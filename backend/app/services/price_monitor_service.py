from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..models.database_models import Product, PriceHistory, UserPreferences, NotificationSettings
from .notification_service import notification_service
from datetime import datetime, timedelta
import asyncio
import logging

logger = logging.getLogger(__name__)

class PriceMonitorService:
    def __init__(self):
        self.check_interval = 3600  # Kontrola každou hodinu
        self.price_threshold = 1  # Minimální změna ceny v procentech pro notifikaci

    async def start_monitoring(self, db: Session):
        """Spustí periodickou kontrolu cen."""
        while True:
            try:
                await self.check_prices(db)
                await asyncio.sleep(self.check_interval)
            except Exception as e:
                logger.error(f"Chyba při kontrole cen: {str(e)}")
                await asyncio.sleep(60)  # Počkáme minutu před dalším pokusem

    async def check_prices(self, db: Session):
        """Kontroluje změny cen všech produktů."""
        logger.info("Začínám kontrolu cen produktů...")
        
        # Získáme všechny produkty
        products = db.query(Product).all()
        
        for product in products:
            try:
                # Získáme poslední zaznamenanou cenu
                last_price = db.query(PriceHistory).filter(
                    PriceHistory.product_id == product.id
                ).order_by(PriceHistory.created_at.desc()).first()

                if not last_price:
                    # První záznam ceny
                    self._record_price(db, product)
                    continue

                # Vypočítáme změnu ceny v procentech
                price_change_percent = abs(
                    (float(product.price) - float(last_price.price)) / float(last_price.price) * 100
                )

                if price_change_percent >= self.price_threshold:
                    # Zaznamenáme novou cenu
                    self._record_price(db, product)
                    
                    # Odešleme notifikace
                    await self._notify_price_change(
                        db, 
                        product.id, 
                        str(last_price.price), 
                        str(product.price)
                    )
                    
                    logger.info(
                        f"Zaznamenána změna ceny produktu {product.id}: "
                        f"{last_price.price} -> {product.price} "
                        f"({price_change_percent:.2f}%)"
                    )

            except Exception as e:
                logger.error(f"Chyba při kontrole ceny produktu {product.id}: {str(e)}")

    def _record_price(self, db: Session, product: Product):
        """Zaznamená aktuální cenu produktu do historie."""
        price_history = PriceHistory(
            product_id=product.id,
            price=product.price,
            created_at=datetime.utcnow()
        )
        db.add(price_history)
        db.commit()

    async def _notify_price_change(
        self, 
        db: Session, 
        product_id: str, 
        old_price: str, 
        new_price: str
    ):
        """Odešle notifikace o změně ceny."""
        await notification_service.notify_price_change(
            db=db,
            product_id=product_id,
            old_price=old_price,
            new_price=new_price
        )

price_monitor_service = PriceMonitorService() 