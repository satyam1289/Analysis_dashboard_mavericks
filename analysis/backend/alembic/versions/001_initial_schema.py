"""initial schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-04-01
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    op.create_table(
        "uploads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("filename", sa.Text(), nullable=False),
        sa.Column("uploaded_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")),
        sa.Column("status", sa.Text(), server_default="pending"),
        sa.Column("total_rows", sa.Integer(), nullable=True),
        sa.Column("processed_rows", sa.Integer(), server_default="0"),
        sa.Column("failed_rows", sa.Integer(), server_default="0"),
        sa.Column("error_log", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'[]'::jsonb")),
        sa.Column("celery_task_id", sa.Text(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")),
    )
    op.create_table(
        "articles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("upload_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("uploads.id", ondelete="CASCADE"), nullable=False),
        sa.Column("raw_row_index", sa.Integer()),
        sa.Column("resolved_url", sa.Text()),
        sa.Column("title", sa.Text()),
        sa.Column("clean_title", sa.Text()),
        sa.Column("summary", sa.Text()),
        sa.Column("clean_summary", sa.Text()),
        sa.Column("published_at", sa.TIMESTAMP(timezone=True)),
        sa.Column("publisher", sa.Text()),
        sa.Column("publisher_tier", sa.SmallInteger(), server_default="3"),
        sa.Column("author", sa.Text()),
        sa.Column("sector", sa.Text()),
        sa.Column("client_tags", postgresql.ARRAY(sa.Text()), server_default="{}"),
        sa.Column("language", sa.Text(), server_default="en"),
        sa.Column("is_english", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("entity_orgs", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'[]'::jsonb")),
        sa.Column("entity_persons", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'[]'::jsonb")),
        sa.Column("entity_products", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'[]'::jsonb")),
        sa.Column("sentiment_title", sa.Float()),
        sa.Column("sentiment_summary", sa.Float()),
        sa.Column("sentiment_label", sa.Text()),
        sa.Column("tfidf_tokens", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'[]'::jsonb")),
        sa.Column("reachlens_score", sa.Float()),
        sa.Column("is_duplicate", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")),
    )
    op.create_table(
        "publisher_tiers",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("domain", sa.Text(), nullable=False, unique=True),
        sa.Column("publisher_name", sa.Text()),
        sa.Column("tier", sa.SmallInteger(), nullable=False),
        sa.Column("da_score", sa.Integer()),
        sa.Column("notes", sa.Text()),
    )
    op.create_table(
        "client_aliases",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("client_name", sa.Text(), nullable=False),
        sa.Column("alias", sa.Text(), nullable=False),
        sa.Column("sector", sa.Text()),
        sa.UniqueConstraint("client_name", "alias", name="uq_client_alias"),
    )
    op.create_table(
        "aggregation_cache",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("upload_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("uploads.id", ondelete="CASCADE"), nullable=False),
        sa.Column("scope", sa.Text(), nullable=False),
        sa.Column("scope_value", sa.Text(), nullable=False),
        sa.Column("widget", sa.Text(), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("computed_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")),
        sa.Column("expires_at", sa.TIMESTAMP(timezone=True)),
        sa.UniqueConstraint("upload_id", "scope", "scope_value", "widget", name="uq_agg_widget"),
    )


def downgrade() -> None:
    op.drop_table("aggregation_cache")
    op.drop_table("client_aliases")
    op.drop_table("publisher_tiers")
    op.drop_table("articles")
    op.drop_table("uploads")
