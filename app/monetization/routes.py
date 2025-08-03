"""
Monetization API Routes

FastAPI routes for the portable monetization system.
Handles redirects, tracking, billing, and Stripe webhooks.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, BackgroundTasks
from fastapi.responses import RedirectResponse, FileResponse
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import logging
import os
from io import BytesIO
import base64

from ..database.database import get_db
from .services import MonetizationService, BillingService, StripeService
from .schema import (
    MonetizationConfigCreate,
    MonetizationConfigUpdate,
    MonetizationConfigResponse,
    AffiliateClickResponse,
    AdClickResponse,
    ConversionWebhookData,
    ConversionPixelParams,
    AffiliateConversionResponse,
    BillingAccountCreate,
    BillingAccountUpdate,
    BillingAccountResponse,
    CreditPurchaseRequest,
    CreditPurchaseResponse,
    InvoiceRequest,
    InvoiceResponse,
    AnalyticsFilter,
    AnalyticsResponse,
    RedirectRequest,
    RedirectResponse as RedirectResponseSchema
)
from .models import MonetizationConfig, AffiliateClick, AdClick, BillingAccount

logger = logging.getLogger(__name__)

# Create router with prefix
router = APIRouter(prefix="/monetization", tags=["monetization"])

# ================================================================================
# CORE REDIRECT ENDPOINT
# ================================================================================

@router.get("/out/{monetizable_type}/{monetizable_id}")
async def redirect_with_tracking(
    monetizable_type: str,
    monetizable_id: str,
    request: Request,
    ref: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Main redirect endpoint: /out/:type/:id?ref=xxx
    
    Tracks clicks and redirects to affiliate/external URL.
    Supports CPC, affiliate, and hybrid monetization modes.
    """
    try:
        # Extract request metadata
        redirect_request = RedirectRequest(
            monetizable_type=monetizable_type,
            monetizable_id=monetizable_id,
            ref_code=ref,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent"),
            referrer=request.headers.get("referer"),
            click_source="direct"
        )
        
        # Handle redirect with tracking
        service = MonetizationService(db)
        result = service.handle_redirect(redirect_request)
        
        if not result.success or not result.redirect_url:
            logger.warning(f"Redirect failed for {monetizable_type}:{monetizable_id}")
            raise HTTPException(status_code=404, detail="Resource not found or not monetized")
        
        # Perform redirect
        logger.info(f"Redirecting {monetizable_type}:{monetizable_id} to {result.redirect_url}")
        return RedirectResponse(url=result.redirect_url, status_code=302)
        
    except Exception as e:
        logger.error(f"Redirect error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ================================================================================
# CONVERSION TRACKING
# ================================================================================

@router.post("/api/affiliate/conversion", response_model=AffiliateConversionResponse)
async def track_conversion_webhook(
    conversion_data: ConversionWebhookData,
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint for affiliate conversion tracking
    
    Partners call this when conversions happen on their side.
    """
    try:
        service = MonetizationService(db)
        conversion = service.track_conversion(conversion_data)
        
        if not conversion:
            raise HTTPException(status_code=404, detail="No matching affiliate click found or conversion outside attribution window")
        
        return conversion
        
    except Exception as e:
        logger.error(f"Conversion tracking error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to track conversion")


@router.get("/track/conversion.gif")
async def track_conversion_pixel(
    ref: str,
    type: str,
    value: Optional[float] = None,
    currency: str = "USD",
    external_id: Optional[str] = None,
    session: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Conversion tracking pixel endpoint
    
    Returns 1x1 transparent GIF for client-side conversion tracking.
    """
    try:
        # Validate and parse parameters
        pixel_params = ConversionPixelParams(
            ref=ref,
            type=type,
            value=value,
            currency=currency,
            external_id=external_id,
            session=session
        )
        
        # Convert to webhook data format
        conversion_data = ConversionWebhookData(
            ref_code=pixel_params.ref,
            conversion_type=pixel_params.type,
            conversion_value=pixel_params.value,
            currency=pixel_params.currency,
            external_conversion_id=pixel_params.external_id,
            session_id=pixel_params.session
        )
        
        # Track conversion in background
        service = MonetizationService(db)
        service.track_conversion(conversion_data)
        
    except Exception as e:
        logger.error(f"Pixel tracking error: {str(e)}")
    
    # Always return 1x1 transparent GIF regardless of errors
    gif_data = base64.b64decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")
    
    return Response(
        content=gif_data,
        media_type="image/gif",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )


# ================================================================================
# MONETIZATION CONFIG MANAGEMENT
# ================================================================================

@router.post("/config", response_model=MonetizationConfigResponse)
async def create_monetization_config(
    config: MonetizationConfigCreate,
    db: Session = Depends(get_db)
):
    """Create monetization configuration for any entity"""
    try:
        service = MonetizationService(db)
        created_config = service.create_config(config)
        return created_config
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Config creation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create configuration")


@router.get("/config/{config_id}", response_model=MonetizationConfigResponse)
async def get_monetization_config(
    config_id: str,
    db: Session = Depends(get_db)
):
    """Get monetization configuration by ID"""
    config = db.query(MonetizationConfig).filter(MonetizationConfig.id == config_id).first()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    return config


@router.put("/config/{config_id}", response_model=MonetizationConfigResponse)
async def update_monetization_config(
    config_id: str,
    updates: MonetizationConfigUpdate,
    db: Session = Depends(get_db)
):
    """Update monetization configuration"""
    config = db.query(MonetizationConfig).filter(MonetizationConfig.id == config_id).first()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    # Apply updates
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(config, field, value)
    
    config.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(config)
    
    return config


@router.get("/config/entity/{monetizable_type}/{monetizable_id}", response_model=List[MonetizationConfigResponse])
async def get_configs_for_entity(
    monetizable_type: str,
    monetizable_id: str,
    db: Session = Depends(get_db)
):
    """Get all monetization configurations for a specific entity"""
    service = MonetizationService(db)
    configs = service.get_config_for_entity(monetizable_type, monetizable_id)
    return configs


@router.get("/config/ref/{ref_code}", response_model=MonetizationConfigResponse)
async def get_config_by_ref_code(
    ref_code: str,
    db: Session = Depends(get_db)
):
    """Get monetization configuration by reference code"""
    service = MonetizationService(db)
    config = service.get_config_by_ref_code(ref_code)
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    return config


# ================================================================================
# BILLING AND CREDIT MANAGEMENT
# ================================================================================

@router.post("/billing/account", response_model=BillingAccountResponse)
async def create_billing_account(
    account_data: BillingAccountCreate,
    db: Session = Depends(get_db)
):
    """Create billing account for a partner"""
    try:
        billing_service = BillingService(db)
        account = billing_service.get_or_create_account(account_data.partner_id)
        
        # Update with provided settings
        for field, value in account_data.dict(exclude={"partner_id"}).items():
            if value is not None:
                setattr(account, field, value)
        
        db.commit()
        db.refresh(account)
        
        return account
        
    except Exception as e:
        logger.error(f"Account creation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create billing account")


@router.get("/billing/account/{partner_id}", response_model=BillingAccountResponse)
async def get_billing_account(
    partner_id: str,
    db: Session = Depends(get_db)
):
    """Get billing account for a partner"""
    billing_service = BillingService(db)
    account = billing_service.get_or_create_account(partner_id)
    return account


@router.put("/billing/account/{partner_id}", response_model=BillingAccountResponse)
async def update_billing_account(
    partner_id: str,
    updates: BillingAccountUpdate,
    db: Session = Depends(get_db)
):
    """Update billing account settings"""
    account = db.query(BillingAccount).filter(BillingAccount.partner_id == partner_id).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Billing account not found")
    
    # Apply updates
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(account, field, value)
    
    account.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(account)
    
    return account


# ================================================================================
# STRIPE INTEGRATION
# ================================================================================

@router.post("/stripe/purchase-credit", response_model=CreditPurchaseResponse)
async def purchase_credit(
    purchase_request: CreditPurchaseRequest,
    db: Session = Depends(get_db)
):
    """Create Stripe checkout session for credit purchase"""
    try:
        # Get Stripe secret key from environment
        stripe_key = os.getenv("STRIPE_SECRET_KEY")
        if not stripe_key:
            raise HTTPException(status_code=500, detail="Stripe not configured")
        
        stripe_service = StripeService(db, stripe_key)
        result = stripe_service.create_credit_checkout_session(
            partner_id=purchase_request.partner_id,
            amount=purchase_request.amount,
            success_url=purchase_request.success_url,
            cancel_url=purchase_request.cancel_url
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("message", "Failed to create checkout session"))
        
        return CreditPurchaseResponse(**result)
        
    except Exception as e:
        logger.error(f"Credit purchase error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create purchase session")


@router.post("/stripe/create-invoice", response_model=InvoiceResponse)
async def create_affiliate_invoice(
    invoice_request: InvoiceRequest,
    db: Session = Depends(get_db)
):
    """Create Stripe invoice for affiliate commissions"""
    try:
        stripe_key = os.getenv("STRIPE_SECRET_KEY")
        if not stripe_key:
            raise HTTPException(status_code=500, detail="Stripe not configured")
        
        stripe_service = StripeService(db, stripe_key)
        result = stripe_service.create_affiliate_invoice(
            partner_id=invoice_request.partner_id,
            start_date=invoice_request.start_date,
            end_date=invoice_request.end_date,
            description=invoice_request.description
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("message", "Failed to create invoice"))
        
        return InvoiceResponse(**result)
        
    except Exception as e:
        logger.error(f"Invoice creation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create invoice")


@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhooks"""
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        stripe_key = os.getenv("STRIPE_SECRET_KEY")
        webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        
        if not stripe_key or not webhook_secret:
            raise HTTPException(status_code=500, detail="Stripe not configured")
        
        import stripe
        stripe.api_key = stripe_key
        
        # Verify webhook signature
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        
        # Handle different event types
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            if session.get("metadata", {}).get("type") == "credit_purchase":
                background_tasks.add_task(handle_successful_payment, session["id"], db, stripe_key)
        
        elif event["type"] == "invoice.payment_succeeded":
            invoice = event["data"]["object"]
            if invoice.get("metadata", {}).get("type") == "affiliate_commission":
                logger.info(f"Affiliate invoice {invoice['id']} paid successfully")
        
        return {"success": True}
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail="Webhook processing failed")


async def handle_successful_payment(session_id: str, db: Session, stripe_key: str):
    """Background task to handle successful credit payments"""
    try:
        stripe_service = StripeService(db, stripe_key)
        stripe_service.handle_successful_payment(session_id)
    except Exception as e:
        logger.error(f"Failed to handle successful payment {session_id}: {str(e)}")


# ================================================================================
# ANALYTICS AND REPORTING
# ================================================================================

@router.get("/analytics/partner/{partner_id}")
async def get_partner_analytics(
    partner_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get analytics for a partner"""
    try:
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.utcnow()
        if not start_date:
            start_date = end_date - timedelta(days=30)
        
        # Get affiliate clicks
        affiliate_clicks = db.query(AffiliateClick).filter(
            AffiliateClick.partner_id == partner_id,
            AffiliateClick.timestamp >= start_date,
            AffiliateClick.timestamp <= end_date
        ).count()
        
        # Get CPC clicks
        cpc_clicks = db.query(AdClick).filter(
            AdClick.partner_id == partner_id,
            AdClick.timestamp >= start_date,
            AdClick.timestamp <= end_date
        ).all()
        
        cpc_spend = sum(click.cost_per_click for click in cpc_clicks)
        
        # Get billing account
        billing_service = BillingService(db)
        account = billing_service.get_or_create_account(partner_id)
        
        # Get affiliate commissions
        commission_summary = billing_service.get_affiliate_commission_summary(
            partner_id, start_date, end_date
        )
        
        return {
            "partner_id": partner_id,
            "period_start": start_date,
            "period_end": end_date,
            "affiliate_clicks": affiliate_clicks,
            "cpc_clicks": len(cpc_clicks),
            "total_clicks": affiliate_clicks + len(cpc_clicks),
            "cpc_spend": cpc_spend,
            "affiliate_commissions": commission_summary["total_commission"],
            "credit_balance": account.credit_balance,
            "conversions": commission_summary["total_conversions"],
            "conversion_rate": (commission_summary["total_conversions"] / affiliate_clicks * 100) if affiliate_clicks > 0 else 0
        }
        
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get analytics")


@router.get("/analytics/entity/{monetizable_type}/{monetizable_id}")
async def get_entity_analytics(
    monetizable_type: str,
    monetizable_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get analytics for a specific entity"""
    try:
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.utcnow()
        if not start_date:
            start_date = end_date - timedelta(days=30)
        
        # Get all configs for this entity
        configs = db.query(MonetizationConfig).filter(
            MonetizationConfig.monetizable_type == monetizable_type,
            MonetizationConfig.monetizable_id == monetizable_id
        ).all()
        
        if not configs:
            raise HTTPException(status_code=404, detail="No monetization configurations found")
        
        # Aggregate stats across all configs
        total_affiliate_clicks = 0
        total_cpc_clicks = 0
        total_cpc_spend = 0
        total_conversions = 0
        total_commissions = 0
        
        for config in configs:
            # Affiliate clicks
            affiliate_clicks = db.query(AffiliateClick).filter(
                AffiliateClick.monetizable_type == monetizable_type,
                AffiliateClick.monetizable_id == monetizable_id,
                AffiliateClick.partner_id == config.partner_id,
                AffiliateClick.timestamp >= start_date,
                AffiliateClick.timestamp <= end_date
            ).count()
            
            # CPC clicks
            cpc_clicks = db.query(AdClick).filter(
                AdClick.monetizable_type == monetizable_type,
                AdClick.monetizable_id == monetizable_id,
                AdClick.partner_id == config.partner_id,
                AdClick.timestamp >= start_date,
                AdClick.timestamp <= end_date
            ).all()
            
            total_affiliate_clicks += affiliate_clicks
            total_cpc_clicks += len(cpc_clicks)
            total_cpc_spend += sum(click.cost_per_click for click in cpc_clicks)
        
        return {
            "monetizable_type": monetizable_type,
            "monetizable_id": monetizable_id,
            "period_start": start_date,
            "period_end": end_date,
            "total_configs": len(configs),
            "affiliate_clicks": total_affiliate_clicks,
            "cpc_clicks": total_cpc_clicks,
            "total_clicks": total_affiliate_clicks + total_cpc_clicks,
            "cpc_spend": total_cpc_spend,
            "average_cpc": total_cpc_spend / total_cpc_clicks if total_cpc_clicks > 0 else 0
        }
        
    except Exception as e:
        logger.error(f"Entity analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get entity analytics")


# ================================================================================
# ADMIN ENDPOINTS
# ================================================================================

@router.get("/admin/stats")
async def get_admin_stats(
    db: Session = Depends(get_db)
):
    """Get overall system statistics (admin only)"""
    try:
        # Total configs
        total_configs = db.query(MonetizationConfig).count()
        active_configs = db.query(MonetizationConfig).filter(MonetizationConfig.is_active == True).count()
        
        # Total clicks
        total_affiliate_clicks = db.query(AffiliateClick).count()
        total_cpc_clicks = db.query(AdClick).count()
        
        # Total revenue
        from sqlalchemy import func
        total_cpc_revenue = db.query(func.sum(AdClick.cost_per_click)).scalar() or 0
        
        # Active partners
        active_partners = db.query(BillingAccount).filter(BillingAccount.is_active == True).count()
        
        return {
            "total_configs": total_configs,
            "active_configs": active_configs,
            "total_affiliate_clicks": total_affiliate_clicks,
            "total_cpc_clicks": total_cpc_clicks,
            "total_clicks": total_affiliate_clicks + total_cpc_clicks,
            "total_cpc_revenue": total_cpc_revenue,
            "active_partners": active_partners
        }
        
    except Exception as e:
        logger.error(f"Admin stats error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get admin statistics")