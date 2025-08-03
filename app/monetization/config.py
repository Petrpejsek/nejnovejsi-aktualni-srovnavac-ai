"""
Monetization System Configuration

Centralized configuration for the portable monetization system.
Designed to be environment-aware and easily configurable.
"""

import os
from typing import Optional, Dict, Any
from dataclasses import dataclass
from enum import Enum


class Environment(str, Enum):
    """Environment types"""
    DEVELOPMENT = "development"
    TESTING = "testing"
    STAGING = "staging"
    PRODUCTION = "production"


@dataclass
class StripeConfig:
    """Stripe integration configuration"""
    secret_key: str
    webhook_secret: str
    publishable_key: Optional[str] = None
    
    # Minimum amounts
    min_credit_purchase: float = 100.0
    min_invoice_amount: float = 10.0
    
    # Default currency
    default_currency: str = "USD"
    
    @classmethod
    def from_env(cls) -> 'StripeConfig':
        """Create Stripe config from environment variables"""
        secret_key = os.getenv('STRIPE_SECRET_KEY')
        webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        
        if not secret_key:
            raise ValueError("STRIPE_SECRET_KEY environment variable is required")
        if not webhook_secret:
            raise ValueError("STRIPE_WEBHOOK_SECRET environment variable is required")
        
        return cls(
            secret_key=secret_key,
            webhook_secret=webhook_secret,
            publishable_key=os.getenv('STRIPE_PUBLISHABLE_KEY'),
            min_credit_purchase=float(os.getenv('STRIPE_MIN_CREDIT_PURCHASE', '100')),
            min_invoice_amount=float(os.getenv('STRIPE_MIN_INVOICE_AMOUNT', '10')),
            default_currency=os.getenv('STRIPE_DEFAULT_CURRENCY', 'USD')
        )


@dataclass
class DatabaseConfig:
    """Database configuration"""
    url: str
    pool_size: int = 10
    max_overflow: int = 20
    echo: bool = False
    
    @classmethod
    def from_env(cls) -> 'DatabaseConfig':
        """Create database config from environment variables"""
        url = os.getenv('DATABASE_URL') or os.getenv('MONETIZATION_DATABASE_URL')
        
        if not url:
            raise ValueError("DATABASE_URL or MONETIZATION_DATABASE_URL environment variable is required")
        
        return cls(
            url=url,
            pool_size=int(os.getenv('DB_POOL_SIZE', '10')),
            max_overflow=int(os.getenv('DB_MAX_OVERFLOW', '20')),
            echo=os.getenv('DB_ECHO', 'false').lower() == 'true'
        )


@dataclass
class FraudDetectionConfig:
    """Fraud detection configuration"""
    enabled: bool = True
    
    # Thresholds
    bot_score_threshold: int = 50
    suspicious_score_threshold: int = 30
    
    # Rate limiting
    max_clicks_per_ip_per_hour: int = 100
    max_clicks_per_session_per_hour: int = 50
    
    # External services
    maxmind_license_key: Optional[str] = None
    ipapi_key: Optional[str] = None
    
    @classmethod
    def from_env(cls) -> 'FraudDetectionConfig':
        """Create fraud detection config from environment variables"""
        return cls(
            enabled=os.getenv('FRAUD_DETECTION_ENABLED', 'true').lower() == 'true',
            bot_score_threshold=int(os.getenv('FRAUD_BOT_THRESHOLD', '50')),
            suspicious_score_threshold=int(os.getenv('FRAUD_SUSPICIOUS_THRESHOLD', '30')),
            max_clicks_per_ip_per_hour=int(os.getenv('FRAUD_MAX_CLICKS_IP_HOUR', '100')),
            max_clicks_per_session_per_hour=int(os.getenv('FRAUD_MAX_CLICKS_SESSION_HOUR', '50')),
            maxmind_license_key=os.getenv('MAXMIND_LICENSE_KEY'),
            ipapi_key=os.getenv('IPAPI_KEY')
        )


