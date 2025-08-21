from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import hmac
import hashlib
import os
import httpx
from datetime import datetime, timezone

router = APIRouter(prefix="/affiliate", tags=["affiliate"])


class PostbackPayload(BaseModel):
    partner_id: str
    offer_id: str | None = None
    click_id: str
    network_txn_id: str
    status: str = "approved"
    payout_value_minor: int
    currency: str = "USD"
    timestamp: int | None = None  # epoch millis
    signature: str | None = None
    nonce: str | None = None
    raw: dict | None = None


def verify_hmac(signature: str | None, body: bytes, secret: str | None) -> bool:
    if not secret:
        return False
    if not signature:
        return False
    digest = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, signature)


@router.post("/postback")
async def affiliate_postback(request: Request):
    raw_body = await request.body()
    try:
        data = PostbackPayload(**(await request.json()))
    except Exception:
        raise HTTPException(status_code=400, detail="invalid json")

    # Basic replay and freshness window (24h)
    now = datetime.now(timezone.utc)
    if data.timestamp:
        try:
            ts = datetime.fromtimestamp(data.timestamp / 1000, tz=timezone.utc)
            if abs((now - ts).total_seconds()) > 60 * 60 * 24:
                raise HTTPException(status_code=400, detail="timestamp out of window")
        except Exception:
            raise HTTPException(status_code=400, detail="invalid timestamp")

    # HMAC validation per partner
    partner_secret = os.getenv(f"AFFIL_{data.partner_id.upper()}_SECRET")
    signature_header = request.headers.get("x-signature") or data.signature
    if partner_secret and not verify_hmac(signature_header, raw_body, partner_secret):
        raise HTTPException(status_code=401, detail="invalid signature")

    # Idempotence: unique (partner_id, network_txn_id)
    # We store in Next.js DB via an internal endpoint or direct DB connection.
    # Here we call a Next.js internal API to persist and map click_id -> client_id/session.
    internal_api_url = os.getenv("INTERNAL_NEXT_API_URL")  # e.g., http://localhost:3000/api/admin/affiliate/postback-store
    internal_api_secret = os.getenv("INTERNAL_NEXT_API_SECRET")
    if not internal_api_url or not internal_api_secret:
        raise HTTPException(status_code=500, detail="server not configured")

    payload = data.model_dump()
    payload["received_at_iso"] = now.isoformat()

    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.post(
            internal_api_url,
            headers={
                "content-type": "application/json",
                "x-internal-secret": internal_api_secret,
            },
            json=payload,
        )
        if res.status_code >= 300:
            raise HTTPException(status_code=500, detail="store failed")

    return {"status": "ok"}


