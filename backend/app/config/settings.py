import os
from dotenv import load_dotenv

# Načtení proměnných z .env souboru
load_dotenv()

class Settings:
    PROJECT_NAME: str = "AI Srovnávač API"
    PROJECT_VERSION: str = "1.0.0"
    
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "user")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "password")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "ai_srovnavac")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Email configuration (provider-agnostic)
    EMAIL_PROVIDER: str = os.getenv("EMAIL_PROVIDER", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "")

    # Postmark specific
    POSTMARK_SERVER_TOKEN: str = os.getenv("POSTMARK_SERVER_TOKEN", "")
    POSTMARK_MESSAGE_STREAM: str = os.getenv("POSTMARK_MESSAGE_STREAM", "")
    ADMIN_API_KEY: str = os.getenv("ADMIN_API_KEY", "")

    # Optional brand settings for templates
    BRAND_NAME: str = os.getenv("BRAND_NAME", "Comparee.ai")
    BRAND_LOGO_URL: str = os.getenv("BRAND_LOGO_URL", "")
    BRAND_SUPPORT_EMAIL: str = os.getenv("BRAND_SUPPORT_EMAIL", "support@comparee.ai")

    # Template strictness
    EMAIL_TEXT_MODE: str = os.getenv("EMAIL_TEXT_MODE", "auto")  # auto | explicit
    EMAIL_TEMPLATE_STRICT: bool = os.getenv("EMAIL_TEMPLATE_STRICT", "true").lower() == "true"
    POSTMARK_WEBHOOK_SECRET: str = os.getenv("POSTMARK_WEBHOOK_SECRET", "")
    EMAIL_TOKEN_SECRET: str = os.getenv("EMAIL_TOKEN_SECRET", "")
    PASSWORD_RESET_TOKEN_TTL_MIN: int = int(os.getenv("PASSWORD_RESET_TOKEN_TTL_MIN", "30"))
    EMAIL_VERIFY_TOKEN_TTL_MIN: int = int(os.getenv("EMAIL_VERIFY_TOKEN_TTL_MIN", "1440"))
    EMAIL_ENABLE_DEV: bool = os.getenv("EMAIL_ENABLE_DEV", "false").lower() == "true"

    @property
    def WEBHOOKS_ENABLED(self) -> bool:
        return self.ENVIRONMENT == "production" and bool(self.POSTMARK_WEBHOOK_SECRET)

    @property
    def EMAIL_TOKENS_ENABLED(self) -> bool:
        return (self.ENVIRONMENT == "production" or self.EMAIL_ENABLE_DEV) and bool(self.EMAIL_TOKEN_SECRET)

    def email_missing_reason(self) -> str:
        """Returns empty string if email can be enabled, otherwise a human readable reason."""
        if self.ENVIRONMENT != "production" and not self.EMAIL_ENABLE_DEV:
            return "ENV is not production and EMAIL_ENABLE_DEV is false"
        if not self.EMAIL_PROVIDER:
            return "EMAIL_PROVIDER not set"
        if self.EMAIL_PROVIDER == "postmark":
            missing = []
            if not self.POSTMARK_SERVER_TOKEN:
                missing.append("POSTMARK_SERVER_TOKEN")
            if not self.POSTMARK_MESSAGE_STREAM:
                missing.append("POSTMARK_MESSAGE_STREAM")
            if not self.EMAIL_FROM:
                missing.append("EMAIL_FROM")
            if missing:
                return "missing secrets: " + ", ".join(missing)
        else:
            return f"unknown provider: {self.EMAIL_PROVIDER}"
        return ""

    @property
    def EMAIL_ENABLED(self) -> bool:
        """Email sending is enabled only on production with complete configuration."""
        return self.email_missing_reason() == ""

settings = Settings()