@dataclass
class AnalyticsConfig:
    """Analytics and reporting configuration"""
    enabled: bool = True
    
    # Data retention
    click_data_retention_days: int = 90
    conversion_data_retention_days: int = 365
    billing_data_retention_days: int = 2555  # 7 years
    
    # Reporting
    daily_reports_enabled: bool = True
    weekly_reports_enabled: bool = True
    monthly_reports_enabled: bool = True
    
    # External analytics
    google_analytics_enabled: bool = False
    google_analytics_tracking_id: Optional[str] = None
    
    @classmethod
    def from_env(cls) -> 'AnalyticsConfig':
        """Create analytics config from environment variables"""
        return cls(
            enabled=os.getenv('ANALYTICS_ENABLED', 'true').lower() == 'true',
            click_data_retention_days=int(os.getenv('ANALYTICS_CLICK_RETENTION_DAYS', '90')),
            conversion_data_retention_days=int(os.getenv('ANALYTICS_CONVERSION_RETENTION_DAYS', '365')),
            billing_data_retention_days=int(os.getenv('ANALYTICS_BILLING_RETENTION_DAYS', '2555')),
            daily_reports_enabled=os.getenv('ANALYTICS_DAILY_REPORTS', 'true').lower() == 'true',
            weekly_reports_enabled=os.getenv('ANALYTICS_WEEKLY_REPORTS', 'true').lower() == 'true',
            monthly_reports_enabled=os.getenv('ANALYTICS_MONTHLY_REPORTS', 'true').lower() == 'true',
            google_analytics_enabled=os.getenv('GA_ENABLED', 'false').lower() == 'true',
            google_analytics_tracking_id=os.getenv('GA_TRACKING_ID')
        )


@dataclass
class SecurityConfig:
    """Security and privacy configuration"""
    # IP hashing
    ip_hash_salt: str = "monetization_2024"
    
    # Attribution windows
    default_attribution_window_hours: int = 720  # 30 days
    max_attribution_window_hours: int = 2160     # 90 days
    
    # Rate limiting
    rate_limit_enabled: bool = True
    rate_limit_requests_per_minute: int = 100
    
    # CORS
    cors_origins: list = ["*"]
    cors_credentials: bool = True
    
    @classmethod
    def from_env(cls) -> 'SecurityConfig':
        """Create security config from environment variables"""
        cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')
        if cors_origins == ['*']:
            cors_origins = ["*"]
        
        return cls(
            ip_hash_salt=os.getenv('IP_HASH_SALT', 'monetization_2024'),
            default_attribution_window_hours=int(os.getenv('DEFAULT_ATTRIBUTION_HOURS', '720')),
            max_attribution_window_hours=int(os.getenv('MAX_ATTRIBUTION_HOURS', '2160')),
            rate_limit_enabled=os.getenv('RATE_LIMIT_ENABLED', 'true').lower() == 'true',
            rate_limit_requests_per_minute=int(os.getenv('RATE_LIMIT_PER_MINUTE', '100')),
            cors_origins=cors_origins,
            cors_credentials=os.getenv('CORS_CREDENTIALS', 'true').lower() == 'true'
        )


@dataclass
class RedirectConfig:
    """Redirect system configuration"""
    # URL validation
    allowed_domains: Optional[list] = None
    blocked_domains: list = None
    
    # Default behavior
    default_redirect_status: int = 302
    enable_redirect_caching: bool = True
    redirect_cache_ttl_seconds: int = 300  # 5 minutes
    
    # Fallback behavior
    fallback_url: Optional[str] = None
    error_redirect_url: Optional[str] = None
    
    @classmethod
    def from_env(cls) -> 'RedirectConfig':
        """Create redirect config from environment variables"""
        allowed_domains = None
        if os.getenv('ALLOWED_REDIRECT_DOMAINS'):
            allowed_domains = os.getenv('ALLOWED_REDIRECT_DOMAINS').split(',')
        
        blocked_domains = []
        if os.getenv('BLOCKED_REDIRECT_DOMAINS'):
            blocked_domains = os.getenv('BLOCKED_REDIRECT_DOMAINS').split(',')
        
        return cls(
            allowed_domains=allowed_domains,
            blocked_domains=blocked_domains,
            default_redirect_status=int(os.getenv('REDIRECT_STATUS_CODE', '302')),
            enable_redirect_caching=os.getenv('REDIRECT_CACHING', 'true').lower() == 'true',
            redirect_cache_ttl_seconds=int(os.getenv('REDIRECT_CACHE_TTL', '300')),
            fallback_url=os.getenv('FALLBACK_REDIRECT_URL'),
            error_redirect_url=os.getenv('ERROR_REDIRECT_URL')
        )


