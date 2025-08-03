"""
Pydantic Schemas for Monetization API

Request/response validation schemas for the monetization system.
Designed for portability and type safety.
"""

from pydantic import BaseModel, validator, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from decimal import Decimal
from .models import MonetizationMode, ConversionType


# ================================================================================
# MONETIZATION CONFIG SCHEMAS
# ================================================================================

class MonetizationConfigBase(BaseModel):
    """Base schema for monetization configuration"""
    monetizable_type: str = Field(..., description="Type of entity being monetized")
    monetizable_id: str = Field(..., description="ID of the entity being monetized")
    mode: MonetizationMode = Field(default=MonetizationMode.CPC)
    ref_code: str = Field(..., description="Unique reference code for tracking")
    affiliate_link: Optional[str] = Field(None, description="Target affiliate URL")
    fallback_link: Optional[str] = Field(None, description="Fallback URL if affiliate fails")
    is_top: bool = Field(default=False, description="Whether to show in top positions")
    is_active: bool = Field(default=True, description="Whether monetization is active")
    cpc_rate: Optional[float] = Field(None, ge=0, description="Cost per click in USD")
    affiliate_rate: Optional[float] = Field(None, ge=0, le=100, description="Commission rate percentage")

    @validator('ref_code')
    def validate_ref_code(cls, v):
        if not v or len(v) < 3:
            raise ValueError('ref_code must be at least 3 characters long')
        # Only allow alphanumeric and hyphens
        if not all(c.isalnum() or c in '-_' for c in v):
            raise ValueError('ref_code can only contain alphanumeric characters, hyphens, and underscores')
        return v.lower()

    @validator('affiliate_link', 'fallback_link')
    def validate_urls(cls, v):
        if v and not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('URL must start with http:// or https://')
        return v

    @validator('mode')
    def validate_mode_requirements(cls, v, values):
        """Validate that required fields are present for each mode"""
        if v == MonetizationMode.CPC and 'cpc_rate' in values and values['cpc_rate'] is None:
            raise ValueError('cpc_rate is required for CPC mode')
        if v in [MonetizationMode.AFFILIATE, MonetizationMode.HYBRID]:
            if 'affiliate_link' in values and not values['affiliate_link']:
                raise ValueError('affiliate_link is required for affiliate and hybrid modes')
            if 'affiliate_rate' in values and values['affiliate_rate'] is None:
                raise ValueError('affiliate_rate is required for affiliate and hybrid modes')
        return v


class MonetizationConfigCreate(MonetizationConfigBase):
    """Schema for creating monetization configuration"""
    partner_id: str = Field(..., description="Partner/company ID")
    created_by: Optional[str] = Field(None, description="User who created this config")


class MonetizationConfigUpdate(BaseModel):
    """Schema for updating monetization configuration"""
    mode: Optional[MonetizationMode] = None
    ref_code: Optional[str] = None
    affiliate_link: Optional[str] = None
    fallback_link: Optional[str] = None
    is_top: Optional[bool] = None
    is_active: Optional[bool] = None
    cpc_rate: Optional[float] = Field(None, ge=0)
    affiliate_rate: Optional[float] = Field(None, ge=0, le=100)

    @validator('ref_code')
    def validate_ref_code(cls, v):
        if v is not None:
            if len(v) < 3:
                raise ValueError('ref_code must be at least 3 characters long')
            if not all(c.isalnum() or c in '-_' for c in v):
                raise ValueError('ref_code can only contain alphanumeric characters, hyphens, and underscores')
            return v.lower()
        return v


class MonetizationConfigResponse(MonetizationConfigBase):
    """Schema for monetization configuration responses"""
    id: str
    partner_id: str
    total_clicks: int = 0
    total_affiliate_clicks: int = 0
    total_cpc_clicks: int = 0
    total_conversions: int = 0
    total_revenue: float = 0.0
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None

    class Config:
        from_attributes = True


# ================================================================================
# CLICK TRACKING SCHEMAS
# ================================================================================

