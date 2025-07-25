import os
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_URL = os.getenv("DATABASE_URL")
engine = create_engine(DB_URL, connect_args={"check_same_thread": False}) # Allows SQLite to run in a non-threaded environment
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def get_db():
    "Returns the current database session in a generator. For FastAPI dependency injection."
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_context():
    "Returns the current database session wrapped in a context manager. For external usage."
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()