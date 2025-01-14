from google.oauth2 import id_token
from google.auth.transport import requests
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.database_models import User
from ..config.settings import settings
from .auth_service import auth_service
import requests as http_requests

class GoogleAuthService:
    def get_auth_url(self) -> str:
        """Generuje URL pro Google přihlášení"""
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "response_type": "code",
            "scope": "email profile",
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "access_type": "offline",
            "prompt": "consent"
        }
        auth_url = f"{base_url}?{'&'.join(f'{k}={v}' for k, v in params.items())}"
        return auth_url

    async def verify_google_token(self, code: str) -> dict:
        """Ověří Google token a získá informace o uživateli"""
        try:
            # Výměna kódu za tokeny
            token_url = "https://oauth2.googleapis.com/token"
            token_data = {
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code"
            }
            token_response = http_requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            tokens = token_response.json()

            # Ověření ID tokenu
            id_info = id_token.verify_oauth2_token(
                tokens["id_token"],
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            return {
                "email": id_info["email"],
                "google_id": id_info["sub"],
                "name": id_info.get("name")
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to verify Google token: {str(e)}"
            )

    async def authenticate_google_user(self, db: Session, user_info: dict) -> tuple[User, str]:
        """Přihlásí nebo zaregistruje uživatele pomocí Google účtu"""
        # Nejprve zkusíme najít uživatele podle Google ID
        user = db.query(User).filter(User.google_id == user_info["google_id"]).first()
        
        if not user:
            # Zkusíme najít uživatele podle emailu
            user = db.query(User).filter(User.email == user_info["email"]).first()
            
            if user:
                # Aktualizujeme existujícího uživatele o Google ID
                user.google_id = user_info["google_id"]
                db.commit()
            else:
                # Vytvoříme nového uživatele
                user = User(
                    email=user_info["email"],
                    google_id=user_info["google_id"],
                    hashed_password="",  # Prázdné heslo pro Google uživatele
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)

        # Vytvoříme JWT token
        access_token = auth_service.create_access_token(data={"sub": user.email})
        
        return user, access_token

google_auth_service = GoogleAuthService() 