from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
import logging

from ..config.settings import settings
from ..api.auth_service import auth_service
from ..models.schemas import UserResponse
from ..services.email_factory import get_email_service
from ..services.email_template_renderer import email_template_renderer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/email", tags=["admin-email"])

class EmailTestRequest(BaseModel):
    to: EmailStr
    subject: str = Field(..., min_length=3, max_length=200)
    text: str = Field(..., min_length=1, max_length=5000)

class EmailTestResponse(BaseModel):
    ok: bool
    provider: str | None = None
    messageId: str | None = None
    status: str | None = None

@router.post("/test", response_model=EmailTestResponse)
async def send_test_email(
    body: EmailTestRequest,
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    # Admin-only
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    # Gate emailing
    if not settings.EMAIL_ENABLED:
        reason = settings.email_missing_reason()
        raise HTTPException(status_code=400, detail=f"Email disabled ({reason})")

    email_service = get_email_service()

    logger.info("Sending test email", extra={"to": body.to, "subject": body.subject, "provider": settings.EMAIL_PROVIDER})
    result = await email_service.send_text_email(body.to, body.subject, body.text)

    return EmailTestResponse(
        ok=True,
        provider=result.get("provider"),
        messageId=result.get("message_id"),
        status=result.get("status")
    )


class TemplatePreviewRequest(BaseModel):
    template: str
    locale: str = "en"
    variables: dict = {}

class TemplatePreviewResponse(BaseModel):
    html: str
    text: str
    subject: str | None = None

@router.post("/preview-template", response_model=TemplatePreviewResponse)
async def preview_template(
    body: TemplatePreviewRequest,
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    try:
        html, text, subject = email_template_renderer.render(
            template_name=body.template,
            locale=body.locale,
            variables=body.variables or {}
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return TemplatePreviewResponse(html=html, text=text, subject=subject)


class SendTemplateTestRequest(BaseModel):
    to: EmailStr
    template: str
    locale: str = "en"
    variables: dict = {}

@router.post("/send-template-test", response_model=EmailTestResponse)
async def send_template_test(
    body: SendTemplateTestRequest,
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    if not settings.EMAIL_ENABLED:
        reason = settings.email_missing_reason()
        raise HTTPException(status_code=400, detail=f"Email disabled ({reason})")
    try:
        html, text, subject = email_template_renderer.render(
            template_name=body.template,
            locale=body.locale,
            variables=body.variables or {}
        )
        email_service = get_email_service()
        result = await email_service.send_email(
            to=body.to,
            subject=subject,
            html=html,
            text=text
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return EmailTestResponse(
        ok=True,
        provider=result.get("provider"),
        messageId=result.get("message_id"),
        status=result.get("status")
    )


