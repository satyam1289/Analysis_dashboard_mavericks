from app.db.session import SessionLocal
from app.db.models import ClientAlias, Article
from sqlalchemy import select

def check():
    with SessionLocal() as db:
        alias_count = db.query(ClientAlias).count()
        article_count = db.query(Article).count()
        tagged_count = db.query(Article).filter(Article.client_tags != []).count()
        print(f"Aliases: {alias_count}")
        print(f"Articles: {article_count}")
        print(f"Tagged Articles: {tagged_count}")
        
        from sqlalchemy import func
        tags = db.execute(select(func.distinct(func.unnest(Article.client_tags)))).scalars().all()
        print(f"Unique Tags: {tags}")
        
if __name__ == "__main__":
    check()
