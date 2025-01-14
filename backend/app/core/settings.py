from pydantic import BaseModel

class Settings(BaseModel):
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Srovnávač"
    CORS_ORIGINS: list = ["*"]

settings = Settings() 