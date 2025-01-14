from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.database_models import AffiliateLink, ClickLog, Product
from typing import List, Optional, Dict
from datetime import datetime
import uuid

class AffiliateService:
    def create_affiliate_link(
        self,
        db: Session,
        product_id: str,
        original_url: str,
        affiliate_url: str,
        provider: str,
        commission_rate: float
    ) -> AffiliateLink:
        """Vytvoří nový affiliate odkaz pro produkt."""
        # Ověření existence produktu
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None

        db_affiliate = AffiliateLink(
            product_id=product_id,
            original_url=original_url,
            affiliate_url=affiliate_url,
            provider=provider,
            commission_rate=commission_rate,
            clicks=0
        )
        db.add(db_affiliate)
        db.commit()
        db.refresh(db_affiliate)
        return db_affiliate

    def get_affiliate_links(
        self,
        db: Session,
        product_id: Optional[str] = None,
        provider: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[AffiliateLink]:
        """Získá seznam affiliate odkazů s možností filtrování."""
        query = db.query(AffiliateLink)
        
        if product_id:
            query = query.filter(AffiliateLink.product_id == product_id)
        if provider:
            query = query.filter(AffiliateLink.provider == provider)
            
        return query.offset(skip).limit(limit).all()

    def update_affiliate_link(
        self,
        db: Session,
        link_id: int,
        affiliate_url: Optional[str] = None,
        commission_rate: Optional[float] = None
    ) -> Optional[AffiliateLink]:
        """Aktualizuje existující affiliate odkaz."""
        db_link = db.query(AffiliateLink).filter(AffiliateLink.id == link_id).first()
        if not db_link:
            return None

        if affiliate_url:
            db_link.affiliate_url = affiliate_url
        if commission_rate is not None:
            db_link.commission_rate = commission_rate
            
        db_link.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_link)
        return db_link

    def delete_affiliate_link(self, db: Session, link_id: int) -> bool:
        """Smaže affiliate odkaz."""
        db_link = db.query(AffiliateLink).filter(AffiliateLink.id == link_id).first()
        if not db_link:
            return False

        db.delete(db_link)
        db.commit()
        return True

    def record_click(
        self,
        db: Session,
        link_id: int,
        ip_address: str,
        user_agent: str,
        referrer: Optional[str] = None
    ) -> Optional[str]:
        """Zaznamená kliknutí na affiliate odkaz a vrátí přesměrovací URL."""
        db_link = db.query(AffiliateLink).filter(AffiliateLink.id == link_id).first()
        if not db_link:
            return None

        # Vytvoření záznamu o kliknutí
        click_log = ClickLog(
            id=str(uuid.uuid4()),
            affiliate_link_id=link_id,
            ip_address=ip_address,
            user_agent=user_agent,
            referrer=referrer,
            timestamp=datetime.utcnow()
        )
        db.add(click_log)

        # Aktualizace počtu kliknutí
        db_link.clicks += 1
        db_link.updated_at = datetime.utcnow()
        
        db.commit()
        return db_link.affiliate_url

    def get_click_stats(
        self,
        db: Session,
        link_id: Optional[int] = None,
        product_id: Optional[str] = None,
        provider: Optional[str] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None
    ) -> Dict:
        """Získá statistiky kliknutí s možností filtrování."""
        query = db.query(
            func.count(ClickLog.id).label('total_clicks'),
            func.count(func.distinct(ClickLog.ip_address)).label('unique_clicks')
        ).join(AffiliateLink)

        if link_id:
            query = query.filter(AffiliateLink.id == link_id)
        if product_id:
            query = query.filter(AffiliateLink.product_id == product_id)
        if provider:
            query = query.filter(AffiliateLink.provider == provider)
        if from_date:
            query = query.filter(ClickLog.timestamp >= from_date)
        if to_date:
            query = query.filter(ClickLog.timestamp <= to_date)

        result = query.first()

        # Získání denních statistik
        daily_stats = db.query(
            func.date(ClickLog.timestamp).label('date'),
            func.count(ClickLog.id).label('clicks'),
            func.count(func.distinct(ClickLog.ip_address)).label('unique_clicks')
        ).join(AffiliateLink)

        if link_id:
            daily_stats = daily_stats.filter(AffiliateLink.id == link_id)
        if product_id:
            daily_stats = daily_stats.filter(AffiliateLink.product_id == product_id)
        if provider:
            daily_stats = daily_stats.filter(AffiliateLink.provider == provider)
        if from_date:
            daily_stats = daily_stats.filter(ClickLog.timestamp >= from_date)
        if to_date:
            daily_stats = daily_stats.filter(ClickLog.timestamp <= to_date)

        daily_stats = daily_stats.group_by(
            func.date(ClickLog.timestamp)
        ).order_by(
            func.date(ClickLog.timestamp)
        ).all()

        return {
            'total_clicks': result.total_clicks if result else 0,
            'unique_clicks': result.unique_clicks if result else 0,
            'daily_stats': [
                {
                    'date': str(day.date),
                    'clicks': day.clicks,
                    'unique_clicks': day.unique_clicks
                }
                for day in daily_stats
            ]
        }

affiliate_service = AffiliateService() 