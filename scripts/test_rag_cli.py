#!/usr/bin/env python3
"""
CLI test runner for EstateIQ AI RAG pipeline.
Executes semantic retrieval, context extraction, and OpenRouter generation
across key benchmark questions specified in the requirements.
"""

import asyncio
import logging
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Load .env
load_dotenv()

from backend.app.rag.embeddings import EmbeddingsManager
from backend.app.rag.vector_store import VectorStore
from backend.app.rag.retriever import RealEstateRetriever
from backend.app.rag.generator import AnswerGenerator


async def run_tests():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    logger = logging.getLogger("estateiq.cli.test_rag")

    print("\n" + "=" * 70)
    print("ESTATEIQ AI — RAG PIPELINE BENCHMARK VERIFICATION")
    print("=" * 70)

    # 1. Load Vector Store
    vector_store = VectorStore()
    if not vector_store.load("data/index"):
        logger.error("Could not load FAISS index from data/index. Please run scripts/build_index.py first.")
        return

    retriever = RealEstateRetriever(vector_store)
    generator = AnswerGenerator()

    test_questions = [
        ("What are the major developments listed by DarGlobal?", "DarGlobal"),
        ("What kinds of properties are available on Wasalt?", "Wasalt"),
        ("Which locations are covered by the collected DarGlobal projects?", "DarGlobal"),
        ("Compare the property information and market focus from DarGlobal and Wasalt.", "all"),
        ("What amenities are mentioned for the indexed developments?", "all"),
    ]

    for i, (q, src_filter) in enumerate(test_questions, 1):
        print(f"\n[{i}/5] TEST QUESTION: \"{q}\" (Filter: {src_filter})")
        print("-" * 70)

        # Retrieve
        chunks = retriever.retrieve(query=q, top_k=4, source_filter=src_filter)
        print(f"Retrieved {len(chunks)} chunks:")
        for c in chunks:
            print(f"  • [{c['source']}] {c['title']} ({c['location']}) - Score: {c.get('similarity_score')}")

        # Generate
        gen_res = await generator.generate_answer(question=q, retrieved_chunks=chunks)
        print("\nGENERATED ANSWER:")
        print(gen_res["answer"][:600] + ("..." if len(gen_res["answer"]) > 600 else ""))
        print("\nCITATIONS RETURNED:")
        for cit in gen_res["citations"][:3]:
            print(f"  - [{cit['source']}] {cit['title']} -> {cit['url']}")
        print("=" * 70)


if __name__ == "__main__":
    asyncio.run(run_tests())
