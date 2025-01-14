from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.database_models import Product, PriceHistory
from ..models.schemas import PriceHistory as PriceHistorySchema
from ..models.schemas import PriceStatistics
from datetime import datetime, timedelta
from typing import List, Optional

class PriceHistoryService:
    async def get_price_history(
        self,
        db: Session,
        product_id: str,
        days: Optional[int] = 30
    ) -> PriceHistorySchema:
        """Získá historii cen produktu."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("Produkt nenalezen")

        # Získáme historii cen za zadané období
        start_date = datetime.utcnow() - timedelta(days=days)
        history = db.query(PriceHistory).filter(
            PriceHistory.product_id == product_id,
            PriceHistory.created_at >= start_date
        ).order_by(PriceHistory.created_at.asc()).all()

        # Vypočítáme statistiky
        prices = [float(h.price) for h in history]
        if not prices:
            return PriceHistorySchema(
                product_id=product_id,
                product_title=product.title,
                current_price=float(product.price),
                history=[],
                min_price=float(product.price),
                max_price=float(product.price),
                avg_price=float(product.price),
                price_change_30d=None
            )

        min_price = min(prices)
        max_price = max(prices)
        avg_price = sum(prices) / len(prices)

        # Vypočítáme změnu ceny za posledních 30 dní
        if len(prices) >= 2:
            price_change = ((prices[-1] - prices[0]) / prices[0]) * 100
        else:
            price_change = None

        return PriceHistorySchema(
            product_id=product_id,
            product_title=product.title,
            current_price=float(product.price),
            history=history,
            min_price=min_price,
            max_price=max_price,
            avg_price=avg_price,
            price_change_30d=price_change
        )

    async def get_price_statistics(
        self,
        db: Session,
        product_id: str
    ) -> PriceStatistics:
        """Získá statistiky cen produktu."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("Produkt nenalezen")

        # Získáme historii cen za posledních 30 dní
        start_date = datetime.utcnow() - timedelta(days=30)
        history = db.query(PriceHistory).filter(
            PriceHistory.product_id == product_id,
            PriceHistory.created_at >= start_date
        ).order_by(PriceHistory.created_at.asc()).all()

        prices = [float(h.price) for h in history]
        if not prices:
            return PriceStatistics(
                min_price=float(product.price),
                max_price=float(product.price),
                avg_price=float(product.price),
                price_change_24h=None,
                price_change_7d=None,
                price_change_30d=None
            )

        # Základní statistiky
        min_price = min(prices)
        max_price = max(prices)
        avg_price = sum(prices) / len(prices)

        # Změny cen za různá období
        now = datetime.utcnow()
        changes = {
            '24h': timedelta(days=1),
            '7d': timedelta(days=7),
            '30d': timedelta(days=30)
        }

        price_changes = {}
        for period, delta in changes.items():
            period_start = now - delta
            start_price = None
            for h in history:
                if h.created_at >= period_start:
                    start_price = float(h.price)
                    break
            
            if start_price and len(prices) > 0:
                change = ((prices[-1] - start_price) / start_price) * 100
                price_changes[period] = change
            else:
                price_changes[period] = None

        return PriceStatistics(
            min_price=min_price,
            max_price=max_price,
            avg_price=avg_price,
            price_change_24h=price_changes['24h'],
            price_change_7d=price_changes['7d'],
            price_change_30d=price_changes['30d']
        )

price_history_service = PriceHistoryService() 