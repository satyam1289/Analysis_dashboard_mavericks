import redis
from app.config.settings import get_settings

def clear_cache():
    settings = get_settings()
    r = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB)
    # Get all keys related to dashboard results (upload_id:scope:scope_value:widget)
    # The keys use the format f"{upload_id}:{scope}:{scope_value}:{widget}"
    # We'll clear the whole DB for a full reset.
    r.flushdb()
    print("✅ Redis Cache Flushed Successfully!")

if __name__ == "__main__":
    clear_cache()
