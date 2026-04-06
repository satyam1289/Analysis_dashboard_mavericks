import os
import sys
import re
import spacy
from rapidfuzz import fuzz
from sqlalchemy import select, delete

# Add the project root to the python path
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.db.models import Article, ClientAlias, AggregationCache, Upload
from app.workers.phase6_aggregate import phase6_aggregate

def reprocess():
    NLP = spacy.load("en_core_web_lg")
    
    with SessionLocal() as db:
        # Get all client aliases
        aliases = db.execute(select(ClientAlias)).scalars().all()
        alias_pairs = [(a.client_name, a.alias) for a in aliases]
        
        # Get all uploads
        uploads = db.execute(select(Upload)).scalars().all()
        
        for upload in uploads:
            print(f"Reprocessing upload {upload.id} ({upload.filename})...")
            
            # Clear existing client cache and tags for this upload
            db.execute(delete(AggregationCache).where(
                AggregationCache.upload_id == upload.id,
                AggregationCache.scope == "client"
            ))
            
            articles = db.execute(select(Article).where(
                Article.upload_id == upload.id,
                Article.is_english.is_(True)
            )).scalars().all()
            
            for article in articles:
                text = ((article.clean_title or "") + " " + (article.clean_summary or "")).lower()
                tags = set()
                
                # Use faster string matching for broad coverage
                for client_name, alias in alias_pairs:
                    # Case insensitive search
                    if re.search(r'\b' + re.escape(alias.lower()) + r'\b', text):
                        tags.add(client_name)
                
                article.client_tags = sorted(list(tags))
            
            db.commit()
            print(f"Tagged articles for {upload.id}. Now re-aggregating...")
            
            # Trigger aggregation for the new tags
            phase6_aggregate(str(upload.id))
            
        print("Success! Client View data has been refreshed.")

if __name__ == "__main__":
    reprocess()
