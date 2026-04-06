import re
from app.db.session import SessionLocal
from app.db.models import Article, ClientAlias
from sqlalchemy import select, update

def bulk_retag_fast():
    db = SessionLocal()
    try:
        # Get all aliases
        aliases = db.execute(select(ClientAlias.client_name, ClientAlias.alias)).all()
        alias_pairs = [(row[0], row[1]) for row in aliases]
        print(f"Loaded {len(alias_pairs)} brand aliases.")
        
        # Get all articles for re-tagging
        articles = db.execute(select(Article.id, Article.title, Article.summary, Article.client_tags)).all()
        print(f"Total articles in database: {len(articles)}")
        
        updated_count = 0
        total_articles = len(articles)
        
        for idx, row in enumerate(articles):
            a_id, a_title, a_summary, a_tags = row[0], row[1], row[2], row[3]
            tags = set(a_tags or [])
            combined_text = ((a_title or "") + " " + (a_summary or "")).lower()
            
            for client_name, alias in alias_pairs:
                if re.search(r'\b' + re.escape(alias.lower()) + r'\b', combined_text):
                    tags.add(client_name)
            
            new_tags = sorted(list(tags))
            if new_tags != (a_tags or []):
                db.execute(update(Article).where(Article.id == a_id).values(client_tags=new_tags))
                updated_count += 1
            
            if idx % 500 == 0:
                db.commit()
                print(f"Processed {idx}/{total_articles}...")

        db.commit()
        print(f"Re-tagging complete! Updated {updated_count} articles total.")
    finally:
        db.close()

if __name__ == "__main__":
    bulk_retag_fast()
