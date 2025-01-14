from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from ..config.settings import settings
from typing import List, Dict, Any
from jinja2 import Environment, select_autoescape, PackageLoader
import aiofiles
from pathlib import Path

class EmailService:
    def __init__(self):
        self.config = ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME,
            MAIL_PASSWORD=settings.MAIL_PASSWORD,
            MAIL_FROM=settings.MAIL_FROM,
            MAIL_PORT=settings.MAIL_PORT,
            MAIL_SERVER=settings.MAIL_SERVER,
            MAIL_TLS=True,
            MAIL_SSL=False,
            USE_CREDENTIALS=True
        )
        
        self.fastmail = FastMail(self.config)
        
        # Inicializace Jinja2 pro šablony e-mailů
        self.template_env = Environment(
            loader=PackageLoader('app', 'templates/email'),
            autoescape=select_autoescape(['html', 'xml'])
        )

    async def send_email(
        self,
        email_to: str,
        subject: str,
        template_name: str,
        template_data: Dict[str, Any]
    ) -> None:
        """Odešle e-mail pomocí šablony."""
        template = self.template_env.get_template(f"{template_name}.html")
        html_content = template.render(**template_data)
        
        message = MessageSchema(
            subject=subject,
            recipients=[email_to],
            body=html_content,
            subtype="html"
        )
        
        await self.fastmail.send_message(message)

    async def send_price_alert(
        self,
        email_to: str,
        product_title: str,
        old_price: str,
        new_price: str,
        product_url: str
    ) -> None:
        """Odešle upozornění na změnu ceny."""
        await self.send_email(
            email_to=email_to,
            subject=f"Změna ceny produktu: {product_title}",
            template_name="price_alert",
            template_data={
                "product_title": product_title,
                "old_price": old_price,
                "new_price": new_price,
                "product_url": product_url
            }
        )

    async def send_new_product_notification(
        self,
        email_to: str,
        product_title: str,
        product_description: str,
        product_price: str,
        product_url: str
    ) -> None:
        """Odešle upozornění na nový produkt."""
        await self.send_email(
            email_to=email_to,
            subject=f"Nový produkt v oblíbené kategorii: {product_title}",
            template_name="new_product",
            template_data={
                "product_title": product_title,
                "product_description": product_description,
                "product_price": product_price,
                "product_url": product_url
            }
        )

    async def send_review_response_notification(
        self,
        email_to: str,
        product_title: str,
        review_text: str,
        response_text: str,
        product_url: str
    ) -> None:
        """Odešle upozornění na odpověď na recenzi."""
        await self.send_email(
            email_to=email_to,
            subject=f"Nová odpověď na vaši recenzi produktu: {product_title}",
            template_name="review_response",
            template_data={
                "product_title": product_title,
                "review_text": review_text,
                "response_text": response_text,
                "product_url": product_url
            }
        )

    async def send_welcome_email(
        self,
        email_to: str,
        username: str
    ) -> None:
        """Odešle uvítací e-mail novému uživateli."""
        await self.send_email(
            email_to=email_to,
            subject="Vítejte v FindAI",
            template_name="welcome",
            template_data={
                "username": username,
                "login_url": f"{settings.FRONTEND_URL}/login"
            }
        )

    async def send_password_reset(
        self,
        email_to: str,
        reset_token: str
    ) -> None:
        """Odešle e-mail pro reset hesla."""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        await self.send_email(
            email_to=email_to,
            subject="Reset hesla",
            template_name="password_reset",
            template_data={
                "reset_url": reset_url,
                "valid_hours": 24
            }
        )

email_service = EmailService() 