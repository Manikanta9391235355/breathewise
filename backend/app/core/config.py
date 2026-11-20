"""
Configuration management for EstateIQ AI application.
Loads environment variables safely without hardcoded secrets.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent


class Settings:
    PROJECT_NAME: str = "EstateIQ AI — DarGlobal × Wasalt Real Estate Intelligence Assistant"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Server Settings (default 10000 for Render compatibility)
    PORT: int = int(os.getenv("PORT", 10000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # CORS Settings
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:8000,http://127.0.0.1:5173,http://127.0.0.1:8000",
        ).split(",")
        if origin.strip()
    ]

    # OpenRouter API Configuration
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "baidu/ernie-5.5-flash-preview:free")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

    # Data & Index Paths
    DATA_DIR: Path = BASE_DIR / os.getenv("DATA_DIR", "data")
    RAW_DATA_DIR: Path = DATA_DIR / "raw"
    PROCESSED_DATA_DIR: Path = DATA_DIR / "processed"
    INDEX_DIR: Path = DATA_DIR / "index"

    CATALOG_FILE: Path = PROCESSED_DATA_DIR / "properties_catalog.json"
    REPORT_FILE: Path = PROCESSED_DATA_DIR / "collection_report.json"
    FAISS_INDEX_FILE: Path = INDEX_DIR / "faiss_index.bin"
    METADATA_FILE: Path = INDEX_DIR / "chunks_metadata.json"

    # Embedding Model
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384


settings = Settings()