class MonetizationConfig:
    """Main monetization system configuration"""
    
    def __init__(self, environment: Environment = None):
        self.environment = environment or Environment(os.getenv('ENVIRONMENT', 'development'))
        
        # Load all configurations
        self.stripe = StripeConfig.from_env()
        self.database = DatabaseConfig.from_env()
        self.fraud_detection = FraudDetectionConfig.from_env()
        self.analytics = AnalyticsConfig.from_env()
        self.security = SecurityConfig.from_env()
        self.redirect = RedirectConfig.from_env()
        
        # System settings
        self.debug = os.getenv('DEBUG', 'false').lower() == 'true'
        self.testing = self.environment == Environment.TESTING
        self.production = self.environment == Environment.PRODUCTION
        
        # Logging
        self.log_level = os.getenv('LOG_LEVEL', 'INFO')
        self.log_format = os.getenv('LOG_FORMAT', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    def is_stripe_configured(self) -> bool:
        """Check if Stripe is properly configured"""
        return bool(self.stripe.secret_key and self.stripe.webhook_secret)
    
    def is_fraud_detection_enabled(self) -> bool:
        """Check if fraud detection is enabled and configured"""
        return self.fraud_detection.enabled
    
    def get_database_url(self, test_suffix: str = "_test") -> str:
        """Get database URL, optionally with test suffix"""
        if self.testing and not self.database.url.endswith(test_suffix):
            return f"{self.database.url}{test_suffix}"
        return self.database.url
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary (for debugging)"""
        return {
            'environment': self.environment.value,
            'debug': self.debug,
            'testing': self.testing,
            'production': self.production,
            'stripe_configured': self.is_stripe_configured(),
            'fraud_detection_enabled': self.is_fraud_detection_enabled(),
            'analytics_enabled': self.analytics.enabled,
            'database_url': '***' if self.production else self.database.url,
            'stripe_secret_key': '***' if self.stripe.secret_key else None,
            'cors_origins': self.security.cors_origins,
            'rate_limit_enabled': self.security.rate_limit_enabled
        }


# Global configuration instance
config = MonetizationConfig()


def get_config() -> MonetizationConfig:
    """Get the global configuration instance"""
    return config


def reload_config() -> MonetizationConfig:
    """Reload configuration from environment variables"""
    global config
    config = MonetizationConfig()
    return config


def validate_config() -> list:
    """Validate configuration and return list of issues"""
    issues = []
    
    try:
        config = get_config()
        
        # Check required configurations
        if not config.is_stripe_configured():
            issues.append("Stripe configuration incomplete (STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET required)")
        
        if not config.database.url:
            issues.append("Database URL not configured")
        
        # Check production-specific requirements
        if config.production:
            if config.debug:
                issues.append("DEBUG should be disabled in production")
            
            if config.security.ip_hash_salt == "monetization_2024":
                issues.append("Default IP hash salt should be changed in production")
            
            if "*" in config.security.cors_origins:
                issues.append("CORS origins should be restricted in production")
        
        # Check Stripe configuration
        if config.stripe.secret_key and config.production:
            if not config.stripe.secret_key.startswith('sk_live_'):
                issues.append("Production should use live Stripe keys (sk_live_)")
        elif config.stripe.secret_key and not config.production:
            if not config.stripe.secret_key.startswith('sk_test_'):
                issues.append("Development should use test Stripe keys (sk_test_)")
        
        # Check fraud detection
        if config.fraud_detection.enabled and not config.fraud_detection.maxmind_license_key:
            issues.append("Fraud detection enabled but no MaxMind license key configured")
        
        # Check analytics retention
        if config.analytics.billing_data_retention_days < 365:
            issues.append("Billing data retention should be at least 365 days for compliance")
    
    except Exception as e:
        issues.append(f"Configuration validation error: {str(e)}")
    
    return issues


def print_config_summary():
    """Print configuration summary (for debugging)"""
    config = get_config()
    print("🔧 Monetization System Configuration")
    print("=" * 50)
    
    for key, value in config.to_dict().items():
        print(f"{key:25}: {value}")
    
    print("\n🔍 Configuration Validation")
    print("=" * 50)
    
    issues = validate_config()
    if issues:
        for issue in issues:
            print(f"❌ {issue}")
    else:
        print("✅ Configuration is valid")


if __name__ == "__main__":
    print_config_summary()