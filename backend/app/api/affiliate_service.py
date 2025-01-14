from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.database_models import AffiliateLink, ClickLog
from datetime import datetime
from fastapi import Request

class AffiliateService:
    @staticmethod
    async def create_affiliate_link(
        db: Session,
        product_id: int,
        original_url: str,
        affiliate_url: str,
        provider: str,
        commission_rate: float
    ) -> AffiliateLink:
        """Vytvoří nový affiliate odkaz."""
        db_link = AffiliateLink(
            product_id=product_id,
            original_url=original_url,
            affiliate_url=affiliate_url,
            provider=provider,
            commission_rate=commission_rate
        )
        db.add(db_link)
        db.commit()
        db.refresh(db_link)
        return db_link

    @staticmethod
    async def get_affiliate_links(
        db: Session,
        product_id: Optional[int] = None,
        provider: Optional[str] = None
    ) -> List[AffiliateLink]:
        """Získá seznam affiliate odkazů s možností filtrování."""
        query = db.query(AffiliateLink)
        
        if product_id:
            query = query.filter(AffiliateLink.product_id == product_id)
        if provider:
            query = query.filter(AffiliateLink.provider == provider)
            
        return query.all()

    @staticmethod
    async def track_click(
        db: Session,
        affiliate_link_id: int,
        request: Request
    ) -> ClickLog:
        """Zaznamená klik na affiliate odkaz."""
        # Zvýšení počtu kliků
        db_link = db.query(AffiliateLink).filter(AffiliateLink.id == affiliate_link_id).first()
        if db_link:
            db_link.clicks += 1
            
        # Zaznamenání detailů o kliku
        click_log = ClickLog(
            affiliate_link_id=affiliate_link_id,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent", ""),
            referrer=request.headers.get("referer", "")
        )
        
        db.add(click_log)
        db.commit()
        db.refresh(click_log)
        return click_log

    @staticmethod
    async def get_click_stats(
        db: Session,
        affiliate_link_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> dict:
        """Získá statistiky kliků."""
        query = db.query(ClickLog)
        
        if affiliate_link_id:
            query = query.filter(ClickLog.affiliate_link_id == affiliate_link_id)
        if start_date:
            query = query.filter(ClickLog.timestamp >= start_date)
        if end_date:
            query = query.filter(ClickLog.timestamp <= end_date)
            
        total_clicks = query.count()
        converted_clicks = query.filter(ClickLog.converted == True).count()
        
        return {
            "total_clicks": total_clicks,
            "converted_clicks": converted_clicks,
            "conversion_rate": (converted_clicks / total_clicks * 100) if total_clicks > 0 else 0
        }

affiliate_service = AffiliateService()
