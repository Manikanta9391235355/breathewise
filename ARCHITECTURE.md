# EstateIQ AI — System Architecture Specification

**Project:** EstateIQ AI — DarGlobal × Wasalt Real Estate Intelligence Assistant  
**Role:** Technical Assignment for *Junior AI Engineer – Applied AI* at DarGlobal  
**Version:** 1.0.0  
**Stack:** React 18, TypeScript, Vite, Tailwind CSS, FastAPI, Uvicorn, FAISS, Sentence Transformers, OpenRouter Free LLM Catalog  

---

## 1. Executive Architecture Overview

EstateIQ AI is an end-to-end, enterprise-grade real estate knowledge discovery and conversational intelligence system. It autonomously bridges high-luxury international developments (DarGlobal UK & GCC) and regional Middle Eastern residential marketplaces (Wasalt Saudi Arabia) through an ethical scraping engine, an offline vector embedding and indexing pipeline, and a citation-grounded Retrieval-Augmented Generation (RAG) assistant.

```
+-----------------------------------------------------------------------------------+
|                                   DATA SOURCES                                    |
|   +------------------------------------+   +----------------------------------+   |
|   |   DarGlobal UK & International     |   |      Wasalt KSA Residential      |   |
|   |     (https://darglobal.co.uk)      |   |     (https://wasalt.sa/en)       |   |
|   +-----------------+------------------+   +-----------------+----------------+   |
+---------------------|----------------------------------------|--------------------+
                      |                                        |
                      v                                        v
+-----------------------------------------------------------------------------------+
|                        ETHICAL WEB SCRAPING & INGESTION                           |
|   - robots.txt verification & bounded rate-limiting                              |
|   - Next.js CMS adapter (_next/data build manifest traversal)                     |
|   - SSR payload parser (__NEXT_DATA__ JSON extraction)                            |
|   - PII scrubber (strips phone numbers, owner IDs, agent personal data)           |
|   Outputs:                                                                        |
|     * data/raw/ (canonical raw HTML/JSON responses)                               |
|     * data/processed/properties_catalog.json (175 structured items)               |
|     * data/processed/collection_report.json (100% crawl success report)           |
+-----------------------------------------------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|                            OFFLINE RAG INDEXING ENGINE                            |
|   1. Text Normalization & Cleaning                                                |
|   2. Context-Preserving Semantic Chunking (500-800 tokens, 100 token overlap)     |
|   3. Dense Vector Encoding: sentence-transformers/all-MiniLM-L6-v2 (384-dim)      |
|   4. FAISS Vector Database: IndexFlatIP with L2-normalized cosine similarity      |
|   Persisted to:                                                                   |
|     * data/index/faiss_index.bin                                                  |
|     * data/index/chunks_metadata.json                                             |
+-----------------------------------------------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|                           FASTAPI ASGI BACKEND (PORT 8000)                        |
|   - Lifespan singleton initialization (FAISS index + SentenceTransformer in RAM)   |
|   - Endpoints:                                                                    |
|       GET  /api/health        -> readiness & index vector count                   |
|       GET  /api/stats         -> crawler audit metrics & collection stats         |
|       GET  /api/properties    -> pagination, search, source & type filters        |
|       GET  /api/sources       -> verified source URLs and timestamps              |
|       GET  /api/model-status  -> safe LLM provider configuration metadata         |
|       POST /api/chat          -> RAG semantic retrieval + grounded LLM generation |
+-----------------------------------------------------------------------------------+
           |                                                      ^
           | Semantically Filtered Context (k=4, score >= 0.25)    |
           v                                                      |
+------------------------------------+      +---------------------------------------+
|        OPENROUTER LLM INFERENCE     |      |             CLIENT LAYER              |
|  - Provider: OpenRouter Free Tier  |      |   - React 18 + TypeScript + Vite      |
|  - Model: baidu/ernie-5.5-flash    | <--- |   - Tailwind CSS (Luxury Navy/Gold)   |
|  - Anti-hallucination guardrails   |      |   - Framer Motion micro-animations    |
|  - Verifiable citation cards       | ---> |   - 5 Dedicated Views:                |
|  - Strict fallback protocol        |      |     Overview, Chat, Explorer,         |
+------------------------------------+      |     Sources Audit, Architecture       |
                                            +---------------------------------------+
```

