import uuid
from datetime import datetime

from sqlalchemy import JSON, TIMESTAMP, Boolean, Float, ForeignKey, Integer, SmallInteger, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Upload(Base):
    __tablename__ = "uploads"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename: Mapped[str] = mapped_column(Text, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    status: Mapped[str] = mapped_column(Text, default="pending")
    total_rows: Mapped[int | None] = mapped_column(Integer, nullable=True)
    processed_rows: Mapped[int] = mapped_column(Integer, default=0)
    failed_rows: Mapped[int] = mapped_column(Integer, default=0)
    error_log: Mapped[list] = mapped_column(JSONB, default=list)
    celery_task_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())


class Article(Base):
    __tablename__ = "articles"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    upload_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("uploads.id", ondelete="CASCADE"))
    raw_row_index: Mapped[int | None] = mapped_column(Integer, nullable=True)
    resolved_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    clean_title: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    clean_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    publisher: Mapped[str | None] = mapped_column(Text, nullable=True)
    publisher_tier: Mapped[int] = mapped_column(SmallInteger, default=3)
    author: Mapped[str | None] = mapped_column(Text, nullable=True)
    sector: Mapped[str | None] = mapped_column(Text, nullable=True)
    client_tags: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)
    language: Mapped[str] = mapped_column(String(10), default="en")
    is_english: Mapped[bool] = mapped_column(Boolean, default=True)
    entity_orgs: Mapped[list] = mapped_column(JSONB, default=list)
    entity_persons: Mapped[list] = mapped_column(JSONB, default=list)
    entity_products: Mapped[list] = mapped_column(JSONB, default=list)
    sentiment_title: Mapped[float | None] = mapped_column(Float, nullable=True)
    sentiment_summary: Mapped[float | None] = mapped_column(Float, nullable=True)
    sentiment_label: Mapped[str | None] = mapped_column(Text, nullable=True)
    tfidf_tokens: Mapped[list] = mapped_column(JSONB, default=list)
    reachlens_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())


class PublisherTier(Base):
    __tablename__ = "publisher_tiers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    domain: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    publisher_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    tier: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    da_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class ClientAlias(Base):
    __tablename__ = "client_aliases"
    __table_args__ = (UniqueConstraint("client_name", "alias", name="uq_client_alias"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    client_name: Mapped[str] = mapped_column(Text, nullable=False)
    alias: Mapped[str] = mapped_column(Text, nullable=False)
    sector: Mapped[str | None] = mapped_column(Text, nullable=True)


class AggregationCache(Base):
    __tablename__ = "aggregation_cache"
    __table_args__ = (UniqueConstraint("upload_id", "scope", "scope_value", "widget", name="uq_agg_widget"),)
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    upload_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("uploads.id", ondelete="CASCADE"))
    scope: Mapped[str] = mapped_column(Text, nullable=False)
    scope_value: Mapped[str] = mapped_column(Text, nullable=False)
    widget: Mapped[str] = mapped_column(Text, nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    computed_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
