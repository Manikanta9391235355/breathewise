"""
Semantic Retriever for EstateIQ AI RAG Pipeline.
Translates user natural language queries into embedding vectors,
performs similarity searches over the FAISS vector index, and filters by relevance.
"""

import logging
from typing import Any
from backend.app.rag.embeddings import EmbeddingsManager
from backend.app.rag.vector_store import VectorStore

logger = logging.getLogger("estateiq.rag.retriever")


class RealEstateRetriever:
    def __init__(self, vector_store: VectorStore, embeddings_manager: EmbeddingsManager | None = None):
        self.vector_store = vector_store
        self.embeddings_manager = embeddings_manager or EmbeddingsManager.get_instance()

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        source_filter: str | None = None,
        score_threshold: float = 0.28,
    ) -> list[dict[str, Any]]:
        """
        Retrieve relevant property chunks for a user question.
        Returns list of enriched chunk objects with similarity score and citation metadata.
        """
        if not query or not query.strip():
            return []

        query_vec = self.embeddings_manager.embed_query(query.strip())
        raw_results = self.vector_store.search(
            query_vector=query_vec,
            top_k=top_k,
            source_filter=source_filter,
            score_threshold=score_threshold,
        )

        retrieved_chunks = []
        for chunk, score in raw_results:
            enriched = dict(chunk)
            enriched["similarity_score"] = round(score, 4)
            retrieved_chunks.append(enriched)

        logger.info(
            "Query '%s...' retrieved %d chunks (source filter: %s)",
            query[:40], len(retrieved_chunks), source_filter or "all"
        )
        return retrieved_chunks
