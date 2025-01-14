from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta
from ..models.database_models import User, Product, NotificationLog
from ..services.email_service import email_service
from ..config.settings import settings

class NotificationService:
    async def create_notification(
        self,
        db: Session,
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[dict] = None
    ) -> NotificationLog:
        """Vytvoří novou notifikaci pro uživatele."""
        notification = NotificationLog(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            data=data,
            read=False
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    async def get_user_notifications(
        self,
        db: Session,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
        unread_only: bool = False
    ) -> List[NotificationLog]:
        """Získá seznam notifikací pro uživatele."""
        query = db.query(NotificationLog).filter(NotificationLog.user_id == user_id)
        
        if unread_only:
            query = query.filter(NotificationLog.read == False)
        
        return query.order_by(desc(NotificationLog.created_at)).offset(offset).limit(limit).all()

    async def mark_notification_as_read(
        self,
        db: Session,
        notification_id: str,
        user_id: str
    ) -> bool:
        """Označí notifikaci jako přečtenou."""
        notification = db.query(NotificationLog).filter(
            NotificationLog.id == notification_id,
            NotificationLog.user_id == user_id
        ).first()
        
        if notification:
            notification.read = True
            notification.read_at = datetime.utcnow()
            db.commit()
            return True
        return False

    async def mark_all_notifications_as_read(
        self,
        db: Session,
        user_id: str
    ) -> int:
        """Označí všechny notifikace uživatele jako přečtené."""
        result = db.query(NotificationLog).filter(
            NotificationLog.user_id == user_id,
            NotificationLog.read == False
        ).update({
            NotificationLog.read: True,
            NotificationLog.read_at: datetime.utcnow()
        })
        db.commit()
        return result

    async def delete_notification(
        self,
        db: Session,
        notification_id: str,
        user_id: str
    ) -> bool:
        """Smaže notifikaci."""
        notification = db.query(NotificationLog).filter(
            NotificationLog.id == notification_id,
            NotificationLog.user_id == user_id
        ).first()
        
        if notification:
            db.delete(notification)
            db.commit()
            return True
        return False

    async def delete_old_notifications(
        self,
        db: Session,
        days: int = 30
    ) -> int:
        """Smaže staré notifikace."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        result = db.query(NotificationLog).filter(
            NotificationLog.created_at < cutoff_date
        ).delete()
        db.commit()
        return result

    async def notify_price_drop(
        self,
        db: Session,
        user: User,
        product: Product,
        old_price: float,
        new_price: float
    ):
        """Odešle notifikaci o snížení ceny produktu."""
        price_drop_percent = ((old_price - new_price) / old_price) * 100
        
        title = f"Snížení ceny: {product.title}"
        message = (
            f"Cena produktu {product.title} se snížila o {price_drop_percent:.1f}% "
            f"z {old_price} Kč na {new_price} Kč."
        )
        
        # Vytvoření notifikace v systému
        await self.create_notification(
            db,
            user.id,
            "price_drop",
            title,
            message,
            {
                "product_id": product.id,
                "old_price": old_price,
                "new_price": new_price,
                "price_drop_percent": price_drop_percent
            }
        )
        
        # Odeslání e-mailu, pokud má uživatel povolené e-mailové notifikace
        user_settings = await preferences_service.get_notification_settings(db, user.id)
        if user_settings and user_settings.email_notifications:
            await email_service.send_price_alert(
                user.email,
                product.title,
                old_price,
                new_price,
                product.imageUrl,
                product.externalUrl
            )

    async def notify_new_product(
        self,
        db: Session,
        user: User,
        product: Product
    ):
        """Odešle notifikaci o novém produktu v sledované kategorii."""
        title = f"Nový produkt: {product.title}"
        message = (
            f"V kategorii {product.category} byl přidán nový produkt: {product.title} "
            f"za cenu {product.price} Kč."
        )
        
        # Vytvoření notifikace v systému
        await self.create_notification(
            db,
            user.id,
            "new_product",
            title,
            message,
            {"product_id": product.id}
        )
        
        # Odeslání e-mailu, pokud má uživatel povolené e-mailové notifikace
        user_settings = await preferences_service.get_notification_settings(db, user.id)
        if user_settings and user_settings.email_notifications:
            await email_service.send_new_product_notification(
                user.email,
                product.title,
                product.category,
                product.price,
                product.imageUrl,
                product.externalUrl
            )

    async def notify_review_response(
        self,
        db: Session,
        user: User,
        product: Product,
        review_id: str,
        response: str
    ):
        """Odešle notifikaci o odpovědi na recenzi."""
        title = f"Nová odpověď na vaši recenzi: {product.title}"
        message = f"Vaše recenze produktu {product.title} získala novou odpověď."
        
        # Vytvoření notifikace v systému
        await self.create_notification(
            db,
            user.id,
            "review_response",
            title,
            message,
            {
                "product_id": product.id,
                "review_id": review_id,
                "response": response
            }
        )
        
        # Odeslání e-mailu, pokud má uživatel povolené e-mailové notifikace
        user_settings = await preferences_service.get_notification_settings(db, user.id)
        if user_settings and user_settings.email_notifications:
            await email_service.send_review_response_notification(
                user.email,
                product.title,
                response,
                product.externalUrl
            )

notification_service = NotificationService() 