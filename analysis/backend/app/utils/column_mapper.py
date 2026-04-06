from rapidfuzz import fuzz

CANONICAL_MAP = {
    "title": ["title", "headline", "article title", "article_title", "head"],
    "summary": ["summary", "description", "excerpt", "body", "content", "article summary", "article_summary"],
    "published_at": ["published at", "published_at", "date", "publish date", "publish_date", "published", "pub date", "pub_date", "datetime"],
    "publisher": ["publisher", "publication", "source", "outlet", "agency", "media house", "publisher/agency"],
    "author": ["author", "journalist", "writer", "byline", "reporter", "authored by"],
    "resolved_url": ["resolved url", "resolved_url", "url", "link", "article url", "article_url"],
    "sector": ["sector", "industry", "category", "vertical", "segment", "keyword matched", "keywords matched", "keywords", "topic"],
    "client": ["client", "client name", "brand", "company"],
}


def normalize_column(name: str) -> str:
    return " ".join((name or "").strip().lower().replace("_", " ").split())


def map_columns(columns: list[str], fuzzy_threshold: int = 80) -> dict:
    normalized = {c: normalize_column(c) for c in columns}
    result: dict[str, str | None] = {}
    used = set()

    for canonical, aliases in CANONICAL_MAP.items():
        match = None
        alias_norm = [normalize_column(a) for a in aliases]

        for col, col_norm in normalized.items():
            if col in used:
                continue
            if col_norm in alias_norm:
                match = col
                break

        if not match:
            for col, col_norm in normalized.items():
                if col in used:
                    continue
                if any(a in col_norm for a in alias_norm):
                    match = col
                    break

        if not match:
            best_score = -1
            best_col = None
            for col, col_norm in normalized.items():
                if col in used:
                    continue
                score = max(fuzz.ratio(col_norm, a) for a in alias_norm)
                if score > best_score:
                    best_score = score
                    best_col = col
            if best_col and best_score >= fuzzy_threshold:
                match = best_col

        result[canonical] = match
        if match:
            used.add(match)
    return result
