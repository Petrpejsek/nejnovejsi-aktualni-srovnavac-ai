from fastapi import APIRouter, Depends, HTTPException, Query, status
import httpx
import logging
from typing import Optional

from ..config.settings import settings
from .auth_service import auth_service
from ..models.schemas import UserResponse

router = APIRouter(prefix="/admin/email", tags=["admin-email-events"])
logger = logging.getLogger(__name__)

POSTMARK_API = "https://api.postmarkapp.com"
TIMEOUT = 5.0
_rate_limiter: dict[int, list[float]] = {}

def _rate_limit_check(user_id: int, now: float) -> bool:
    # allow max 5 per 60s
    window = 60.0
    allowed = 5
    entries = _rate_limiter.get(user_id, [])
    entries = [t for t in entries if now - t < window]
    if len(entries) >= allowed:
        _rate_limiter[user_id] = entries
        return False
    entries.append(now)
    _rate_limiter[user_id] = entries
    return True

def _headers():
    return {
        "Accept": "application/json",
        "X-Postmark-Server-Token": settings.POSTMARK_SERVER_TOKEN,
    }

@router.get("/bounces")
async def list_bounces(
    type: Optional[str] = Query(None, alias="type"),
    count: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    try:
        params = {"count": count, "offset": offset}
        if type and type.lower() != "all":
            params["type"] = type
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(f"{POSTMARK_API}/bounces", headers=_headers(), params=params)
        if resp.status_code >= 400:
            raise HTTPException(status_code=502, detail="Failed to fetch bounces from provider")
        data = resp.json()
        # Normalize
        items = []
        for it in data.get("Bounces", []):
            items.append({
                "ID": it.get("ID"),
                "Type": it.get("Type"),
                "Email": it.get("Email"),
                "BouncedAt": it.get("BouncedAt"),
                "Description": it.get("Description"),
                "Inactive": it.get("Inactive"),
                "CanActivate": it.get("CanActivate"),
                "Details": it.get("Details"),
                "DumpAvailable": it.get("DumpAvailable"),
            })
        return {"TotalCount": data.get("TotalCount"), "Bounces": items}
    except HTTPException:
        raise
    except Exception:
        logger.warning("postmark.bounces.fetch_error")
        raise HTTPException(status_code=502, detail="Error contacting email provider")

@router.get("/bounces/{bounce_id}")
async def get_bounce(
    bounce_id: int,
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(f"{POSTMARK_API}/bounces/{bounce_id}", headers=_headers())
        if resp.status_code >= 400:
            raise HTTPException(status_code=502, detail="Failed to fetch bounce detail from provider")
        data = resp.json()
        # Return safe subset
        return {
            "ID": data.get("ID"),
            "Type": data.get("Type"),
            "Email": data.get("Email"),
            "BouncedAt": data.get("BouncedAt"),
            "Description": data.get("Description"),
            "Details": data.get("Details"),
            "DumpAvailable": data.get("DumpAvailable"),
            "Subject": data.get("Subject"),
            "CanActivate": data.get("CanActivate"),
        }
    except HTTPException:
        raise
    except Exception:
        logger.warning("postmark.bounce_detail.fetch_error")
        raise HTTPException(status_code=502, detail="Error contacting email provider")

@router.post("/bounces/{bounce_id}/activate")
async def activate_bounce(
    bounce_id: int,
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    # Rate limit per admin
    import time
    now = time.time()
    if not _rate_limit_check(int(current_user.id), now):
        raise HTTPException(status_code=429, detail="Too many activation attempts")

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            # (a) fetch detail
            d_resp = await client.get(f"{POSTMARK_API}/bounces/{bounce_id}", headers=_headers())
        if d_resp.status_code >= 400:
            raise HTTPException(status_code=502, detail="Failed to fetch bounce detail from provider")
        detail = d_resp.json()
        if not detail.get("Inactive") or not detail.get("CanActivate"):
            raise HTTPException(status_code=400, detail="Bounce not eligible for activation")

        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            a_resp = await client.put(f"{POSTMARK_API}/bounces/{bounce_id}/activate", headers=_headers())
        if a_resp.status_code >= 400:
            raise HTTPException(status_code=502, detail="Failed to activate address at provider")

        logger.info(
            "admin_activate_bounce",
            extra={
                "id": bounce_id,
                "email": detail.get("Email"),
                "type": detail.get("Type"),
                "admin_user_id": current_user.id,
            },
        )
        return {"ok": True, "id": bounce_id, "message": "Activated"}
    except HTTPException:
        raise
    except Exception:
        logger.warning("postmark.bounce_activate.error")
        raise HTTPException(status_code=502, detail="Error contacting email provider")


