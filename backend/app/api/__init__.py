from fastapi import APIRouter
from . import products, billing
from .admin_email_test import router as admin_email_router
from .affiliate.postback import router as affiliate_router

router = APIRouter()

router.include_router(products.router, prefix="/products", tags=["products"])
router.include_router(billing.router, prefix="/billing", tags=["billing"])
router.include_router(affiliate_router)
router.include_router(admin_email_router)
