"""
Monetization Utilities

Helper functions and utilities for the monetization system.
"""

import secrets
import string
import hashlib
import re
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs


def generate_ref_code(length: int = 8, prefix: str = "") -> str:
    """Generate a unique reference code"""
    chars = string.ascii_lowercase + string.digits
    random_part = ''.join(secrets.choice(chars) for _ in range(length))
    
    if prefix:
        return f"{prefix}-{random_part}"
    return random_part


def validate_ref_code(ref_code: str) -> bool:
    """Validate reference code format"""
    if not ref_code or len(ref_code) < 3:
        return False
    
    # Only allow alphanumeric, hyphens, and underscores
    pattern = r'^[a-zA-Z0-9_-]+$'
    return bool(re.match(pattern, ref_code))


def sanitize_ref_code(ref_code: str) -> str:
    """Sanitize and normalize reference code"""
    if not ref_code:
        return ""
    
    # Convert to lowercase and replace invalid characters
    sanitized = re.sub(r'[^a-zA-Z0-9_-]', '', ref_code.lower())
    
    # Ensure minimum length
    if len(sanitized) < 3:
        sanitized += generate_ref_code(3)
    
    return sanitized


def hash_ip_address(ip_address: str, salt: str = "monetization_2024") -> str:
    """Hash IP address for privacy compliance"""
    if not ip_address:
        return ""
    
    return hashlib.sha256(f"{ip_address}{salt}".encode()).hexdigest()[:16]


def extract_utm_params(url: str) -> Dict[str, str]:
    """Extract UTM parameters from URL for tracking"""
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    
    utm_params = {}
    for key, values in params.items():
        if key.startswith('utm_') and values:
            utm_params[key] = values[0]
    
    return utm_params


def build_affiliate_url(base_url: str, ref_code: str, additional_params: Optional[Dict[str, str]] = None) -> str:
    """Build affiliate URL with reference code and optional parameters"""
    if not base_url:
        return ""
    
    # Parse existing URL
    parsed = urlparse(base_url)
    params = parse_qs(parsed.query)
    
    # Add ref parameter
    params['ref'] = [ref_code]
    
    # Add additional parameters
    if additional_params:
        for key, value in additional_params.items():
            params[key] = [str(value)]
    
    # Rebuild query string
    query_parts = []
    for key, values in params.items():
        for value in values:
            query_parts.append(f"{key}={value}")
    
    new_query = "&".join(query_parts)
    
    # Rebuild URL
    if parsed.scheme and parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{new_query}"
    else:
        return f"{base_url}?{new_query}"


def validate_url(url: str) -> bool:
    """Validate URL format"""
    if not url:
        return False
    
    try:
        parsed = urlparse(url)
        return bool(parsed.scheme and parsed.netloc)
    except:
        return False


def calculate_attribution_window(click_timestamp: datetime, conversion_timestamp: datetime, 
                               window_hours: int = 720) -> bool:
    """Check if conversion is within attribution window"""
    time_diff = conversion_timestamp - click_timestamp
    return time_diff <= timedelta(hours=window_hours)


def calculate_commission(conversion_value: float, commission_rate: float) -> float:
    """Calculate commission amount"""
    if not conversion_value or not commission_rate:
        return 0.0
    
    return (conversion_value * commission_rate) / 100


def format_currency(amount: float, currency: str = "USD") -> str:
    """Format currency for display"""
    if currency == "USD":
        return f"${amount:.2f}"
    elif currency == "EUR":
        return f"€{amount:.2f}"
    elif currency == "GBP":
        return f"£{amount:.2f}"
    else:
        return f"{amount:.2f} {currency}"


def get_country_from_ip(ip_address: str) -> Optional[str]:
    """
    Get country code from IP address
    
    Note: This is a placeholder. In production, you would use a service like:
    - MaxMind GeoIP2
    - IP2Location
    - ipapi.co
    """
    # Placeholder implementation
    # In production, integrate with a proper GeoIP service
    return None


