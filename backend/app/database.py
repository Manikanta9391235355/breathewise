import os
import shutil
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

db_url = settings.DATABASE_URL

# Vercel Serverless Environment detection:
# AWS Lambda / Vercel functions have a read-only root; only /tmp is writable for SQLite.
if os.getenv("VERCEL") and db_url.startswith("sqlite"):
    tmp_db_path = "/tmp/munim.db"
    root_dir = Path(__file__).resolve().parent.parent.parent
    bundled_db = root_dir / "munim.db"
    if not os.path.exists(tmp_db_path) and bundled_db.exists():
        shutil.copyfile(bundled_db, tmp_db_path)
    db_url = f"sqlite:///{tmp_db_path}"

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# If PostgreSQL URL uses 'postgres://' (common in Supabase/Heroku), convert to 'postgresql://' for SQLAlchemy
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True if db_url.startswith("postgresql") else False,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
