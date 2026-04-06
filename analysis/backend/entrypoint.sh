#!/bin/sh
set -e

alembic upgrade head
python -m app.seed.publisher_tiers
python -m spacy download en_core_web_lg || true

exec uvicorn app.main:app --host 0.0.0.0 --port 8000