class AffiliateClickCreate(BaseModel):
    """Schema for creating affiliate click records"""
    monetizable_type: str
    monetizable_id: str
    ref_code: str
    partner_id: str
    ip_hash: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    click_source: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None
    session_id: Optional[str] = None


class AffiliateClickResponse(BaseModel):
    """Schema for affiliate click responses"""
    id: str
    monetizable_type: str
    monetizable_id: str
    ref_code: str
    partner_id: str
    timestamp: datetime
    ip_hash: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    click_source: Optional[str] = None
    country: Optional[str] = None
    is_valid: bool = True
    is_converted: bool = False
    session_id: Optional[str] = None

    class Config:
        from_attributes = True


class AdClickCreate(BaseModel):
    """Schema for creating CPC ad click records"""
    monetizable_type: str
    monetizable_id: str
    partner_id: str
    campaign_id: Optional[str] = None
    cost_per_click: float = Field(..., gt=0, description="Cost charged for this click")
    ip_hash: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    country: Optional[str] = None


class AdClickResponse(BaseModel):
    """Schema for ad click responses"""
    id: str
    monetizable_type: str
    monetizable_id: str
    partner_id: str
    campaign_id: Optional[str] = None
    timestamp: datetime
    cost_per_click: float
    currency: str = "USD"
    is_valid_click: bool = True
    country: Optional[str] = None

    class Config:
        from_attributes = True


# ================================================================================
# CONVERSION TRACKING SCHEMAS
# ================================================================================

class ConversionWebhookData(BaseModel):
    """Schema for conversion webhook data from partners"""
    ref_code: str = Field(..., description="Reference code to match the conversion")
    conversion_type: ConversionType = Field(..., description="Type of conversion")
    conversion_value: Optional[float] = Field(None, ge=0, description="Monetary value")
    currency: str = Field(default="USD", description="Currency of the conversion value")
    external_conversion_id: Optional[str] = Field(None, description="Partner's internal conversion ID")
    session_id: Optional[str] = Field(None, description="Session ID for attribution")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional conversion data")

    @validator('currency')
    def validate_currency(cls, v):
        # Simple validation for common currencies
        allowed_currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
        if v.upper() not in allowed_currencies:
            raise ValueError(f'Currency must be one of: {", ".join(allowed_currencies)}')
        return v.upper()


class ConversionPixelParams(BaseModel):
    """Schema for conversion tracking pixel parameters"""
    ref: str = Field(..., alias="ref", description="Reference code")
    type: ConversionType = Field(..., alias="type", description="Conversion type")
    value: Optional[float] = Field(None, alias="value", ge=0, description="Conversion value")
    currency: str = Field(default="USD", alias="currency")
    external_id: Optional[str] = Field(None, alias="external_id", description="External conversion ID")
    session: Optional[str] = Field(None, alias="session", description="Session ID")


class AffiliateConversionResponse(BaseModel):
    """Schema for affiliate conversion responses"""
    id: str
    affiliate_click_id: Optional[str] = None
    ref_code: str
    partner_id: str
    monetizable_type: str
    monetizable_id: str
    conversion_type: ConversionType
    conversion_value: Optional[float] = None
    currency: str = "USD"
    commission_rate: Optional[float] = None
    commission_amount: Optional[float] = None
    timestamp: datetime
    is_billable: bool = True

    class Config:
        from_attributes = True


# ================================================================================
# BILLING AND ACCOUNT SCHEMAS
# ================================================================================

class BillingAccountCreate(BaseModel):
    """Schema for creating billing accounts"""
    partner_id: str = Field(..., description="Partner/company ID")
    auto_recharge_enabled: bool = Field(default=False)
    auto_recharge_threshold: float = Field(default=50.0, ge=0)
    auto_recharge_amount: float = Field(default=200.0, ge=100)  # Minimum $100
    daily_spend_limit: Optional[float] = Field(None, ge=0)
    monthly_spend_limit: Optional[float] = Field(None, ge=0)
    credit_limit: float = Field(default=1000.0, ge=100)

    @validator('auto_recharge_amount')
    def validate_min_recharge(cls, v):
        if v < 100:
            raise ValueError('Minimum auto-recharge amount is $100')
        return v


