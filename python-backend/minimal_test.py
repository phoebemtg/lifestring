#!/usr/bin/env python3
"""
Minimal test FastAPI app to verify deployment works.
"""
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Lifestring Test API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Lifestring Test API is running!", "port": os.environ.get("PORT", "8080")}

@app.get("/up")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "port": os.environ.get("PORT", "8080")}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"Starting minimal test app on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
