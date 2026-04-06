from collections import Counter, defaultdict

import numpy as np
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sqlalchemy import select

from app.db.models import Article
from app.db.session import SessionLocal

BASE_STOPWORDS = {
    "said",
    "also",
    "would",
    "could",
    "one",
    "new",
    "year",
    "according",
    "company",
    "india",
    "percent",
    "%",
}


def _compute_doc_frequency(texts: list[str]) -> Counter:
    # Document frequency over whitespace tokens (aligns with our existing token splitting).
    df_words: Counter = Counter()
    for t in texts:
        df_words.update(set(t.lower().split()))
    return df_words


def _merge_tfidf_tokens(existing: list[dict], new_tokens: dict[str, float], top_n: int = 200) -> list[dict]:
    merged: dict[str, float] = {}
    for item in existing or []:
        w = item.get("word")
        if not w:
            continue
        merged[str(w)] = float(item.get("weight", 0.0))
    for w, v in new_tokens.items():
        merged[w] = merged.get(w, 0.0) + float(v)
    top_items = sorted(merged.items(), key=lambda kv: kv[1], reverse=True)[:top_n]
    return [{"word": k, "weight": float(v)} for k, v in top_items]


def _apply_tfidf_to_articles(vector_texts: list[tuple[Article, str]]):
    # Spec: if group has < 5 articles, skip.
    if len(vector_texts) < 5:
        return

    texts = [t for _, t in vector_texts]
    df_words = _compute_doc_frequency(texts)
    corpus_noise = {w for w, c in df_words.items() if c / len(texts) > 0.8}

    # Spec: standard English stopwords + required custom stopwords + corpus noise words.
    stopwords = list(set(ENGLISH_STOP_WORDS) | set(BASE_STOPWORDS) | corpus_noise)
    vec = TfidfVectorizer(max_features=200, stop_words=stopwords, min_df=2)

    try:
        matrix = vec.fit_transform(texts)
    except ValueError:
        # Empty vocabulary (too much noise/stopwords). Return empty tokens.
        for article, _ in vector_texts:
            article.tfidf_tokens = []
        return

    names = vec.get_feature_names_out()

    for row_idx, (article, _) in enumerate(vector_texts):
        row = matrix[row_idx]
        nz_idx = row.nonzero()[1]
        weights = row.data
        new_tokens = {names[i]: float(w) for i, w in zip(nz_idx, weights)}
        article.tfidf_tokens = _merge_tfidf_tokens(article.tfidf_tokens or [], new_tokens)


def phase4_tfidf(upload_id: str):
    with SessionLocal() as db:
        articles = (
            db.execute(
                select(Article).where(
                    Article.upload_id == upload_id,
                    Article.is_duplicate.is_(False),
                    Article.is_english.is_(True),
                )
            )
            .scalars()
            .all()
        )

        # Phase 4a: Sector context TF-IDF.
        by_sector: dict[str, list[Article]] = defaultdict(list)
        for a in articles:
            by_sector[a.sector or "General"].append(a)
        for _, group in by_sector.items():
            vector_texts = [(a, a.clean_summary) for a in group if a.clean_summary]
            _apply_tfidf_to_articles(vector_texts)

        # Phase 4b: Client tag context TF-IDF (merge into existing article tokens).
        by_client: dict[str, list[Article]] = defaultdict(list)
        for a in articles:
            for tag in a.client_tags or []:
                by_client[tag].append(a)
        for _, group in by_client.items():
            vector_texts = [(a, a.clean_summary) for a in group if a.clean_summary]
            _apply_tfidf_to_articles(vector_texts)

        db.commit()
