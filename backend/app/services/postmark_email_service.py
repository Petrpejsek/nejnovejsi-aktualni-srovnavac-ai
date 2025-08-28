import httpx
import logging
from typing import Optional

from ..config.settings import settings
from .email_service import EmailService, EmailResult

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT_SECONDS = 5.0

class PostmarkEmailService(EmailService):
    def __init__(self, timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS):
        self.timeout_seconds = timeout_seconds
        self.api_url = "https://api.postmarkapp.com/email"
        self.token = settings.POSTMARK_SERVER_TOKEN
        self.from_email = settings.EMAIL_FROM
        self.stream = settings.POSTMARK_MESSAGE_STREAM

    async def _send_once(self, to: str, subject: str, html: Optional[str], text: Optional[str]) -> tuple[int, Optional[dict]]:
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Postmark-Server-Token": self.token,
        }
        payload = {
            "From": self.from_email,
            "To": to,
            "Subject": subject,
            "MessageStream": self.stream,
        }
        if html is not None:
            payload["HtmlBody"] = html
        if text is not None:
            payload["TextBody"] = text
        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            resp = await client.post(self.api_url, headers=headers, json=payload)
            try:
                data = resp.json()
            except Exception:
                data = None
            return resp.status_code, data

    async def send_email(self, to: str, subject: str, html: Optional[str] = None, text: Optional[str] = None) -> EmailResult:
        if not settings.EMAIL_ENABLED:
            logger.info("Email disabled - blocking Postmark send", extra={"to": to, "subject": subject})
            return {"provider": "postmark", "status": "disabled"}
        # Strict input validation (no fallback here)
        if not subject or not str(subject).strip():
            raise ValueError("Subject is required")
        if html is None or not str(html).strip():
            raise ValueError("HTML body is required")
        if text is None or not str(text).strip():
            raise ValueError("Plain text part missing")

        # First attempt
        try:
            status_code, data = await self._send_once(to, subject, html, text)
        except (httpx.TimeoutException, httpx.TransportError) as e:
            logger.warning("Postmark send timeout/transport error, retrying once", exc_info=False)
            # One simple retry
            status_code, data = await self._send_once(to, subject, html, text)
        else:
            # Retry on 5xx
            if status_code >= 500:
                logger.warning("Postmark 5xx response, retrying once", extra={"status_code": status_code})
                status_code, data = await self._send_once(to, subject, html, text)
        
        # Logging
        logger.info("Email send attempt", extra={"to": to, "subject": subject, "provider": "postmark", "status_code": status_code})
        if data is not None:
            # Only debug the response body
            logger.debug("Postmark response", extra={"status_code": status_code, "body": str(data)[:500]})

        # Build result
        result: EmailResult = {"provider": "postmark"}
        if data and isinstance(data, dict):
            message_id = data.get("MessageID") or data.get("MessageId") or data.get("Message-ID")
            if message_id:
                result["message_id"] = str(message_id)
            error_code = data.get("ErrorCode")
            message = data.get("Message")
            result["status"] = f"{status_code}:{error_code}:{message}" if error_code or message else str(status_code)
        else:
            result["status"] = str(status_code)

        # Raise warnings for non-2xx
        if not (200 <= status_code < 300):
            logger.warning("Postmark send failed", extra={"status_code": status_code, "short_body": str(data)[:200] if data else None})

        return result

    async def send_text_email(self, to: str, subject: str, text: str) -> EmailResult:
        return await self.send_email(to=to, subject=subject, html=None, text=text)


