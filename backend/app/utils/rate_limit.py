"""
Simple Redis-backed rate limiter using sliding window counters.
Usage: @router.post("/", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
"""
from fastapi import Request, HTTPException
from app.core.redis_client import get_redis


class RateLimiter:
    def __init__(self, times: int = 60, seconds: int = 60):
        self.times = times
        self.seconds = seconds

    async def __call__(self, request: Request):
        redis = await get_redis()
        client_ip = request.client.host if request.client else "unknown"
        key = f"rate_limit:{request.url.path}:{client_ip}"

        current = await redis.incr(key)
        if current == 1:
            await redis.expire(key, self.seconds)

        if current > self.times:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {self.times} requests per {self.seconds}s.",
            )
