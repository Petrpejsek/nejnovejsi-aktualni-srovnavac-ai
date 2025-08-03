"""
Monetization Services

Core business logic for the portable monetization system.
Handles tracking, billing, redirects, and Stripe integration.
"""

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import stripe
import logging

from .models import (
    MonetizationConfig, 
    AffiliateClick, 
    AdClick, 
    AffiliateConversion, 
    BillingAccount,
    MonetizationMode,
    ConversionType
)
from .schema import (
    MonetizationConfigCreate,
    AffiliateClickCreate,
    AdClickCreate,
    ConversionWebhookData,
    RedirectRequest,
    RedirectResponse
)

logger = logging.getLogger(__name__)


class MonetizationService:
    """
    Core service for monetization operations
    
    Handles all monetization logic in a portable, reusable way.
    No dependencies on specific entity types (Tool, Product, etc.)
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    # ================================================================================
    # CONFIGURATION MANAGEMENT
    # ================================================================================
    
    def create_config(self, config_data: MonetizationConfigCreate) -> MonetizationConfig:
        """Create monetization configuration for any entity"""
        
        # Ensure ref_code is unique
        if self.get_config_by_ref_code(config_data.ref_code):
            raise ValueError(f"Reference code '{config_data.ref_code}' already exists")
        
        # Validate that entity+partner combination is unique
        existing = self.db.query(MonetizationConfig).filter(
            and_(
                MonetizationConfig.monetizable_type == config_data.monetizable_type,
                MonetizationConfig.monetizable_id == config_data.monetizable_id,
                MonetizationConfig.partner_id == config_data.partner_id
            )
        ).first()
        
        if existing:
            raise ValueError(f"Monetization already configured for {config_data.monetizable_type}:{config_data.monetizable_id} by this partner")
        
        config = MonetizationConfig(**config_data.dict())
        self.db.add(config)
        self.db.commit()
        self.db.refresh(config)
        
        logger.info(f"Created monetization config {config.id} for {config.monetizable_type}:{config.monetizable_id}")
        return config
    
    def get_config_by_ref_code(self, ref_code: str) -> Optional[MonetizationConfig]:
        """Get monetization config by reference code"""
        return self.db.query(MonetizationConfig).filter(
            MonetizationConfig.ref_code == ref_code
        ).first()
    
    def get_config_for_entity(self, monetizable_type: str, monetizable_id: str) -> List[MonetizationConfig]:
        """Get all monetization configs for a specific entity"""
        return self.db.query(MonetizationConfig).filter(
            and_(
                MonetizationConfig.monetizable_type == monetizable_type,
                MonetizationConfig.monetizable_id == monetizable_id,
                MonetizationConfig.is_active == True
            )
        ).all()
    
    def update_config_stats(self, config_id: str, click_type: str = "total") -> None:
        """Update click statistics for a monetization config"""
        config = self.db.query(MonetizationConfig).filter(
            MonetizationConfig.id == config_id
        ).first()
        
        if config:
            if click_type == "affiliate":
                config.total_affiliate_clicks += 1
            elif click_type == "cpc":
                config.total_cpc_clicks += 1
            
            config.total_clicks += 1
            self.db.commit()
    
    # ================================================================================
    # REDIRECT AND TRACKING
    # ================================================================================
    
    def handle_redirect(self, request: RedirectRequest) -> RedirectResponse:
        """
        Handle redirect request with tracking
        
        Main entry point for /out/:type/:id?ref=xxx endpoint
        """
        try:
            # Find the monetization config
            config = None
            
            if request.ref_code:
                config = self.get_config_by_ref_code(request.ref_code)
            else:
                # Try to find any active config for this entity
                configs = self.get_config_for_entity(
                    request.monetizable_type, 
                    request.monetizable_id
                )
                if configs:
                    config = configs[0]  # Use first active config
            
            if not config or not config.is_active:
                logger.warning(f"No active monetization config found for {request.monetizable_type}:{request.monetizable_id}")
                return RedirectResponse(
                    success=False,
                    redirect_url="",
                    message="No monetization configuration found"
                )
            
            # Track the click based on monetization mode
            tracking_ids = []
            
            if config.mode in [MonetizationMode.AFFILIATE, MonetizationMode.HYBRID]:
                affiliate_click_id = self._track_affiliate_click(config, request)
                if affiliate_click_id:
                    tracking_ids.append(affiliate_click_id)
            
            if config.mode in [MonetizationMode.CPC, MonetizationMode.HYBRID]:
                cpc_click_id = self._track_cpc_click(config, request)
                if cpc_click_id:
                    tracking_ids.append(cpc_click_id)
            
            # Determine redirect URL
            redirect_url = config.affiliate_link or config.fallback_link
            if not redirect_url:
                logger.error(f"No redirect URL configured for {config.id}")
                return RedirectResponse(
                    success=False,
                    redirect_url="",
                    message="No redirect URL configured"
                )
            
            # Update statistics
            self.update_config_stats(config.id)
            
            return RedirectResponse(
                success=True,
                redirect_url=redirect_url,
                tracking_id=tracking_ids[0] if tracking_ids else None,
                mode=config.mode,
                message="Redirect successful"
            )
            
        except Exception as e:
            logger.error(f"Redirect handling failed: {str(e)}")
            return RedirectResponse(
                success=False,
                redirect_url="",
                message=f"Redirect failed: {str(e)}"
            )
    
    def _track_affiliate_click(self, config: MonetizationConfig, request: RedirectRequest) -> Optional[str]:
        """Track affiliate click"""
        try:
            click_data = AffiliateClickCreate(
                monetizable_type=config.monetizable_type,
                monetizable_id=config.monetizable_id,
                ref_code=config.ref_code,
                partner_id=config.partner_id,
                ip_hash=self._hash_ip(request.ip_address) if request.ip_address else None,
                user_agent=request.user_agent,
                referrer=request.referrer,
                click_source=request.click_source
            )
            
            click = AffiliateClick(**click_data.dict())
            self.db.add(click)
            self.db.commit()
            self.db.refresh(click)
            
            # Update config stats
            self.update_config_stats(config.id, "affiliate")
            
            logger.info(f"Tracked affiliate click {click.id} for {config.ref_code}")
            return click.id
            
        except Exception as e:
            logger.error(f"Failed to track affiliate click: {str(e)}")
            return None
    
    def _track_cpc_click(self, config: MonetizationConfig, request: RedirectRequest) -> Optional[str]:
        """Track CPC click and charge partner"""
        try:
            if not config.cpc_rate or config.cpc_rate <= 0:
                logger.warning(f"Invalid CPC rate for config {config.id}")
                return None
            
            # Check if partner has sufficient credit
            billing_service = BillingService(self.db)
            account = billing_service.get_or_create_account(config.partner_id)
            
            if account.credit_balance < config.cpc_rate:
                logger.warning(f"Insufficient credit for partner {config.partner_id}: {account.credit_balance} < {config.cpc_rate}")
                return None
            
            # Charge the click
            click_data = AdClickCreate(
                monetizable_type=config.monetizable_type,
                monetizable_id=config.monetizable_id,
                partner_id=config.partner_id,
                cost_per_click=config.cpc_rate,
                ip_hash=self._hash_ip(request.ip_address) if request.ip_address else None,
                user_agent=request.user_agent,
                referrer=request.referrer
            )
            
            click = AdClick(**click_data.dict())
            self.db.add(click)
            
            # Deduct credit
            account.credit_balance -= config.cpc_rate
            account.total_spent += config.cpc_rate
            account.last_activity_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(click)
            
            # Update config stats
            self.update_config_stats(config.id, "cpc")
            
            logger.info(f"Tracked CPC click {click.id} for {config.ref_code}, charged ${config.cpc_rate}")
            return click.id
            
        except Exception as e:
            logger.error(f"Failed to track CPC click: {str(e)}")
            self.db.rollback()
            return None
    
    def _hash_ip(self, ip_address: str) -> str:
        """Hash IP address for privacy"""
        if not ip_address:
            return None
        
        # Use SHA-256 with a salt for privacy
        salt = "monetization_salt_2024"  # Should be configurable
        return hashlib.sha256(f"{ip_address}{salt}".encode()).hexdigest()[:16]
    
    # ================================================================================
    # CONVERSION TRACKING
    # ================================================================================
    
    def track_conversion(self, conversion_data: ConversionWebhookData) -> Optional[AffiliateConversion]:
        """Track affiliate conversion from webhook or pixel"""
        try:
            # Find the corresponding affiliate click
            affiliate_click = self.db.query(AffiliateClick).filter(
                AffiliateClick.ref_code == conversion_data.ref_code
            ).order_by(AffiliateClick.timestamp.desc()).first()
            
            if not affiliate_click:
                logger.warning(f"No affiliate click found for ref_code: {conversion_data.ref_code}")
                return None
            
            # Check attribution window (default 30 days)
            attribution_hours = 720  # 30 days
            cutoff_time = datetime.utcnow() - timedelta(hours=attribution_hours)
            
            if affiliate_click.timestamp < cutoff_time:
                logger.warning(f"Affiliate click {affiliate_click.id} outside attribution window")
                return None
            
            # Get monetization config for commission calculation
            config = self.db.query(MonetizationConfig).filter(
                MonetizationConfig.ref_code == conversion_data.ref_code
            ).first()
            
            if not config:
                logger.warning(f"No monetization config found for ref_code: {conversion_data.ref_code}")
                return None
            
            # Calculate commission
            commission_amount = None
            if config.affiliate_rate and conversion_data.conversion_value:
                commission_amount = (conversion_data.conversion_value * config.affiliate_rate) / 100
            
            # Create conversion record
            conversion = AffiliateConversion(
                id=str(uuid.uuid4()),
                affiliate_click_id=affiliate_click.id,
                ref_code=conversion_data.ref_code,
                partner_id=config.partner_id,
                monetizable_type=config.monetizable_type,
                monetizable_id=config.monetizable_id,
                conversion_type=conversion_data.conversion_type,
                conversion_value=conversion_data.conversion_value,
                currency=conversion_data.currency,
                commission_rate=config.affiliate_rate,
                commission_amount=commission_amount,
                attribution_window_hours=attribution_hours,
                session_id=conversion_data.session_id,
                external_conversion_id=conversion_data.external_conversion_id,
                metadata=str(conversion_data.metadata) if conversion_data.metadata else None
            )
            
            self.db.add(conversion)
            
            # Update affiliate click
            affiliate_click.is_converted = True
            affiliate_click.conversion_id = conversion.id
            
            # Update config stats
            config.total_conversions += 1
            if commission_amount:
                config.total_revenue += commission_amount
            
            self.db.commit()
            self.db.refresh(conversion)
            
            logger.info(f"Tracked conversion {conversion.id} for ref_code {conversion_data.ref_code}")
            return conversion
            
        except Exception as e:
            logger.error(f"Failed to track conversion: {str(e)}")
            self.db.rollback()
            return None


class BillingService:
    """
    Service for managing billing accounts and credit operations
    
    Handles CPC credit management and affiliate invoice preparation.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_or_create_account(self, partner_id: str) -> BillingAccount:
        """Get existing billing account or create new one"""
        account = self.db.query(BillingAccount).filter(
            BillingAccount.partner_id == partner_id
        ).first()
        
        if not account:
            account = BillingAccount(
                id=str(uuid.uuid4()),
                partner_id=partner_id,
                credit_balance=0.0,
                is_active=True
            )
            self.db.add(account)
            self.db.commit()
            self.db.refresh(account)
            logger.info(f"Created billing account {account.id} for partner {partner_id}")
        
        return account
    
    def add_credit(self, partner_id: str, amount: float, source: str = "stripe") -> BillingAccount:
        """Add credit to partner's account"""
        account = self.get_or_create_account(partner_id)
        
        account.credit_balance += amount
        account.total_deposited += amount
        account.last_activity_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(account)
        
        logger.info(f"Added ${amount} credit to partner {partner_id}, new balance: ${account.credit_balance}")
        return account
    
    def check_auto_recharge(self, partner_id: str) -> Optional[float]:
        """Check if account needs auto-recharge and return amount"""
        account = self.get_or_create_account(partner_id)
        
        if (account.auto_recharge_enabled and 
            account.credit_balance <= account.auto_recharge_threshold and
            account.auto_recharge_amount >= 100):  # Minimum $100
            
            return account.auto_recharge_amount
        
        return None
    
    def get_affiliate_commission_summary(self, partner_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get affiliate commission summary for invoicing"""
        conversions = self.db.query(AffiliateConversion).filter(
            and_(
                AffiliateConversion.partner_id == partner_id,
                AffiliateConversion.timestamp >= start_date,
                AffiliateConversion.timestamp <= end_date,
                AffiliateConversion.is_billable == True,
                AffiliateConversion.billed_at.is_(None)
            )
        ).all()
        
        total_commission = sum(c.commission_amount or 0 for c in conversions)
        total_conversions = len(conversions)
        
        # Group by conversion type
        by_type = {}
        for conversion in conversions:
            conv_type = conversion.conversion_type.value
            if conv_type not in by_type:
                by_type[conv_type] = {"count": 0, "commission": 0}
            by_type[conv_type]["count"] += 1
            by_type[conv_type]["commission"] += conversion.commission_amount or 0
        
        return {
            "partner_id": partner_id,
            "period_start": start_date,
            "period_end": end_date,
            "total_commission": total_commission,
            "total_conversions": total_conversions,
            "conversions_by_type": by_type,
            "conversion_ids": [c.id for c in conversions]
        }
    
    def mark_conversions_billed(self, conversion_ids: List[str], invoice_id: str) -> None:
        """Mark conversions as billed"""
        self.db.query(AffiliateConversion).filter(
            AffiliateConversion.id.in_(conversion_ids)
        ).update({
            "billed_at": datetime.utcnow(),
            "invoice_id": invoice_id
        }, synchronize_session=False)
        
        self.db.commit()
        logger.info(f"Marked {len(conversion_ids)} conversions as billed for invoice {invoice_id}")


class StripeService:
    """
    Service for Stripe integration
    
    Handles credit purchases and affiliate invoicing.
    """
    
    def __init__(self, db: Session, stripe_secret_key: str):
        self.db = db
        stripe.api_key = stripe_secret_key
        self.billing_service = BillingService(db)
    
    def create_credit_checkout_session(self, partner_id: str, amount: float, 
                                     success_url: str, cancel_url: str) -> Dict[str, Any]:
        """Create Stripe Checkout session for credit purchase"""
        try:
            if amount < 100:
                raise ValueError("Minimum credit purchase is $100")
            
            # Get or create billing account
            account = self.billing_service.get_or_create_account(partner_id)
            
            # Create or get Stripe customer
            if not account.stripe_customer_id:
                customer = stripe.Customer.create(
                    metadata={"partner_id": partner_id}
                )
                account.stripe_customer_id = customer.id
                self.db.commit()
            
            # Create checkout session
            session = stripe.checkout.Session.create(
                customer=account.stripe_customer_id,
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f'CPC Advertising Credits - ${amount}',
                            'description': 'Credits for Cost-Per-Click advertising'
                        },
                        'unit_amount': int(amount * 100),  # Stripe uses cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    'partner_id': partner_id,
                    'credit_amount': str(amount),
                    'type': 'credit_purchase'
                }
            )
            
            logger.info(f"Created Stripe checkout session {session.id} for partner {partner_id}")
            return {
                "success": True,
                "checkout_url": session.url,
                "session_id": session.id
            }
            
        except Exception as e:
            logger.error(f"Failed to create checkout session: {str(e)}")
            return {
                "success": False,
                "message": str(e)
            }
    
    def handle_successful_payment(self, session_id: str) -> bool:
        """Handle successful credit purchase"""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            
            if session.payment_status == 'paid':
                partner_id = session.metadata.get('partner_id')
                credit_amount = float(session.metadata.get('credit_amount', 0))
                
                if partner_id and credit_amount > 0:
                    self.billing_service.add_credit(partner_id, credit_amount, "stripe")
                    logger.info(f"Successfully added ${credit_amount} credit for partner {partner_id}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to handle successful payment: {str(e)}")
            return False
    
    def create_affiliate_invoice(self, partner_id: str, start_date: datetime, 
                               end_date: datetime, description: str = None) -> Dict[str, Any]:
        """Create Stripe invoice for affiliate commissions"""
        try:
            # Get commission summary
            summary = self.billing_service.get_affiliate_commission_summary(
                partner_id, start_date, end_date
            )
            
            if summary["total_commission"] <= 0:
                return {
                    "success": False,
                    "message": "No billable commissions found for this period"
                }
            
            # Get billing account
            account = self.billing_service.get_or_create_account(partner_id)
            
            if not account.stripe_customer_id:
                customer = stripe.Customer.create(
                    metadata={"partner_id": partner_id}
                )
                account.stripe_customer_id = customer.id
                self.db.commit()
            
            # Check billing threshold
            if summary["total_commission"] < account.affiliate_billing_threshold:
                return {
                    "success": False,
                    "message": f"Commission amount ${summary['total_commission']} below billing threshold ${account.affiliate_billing_threshold}"
                }
            
            # Create invoice
            invoice_description = description or f"Affiliate commissions for {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
            
            invoice = stripe.Invoice.create(
                customer=account.stripe_customer_id,
                description=invoice_description,
                metadata={
                    'partner_id': partner_id,
                    'period_start': start_date.isoformat(),
                    'period_end': end_date.isoformat(),
                    'total_conversions': str(summary['total_conversions']),
                    'type': 'affiliate_commission'
                },
                auto_advance=True  # Automatically finalize and send
            )
            
            # Add invoice line item
            stripe.InvoiceItem.create(
                customer=account.stripe_customer_id,
                invoice=invoice.id,
                amount=int(summary["total_commission"] * 100),  # Stripe uses cents
                currency='usd',
                description=f"Affiliate commissions ({summary['total_conversions']} conversions)"
            )
            
            # Finalize invoice
            invoice = stripe.Invoice.finalize_invoice(invoice.id)
            
            # Mark conversions as billed
            self.billing_service.mark_conversions_billed(
                summary["conversion_ids"], 
                invoice.id
            )
            
            # Update account
            account.last_affiliate_invoice_date = datetime.utcnow()
            self.db.commit()
            
            logger.info(f"Created affiliate invoice {invoice.id} for partner {partner_id}: ${summary['total_commission']}")
            
            return {
                "success": True,
                "invoice_id": invoice.id,
                "invoice_url": invoice.hosted_invoice_url,
                "amount": summary["total_commission"],
                "due_date": datetime.fromtimestamp(invoice.due_date) if invoice.due_date else None
            }
            
        except Exception as e:
            logger.error(f"Failed to create affiliate invoice: {str(e)}")
            return {
                "success": False,
                "message": str(e)
            }