#!/usr/bin/env python3
"""
CLI script to build the FAISS vector index from processed real estate catalog.
Generates embeddings using sentence-transformers (all-MiniLM-L6-v2) and persists
the index to data/index/faiss_index.bin and data/index/chunks_metadata.json.
"""

import json
import logging
import sys
import time
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.rag.chunker import DocumentChunker
from backend.app.rag.embeddings import EmbeddingsManager
from backend.app.rag.vector_store import VectorStore


def main():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    logger = logging.getLogger("estateiq.cli.build_index")

    catalog_path = Path("data/processed/properties_catalog.json")
    if not catalog_path.exists():
        logger.error("Properties catalog not found at %s. Please run scripts/run_scraper.py first.", catalog_path)
        sys.exit(1)

    start_time = time.time()
    logger.info("Reading property catalog from %s...", catalog_path)

    # 1. Chunk documents
    chunker = DocumentChunker(target_chunk_size=600, chunk_overlap=100)
    chunks = chunker.process_catalog(catalog_path)
    logger.info("Generated %d semantic chunks with preserved metadata", len(chunks))

    # 2. Compute embeddings
    logger.info("Initializing SentenceTransformer embedding model (all-MiniLM-L6-v2)...")
    embedder = EmbeddingsManager.get_instance()
    texts = [c["text"] for c in chunks]
    logger.info("Generating embeddings for %d chunks...", len(texts))
    embeddings = embedder.embed_texts(texts, batch_size=32, show_progress=True)

    # 3. Build FAISS Vector Index
    logger.info("Constructing FAISS vector index...")
    vector_store = VectorStore(dimension=embedder.dimension)
    vector_store.build(chunks=chunks, embeddings=embeddings)

    # 4. Persist to disk
    vector_store.save("data/index")
    duration = time.time() - start_time

    print("\n" + "=" * 60)
    print("ESTATEIQ AI — FAISS VECTOR INDEX BUILT SUCCESSFULLY")
    print("=" * 60)
    print(f"Total Chunks:       {len(chunks)}")
    print(f"Embedding Model:    all-MiniLM-L6-v2 (dim: {embedder.dimension})")
    print(f"FAISS Index Path:   data/index/faiss_index.bin")
    print(f"Metadata Path:      data/index/chunks_metadata.json")
    print(f"Elapsed Time:       {duration:.2f} seconds")
    print("=" * 60)


if __name__ == "__main__":
    main()
