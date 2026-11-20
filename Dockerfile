# ============================================================
# Stage 1: Build React Production Frontend
# ============================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --prefer-offline || npm install

COPY frontend/ ./
RUN npm run build

# ============================================================
# Stage 2: Python 3.11 FastAPI Backend & RAG Runtime
# ============================================================
FROM python:3.11-slim AS runner

# Install libgomp for FAISS and curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy pre-computed data and FAISS index (instant startup without scraping)
COPY data/ ./data/
COPY scripts/ ./scripts/

# Copy compiled frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Environment variables (default to 10000 for Render, overridden by $PORT)
ENV PORT=10000 \
    HOST=0.0.0.0 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    DATA_DIR=data

EXPOSE 10000

# Health check endpoint verification
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:${PORT:-10000}/api/health || exit 1

# Start Uvicorn ASGI server binding to 0.0.0.0 respecting Render PORT
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
