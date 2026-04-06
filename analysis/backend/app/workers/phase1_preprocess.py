import re
from datetime import datetime, timezone

import pandas as pd
from dateutil import parser as date_parser
from langdetect import detect
from pydantic import BaseModel, ConfigDict, field_validator
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.config.settings import get_settings
from app.db.models import Article, Upload
from app.db.session import SessionLocal
from app.utils.column_mapper import map_columns
from app.utils.text_cleaner import clean_text

settings = get_settings()


class RawArticle(BaseModel):
    title: str | None = None          # No longer required — we'll fall back below
    summary: str | None = None
    published_at: str | None = None
    publisher: str | None = None
    author: str | None = None
    resolved_url: str | None = None
    sector: str | None = None
    client: str | None = None
    model_config = ConfigDict(extra="ignore")

    @field_validator("resolved_url", mode="before")
    @classmethod
    def sanitize_url(cls, v):
        """Return None for invalid/non-http URLs instead of rejecting the row."""
        if not v or str(v).strip().lower() in ("nan", "none", ""):
            return None
        v = str(v).strip()
        return v if v.startswith("http") else None

    @field_validator("published_at", mode="before")
    @classmethod
    def sanitize_date(cls, v):
        """Return None for unparseable dates instead of rejecting the row."""
        if not v or str(v).strip().lower() in ("nan", "none", ""):
            return None
        v = str(v).strip()
        try:
            parsed = date_parser.parse(v, dayfirst=False)
            if 1900 <= parsed.year <= 2099:
                return v
            return None
        except Exception:
            return None

    @field_validator("title", "summary", "publisher", "author", "sector", "client", mode="before")
    @classmethod
    def sanitize_str(cls, v):
        """Convert NaN / None strings to actual None."""
        if v is None:
            return None
        s = str(v).strip()
        return None if s.lower() in ("nan", "none", "") else s

def _parse_file(file_path: str) -> pd.DataFrame:
    if file_path.lower().endswith(".csv"):
        try:
            df = pd.read_csv(file_path, dtype=str, encoding="utf-8-sig")
        except UnicodeDecodeError:
            df = pd.read_csv(file_path, dtype=str, encoding="latin-1")
        df.dropna(how="all", inplace=True)
        return df

    xls = pd.ExcelFile(file_path)
    best_sheet = xls.sheet_names[0]
    max_rows = -1
    for sheet in xls.sheet_names:
        temp_df = pd.read_excel(file_path, sheet_name=sheet, dtype=str, nrows=1000) # Peek
        temp_df.dropna(how="all", inplace=True)
        if len(temp_df) > max_rows:
            max_rows = len(temp_df)
            best_sheet = sheet

    final_df = pd.read_excel(file_path, sheet_name=best_sheet, dtype=str)
    final_df.dropna(how="all", inplace=True)
    return final_df


def _parse_date(v: str | None):
    if not v:
        return None
    try:
        return date_parser.parse(v, dayfirst=False)
    except Exception:
        return None


def _norm_title_for_dedup(t: str | None) -> str | None:
    if not t:
        return None
    t = re.sub(r"[^\w\s]", "", t.lower()).strip()
    return t or None


def phase1_preprocess(upload_id: str, file_path: str):
    with SessionLocal() as db:
        _run_phase1(db, upload_id, file_path)


def _run_phase1(db: Session, upload_id: str, file_path: str):
    df = _parse_file(file_path)
    if df.empty:
        db.execute(update(Upload).where(Upload.id == upload_id).values(status="failed", error_log=[{"type": "empty_file"}]))
        db.commit()
        return

    total_rows = len(df)
    error_log = []
    if total_rows > settings.MAX_UPLOAD_ROWS:
        df = df.head(settings.MAX_UPLOAD_ROWS)
        error_log.append({"type": "row_cap_applied", "max_rows": settings.MAX_UPLOAD_ROWS})

    mappings = map_columns(df.columns.tolist(), fuzzy_threshold=80)
    error_log.append({"type": "column_mapping", "mappings": mappings})

    db.execute(update(Upload).where(Upload.id == upload_id).values(total_rows=len(df), error_log=error_log))
    db.commit()

    seen_url = set()
    seen_title = set()
    batch = []
    failed_rows = 0

    for idx, row in df.iterrows():
        payload = {}
        for canonical, source_col in mappings.items():
            payload[canonical] = row.get(source_col) if source_col else None
        
        try:
            parsed = RawArticle(**payload)
        except Exception as e:
            failed_rows += 1
            if failed_rows <= 10:
                error_log.append({
                    "type": "row_validation_error",
                    "row_index": int(idx) + 2,
                    "error": str(e),
                })
            continue

        # Title fallback: use summary snippet or 'Untitled' — never skip a row for missing title
        effective_title = parsed.title or (parsed.summary[:120] if parsed.summary else None) or "Untitled"
        clean_title = clean_text(effective_title)
        clean_summary = clean_text(parsed.summary)
        # FORCE ALL ARTICLES AS ENGLISH TO ENSURE FULL COVERAGE
        lang = "en"
        is_english = True
        # if settings.LANGUAGE_FILTER_ENABLED:
        #     try:
        #         lang = detect(clean_title or clean_summary or "en")
        #     except Exception:
        #         lang = "en"
        #     is_english = lang == "en"

        dedup_key = parsed.resolved_url or _norm_title_for_dedup(clean_title)
        is_duplicate = False
        if parsed.resolved_url:
            if parsed.resolved_url in seen_url:
                is_duplicate = True
            else:
                seen_url.add(parsed.resolved_url)
        elif dedup_key:
            if dedup_key in seen_title:
                is_duplicate = True
            else:
                seen_title.add(dedup_key)

        batch.append(
            {
                "upload_id": upload_id,
                "raw_row_index": int(idx) + 2,
                "resolved_url": parsed.resolved_url,
                "title": effective_title,
                "clean_title": clean_title,
                "summary": parsed.summary,
                "clean_summary": clean_summary,
                "published_at": _parse_date(parsed.published_at),
                "publisher": parsed.publisher or "Unknown",
                "author": parsed.author,
                "sector": parsed.sector or "General",
                "client_tags": [parsed.client] if parsed.client else [],
                "language": lang,
                "is_english": is_english,
                "entity_orgs": [],
                "entity_persons": [],
                "entity_products": [],
                "tfidf_tokens": [],
                "is_duplicate": is_duplicate,
            }
        )
        if len(batch) >= settings.UPLOAD_CHUNK_SIZE:
            db.execute(Article.__table__.insert().values(batch))
            db.execute(
                update(Upload)
                .where(Upload.id == upload_id)
                .values(
                    processed_rows=Upload.processed_rows + len(batch),
                    failed_rows=failed_rows,
                    error_log=error_log
                )
            )
            db.commit()
            batch = []

    if batch:
        db.execute(Article.__table__.insert().values(batch))
        db.execute(
            update(Upload)
            .where(Upload.id == upload_id)
            .values(
                processed_rows=Upload.processed_rows + len(batch),
                failed_rows=failed_rows,
                error_log=error_log
            )
        )
        db.commit()
