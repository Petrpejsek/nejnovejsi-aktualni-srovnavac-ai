from fastapi import APIRouter
from . import products, billing

router = APIRouter()

router.include_router(products.router, prefix="/products", tags=["products"])
router.include_router(billing.router, prefix="/billing", tags=["billing"])
