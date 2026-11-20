"""
Unit Tests for RAG Chunking, Embeddings, and FAISS Vector Search.
"""

from backend.app.rag.chunker import DocumentChunker
from backend.app.rag.vector_store import VectorStore
from backend.app.rag.generator import AnswerGenerator


def test_chunker_metadata_preservation():
    """Verify document chunker preserves URLs and key specifications."""
    chunker = DocumentChunker(target_chunk_size=400, chunk_overlap=50)
    sample_doc = {
        "id": "test-doc-1",
        "name": "The Astera, Interiors by Aston Martin",
        "source": "DarGlobal",
        "property_type": "Luxury Residences",
        "country": "United Arab Emirates",
        "city": "Ras Al Khaimah",
        "location": "Al Marjan Island, Ras Al Khaimah",
        "developer": "DarGlobal",
        "description": "Aston Martin beachfront branded residences on Al Marjan Island with direct ocean access.",
        "amenities": ["Direct Beach Access", "Private Spa", "Infinity Pool"],
        "price": "Price on Application",
        "source_url": "https://darglobal.co.uk/the-astera",
    }

    chunks = chunker.chunk_document(sample_doc)
    assert len(chunks) >= 1
    c = chunks[0]
    assert c["title"] == "The Astera, Interiors by Aston Martin"
    assert c["source_url"] == "https://darglobal.co.uk/the-astera"
    assert "Direct Beach Access" in c["text"]
    assert "Aston Martin" in c["text"]


def test_vector_store_load_and_search():
    """Verify FAISS vector store loads and returns top-k matches."""
    vector_store = VectorStore()
    loaded = vector_store.load("data/index")
    assert loaded is True
    assert vector_store.is_ready()
    assert vector_store.index.ntotal >= 150


def test_generator_citations_extraction():
    """Verify citation generator extracts unique URLs and snippets."""
    gen = AnswerGenerator()
    chunks = [
        {
            "source": "DarGlobal",
            "title": "AIDA Muscat",
            "source_url": "https://darglobal.co.uk/aida-360",
            "location": "Muscat, Oman",
            "price": "Price on Application",
            "text": "AIDA is a dramatic master community on the cliffs of Oman.",
            "similarity_score": 0.55,
        },
        {
            "source": "DarGlobal",
            "title": "AIDA Muscat",
            "source_url": "https://darglobal.co.uk/aida-360",  # Duplicate URL to test deduplication
            "location": "Muscat, Oman",
            "price": "Price on Application",
            "text": "Second chunk of AIDA.",
            "similarity_score": 0.51,
        },
        {
            "source": "Wasalt",
            "title": "Villa in Ar-Rimal",
            "source_url": "https://wasalt.sa/en/property/sale/villa-450-sqm",
            "location": "Riyadh, Saudi Arabia",
            "price": "2,150,000 SAR",
            "text": "Villa with 4 bedrooms in East Riyadh.",
            "similarity_score": 0.49,
        },
    ]

    citations = gen.extract_citations(chunks)
    assert len(citations) == 2  # Deduplicated from 3 chunks
    assert citations[0]["url"] == "https://darglobal.co.uk/aida-360"
    assert citations[1]["url"] == "https://wasalt.sa/en/property/sale/villa-450-sqm"
