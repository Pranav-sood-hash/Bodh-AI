#!/usr/bin/env python3
"""
Entry point — run this directly:
    python run.py
or use uvicorn directly:
    uvicorn app.main:app --reload --port 8000
"""
import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,       # auto-reload on file changes (dev only)
        log_level="info",
    )
