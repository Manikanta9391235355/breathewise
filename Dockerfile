# ============================================================
# Stage 1: Build React Production Frontend
# ============================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ============================================================
# Stage 2: Python 3.11 FastAPI Backend & RAG Runtime
# ============================================================
FROM python:3.11-slim AS runner

# Install libgomp for FAISS and curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Install lightweight CPU-only PyTorch (reduces image from 4GB+ to ~300MB, preventing Render build timeouts/OOM)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# 2. Install remaining Python backend dependencies
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 3. Pre-cache SentenceTransformer model into image so container starts in < 1 second with ZERO external downloads
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# 4. Copy backend application, pre-computed data, and vector indices
COPY backend/ ./backend/
COPY data/ ./data/
COPY scripts/ ./scripts/

# 5. Copy compiled frontend distribution from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Production environment configuration
ENV PORT=10000 \
    HOST=0.0.0.0 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    DATA_DIR=data \
    HF_HUB_DISABLE_SYMLINKS_WARNING=1

EXPOSE 10000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-10000}/api/health || exit 1

# Start production ASGI server
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
