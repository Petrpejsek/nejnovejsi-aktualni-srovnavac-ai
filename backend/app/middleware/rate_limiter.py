from fastapi import Request, HTTPException
from ..services.cache_service import cache_service
import time
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.enabled = cache_service.enabled

    async def __call__(self, request: Request):
        if not self.enabled:
            return
            
        try:
            client_ip = request.client.host
            current_time = int(time.time())
            key = f"rate_limit:{client_ip}:{current_time // 60}"
            
            requests = cache_service.get(key)
            requests = int(requests) if requests else 0
            
            if requests >= self.requests_per_minute:
                raise HTTPException(status_code=429, detail="Too many requests")
            
            cache_service.set(key, str(requests + 1), expire=60)
        except Exception as e:
            logger.error(f"Rate limiter error: {e}")
            # V případě chyby povolíme request
            return

rate_limiter = RateLimiter() 