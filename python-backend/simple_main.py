"""
Simple FastAPI application with just AI chat endpoints.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os

from app.core.config import settings
from app.api.v1 import ai_chat

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Lifestring API Simple",
    description="Lifestring API - AI Chat Only",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger.info("Starting up Lifestring API Simple...")
    logger.info("Application started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    logger.info("Shutting down Lifestring API Simple...")

# Health check endpoint
@app.get("/up", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Lifestring API Simple",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Include AI chat router
app.include_router(ai_chat.router, prefix=settings.API_V1_PREFIX, tags=["AI Chat"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
