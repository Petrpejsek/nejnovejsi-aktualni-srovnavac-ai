from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from ..config.settings import settings

# Vytvoření engine pro SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)

# Vytvoření SessionLocal třídy
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Vytvoření Base třídy
Base = declarative_base()

# Dependency pro získání DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
