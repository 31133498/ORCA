from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import Base, SessionLocal, engine
from .routes import intelligence, mentions, queue, stats
from .routers import chat_router, voice_router
from .seed import seed_demo
from .pipeline import process_unclassified


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo(db)
        process_unclassified(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="ORCA — X Social Intelligence API",
    version="0.1.0",
    description="Backend for ORCA's X (Twitter) module. Case study: MTN Nigeria.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "operator": settings.operator_name,
        "operator_handle": settings.operator_handle,
        "apify_configured": bool(settings.apify_token),
        "anthropic_configured": bool(settings.anthropic_api_key),
    }


app.include_router(mentions.router)
app.include_router(queue.router)
app.include_router(intelligence.router)
app.include_router(stats.router)
app.include_router(chat_router)
app.include_router(voice_router)
