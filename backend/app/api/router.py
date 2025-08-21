from fastapi import APIRouter
from .products import router as products_router
from .affiliate.postback import router as affiliate_router

router = APIRouter()
router.include_router(products_router, prefix="/products", tags=["products"]) 
router.include_router(affiliate_router)