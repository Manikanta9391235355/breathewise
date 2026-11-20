"""
FAISS Vector Store Manager for EstateIQ AI RAG Pipeline.
Provides fast cosine similarity retrieval over persistent FAISS indices,
with support for source-specific filtering and metadata preservation.
"""

import json
import logging
from pathlib import Path
from typing import Any
import faiss
import numpy as np

logger = logging.getLogger("estateiq.rag.vector_store")


class VectorStore:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.index: faiss.IndexFlatIP | None = None
        self.metadata: list[dict[str, Any]] = []

    def build(self, chunks: list[dict[str, Any]], embeddings: np.ndarray) -> None:
        """Create FAISS IndexFlatIP (cosine similarity) and register metadata."""
        if len(chunks) != len(embeddings):
            raise ValueError(f"Mismatch: {len(chunks)} chunks vs {len(embeddings)} embeddings")

        dim = embeddings.shape[1]
        self.dimension = dim
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(embeddings)
        self.metadata = chunks
        logger.info("Built FAISS index with %d vectors (dimension: %d)", self.index.ntotal, dim)

    def save(self, index_dir: str | Path = "data/index") -> None:
        """Persist index binary and metadata JSON to disk."""
        path = Path(index_dir)
        path.mkdir(parents=True, exist_ok=True)

        if self.index is None:
            raise ValueError("Cannot save uninitialized index")

        index_file = path / "faiss_index.bin"
        metadata_file = path / "chunks_metadata.json"

        faiss.write_index(self.index, str(index_file))
        with open(metadata_file, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2, ensure_ascii=False)

        logger.info("Persisted FAISS index to %s and metadata to %s", index_file, metadata_file)

    def load(self, index_dir: str | Path = "data/index") -> bool:
        """Load index and metadata from disk."""
        path = Path(index_dir)
        index_file = path / "faiss_index.bin"
        metadata_file = path / "chunks_metadata.json"

        if not index_file.exists() or not metadata_file.exists():
            logger.warning("FAISS index files not found in %s", path)
            return False

        try:
            self.index = faiss.read_index(str(index_file))
            with open(metadata_file, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
            self.dimension = self.index.d
            logger.info("Successfully loaded FAISS index with %d vectors from %s", self.index.ntotal, index_file)
            return True
        except Exception as e:
            logger.error("Failed to load FAISS index: %s", e)
            return False

    def is_ready(self) -> bool:
        """Verify index is populated and ready for queries."""
        return self.index is not None and self.index.ntotal > 0 and len(self.metadata) > 0

    def search(
        self,
        query_vector: np.ndarray,
        top_k: int = 5,
        source_filter: str | None = None,
        score_threshold: float = 0.25
    ) -> list[tuple[dict[str, Any], float]]:
        """
        Perform semantic similarity search.
        Optional source_filter can be 'DarGlobal', 'Wasalt', or None for all.
        Returns list of (chunk_dict, similarity_score).
        """
        if not self.is_ready():
            logger.error("Vector store search requested but index is not ready")
            return []

        # Retrieve a wider pool if filtering is applied
        fetch_k = top_k * 4 if source_filter and source_filter.lower() != "all" else top_k * 2
        fetch_k = min(fetch_k, self.index.ntotal)

        distances, indices = self.index.search(query_vector, fetch_k)

        results: list[tuple[dict[str, Any], float]] = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < 0 or idx >= len(self.metadata):
                continue
            score = float(dist)
            if score < score_threshold:
                continue

            chunk = self.metadata[idx]
            if source_filter and source_filter.lower() not in ("all", "", "both"):
                chunk_src = chunk.get("source", "").lower()
                if source_filter.lower() not in chunk_src:
                    continue

            results.append((chunk, score))
            if len(results) >= top_k:
                break

        return results
