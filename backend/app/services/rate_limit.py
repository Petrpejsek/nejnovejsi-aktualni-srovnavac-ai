import time
from typing import Dict, List

class RateLimitError(Exception):
    pass

_BUCKETS: Dict[str, List[float]] = {}

def check_rate_limit(key: str, window_sec: int, limit: int) -> None:
    now = time.time()
    entries = _BUCKETS.get(key, [])
    entries = [t for t in entries if now - t < window_sec]
    if len(entries) >= limit:
        _BUCKETS[key] = entries
        raise RateLimitError("Too many requests")
    entries.append(now)
    _BUCKETS[key] = entries


