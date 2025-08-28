from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
import logging

from ..config.settings import settings
from ..services.email_tokens import create_verify_token
from ..services.rate_limit import check_rate_limit, RateLimitError
from ..services.email_factory import get_email_service
from ..services.email_template_renderer import email_template_renderer

router = APIRouter()
logger = logging.getLogger(__name__)

class VerifyRequestBody(BaseModel):
    email: EmailStr
    user_id: str | int | None = None

@router.post("/auth/email/verify-request")
async def email_verify_request(body: VerifyRequestBody, request: Request):
    # Rate limit 1/10 min on email+IP
    client_ip = request.client.host if request.client else "0.0.0.0"
    key = f"verify:{body.email}:{client_ip}"
    try:
        check_rate_limit(key, window_sec=600, limit=1)
    except RateLimitError as e:
        raise HTTPException(status_code=429, detail=str(e))

    try:
        if not settings.EMAIL_TOKENS_ENABLED:
            return {"ok": True}

        token = create_verify_token(body.user_id or "0", str(body.email), settings.EMAIL_VERIFY_TOKEN_TTL_MIN)
        action_url = f"https://comparee.ai/account/verify?token={token}"

        html, text, subject = email_template_renderer.render(
            template_name="verify_email",
            locale="en",
            variables={"action_url": action_url}
        )

        email_service = get_email_service()
        await email_service.send_email(to=str(body.email), subject=subject, html=html, text=text)
        logger.info("tx_email.verify_email_sent", extra={"email": str(body.email), "user_id": body.user_id})
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=502, detail="Email provider error")

    return {"ok": True}


