from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
import re

from sqlalchemy import delete, select

from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

from app.config.settings import get_settings
from app.db.models import AggregationCache, Article, ClientAlias, Upload
from app.db.session import SessionLocal
from app.utils.author_normalizer import is_excluded_author

settings = get_settings()
WIDGETS = [
    "top_publications",
    "word_cloud",
    "sentiment_overview",
    "top_companies",
    "positive_word_cloud",
    "negative_word_cloud",
    "hot_topics",
    "top_journalists",
]


def _scope_values(articles, scope):
    if scope == "sector":
        sectors = {a.sector for a in articles if a.sector}
        return ["General"] + sorted(sectors)
    values = set()
    for a in articles:
        values.update(a.client_tags or [])
    return ["General"] + sorted(values)


def phase6_aggregate(upload_id: str):
    with SessionLocal() as db:
        articles = db.execute(select(Article).where(Article.upload_id == upload_id)).scalars().all()
        client_alias_rows = db.execute(select(ClientAlias.client_name)).scalars().all()
        db.execute(delete(AggregationCache).where(AggregationCache.upload_id == upload_id))
        now = datetime.now(timezone.utc)
        exp = now + timedelta(seconds=settings.CACHE_TTL_SECONDS)

        # Word cloud exclusion rules:
        # - exclude tokens shorter than 3
        # - exclude English stopwords
        # - exclude any token that matches client names or sector names
        excluded_name_tokens: set[str] = set()
        
        # PR & News Structural Noise Reduction (Aggressive Filtering)
        CUSTOM_STOPWORDS = {
            "has", "from", "with", "into", "for", "but", "not", "that", "this",
            "been", "were", "their", "more", "also", "only", "well", "many",
            "could", "would", "about", "your", "what", "than", "they", "will",
            "nbsp", "amp", "2026", "2025", "2024", "million", "billion", "around",
            "website", "services", "projects", "service", "data", "page", "displayed",
            "verifies", "lifecycle", "project", "firm", "companies", "management",
            "using", "used", "uses", "click", "link", "online", "access", "available",
            "including", "provide", "based", "support", "working", "across", "become",
            "make", "made", "become", "take", "taken", "took", "give", "given", "given",
            "help", "helps", "helped", "need", "needs", "needed", "report", "reports",
            "reported", "show", "shows", "showed", "seen", "saw", "say", "said", "says",
            "told", "tell", "tells", "brief", "about", "nearly", "every", "within",
            "further", "latest", "time", "year", "years", "month", "day", "days"
        }
        
        for a in articles:
            for token in re.split(r"\W+", (a.sector or "General").lower()):
                if token:
                    excluded_name_tokens.add(token)
        for name in client_alias_rows or []:
            for token in re.split(r"\W+", str(name).lower()):
                if token:
                    excluded_name_tokens.add(token)
        
        excluded_name_tokens |= set(ENGLISH_STOP_WORDS)
        excluded_name_tokens |= CUSTOM_STOPWORDS

        # High-Impact Sentiment Lexicon (Strict Routing)
        NEG_IMPACT = {
            "malicious", "bots", "bot", "vulnerability", "risk", "fraud", "scam", 
            "threat", "attack", "compromise", "breach", "hack", "leaked", "danger", 
            "failure", "failed", "crash", "plunge", "decline", "slowdown", "crisis",
            "lawsuit", "legal", "investigation", "allegations", "scandal", "shutdown",
            "layoffs", "unsuccessful", "poor", "weak", "disruption", "outage"
        }
        POS_IMPACT = {
            "protect", "secure", "growth", "leader", "innovation", "success", "winning", 
            "partnership", "exclusive", "breakthrough", "milestone", "expansion", "leading",
            "top", "best", "excellent", "advanced", "fastest", "pioneering", "expert",
            "award", "solution", "efficiency", "strategic", "momentum", "potential"
        }

        for scope in ["sector", "client"]:
            values = _scope_values(articles, scope)
            for sv in values:
                scoped = [
                    a
                    for a in articles
                    if not a.is_duplicate and a.is_english and (
                        True if sv == "General" else (
                            (a.sector == sv) if scope == "sector" else (sv in (a.client_tags or []))
                        )
                    )
                ]
                pub_counter = Counter((a.publisher or "Unknown") for a in scoped)
                top_pubs = [{"publisher": p, "article_count": c} for p, c in pub_counter.most_common(20)]

                # word cloud aggregation
                token_weights = defaultdict(float)
                pos_token_weights = defaultdict(float)
                neg_token_weights = defaultdict(float)

                for a in scoped:
                    tokens = a.tfidf_tokens or []
                    label = a.sentiment_label or "neutral"
                    
                    for t in tokens:
                        w = str(t.get("word")).lower()
                        weight = float(t.get("weight", 0.0))
                        
                        if w and len(w) >= 3 and w not in excluded_name_tokens:
                            token_weights[w] += weight
                            
                            # FORCE categorization for specific high-impact words
                            if w in NEG_IMPACT:
                                neg_token_weights[w] += weight
                            elif w in POS_IMPACT:
                                pos_token_weights[w] += weight
                            else:
                                # Standard sentiment-based routing
                                if label == "positive":
                                    pos_token_weights[w] += weight
                                elif label == "negative":
                                    neg_token_weights[w] += weight

                def format_cloud(weights: dict[str, float], other_weights: dict[str, float], limit: int):
                    filtered_items = []
                    for w, v in weights.items():
                        lw = str(w).lower()
                        if len(lw) < 3 or lw in excluded_name_tokens:
                            continue
                        
                        # MUTUAL EXCLUSION LOGIC
                        # If a word exists in both clouds, we only show it in its DOMINANT cloud
                        other_v = other_weights.get(w, 0.0)
                        if other_v > v:
                            # It's stronger in the other category, so skip it here
                            continue

                        filtered_items.append((w, v))
                    filtered_items.sort(key=lambda x: x[1], reverse=True)
                    return [{"word": w, "weight": float(v)} for w, v in filtered_items[:limit]]

                words = format_cloud(token_weights, {}, 150)
                pos_words = format_cloud(pos_token_weights, neg_token_weights, 150)
                neg_words = format_cloud(neg_token_weights, pos_token_weights, 150)

                sentiment_counts = Counter((a.sentiment_label or "neutral") for a in scoped)
                donut = [{"label": k, "count": v} for k, v in sentiment_counts.items()]
                
                org_counts = Counter()
                for a in scoped:
                    org_counts.update([o for o in (a.entity_orgs or []) if o.lower() not in {"government", "ministry", "department"}])
                top_companies = [{"name": n, "count": c} for n, c in org_counts.most_common(15)]

                author_counts = Counter()
                for a in scoped:
                    if not is_excluded_author(a.author):
                        # Preserve original casing from DB — strip only
                        name = (a.author or "").strip()
                        if name:
                            author_counts[name] += 1
                
                # Show top 20 journalists — no minimum article count filter
                top_journos = [
                    {"author": n, "article_count": c} 
                    for n, c in author_counts.most_common(20)
                ]

                payloads = {
                    "top_publications": {"data": top_pubs, "computed_at": now.isoformat()},
                    "word_cloud": {"data": words if len(words) >= 10 else [], "message": None if len(words) >= 10 else "Insufficient data for word cloud"},
                    "sentiment_overview": {"donut": donut, "timeseries": []},
                    "top_companies": {"data": top_companies},
                    "positive_word_cloud": {"data": pos_words},
                    "negative_word_cloud": {"data": neg_words},
                    "hot_topics": {"data": [], "message": "No significant spikes detected in this date range."},
                    "top_journalists": {"data": top_journos},
                }
                for widget, payload in payloads.items():
                    db.add(
                        AggregationCache(
                            upload_id=upload_id,
                            scope=scope,
                            scope_value=sv,
                            widget=widget,
                            payload=payload,
                            expires_at=exp,
                        )
                    )

        upload = db.execute(select(Upload).where(Upload.id == upload_id)).scalar_one_or_none()
        if upload:
            upload.status = "complete"
        db.commit()
