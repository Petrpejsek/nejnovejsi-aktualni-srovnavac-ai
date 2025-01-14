from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from ..core.settings import settings

# Vytvoření engine pro SQLite
engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)

# Vytvoření session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Základní třída pro modely
Base = declarative_base()

# Dependency pro získání DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 