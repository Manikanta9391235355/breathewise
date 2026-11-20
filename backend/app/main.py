"""
Main FastAPI Application Entrypoint for EstateIQ AI.
Integrates RAG Engine, REST API Routes, Static Assets, and Lifespan Services.
"""

from contextlib import asynccontextmanager
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.api.routes import router as api_router
from backend.app.core.config import settings
from backend.app.rag.embeddings import EmbeddingsManager
from backend.app.rag.generator import AnswerGenerator
from backend.app.rag.retriever import RealEstateRetriever
from backend.app.rag.vector_store import VectorStore
from backend.app.services.property_service import property_service
from backend.app.services.stats_service import stats_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("estateiq.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RAG vector store and models on startup."""
    logger.info("Initializing EstateIQ AI RAG Engine...")

    # 1. Load Vector Store
    vector_store = VectorStore(dimension=settings.EMBEDDING_DIMENSION)
    index_loaded = vector_store.load(settings.INDEX_DIR)
    if not index_loaded:
        logger.warning(
            "FAISS index not found at %s. Please run 'python scripts/build_index.py' to generate embeddings.",
            settings.INDEX_DIR,
        )

    # 2. Initialize Embeddings & Retriever
    embedder = EmbeddingsManager.get_instance(model_name=settings.EMBEDDING_MODEL_NAME)
    retriever = RealEstateRetriever(vector_store=vector_store, embeddings_manager=embedder)

    # 3. Initialize OpenRouter Answer Generator
    generator = AnswerGenerator(
        api_key=settings.OPENROUTER_API_KEY,
        model=settings.OPENROUTER_MODEL,
        base_url=settings.OPENROUTER_BASE_URL,
    )

    # Attach to application state
    app.state.vector_store = vector_store
    app.state.embedder = embedder
    app.state.retriever = retriever
    app.state.generator = generator

    # Reload property catalog
    count = property_service.reload()
    logger.info("EstateIQ AI backend ready. %d properties loaded, vector index ready: %s", count, index_loaded)

    yield

    logger.info("Shutting down EstateIQ AI backend.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Real Estate Knowledge Assistant specializing in DarGlobal and Wasalt platforms.",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits localhost Vite and production Docker hosts
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Core API Routes
app.include_router(api_router)


# Mount Frontend Production Build (if available)
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    logger.info("Mounting static frontend build from %s", frontend_dist)
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=(settings.ENVIRONMENT == "development"),
    )
