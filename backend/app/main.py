import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.services.seed import seed_database
from backend.app.api.munim_routes import router as munim_router

BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database schema and seed if needed
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db, force=False)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.TAGLINE,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Munim API Router
app.include_router(munim_router, prefix="/api")

# Serve frontend build if available and not on Vercel (where Vercel CDN serves static assets directly)
if FRONTEND_DIST.exists() and not os.getenv("VERCEL"):
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't hijack /api routes
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        target_file = FRONTEND_DIST / full_path
        if target_file.exists() and target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "name": settings.PROJECT_NAME,
            "tagline": settings.TAGLINE,
            "version": settings.VERSION,
            "api_health": "/api/health",
            "api_docs": "/api/docs",
            "frontend_dev_url": "http://localhost:5173"
        }
