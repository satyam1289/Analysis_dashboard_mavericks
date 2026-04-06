from celery.result import AsyncResult
from fastapi import APIRouter
from redis import Redis
from sqlalchemy import text

from app.config.settings import get_settings
from app.db.session import SessionLocal
from app.workers.celery_app import celery_app

router = APIRouter(tags=["health"])
settings = get_settings()


@router.get("/health")
def health():
    db_ok = "disconnected"
    redis_ok = "disconnected"
    celery_ok = "disconnected"

    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        db_ok = "connected"
    except Exception:
        pass

    try:
        Redis.from_url(settings.redis_url).ping()
        redis_ok = "connected"
    except Exception:
        pass

    try:
        _ = AsyncResult("health-check", app=celery_app)
        celery_ok = "connected"
    except Exception:
        pass

    return {"status": "ok", "db": db_ok, "redis": redis_ok, "celery": celery_ok}
