from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from ..database.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    price = Column(Float)
    category = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow) 