"""
Monetization Database Models

Portable models designed for reuse across different projects.
Uses generic monetizableType + monetizableId instead of specific entity relationships.
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, Enum, Index
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from decimal import Decimal
import uuid
import enum
from ..database.database import Base


class MonetizationMode(str, enum.Enum):
    """Monetization modes supported by the system"""
    CPC = "cpc"           # Cost-per-click with credit-based billing
    AFFILIATE = "affiliate"  # Commission-based affiliate tracking
    HYBRID = "hybrid"     # Both CPC and affiliate combined


class ConversionType(str, enum.Enum):
    """Types of affiliate conversions"""
    REGISTRATION = "registration"
    TRIAL_START = "trial_start"
    SUBSCRIPTION = "subscription"
    PURCHASE = "purchase"
    LEAD = "lead"
    CUSTOM = "custom"


class MonetizationConfig(Base):
    """
    Main configuration for monetizing any entity (Tool, Product, Service, etc.)
    
    This is the core model that defines how monetization works for any entity.
    Uses generic monetizable_type + monetizable_id for maximum portability.
    """
    __tablename__ = "monetization_configs"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Generic entity reference - PORTABLE DESIGN
    monetizable_type = Column(String, nullable=False, index=True)  # e.g., "Tool", "Product", "Service"
    monetizable_id = Column(String, nullable=False, index=True)    # ID of the entity being monetized
    
    # Monetization settings
    mode = Column(Enum(MonetizationMode), nullable=False, default=MonetizationMode.CPC)
    ref_code = Column(String, unique=True, nullable=False, index=True)  # Unique reference code
    affiliate_link = Column(Text, nullable=True)  # Target affiliate URL
    fallback_link = Column(Text, nullable=True)   # Fallback if affiliate fails
    
    # Display and positioning
    is_top = Column(Boolean, default=False)       # Whether this entity gets top positioning
    is_active = Column(Boolean, default=True)     # Whether monetization is active
    
    # Partner and rates
    partner_id = Column(String, nullable=False, index=True)  # UUID of the partner/company
    cpc_rate = Column(Float, nullable=True)       # Rate per CPC click (in USD)
    affiliate_rate = Column(Float, nullable=True) # Commission rate (percentage 0-100)
    
    # Tracking and analytics
    total_clicks = Column(Integer, default=0)
    total_affiliate_clicks = Column(Integer, default=0)
    total_cpc_clicks = Column(Integer, default=0)
    total_conversions = Column(Integer, default=0)
    total_revenue = Column(Float, default=0.0)    # Total revenue generated
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=True)    # User who created this config
    
    # Composite indexes for performance
    __table_args__ = (
        Index('idx_monetizable_entity', 'monetizable_type', 'monetizable_id'),
        Index('idx_partner_active', 'partner_id', 'is_active'),
        Index('idx_mode_active', 'mode', 'is_active'),
    )


class AffiliateClick(Base):
    """
    Tracks affiliate clicks for commission-based monetization
    
    Portable design - tracks clicks for any monetizable entity type.
    """
    __tablename__ = "affiliate_clicks"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Reference to monetizable entity
    monetizable_type = Column(String, nullable=False, index=True)
    monetizable_id = Column(String, nullable=False, index=True)
    
    # Affiliate tracking
    ref_code = Column(String, nullable=False, index=True)
    partner_id = Column(String, nullable=False, index=True)
    
    # Click metadata
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    ip_hash = Column(String, nullable=True)        # Hashed IP for privacy
    user_agent = Column(Text, nullable=True)
    referrer = Column(Text, nullable=True)
    click_source = Column(String, nullable=True)   # Source page/context
    
    # Geolocation (optional)
    country = Column(String, nullable=True)
    region = Column(String, nullable=True)
    
    # Tracking status
    is_valid = Column(Boolean, default=True)
    fraud_reason = Column(String, nullable=True)
    
    # Conversion tracking (optional link)
    conversion_id = Column(String, nullable=True)  # Links to AffiliateConversion
    is_converted = Column(Boolean, default=False)
    
    # Session tracking
    session_id = Column(String, nullable=True, index=True)
    
    __table_args__ = (
        Index('idx_affiliate_entity', 'monetizable_type', 'monetizable_id'),
        Index('idx_affiliate_partner', 'partner_id', 'timestamp'),
        Index('idx_affiliate_ref', 'ref_code', 'timestamp'),
        Index('idx_affiliate_session', 'session_id', 'timestamp'),
    )


class AdClick(Base):
    """
    Enhanced AdClick model for CPC (Cost-Per-Click) monetization
    
    Extended from existing AdClick but made portable with monetizable_type/id.
    """
    __tablename__ = "ad_clicks_monetization"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Reference to monetizable entity (PORTABLE)
    monetizable_type = Column(String, nullable=False, index=True)
    monetizable_id = Column(String, nullable=False, index=True)
    
    # Campaign and partner info
    campaign_id = Column(String, nullable=True, index=True)    # Optional campaign
    partner_id = Column(String, nullable=False, index=True)
    
    # Click details
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    ip_hash = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    referrer = Column(Text, nullable=True)
    
    # Billing
    cost_per_click = Column(Float, nullable=False)  # Amount charged for this click
    currency = Column(String, default="USD", nullable=False)
    
    # Fraud detection
    is_valid_click = Column(Boolean, default=True)
    fraud_reason = Column(String, nullable=True)
    
    # Geolocation
    country = Column(String, nullable=True)
    
    # Conversion tracking (optional)
    conversion_tracked = Column(Boolean, default=False)
    conversion_value = Column(Float, nullable=True)
    
    __table_args__ = (
        Index('idx_adclick_entity', 'monetizable_type', 'monetizable_id'),
        Index('idx_adclick_partner', 'partner_id', 'timestamp'),
        Index('idx_adclick_campaign', 'campaign_id', 'timestamp'),
        Index('idx_adclick_billing', 'partner_id', 'cost_per_click'),
    )


class AffiliateConversion(Base):
    """
    Tracks affiliate conversions for commission calculation
    
    Optional model for advanced affiliate tracking.
    """
    __tablename__ = "affiliate_conversions"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Reference back to the click that led to conversion
    affiliate_click_id = Column(String, nullable=True, index=True)
    ref_code = Column(String, nullable=False, index=True)
    partner_id = Column(String, nullable=False, index=True)
    
    # Monetizable entity
    monetizable_type = Column(String, nullable=False, index=True)
    monetizable_id = Column(String, nullable=False, index=True)
    
    # Conversion details
    conversion_type = Column(Enum(ConversionType), nullable=False)
    conversion_value = Column(Float, nullable=True)  # Monetary value of conversion
    currency = Column(String, default="USD")
    
    # Commission calculation
    commission_rate = Column(Float, nullable=True)   # Rate used for this conversion
    commission_amount = Column(Float, nullable=True) # Calculated commission
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    attribution_window_hours = Column(Integer, default=720)  # 30 days default
    
    # Session tracking
    session_id = Column(String, nullable=True, index=True)
    
    # Metadata from webhook/pixel
    external_conversion_id = Column(String, nullable=True)  # Partner's conversion ID
    metadata = Column(Text, nullable=True)  # JSON metadata from webhook
    
    # Billing status
    is_billable = Column(Boolean, default=True)
    billed_at = Column(DateTime, nullable=True)
    invoice_id = Column(String, nullable=True)
    
    __table_args__ = (
        Index('idx_conversion_entity', 'monetizable_type', 'monetizable_id'),
        Index('idx_conversion_partner', 'partner_id', 'timestamp'),
        Index('idx_conversion_billing', 'partner_id', 'is_billable', 'billed_at'),
        Index('idx_conversion_ref', 'ref_code', 'timestamp'),
    )


class BillingAccount(Base):
    """
    Manages CPC credit balance and billing for partners
    
    Portable billing system for any partner regardless of entity type.
    """
    __tablename__ = "billing_accounts"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Partner reference
    partner_id = Column(String, unique=True, nullable=False, index=True)
    
    # Stripe integration
    stripe_customer_id = Column(String, unique=True, nullable=True)
    
    # Credit balance for CPC
    credit_balance = Column(Float, default=0.0, nullable=False)  # Current balance in USD
    total_deposited = Column(Float, default=0.0)                # Lifetime deposits
    total_spent = Column(Float, default=0.0)                    # Lifetime CPC spend
    
    # Auto-recharge settings
    auto_recharge_enabled = Column(Boolean, default=False)
    auto_recharge_threshold = Column(Float, default=50.0)       # Trigger recharge at this balance
    auto_recharge_amount = Column(Float, default=200.0)         # Amount to recharge
    
    # Billing limits
    daily_spend_limit = Column(Float, nullable=True)            # Optional daily CPC limit
    monthly_spend_limit = Column(Float, nullable=True)          # Optional monthly CPC limit
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    credit_limit = Column(Float, default=1000.0)                # Maximum credit allowed
    
    # Affiliate billing settings
    affiliate_billing_enabled = Column(Boolean, default=False)
    affiliate_billing_threshold = Column(Float, default=10.0)   # Minimum amount to invoice
    last_affiliate_invoice_date = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_activity_at = Column(DateTime, nullable=True)
    
    # Notes and metadata
    notes = Column(Text, nullable=True)
    metadata = Column(Text, nullable=True)  # JSON for additional data
    
    __table_args__ = (
        Index('idx_billing_partner', 'partner_id', 'is_active'),
        Index('idx_billing_stripe', 'stripe_customer_id'),
        Index('idx_billing_balance', 'credit_balance', 'auto_recharge_enabled'),
    )


# Additional indexes for cross-table queries
Index('idx_clicks_partner_time', AffiliateClick.partner_id, AffiliateClick.timestamp)
Index('idx_adclicks_partner_time', AdClick.partner_id, AdClick.timestamp)
Index('idx_conversions_partner_time', AffiliateConversion.partner_id, AffiliateConversion.timestamp)