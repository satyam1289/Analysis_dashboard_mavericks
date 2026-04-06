from sqlalchemy import delete

from app.db.models import PublisherTier
from app.db.session import SessionLocal

TIER_1_PUBLISHERS = [
    "economictimes.com",
    "businessstandard.com",
    "livemint.com",
    "thehindu.com",
    "hindustantimes.com",
    "ndtv.com",
    "timesofindia.com",
    "financialexpress.com",
    "moneycontrol.com",
    "bloomberg.com",
    "reuters.com",
    "ft.com",
    "wsj.com",
    "techcrunch.com",
    "forbes.com",
    "fortune.com",
    "inc42.com",
    "entrackr.com",
]
TIER_2_PUBLISHERS = [
    "yourstory.com",
    "vccircle.com",
    "dealstreetasia.com",
    "medianama.com",
    "gadgets360.com",
    "91mobiles.com",
    "digit.in",
    "thequint.com",
    "scroll.in",
    "thewire.in",
    "newslaundry.com",
    "outlookindia.com",
    "theweek.in",
]


def seed():
    with SessionLocal() as db:
        db.execute(delete(PublisherTier))
        for d in TIER_1_PUBLISHERS:
            db.add(PublisherTier(domain=d, publisher_name=d, tier=1))
        for d in TIER_2_PUBLISHERS:
            db.add(PublisherTier(domain=d, publisher_name=d, tier=2))
        db.commit()


if __name__ == "__main__":
    seed()
