import logging
from ..config.settings import settings
from .email_service import NoopEmailService, EmailService
from .postmark_email_service import PostmarkEmailService

logger = logging.getLogger(__name__)

def get_email_service() -> EmailService:
    if not settings.EMAIL_ENABLED:
        reason = settings.email_missing_reason()
        logger.info("Email disabled", extra={"reason": reason})
        return NoopEmailService()

    provider = (settings.EMAIL_PROVIDER or "").lower()
    if provider == "postmark":
        return PostmarkEmailService()

    raise RuntimeError(f"Unknown email provider: {settings.EMAIL_PROVIDER}")


