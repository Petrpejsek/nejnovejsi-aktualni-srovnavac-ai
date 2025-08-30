from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.settings import settings
from .api.__init__ import router as api_router

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Vítejte v AI Srovnávač API"}
