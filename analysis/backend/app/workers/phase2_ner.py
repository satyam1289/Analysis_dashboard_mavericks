import re

import spacy
from rapidfuzz import fuzz
from sqlalchemy import select

from app.config.settings import get_settings
from app.db.models import Article, ClientAlias
from app.db.session import SessionLocal

settings = get_settings()
NLP = spacy.load("en_core_web_lg")


def phase2_ner(upload_id: str):
    with SessionLocal() as db:
        articles = db.execute(
            select(Article).where(
                Article.upload_id == upload_id,
                Article.is_duplicate.is_(False),
                Article.is_english.is_(True),
            )
        ).scalars().all()
        aliases = db.execute(select(ClientAlias)).scalars().all()
        alias_pairs = [(a.client_name, a.alias) for a in aliases]
        texts = [((a.clean_title or "") + " " + (a.clean_summary or "")).strip() for a in articles]
        docs = NLP.pipe(texts, batch_size=settings.NER_BATCH_SIZE)
        for article, doc in zip(articles, docs):
            orgs, persons, products = set(), set(), set()
            tags = set(article.client_tags or [])
            
            # Combine text for direct keyword search
            combined_text = ((article.clean_title or "") + " " + (article.clean_summary or "")).lower()
            
            # 1. Direct Alias Matching (Highly Reliable)
            for client_name, alias in alias_pairs:
                if re.search(r'\b' + re.escape(alias.lower()) + r'\b', combined_text):
                    tags.add(client_name)
            
            # 2. AI Entity Recognition matching
            for ent in doc.ents:
                text = ent.text.strip()
                if len(text) > 100 or re.fullmatch(r"\d+", text):
                    continue
                if ent.label_ == "ORG":
                    orgs.add(text)
                    for client_name, alias in alias_pairs:
                        if fuzz.token_sort_ratio(text.lower(), alias.lower()) >= settings.RAPIDFUZZ_THRESHOLD:
                            tags.add(client_name)
                elif ent.label_ == "PERSON":
                    persons.add(text)
                elif ent.label_ == "PRODUCT":
                    products.add(text)
            
            article.entity_orgs = sorted(orgs)
            article.entity_persons = sorted(persons)
            article.entity_products = sorted(products)
            article.client_tags = sorted(tags)
        db.commit()
