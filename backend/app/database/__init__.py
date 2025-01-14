from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Vytvoření SQLite databáze
SQLALCHEMY_DATABASE_URL = "sqlite:///./findai.db"

# Vytvoření engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Vytvoření session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Základní model
Base = declarative_base()

# Dependency pro získání DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
