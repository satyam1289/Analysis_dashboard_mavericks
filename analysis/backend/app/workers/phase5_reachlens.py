import math
from datetime import datetime, timezone

from sqlalchemy import select

from app.db.models import Article
from app.db.session import SessionLocal


def _tier_score(tier: int | None) -> float:
    if tier == 1:
        return 1.0
    if tier == 2:
        return 0.6
    if tier == 3:
        return 0.3
    return 0.2


def run_reachlens(upload_id: str):
    with SessionLocal() as db:
        articles = db.execute(select(Article).where(Article.upload_id == upload_id, Article.is_duplicate.is_(False))).scalars().all()
        for a in articles:
            pa = _tier_score(a.publisher_tier)
            sw = min(1.0, abs(a.sentiment_summary or 0.0) + 0.1)
            vv = 0.5
            days = 0
            if a.published_at:
                days = (datetime.now(timezone.utc) - a.published_at).days
            rd = math.exp(-0.1 * max(0, days))
            raw = (pa * 0.35) + (sw * 0.25) + (vv * 0.25) + (rd * 0.15)
            a.reachlens_score = max(0.0, min(100.0, raw * 100.0))
        db.commit()
