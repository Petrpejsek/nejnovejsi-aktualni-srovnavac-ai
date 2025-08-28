from fastapi import APIRouter, Request, HTTPException, status
import hmac
import hashlib
import json
import logging

from ..config.settings import settings

router = APIRouter()
logger = logging.getLogger(__name__)

def _constant_time_equals(a: bytes, b: bytes) -> bool:
    return hmac.compare_digest(a, b)

@router.post("/webhooks/postmark")
async def webhooks_postmark(request: Request):
    if not settings.WEBHOOKS_ENABLED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Webhooks disabled")

    # Read raw body exactly as sent
    raw = await request.body()
    signature = request.headers.get("X-Postmark-Signature")
    if not signature:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing signature")

    # Compute HMAC-SHA256 over raw body
    mac = hmac.new(settings.POSTMARK_WEBHOOK_SECRET.encode("utf-8"), raw, hashlib.sha256)
    computed = mac.hexdigest()

    if not _constant_time_equals(computed.encode("utf-8"), signature.encode("utf-8")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")

    try:
        payload = json.loads(raw.decode("utf-8"))
    except Exception:
        # If parsing fails, still accept but log minimal info
        logger.warning("email.webhook invalid_json")
        return {"ok": True}

    # Extract safe fields
    record_type = payload.get("RecordType")
    msg_stream = payload.get("MessageStream")
    email = payload.get("Email") or payload.get("Recipient")
    msg_id = payload.get("MessageID") or payload.get("MessageId")
    bounced_at = payload.get("BouncedAt") or payload.get("ReceivedAt")
    p_type = payload.get("Type")
    description = payload.get("Description")
    details = payload.get("Details")
    inactive = payload.get("Inactive")
    tag = payload.get("Tag")

    # Limit details field length to keep logs compact
    if isinstance(details, str) and len(details) > 300:
        details = details[:300] + "..."

    log_obj = {
        "event": "postmark",
        "message_stream": msg_stream,
        "record_type": record_type,
        "type": p_type,
        "email": email,
        "message_id": msg_id,
        "timestamp": bounced_at,
        "description": description,
        "details": details,
        "inactive": inactive,
        "tag": tag,
    }
    logger.info(json.dumps(log_obj, ensure_ascii=False))
    return {"ok": True}


