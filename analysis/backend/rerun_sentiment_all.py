"""Re-run sentiment + aggregation on ALL uploads to ensure full coverage."""
from sqlalchemy import select, update
from app.db.models import Upload, Article
from app.db.session import SessionLocal
from app.workers.phase3_sentiment import phase3_sentiment, ANALYZER, _label
from app.workers.phase6_aggregate import phase6_aggregate

def rerun_all():
    with SessionLocal() as db:
        upload_ids = db.execute(select(Upload.id).where(Upload.status == "complete")).scalars().all()
    
    print(f"Found {len(upload_ids)} completed uploads to process")
    
    for uid in upload_ids:
        print(f"\n--- Processing upload: {uid} ---")
        
        # Re-score ALL articles (not just NULL ones)
        with SessionLocal() as db:
            articles = db.execute(
                select(Article).where(
                    Article.upload_id == uid,
                    Article.is_duplicate.is_(False),
                    Article.is_english.is_(True),
                )
            ).scalars().all()
            
            print(f"  Re-scoring {len(articles)} articles...")
            
            for article in articles:
                try:
                    s_sum = ANALYZER.polarity_scores(article.clean_summary or "")["compound"] if article.clean_summary else 0.0
                except Exception:
                    s_sum = 0.0
                
                try:
                    s_title = ANALYZER.polarity_scores(article.clean_title or "")["compound"] if article.clean_title else 0.0
                except Exception:
                    s_title = 0.0
                
                article.sentiment_summary = s_sum
                article.sentiment_title = s_title
                article.sentiment_label = _label(s_title, s_sum)
            
            db.commit()
            print(f"  Sentiment scoring done.")
        
        # Re-aggregate
        print(f"  Re-aggregating...")
        phase6_aggregate(uid)
        print(f"  Done.")
    
    print("\n=== ALL UPLOADS RE-PROCESSED ===")

if __name__ == "__main__":
    rerun_all()
