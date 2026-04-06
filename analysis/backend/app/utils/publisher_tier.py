from urllib.parse import urlparse

from rapidfuzz import fuzz
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config.settings import get_settings
from app.db.models import PublisherTier

settings = get_settings()


def get_domain(url_or_name: str | None) -> str:
    if not url_or_name:
        return ""
    raw = url_or_name.strip().lower()
    if "://" in raw:
        return urlparse(raw).netloc.replace("www.", "")
    return raw.replace("www.", "")


def resolve_publisher_tier(db: Session, publisher: str | None) -> int:
    domain = get_domain(publisher)
    if not domain:
        return 3
    tiers = db.execute(select(PublisherTier)).scalars().all()
    best_score = -1
    best_tier = 3
    for row in tiers:
        score = fuzz.token_sort_ratio(domain, row.domain.lower())
        if score > best_score and score >= settings.RAPIDFUZZ_THRESHOLD:
            best_score = score
            best_tier = int(row.tier)
    return best_tier
