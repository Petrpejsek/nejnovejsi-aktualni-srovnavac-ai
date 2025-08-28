from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import httpx
import os

from ..config.settings import settings
from ..api.auth_service import auth_service
from ..models.schemas import UserResponse

router = APIRouter(prefix="/admin/email", tags=["admin-email-diagnostics"])

class EmailDiagnosticsResponse(BaseModel):
    environment: str
    email_enabled: bool
    email_tokens_enabled: bool
    provider: str | None
    _from: str | None
    transactional_stream: str | None
    newsletter_stream: str | None
    missing: list[str]
    base_urls: dict
    version: str | None


@router.get("/diagnostics", response_model=EmailDiagnosticsResponse)
async def get_email_diagnostics(current_user: UserResponse = Depends(auth_service.get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    missing: list[str] = []
    reason = settings.email_missing_reason()
    if reason.startswith("missing secrets:"):
        items = reason.split(":", 1)[1].strip()
        if items:
            missing = [s.strip() for s in items.split(",") if s.strip()]
    elif reason and reason != "":
        # generic reason – not in production, unknown provider, etc.
        missing = [reason]

    base_urls = {
        "python_api_url": os.getenv("PYTHON_API_URL") or None,
        "next_public_api_base_url": os.getenv("NEXT_PUBLIC_API_BASE_URL") or None,
    }

    version = os.getenv("GIT_SHA") or os.getenv("BUILD_VERSION") or None

    return EmailDiagnosticsResponse(
        environment=settings.ENVIRONMENT,
        email_enabled=settings.EMAIL_ENABLED,
        email_tokens_enabled=settings.EMAIL_TOKENS_ENABLED,
        provider=settings.EMAIL_PROVIDER or None,
        _from=settings.EMAIL_FROM or None,
        transactional_stream=settings.POSTMARK_MESSAGE_STREAM or None,
        newsletter_stream=os.getenv("POSTMARK_NEWSLETTER_STREAM") or None,
        missing=missing,
        base_urls=base_urls,
        version=version,
    )


class PostmarkSanityResponse(BaseModel):
    ok: bool
    server: dict | None = None


@router.get("/postmark-sanity", response_model=PostmarkSanityResponse)
async def postmark_sanity(current_user: UserResponse = Depends(auth_service.get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    if not (settings.EMAIL_PROVIDER == "postmark" and settings.POSTMARK_SERVER_TOKEN):
        raise HTTPException(status_code=502, detail="Postmark not configured")

    headers = {"X-Postmark-Server-Token": settings.POSTMARK_SERVER_TOKEN}
    timeout = httpx.Timeout(5.0)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            # Lightweight info endpoint
            r = await client.get("https://api.postmarkapp.com/server", headers=headers)
            if r.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Postmark error {r.status_code}")
            data = r.json()
            # Redact sensitive fields
            if "ApiTokens" in data:
                data["ApiTokens"] = ["REDACTED"]
            return PostmarkSanityResponse(ok=True, server=data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Postmark sanity failed: {e}")


