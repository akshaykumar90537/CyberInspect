"""
Application configuration loaded from environment variables.
All sensitive values are read from .env — never hardcoded.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_ENV: str = "development"
    APP_NAME: str = "CyberInspect AI"
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://cyberinspect:cyberinspectpassword@localhost:5432/cyberinspectdb"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET_KEY: str = "changeme-very-long-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"

    # ZAP
    ZAP_API_KEY: str = "changeme"
    ZAP_BASE_URL: str = "http://localhost:8080"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    SCAN_RATE_LIMIT_PER_HOUR: int = 10

    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    FROM_EMAIL: str = "noreply@cyberinspect.ai"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
