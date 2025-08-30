from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 