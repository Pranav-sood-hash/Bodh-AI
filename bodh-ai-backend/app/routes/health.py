from fastapi import APIRouter
from app.models.schemas import HealthResponse
import os

router = APIRouter(tags=["Health"])


@router.get("/ping", response_model=dict)
async def ping():
    """Simple ping endpoint — mirrors the Express /api/ping route."""
    return {"message": os.getenv("PING_MESSAGE", "ping pong")}


@router.get("/health", response_model=HealthResponse)
async def health():
    """Detailed health check — reports which AI services are configured."""
    anthropic_key = bool(os.getenv("ANTHROPIC_API_KEY"))
    openai_key = bool(os.getenv("OPENAI_API_KEY"))

    return HealthResponse(
        status="ok",
        version="1.0.0",
        services={
            "chat": "ok" if anthropic_key else "missing ANTHROPIC_API_KEY",
            "documents": "ok" if anthropic_key else "missing ANTHROPIC_API_KEY",
            "image_generation": "ok" if openai_key else "missing OPENAI_API_KEY",
        },
    )
