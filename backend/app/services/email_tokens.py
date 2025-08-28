from datetime import datetime, timedelta, timezone
from typing import Union
from jose import jwt

from ..config.settings import settings


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _create_token(user_id: Union[str, int], email: str, ttl_min: int, purpose: str) -> str:
    if not email or "@" not in email:
        raise ValueError("Invalid email")
    user_sub = str(user_id) if user_id is not None else "0"
    if not settings.EMAIL_TOKEN_SECRET:
        raise ValueError("EMAIL_TOKEN_SECRET not configured")
    exp = _now_utc() + timedelta(minutes=int(ttl_min))
    claims = {
        "sub": user_sub,
        "email": email,
        "purpose": purpose,
        "exp": exp,
    }
    return jwt.encode(claims, settings.EMAIL_TOKEN_SECRET, algorithm="HS256")


def create_reset_token(user_id: Union[str, int], email: str, ttl_min: int) -> str:
    return _create_token(user_id, email, ttl_min, "reset")


def create_verify_token(user_id: Union[str, int], email: str, ttl_min: int) -> str:
    return _create_token(user_id, email, ttl_min, "verify")