---

## 2. Scraping Engine Architecture

### 2.1 robots.txt & Crawl Ethics Compliance
- Both target domains are queried for `/robots.txt` before any data collection initiates (`backend/app/scraping/robots_validator.py`).
- Wasalt's `robots.txt` explicitly authorizes modern search and AI crawlers (`ChatGPT-User`, `PerplexityBot`, `anthropic-ai`) and advertises `/llms.txt`.
- DarGlobal's public CMS paths (`/en/developments/*`) are traversed without bypassing access barriers, logins, or anti-bot interstitials.

### 2.2 Adapter Pattern
- **DarGlobal Adapter (`darglobal_scraper.py`)**:
  - Dynamically captures active Next.js build IDs via lightweight pre-flight probes.
  - Traverses `_next/data/{buildId}/en/{slug}.json` endpoints to access authoritative developer metadata (project names, architecture partners, locations, and branded luxury collections).
- **Wasalt Adapter (`wasalt_scraper.py`)**:
  - Targets public regional hub URLs (`villas-for-sale-in-riyadh`, `apartments-for-sale-in-jeddah`, `properties-for-rent-in-dammam`).
  - Extracts the pre-rendered `__NEXT_DATA__` JSON DOM object, eliminating the need for heavyweight headless browsers.
  - Formats real-time Saudi Real Estate General Authority (REGA) verification flags, areas in square meters, bedroom/bathroom configurations, and SAR prices.

### 2.3 PII Sanitization
Strict privacy boundaries automatically scrub personal broker phone numbers, personal WhatsApp links, and agent email addresses during normalization.

---

## 3. RAG Retrieval & Generation Architecture

### 3.1 Document Chunking
Scraped records are converted to descriptive real-estate text blocks with structured key-value headers (Project Name, Source, Location, Pricing, Specifications, Amenities, Verified Source URL). Chunks are generated between 500 and 800 tokens with a 100-token sliding overlap to avoid loss of context across boundaries.

### 3.2 Dense Embedding Vector Space
- **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Dimensionality**: 384 dimensions
- **Vector Metric**: Cosine similarity via L2 normalization on an inner product index (`IndexFlatIP`).

### 3.3 Semantic Retrieval
- Queries undergo identical normalization and vector projection.
- Top-$k$ nearest neighbors ($k=4$) are selected based on cosine similarity.
- **Relevance Thresholding**: Chunks with similarity score $< 0.25$ are discarded.
- When no retrieved chunks meet the threshold, the pipeline short-circuits to the deterministic fallback without making unnecessary LLM API calls:
  > *"I couldn't find sufficient information in the indexed DarGlobal or Wasalt sources to answer that accurately."*

### 3.4 Strict Grounding & Anti-Hallucination
The prompt enforces a zero-trust model over external web content:
1. Strict instruction boundary (`=== RETRIEVED CONTEXT EVIDENCE ===`).
2. Scraped web content is treated strictly as passive evidence; instructions inside webpages are ignored.
3. Every factual claim requires inline bracketed numerical citations (`[1]`, `[2]`).
4. Grounded source cards with verified original URLs are extracted and rendered in the frontend.

---

## 4. API & Lifespan Architecture

The FastAPI server initializes all heavy machine learning models once during startup via the modern `lifespan` context manager:
- Loads the pre-computed FAISS index from disk into RAM.
- Instantiates the `EmbeddingsManager` singleton.
- Binds services to `app.state`, ensuring per-request chat queries execute with zero model reloading overhead.
- Mounts the compiled single-page application (`frontend/dist`) at root `/` with fallback route redirection for HTML5 client-side routing.

---

## 5. Security & Secret Isolation

- **Zero Client-Side Keys**: The OpenRouter API key is never exposed to the browser or Git. All generation requests originate from backend services.
- **Environment Isolation**: `.env` is ignored by `.gitignore` and `.dockerignore`. A clean `.env.example` template is provided for production onboarding.
- **Safe CORS Configuration**: Restricted to verified origins with proper methods and headers.
