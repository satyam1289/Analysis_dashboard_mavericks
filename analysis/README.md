# ⚡ Mavericks Analysis Dashboard
**High-Fidelity News Intelligence & PR Analytics Platform**

Welcome to the Mavericks Analysis Engine. This platform is designed to transform raw news data extracts (CSV/XLSX) into interactive, multi-layered intelligence dashboards with automated sentiment mapping, brand entity extraction, and journalist performance tracking.

---

## 🏛 System Architecture
The platform is built on a high-availability microservices architecture designed for rapid data processing and low-latency visualization.

- **Frontend:** React 18 + TypeScript + Vite (Port 5000 via NGINX)
- **API Engine:** FastAPI + SQLAlchemy 2.0 + Uvicorn (Internal Port 8000)
- **Data Pipeline:** Celery 5.3 x Redis 7.0 (Asynchronous task orchestration)
- **Database:** PostgreSQL 16 (Relational news persistence)
- **Intelligence:** NLP-driven Entity Extraction (spaCy) and Sentiment Analysis (VADER)

---

## 🚀 Rapid Deployment (Docker Compose)

The entire Mavericks stack is containerized for instant deployment.

### 1. Environment Setup
Create your local environment file:
```powershell
cp .env.example .env
```

### 2. Launch the Application
Run the build and start command (this will initialize the database, run migrations, and seed default publisher tiers):
```powershell
docker compose up -d --build
```

### 3. Access the Dashboard
The platform is accessible via the NGINX gateway:
- **Dashboard:** [http://localhost:5000](http://localhost:5000)
- **API Documentation:** [http://localhost:5000/api/v1/docs](http://localhost:5000/api/v1/docs)

---

## 📊 Core Feature Flow
Follow these "orders" to move from raw data to finished intelligence:

### Step 1: Data Ingestion
- Upload your `.xlsx` or `.csv` dataset via the **Data Import** screen.
- **Requirement:** Your file must contain a `title`, `author` (journalists), and `publisher` column.

### Step 2: Processing Pipeline
Mavericks automatically executes a 6-phase pipeline for every upload:
1. **Pre-process:** Language filtering and raw row cleaning.
2. **Sentiment Analysis:** AI-mapping for Positive/Negative/Neutral signals.
3. **Entity Extraction:** Automated brand and company tagging.
4. **Scoring:** ReachLens scoring based on outlet tier and impact.
5. **Deduplication:** Fuzzy title matching to remove repetitive hits.
6. **Aggregation:** Final cache building for sub-second dashboard loading.

### Step 3: Interactive Intelligence
- **Keyword View:** Filter insights by sector or topic.
- **Client View:** Drill down into specific brand mentions.
- **Deep-Dive:** Click on any Publisher (e.g., MSN) or Journalist bar to view the associated articles.

---

## 🛠 Maintenance & Commands

### Viewing Logs
To monitor the analysis pipeline in real-time:
```powershell
docker compose logs -f celery_worker
```

### Clearing the Cache
If you encounter data discrepancies, flush the aggregation cache:
```powershell
docker compose exec backend python -m app.scripts.clear_cache
```

### Hard Reset
To wipe all data and start with a fresh environment:
```powershell
docker compose down -v
docker compose up -d --build
```

---

**Built with Precision by the Mavericks Intelligence Team.**
