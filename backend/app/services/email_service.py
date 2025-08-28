from typing import Protocol, TypedDict
import logging

logger = logging.getLogger(__name__)

class EmailResult(TypedDict, total=False):
    message_id: str
    provider: str
    status: str

class EmailService(Protocol):
    async def send_text_email(self, to: str, subject: str, text: str) -> EmailResult: ...
    async def send_email(self, to: str, subject: str, html: str | None = None, text: str | None = None) -> EmailResult: ...

class NoopEmailService:
    """No-op email service used when emailing is disabled."""

    async def send_text_email(self, to: str, subject: str, text: str) -> EmailResult:
        logger.info("Email disabled - not sending email", extra={"to": to, "subject": subject})
        return {"provider": "noop", "status": "disabled"}

    async def send_email(self, to: str, subject: str, html: str | None = None, text: str | None = None) -> EmailResult:
        logger.info("Email disabled - not sending email", extra={"to": to, "subject": subject})
        return {"provider": "noop", "status": "disabled"}

    # Shims for legacy calls from notification service (if any).
    async def send_price_alert(self, *args, **kwargs) -> EmailResult:
        return {"provider": "noop", "status": "disabled"}
    async def send_new_product_notification(self, *args, **kwargs) -> EmailResult:
        return {"provider": "noop", "status": "disabled"}
    async def send_review_response_notification(self, *args, **kwargs) -> EmailResult:
        return {"provider": "noop", "status": "disabled"}