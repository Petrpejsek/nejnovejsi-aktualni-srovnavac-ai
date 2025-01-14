from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: str
    category: str
    price: float
    url: str
    affiliate_link: str
    features: List[str]
    pros: List[str]
    cons: List[str]
    rating: float
    company: str
    tags: List[str]
    
class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProductSearch(BaseModel):
    query: str
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    tags: Optional[List[str]] = None
