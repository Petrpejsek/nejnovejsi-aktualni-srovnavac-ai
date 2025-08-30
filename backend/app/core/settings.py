import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Načtení proměnných z .env souboru
load_dotenv()

class Settings(BaseModel):
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Srovnávač"
    CORS_ORIGINS: list = ["*"]
    
    # Email configuration
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    EMAIL_PROVIDER: str = os.getenv("EMAIL_PROVIDER", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "")
    POSTMARK_SERVER_TOKEN: str = os.getenv("POSTMARK_SERVER_TOKEN", "")
    POSTMARK_MESSAGE_STREAM: str = os.getenv("POSTMARK_MESSAGE_STREAM", "")
    EMAIL_TOKEN_SECRET: str = os.getenv("EMAIL_TOKEN_SECRET", "")
    PASSWORD_RESET_TOKEN_TTL_MIN: int = int(os.getenv("PASSWORD_RESET_TOKEN_TTL_MIN", "30"))
    EMAIL_VERIFY_TOKEN_TTL_MIN: int = int(os.getenv("EMAIL_VERIFY_TOKEN_TTL_MIN", "1440"))
    EMAIL_ENABLE_DEV: bool = os.getenv("EMAIL_ENABLE_DEV", "false").lower() == "true"
    
    # Brand settings
    BRAND_NAME: str = os.getenv("BRAND_NAME", "Comparee.ai")
    BRAND_LOGO_URL: str = os.getenv("BRAND_LOGO_URL", "")
    BRAND_SUPPORT_EMAIL: str = os.getenv("BRAND_SUPPORT_EMAIL", "support@comparee.ai")
    
    # Template settings
    EMAIL_TEXT_MODE: str = os.getenv("EMAIL_TEXT_MODE", "auto")
    EMAIL_TEMPLATE_STRICT: bool = os.getenv("EMAIL_TEMPLATE_STRICT", "true").lower() == "true"
    
    @property
    def EMAIL_TOKENS_ENABLED(self) -> bool:
        return (self.ENVIRONMENT == "production" or self.EMAIL_ENABLE_DEV) and bool(self.EMAIL_TOKEN_SECRET)
    
    @property
    def EMAIL_ENABLED(self) -> bool:
        # Enable only in production or explicitly in development when EMAIL_ENABLE_DEV is true
        if self.ENVIRONMENT != "production" and not self.EMAIL_ENABLE_DEV:
            return False
        if not self.EMAIL_PROVIDER:
            return False
        if self.EMAIL_PROVIDER == "postmark":
            return bool(self.POSTMARK_SERVER_TOKEN and self.POSTMARK_MESSAGE_STREAM and self.EMAIL_FROM)
        return False

settings = Settings() 