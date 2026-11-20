"""
Embedding Manager for EstateIQ AI RAG Pipeline.
Generates 384-dimensional dense semantic vectors using sentence-transformers (all-MiniLM-L6-v2).
"""

import logging
from typing import Sequence
import numpy as np
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("estateiq.rag.embeddings")


class EmbeddingsManager:
    _instance: "EmbeddingsManager | None" = None

    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        logger.info("Loading embedding model: %s...", model_name)
        self.model = SentenceTransformer(model_name)
        if hasattr(self.model, "get_embedding_dimension"):
            self.dimension = self.model.get_embedding_dimension()
        else:
            self.dimension = self.model.get_sentence_embedding_dimension()
        logger.info("Embedding model loaded. Vector dimension: %d", self.dimension)

    @classmethod
    def get_instance(cls, model_name: str = "sentence-transformers/all-MiniLM-L6-v2") -> "EmbeddingsManager":
        """Singleton pattern to ensure embedding model is only loaded once in memory."""
        if cls._instance is None:
            cls._instance = cls(model_name=model_name)
        return cls._instance

    def embed_texts(self, texts: Sequence[str], batch_size: int = 32, show_progress: bool = False) -> np.ndarray:
        """Encode multiple text documents into normalized float32 numpy arrays."""
        embeddings = self.model.encode(
            list(texts),
            batch_size=batch_size,
            show_progress_bar=show_progress,
            normalize_embeddings=True,  # Cosine similarity via inner product
            convert_to_numpy=True
        )
        return embeddings.astype(np.float32)

    def embed_query(self, query: str) -> np.ndarray:
        """Encode a single search question into a normalized float32 vector."""
        query_emb = self.model.encode(
            [query],
            normalize_embeddings=True,
            convert_to_numpy=True
        )
        return query_emb.astype(np.float32)
