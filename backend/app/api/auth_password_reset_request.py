from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
import logging

from ..core.settings import settings
from ..services.email_tokens import create_reset_token
from ..services.rate_limit import check_rate_limit, RateLimitError
from ..services.email_factory import get_email_service
from ..services.email_template_renderer import email_template_renderer

router = APIRouter()
logger = logging.getLogger(__name__)

class ResetRequestBody(BaseModel):
    email: EmailStr
    user_id: str | int | None = None

@router.post("/auth/password/reset-request")
async def password_reset_request(body: ResetRequestBody, request: Request):
    # Rate limit 1/5 min on email+IP
    client_ip = request.client.host if request.client else "0.0.0.0"
    key = f"pwreset:{body.email}:{client_ip}"
    try:
        check_rate_limit(key, window_sec=300, limit=1)
    except RateLimitError as e:
        raise HTTPException(status_code=429, detail=str(e))

    # Neutral behavior: always return ok, but attempt send when possible
    try:
        if not settings.EMAIL_TOKENS_ENABLED:
            # Still neutral response, but no sending in non-prod or missing secret
            return {"ok": True}

        token = create_reset_token(body.user_id or "0", str(body.email), settings.PASSWORD_RESET_TOKEN_TTL_MIN)
        action_url = f"https://comparee.ai/account/reset?token={token}"

        # Render template (strict)
        html, text, subject = email_template_renderer.render(
            template_name="password_reset",
            locale="en",
            variables={"action_url": action_url}
        )

        email_service = get_email_service()
        await email_service.send_email(to=str(body.email), subject=subject, html=html, text=text)
        logger.info("tx_email.password_reset_sent", extra={"email": str(body.email), "user_id": body.user_id})
    except HTTPException:
        raise
    except ValueError as e:
        # Renderer or token validation error
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        # Provider/network error
        raise HTTPException(status_code=502, detail="Email provider error")

    return {"ok": True}


