from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from groq import AsyncGroq

from app.routes import chat, documents, health

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Bodh AI Backend starting up...")
    yield
    print("🛑 Bodh AI Backend shutting down...")


app = FastAPI(
    title="Bodh AI API",
    description="Backend API for Bodh AI — chat and document analysis.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow the React frontend (Vite dev server on 8080, or any origin
# during development). Tighten this in production to your actual domain.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers — all prefixed with /api to match the Express convention
# ---------------------------------------------------------------------------
app.include_router(health.router,    prefix="/api")
app.include_router(chat.router,      prefix="/api")
app.include_router(documents.router, prefix="/api")