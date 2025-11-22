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
    CHAT_MODEL: str = "gpt-4o"  # Primary model
    CHAT_MODEL_FALLBACK: str = "gpt-4o-mini"  # Fallback model for cost efficiency
    CHAT_MODEL_PREMIUM: str = "gpt-4o"  # Premium model for complex queries

    # Google Gemini (Alternative AI provider)
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GEMINI_MODEL: str = "gemini-2.5-flash"  # Fast/cheap version (Gemini 3 equivalent)
    GEMINI_MODEL_FLASH: str = "gemini-2.5-flash"  # Fast/cheap version

    # AI Model Strategy
    USE_GEMINI_FOR_REALTIME: bool = os.getenv("USE_GEMINI_FOR_REALTIME", "true").lower() == "true"
    USE_GEMINI_FOR_EVENTS: bool = os.getenv("USE_GEMINI_FOR_EVENTS", "true").lower() == "true"

    # External APIs for real-time data
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "demo_key_please_replace")
    NEWSAPI_KEY: str = os.getenv("NEWSAPI_KEY", "demo_key_please_replace")
    SPORTS_API_KEY: str = os.getenv("SPORTS_API_KEY", "")
    EVENTBRITE_API_KEY: str = os.getenv("EVENTBRITE_API_KEY", "")
    TICKETMASTER_API_KEY: str = os.getenv("TICKETMASTER_API_KEY", "")

    # AI Bot
    AI_BOT_USER_ID: str = "00000000-0000-0000-0000-000000000000"

    # Redis (for Celery)
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8081",
        "http://localhost:8082",
        "https://life-string-main-i0124wbax-phoebe-tgs-projects.vercel.app",
        "https://life-string-main-e1hc219e3-phoebe-tgs-projects.vercel.app",
        "https://life-string-main-k719jd01l-phoebe-tgs-projects.vercel.app",
        "https://life-string-main-7ixqhqhqh-phoebe-tgs-projects.vercel.app",
        "https://life-string-main-git-main-phoebe-tgs-projects.vercel.app",
        "https://life-string-main-phoebe-tgs-projects.vercel.app",
        "https://life-string-main.vercel.app",
        "https://lifestring-frontend-lbqsn06cr-phoebe-tgs-projects.vercel.app",
        "https://lifestring-frontend-n5rpd07qh-phoebe-tgs-projects.vercel.app",
        # Lovable domains
        "https://lovable.dev",
        "https://*.lovable.dev",
        "https://lovable.app",
        "https://*.lovable.app",
        "https://lifestring-frontend-mwjxrwcep-phoebe-tgs-projects.vercel.app",  # NEW DEPLOYMENT
        "https://lifestring-frontend-jdv71xbn0-phoebe-tgs-projects.vercel.app",  # LATEST DEPLOYMENT
        "https://lifestring-frontend-oibldp6dz-phoebe-tgs-projects.vercel.app",  # CURRENT DEPLOYMENT
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
