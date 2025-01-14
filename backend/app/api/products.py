from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database.database import get_db
from ..models.schemas import Product, ProductCreate
from ..models.database_models import Product as DBProduct

router = APIRouter()

@router.get("/", response_model=List[Product])
def get_products(db: Session = Depends(get_db)):
    return db.query(DBProduct).all()

@router.post("/", response_model=Product)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = DBProduct(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product 