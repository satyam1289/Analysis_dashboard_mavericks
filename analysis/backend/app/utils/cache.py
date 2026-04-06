import json
import logging

import redis
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config.settings import get_settings
from app.db.models import AggregationCache

logger = logging.getLogger(__name__)
settings = get_settings()


def get_redis_client() -> redis.Redis:
    return redis.Redis.from_url(settings.redis_url, decode_responses=True)


def cache_get_or_db(db: Session, key: str, upload_id: str, scope: str, scope_value: str, widget: str):
    try:
        value = get_redis_client().get(key)
        if value:
            return json.loads(value)
    except Exception:
        logger.warning("redis_unavailable_fallback_db", extra={"key": key})

    stmt = select(AggregationCache).where(
        AggregationCache.upload_id == upload_id,
        AggregationCache.scope == scope,
        AggregationCache.scope_value == scope_value,
        AggregationCache.widget == widget,
    )
    row = db.execute(stmt).scalar_one_or_none()
    return row.payload if row else None
