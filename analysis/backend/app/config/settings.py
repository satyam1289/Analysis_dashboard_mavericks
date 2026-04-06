from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    POSTGRES_DB: str = "pr_dashboard"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432

    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    REACHLENS_ENABLED: bool = False
    FINBERT_ENABLED: bool = False
    LANGUAGE_FILTER_ENABLED: bool = True
    MAX_UPLOAD_ROWS: int = 10000
    UPLOAD_CHUNK_SIZE: int = 500
    CACHE_TTL_SECONDS: int = 86400
    NER_BATCH_SIZE: int = 64
    RAPIDFUZZ_THRESHOLD: int = 85
    SPIKE_ZSCORE_THRESHOLD: float = 2.0

    @property
    def db_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def redis_url(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
