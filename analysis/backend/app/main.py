from fastapi import FastAPI

from app.api.routes.health import router as health_router
from app.api.routes.results import router as results_router
from app.api.routes.uploads import router as uploads_router

app = FastAPI(title="PR Intelligence Dashboard API", version="1.0.0")

app.include_router(health_router, prefix="/api/v1")
app.include_router(uploads_router, prefix="/api/v1")
app.include_router(results_router, prefix="/api/v1")