def detect_fraud_indicators(ip_hash: str, user_agent: str, referrer: str) -> Dict[str, Any]:
    """
    Detect potential fraud indicators
    
    Returns dict with fraud score and reasons.
    """
    fraud_score = 0
    indicators = []
    
    # Basic fraud detection (expand as needed)
    if not user_agent:
        fraud_score += 20
        indicators.append("missing_user_agent")
    
    if user_agent and ("bot" in user_agent.lower() or "crawler" in user_agent.lower()):
        fraud_score += 50
        indicators.append("bot_user_agent")
    
    # Check for suspicious referrers
    if referrer:
        suspicious_domains = ["localhost", "127.0.0.1", "192.168.", "10.0."]
        if any(domain in referrer for domain in suspicious_domains):
            fraud_score += 30
            indicators.append("suspicious_referrer")
    
    # More sophisticated fraud detection would include:
    # - IP reputation checks
    # - Click velocity analysis
    # - Device fingerprinting
    # - Pattern analysis
    
    return {
        "fraud_score": min(fraud_score, 100),  # Cap at 100
        "indicators": indicators,
        "is_suspicious": fraud_score >= 50
    }


def generate_session_id() -> str:
    """Generate unique session ID for tracking"""
    return secrets.token_urlsafe(32)


def parse_user_agent(user_agent: str) -> Dict[str, Optional[str]]:
    """
    Parse user agent string to extract browser and OS info
    
    Note: This is a basic implementation. For production, consider using
    a library like user-agents or ua-parser.
    """
    if not user_agent:
        return {"browser": None, "os": None, "device": None}
    
    user_agent_lower = user_agent.lower()
    
    # Basic browser detection
    browser = None
    if "chrome" in user_agent_lower and "edge" not in user_agent_lower:
        browser = "Chrome"
    elif "firefox" in user_agent_lower:
        browser = "Firefox"
    elif "safari" in user_agent_lower and "chrome" not in user_agent_lower:
        browser = "Safari"
    elif "edge" in user_agent_lower:
        browser = "Edge"
    
    # Basic OS detection
    os = None
    if "windows" in user_agent_lower:
        os = "Windows"
    elif "mac" in user_agent_lower:
        os = "macOS"
    elif "linux" in user_agent_lower:
        os = "Linux"
    elif "android" in user_agent_lower:
        os = "Android"
    elif "ios" in user_agent_lower:
        os = "iOS"
    
    # Basic device detection
    device = None
    if "mobile" in user_agent_lower:
        device = "Mobile"
    elif "tablet" in user_agent_lower:
        device = "Tablet"
    else:
        device = "Desktop"
    
    return {
        "browser": browser,
        "os": os,
        "device": device
    }


def validate_stripe_webhook_signature(payload: bytes, signature: str, webhook_secret: str) -> bool:
    """
    Validate Stripe webhook signature
    
    This is a simplified version. Use stripe.Webhook.construct_event() in production.
    """
    try:
        import stripe
        stripe.Webhook.construct_event(payload, signature, webhook_secret)
        return True
    except:
        return False


def chunk_list(lst: list, chunk_size: int):
    """Split list into chunks of specified size"""
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]


def safe_float(value: Any, default: float = 0.0) -> float:
    """Safely convert value to float"""
    try:
        return float(value) if value is not None else default
    except (ValueError, TypeError):
        return default


def safe_int(value: Any, default: int = 0) -> int:
    """Safely convert value to int"""
    try:
        return int(value) if value is not None else default
    except (ValueError, TypeError):
        return default


def truncate_string(text: str, max_length: int = 255) -> str:
    """Truncate string to maximum length"""
    if not text:
        return ""
    
    return text[:max_length] if len(text) > max_length else text


def is_valid_email(email: str) -> bool:
    """Basic email validation"""
    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def mask_sensitive_data(data: str, show_last: int = 4) -> str:
    """Mask sensitive data for logging"""
    if not data or len(data) <= show_last:
        return "*" * len(data) if data else ""
    
    return "*" * (len(data) - show_last) + data[-show_last:]


class MonetizationError(Exception):
    """Base exception for monetization errors"""
    pass


class ConfigurationError(MonetizationError):
    """Configuration-related errors"""
    pass


class TrackingError(MonetizationError):
    """Tracking-related errors"""
    pass


class BillingError(MonetizationError):
    """Billing-related errors"""
    pass


class StripeError(MonetizationError):
    """Stripe integration errors"""
    pass