class BillingAccountUpdate(BaseModel):
    """Schema for updating billing accounts"""
    auto_recharge_enabled: Optional[bool] = None
    auto_recharge_threshold: Optional[float] = Field(None, ge=0)
    auto_recharge_amount: Optional[float] = Field(None, ge=100)
    daily_spend_limit: Optional[float] = Field(None, ge=0)
    monthly_spend_limit: Optional[float] = Field(None, ge=0)
    credit_limit: Optional[float] = Field(None, ge=100)
    is_active: Optional[bool] = None
    affiliate_billing_enabled: Optional[bool] = None
    affiliate_billing_threshold: Optional[float] = Field(None, ge=0)


class BillingAccountResponse(BaseModel):
    """Schema for billing account responses"""
    id: str
    partner_id: str
    stripe_customer_id: Optional[str] = None
    credit_balance: float
    total_deposited: float
    total_spent: float
    auto_recharge_enabled: bool
    auto_recharge_threshold: float
    auto_recharge_amount: float
    daily_spend_limit: Optional[float] = None
    monthly_spend_limit: Optional[float] = None
    is_active: bool
    is_verified: bool
    credit_limit: float
    affiliate_billing_enabled: bool
    affiliate_billing_threshold: float
    last_affiliate_invoice_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    last_activity_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ================================================================================
# REDIRECT AND TRACKING SCHEMAS
# ================================================================================

class RedirectRequest(BaseModel):
    """Schema for redirect endpoint requests"""
    monetizable_type: str = Field(..., description="Type of entity (Tool, Product, etc.)")
    monetizable_id: str = Field(..., description="ID of the entity")
    ref_code: Optional[str] = Field(None, description="Reference code from URL parameter")
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    click_source: Optional[str] = None


class RedirectResponse(BaseModel):
    """Schema for redirect responses"""
    success: bool
    redirect_url: str
    tracking_id: Optional[str] = None
    mode: MonetizationMode
    message: Optional[str] = None


# ================================================================================
# ANALYTICS AND REPORTING SCHEMAS
# ================================================================================

class AnalyticsFilter(BaseModel):
    """Schema for analytics filtering"""
    partner_id: Optional[str] = None
    monetizable_type: Optional[str] = None
    monetizable_id: Optional[str] = None
    mode: Optional[MonetizationMode] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    country: Optional[str] = None


class AnalyticsResponse(BaseModel):
    """Schema for analytics responses"""
    total_clicks: int
    total_affiliate_clicks: int
    total_cpc_clicks: int
    total_conversions: int
    total_revenue: float
    total_cpc_spend: float
    total_affiliate_commissions: float
    average_cpc: float
    conversion_rate: float
    top_entities: List[Dict[str, Any]]
    daily_stats: List[Dict[str, Any]]


# ================================================================================
# STRIPE INTEGRATION SCHEMAS
# ================================================================================

class CreditPurchaseRequest(BaseModel):
    """Schema for credit purchase requests"""
    partner_id: str
    amount: float = Field(..., ge=100, description="Amount to purchase (minimum $100)")
    currency: str = Field(default="USD")
    success_url: str = Field(..., description="URL to redirect after successful payment")
    cancel_url: str = Field(..., description="URL to redirect if payment is cancelled")

    @validator('amount')
    def validate_minimum_amount(cls, v):
        if v < 100:
            raise ValueError('Minimum credit purchase is $100')
        return v


class CreditPurchaseResponse(BaseModel):
    """Schema for credit purchase responses"""
    success: bool
    checkout_url: Optional[str] = None
    session_id: Optional[str] = None
    message: Optional[str] = None


class InvoiceRequest(BaseModel):
    """Schema for affiliate invoice requests"""
    partner_id: str
    start_date: datetime
    end_date: datetime
    description: Optional[str] = None


class InvoiceResponse(BaseModel):
    """Schema for affiliate invoice responses"""
    success: bool
    invoice_id: Optional[str] = None
    invoice_url: Optional[str] = None
    amount: Optional[float] = None
    due_date: Optional[datetime] = None
    message: Optional[str] = None