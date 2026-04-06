from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sqlalchemy import select

from app.db.models import Article
from app.db.session import SessionLocal

# OPTIMIZATION: Initialize with custom PR/Business lexicon boosts
ANALYZER = SentimentIntensityAnalyzer()
ANALYZER.lexicon.update({
    "innovative": 3.5,
    "groundbreaking": 4.0,
    "leadership": 2.5,
    "partnership": 2.0,
    "misleading": -3.5,
    "crisis": -4.0,
    "fraud": -4.0,
    "bankruptcy": -4.0,
    "lawsuit": -3.0,
    "scam": -4.0,
    "surge": 2.0,
    "plunge": -2.0,
})


def _label(title_score: float, summary_score: float) -> str:
    """
    OPTIMIZATION: Hybrid Weighted Sentiment.
    News headlines are often stronger than summaries. We weight Title 60% and Summary 40%.
    We also widen the neutral band to 0.1 (from 0.05) to reduce noise.
    """
    combined = (title_score * 0.6) + (summary_score * 0.4)
    if combined >= 0.1:
        return "positive"
    if combined <= -0.1:
        return "negative"
    return "neutral"


def phase3_sentiment(upload_id: str):
    with SessionLocal() as db:
        articles = db.execute(
            select(Article).where(
                Article.upload_id == upload_id,
                Article.is_duplicate.is_(False),
                Article.is_english.is_(True),
            )
        ).scalars().all()
        
        for article in articles:
            # Score summary (if exists)
            try:
                s_sum = ANALYZER.polarity_scores(article.clean_summary or "")["compound"] if article.clean_summary else 0.0
            except Exception:
                s_sum = 0.0
            
            # Score title (if exists)
            try:
                s_title = ANALYZER.polarity_scores(article.clean_title or "")["compound"] if article.clean_title else 0.0
            except Exception:
                s_title = 0.0
            
            article.sentiment_summary = s_sum
            article.sentiment_title = s_title
            # Use optimized hybrid labeler
            article.sentiment_label = _label(s_title, s_sum)
            
        db.commit()
