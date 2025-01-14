import redis
from typing import Optional, Any
from ..core.settings import settings
import logging

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        try:
            self.redis = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                password=settings.REDIS_PASSWORD,
                decode_responses=True
            )
            self.enabled = True
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Cache will be disabled.")
            self.enabled = False
    
    def get(self, key: str) -> Optional[Any]:
        if not self.enabled:
            return None
        try:
            return self.redis.get(key)
        except Exception as e:
            logger.error(f"Redis get error: {e}")
            return None
    
    def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        if not self.enabled:
            return False
        try:
            return self.redis.set(key, value, ex=expire)
        except Exception as e:
            logger.error(f"Redis set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        if not self.enabled:
            return False
        try:
            return bool(self.redis.delete(key))
        except Exception as e:
            logger.error(f"Redis delete error: {e}")
            return False

cache_service = CacheService() 