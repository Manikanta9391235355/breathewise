"""
FastAPI Route Handlers for EstateIQ AI.
Provides clean REST API endpoints for RAG Chat, Property Explorer,
Source Auditing, and System Health.
"""

import datetime
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Request

from backend.app.core.config import settings
from backend.app.models.schemas import (
    ChatRequest,
    ChatResponse,
    CollectionStats,
    HealthResponse,
    ModelStatusResponse,
    PaginatedProperties,
    SourcesResponse,
)
from backend.app.services.property_service import property_service
from backend.app.services.stats_service import stats_service

logger = logging.getLogger("estateiq.api.routes")
router = APIRouter(prefix="/api", tags=["EstateIQ Core API"])


@router.get("/health", response_model=HealthResponse)
async def get_health(request: Request):
    """Returns application, knowledge index, and configuration readiness."""
    vector_store = getattr(request.app.state, "vector_store", None)
    generator = getattr(request.app.state, "generator", None)

    index_ready = vector_store.is_ready() if vector_store else False
    total_chunks = len(vector_store.metadata) if index_ready else 0
    model_configured = generator.is_configured() if generator else False

    status = "healthy" if (index_ready and model_configured) else "ready_local"

    return HealthResponse(
        status=status,
        timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        index_ready=index_ready,
        total_chunks=total_chunks,
        model_configured=model_configured,
        app_version=settings.VERSION,
    )


@router.get("/stats", response_model=CollectionStats)
async def get_stats(request: Request):
    """Returns actual collection statistics and indexed document counts."""
    vector_store = getattr(request.app.state, "vector_store", None)
    index_ready = vector_store.is_ready() if vector_store else False
    total_chunks = len(vector_store.metadata) if index_ready else 0

    return stats_service.get_stats(total_chunks=total_chunks, faiss_ready=index_ready)


@router.get("/properties", response_model=PaginatedProperties)
async def get_properties(
    source: Optional[str] = Query(None, description="Filter by source: 'DarGlobal', 'Wasalt', or 'all'"),
    location: Optional[str] = Query(None, description="Filter by country, city, or district"),
    property_type: Optional[str] = Query(None, description="Filter by property type: 'Villa', 'Apartment', etc."),
    q: Optional[str] = Query(None, description="Free-text search query"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(12, ge=1, le=100, description="Items per page"),
):
    """Returns indexed property and project information with pagination and filters."""
    return property_service.filter_properties(
        source=source,
        country_or_city=location,
        property_type=property_type,
        search_query=q,
        page=page,
        page_size=page_size,
    )


@router.get("/sources", response_model=SourcesResponse)
async def get_sources():
    """Returns indexed website sources, original URLs, and timestamps."""
    return stats_service.get_sources_response()


@router.get("/model-status", response_model=ModelStatusResponse)
async def get_model_status(request: Request):
    """Returns model configuration status without exposing secrets."""
    generator = getattr(request.app.state, "generator", None)
    is_conf = generator.is_configured() if generator else bool(settings.OPENROUTER_API_KEY)

    return ModelStatusResponse(
        model_name=settings.OPENROUTER_MODEL,
        base_url=settings.OPENROUTER_BASE_URL,
        is_configured=is_conf,
        status="ready" if is_conf else "unconfigured",
        free_tier_verified=True,
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(request: Request, body: ChatRequest):
    """
    Accepts user question and optional history, retrieves grounded evidence,
    and returns OpenRouter generated answer with verifiable source citations.
    """
    retriever = getattr(request.app.state, "retriever", None)
    generator = getattr(request.app.state, "generator", None)

    if not retriever or not generator:
        raise HTTPException(
            status_code=503,
            detail="EstateIQ RAG engine is currently initializing. Please retry in a few seconds.",
        )

    # Convert conversation history to list of dicts
    history_dicts = None
    if body.conversation_history:
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in body.conversation_history]

    # 1. Retrieve relevant chunks
    retrieved_chunks = retriever.retrieve(
        query=body.question,
        top_k=5,
        source_filter=body.source_filter,
        score_threshold=0.25,
    )

    # 2. Generate grounded answer
    result = await generator.generate_answer(
        question=body.question,
        retrieved_chunks=retrieved_chunks,
        conversation_history=history_dicts,
    )

    return ChatResponse(
        answer=result["answer"],
        citations=result["citations"],
        model=result["model"],
        chunks_used=result["chunks_used"],
        status=result["status"],
        source_filter=body.source_filter or "all",
        error=result.get("error"),
    )
