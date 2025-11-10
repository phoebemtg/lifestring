import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Lifestring"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database (Supabase PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/lifestring")
    DB_ECHO: bool = False

    # Supabase - Environment variables will override these defaults
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://bkaiuwzwepdxdwhznwbt.supabase.co")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_ORG_ID: str = ""
    EMBED_MODEL: str = "text-embedding-3-small"
    CHAT_MODEL: str = "gpt-4o-mini"

    # AI Bot
    AI_BOT_USER_ID: str = "00000000-0000-0000-0000-000000000000"

    # Redis (for Celery)
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8081",
        "https://life-string-main-i0124wbax-phoebe-tgs-projects.vercel.app",
        "https://life-string-main-e1hc219e3-phoebe-tgs-projects.vercel.app",
        "https://life-string-main-k719jd01l-phoebe-tgs-projects.vercel.app",
        "https://life-string-main-7ixqhqhqh-phoebe-tgs-projects.vercel.app",
        "https://life-string-main-git-main-phoebe-tgs-projects.vercel.app",
        "https://life-string-main-phoebe-tgs-projects.vercel.app",
        "https://life-string-main.vercel.app",
        "https://*.vercel.app",
        "https://lifestring.ai",
        "https://www.lifestring.ai",
    ]

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-generate-with-openssl-rand-hex-32")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
