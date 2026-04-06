from celery import Celery

from app.config.settings import get_settings

settings = get_settings()

celery_app = Celery(
    "pr_dashboard",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.workers.orchestrator"],
)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    beat_schedule={
        "mark-stale-pending-uploads": {
            "task": "app.workers.orchestrator.mark_stale_pending_uploads",
            "schedule": 300.0,
        }
    },
)
