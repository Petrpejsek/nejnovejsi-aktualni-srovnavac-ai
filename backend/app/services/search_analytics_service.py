from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from ..models.database_models import SearchLog, Product
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json

class SearchAnalyticsService:
    async def log_search(
        self,
        db: Session,
        query: str,
        filters: dict,
        results_count: int,
        session_id: str,
        user_id: Optional[str] = None,
        category: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> SearchLog:
        """Zaloguje vyhledávací dotaz."""
        search_log = SearchLog(
            user_id=user_id,
            query=query,
            filters=json.dumps(filters),
            results_count=results_count,
            category=category,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(search_log)
        db.commit()
        db.refresh(search_log)
        return search_log

    async def log_search_click(
        self,
        db: Session,
        search_id: str,
        product_id: str
    ) -> bool:
        """Zaloguje kliknutí na výsledek vyhledávání."""
        search_log = db.query(SearchLog).filter(SearchLog.id == search_id).first()
        if not search_log:
            return False

        clicked_results = json.loads(search_log.clicked_results or '[]')
        if product_id not in clicked_results:
            clicked_results.append(product_id)
            search_log.clicked_results = json.dumps(clicked_results)
            search_log.conversion = True
            db.commit()
        return True

    async def get_popular_searches(
        self,
        db: Session,
        days: int = 7,
        limit: int = 10
    ) -> List[Dict]:
        """Získá nejpopulárnější vyhledávací dotazy."""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        popular_searches = db.query(
            SearchLog.query,
            func.count(SearchLog.id).label('count'),
            func.avg(SearchLog.results_count).label('avg_results'),
            func.sum(SearchLog.conversion.cast(Integer)).label('conversions')
        ).filter(
            SearchLog.created_at >= start_date
        ).group_by(
            SearchLog.query
        ).order_by(
            desc('count')
        ).limit(limit).all()

        return [
            {
                "term": search.query,
                "count": search.count,
                "avg_results": float(search.avg_results),
                "conversion_rate": (search.conversions / search.count) * 100
            }
            for search in popular_searches
        ]

    async def get_search_trends(
        self,
        db: Session,
        days: int = 30
    ) -> List[Dict]:
        """Získá trendy ve vyhledávání po dnech."""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        daily_stats = db.query(
            func.date_trunc('day', SearchLog.created_at).label('date'),
            func.count(SearchLog.id).label('searches'),
            func.avg(SearchLog.results_count).label('avg_results'),
            func.sum(SearchLog.conversion.cast(Integer)).label('conversions')
        ).filter(
            SearchLog.created_at >= start_date
        ).group_by(
            'date'
        ).order_by(
            'date'
        ).all()

        return [
            {
                "date": stats.date.strftime('%Y-%m-%d'),
                "searches": stats.searches,
                "avg_results": float(stats.avg_results),
                "conversions": stats.conversions
            }
            for stats in daily_stats
        ]

    async def get_category_insights(
        self,
        db: Session,
        days: int = 30
    ) -> List[Dict]:
        """Získá přehledy vyhledávání podle kategorií."""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        category_stats = db.query(
            SearchLog.category,
            func.count(SearchLog.id).label('searches'),
            func.avg(SearchLog.results_count).label('avg_results'),
            func.sum(SearchLog.conversion.cast(Integer)).label('conversions')
        ).filter(
            and_(
                SearchLog.created_at >= start_date,
                SearchLog.category.isnot(None)
            )
        ).group_by(
            SearchLog.category
        ).order_by(
            desc('searches')
        ).all()

        return [
            {
                "category": stats.category,
                "searches": stats.searches,
                "avg_results": float(stats.avg_results),
                "conversion_rate": (stats.conversions / stats.searches) * 100
            }
            for stats in category_stats
        ]

    async def get_zero_results_searches(
        self,
        db: Session,
        days: int = 7,
        limit: int = 20
    ) -> List[Dict]:
        """Získá vyhledávací dotazy, které nevrátily žádné výsledky."""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        failed_searches = db.query(
            SearchLog.query,
            func.count(SearchLog.id).label('count')
        ).filter(
            and_(
                SearchLog.created_at >= start_date,
                SearchLog.results_count == 0
            )
        ).group_by(
            SearchLog.query
        ).order_by(
            desc('count')
        ).limit(limit).all()

        return [
            {
                "term": search.query,
                "count": search.count
            }
            for search in failed_searches
        ]

    async def get_user_search_history(
        self,
        db: Session,
        user_id: str,
        limit: int = 50
    ) -> List[Dict]:
        """Získá historii vyhledávání konkrétního uživatele."""
        searches = db.query(SearchLog).filter(
            SearchLog.user_id == user_id
        ).order_by(
            desc(SearchLog.created_at)
        ).limit(limit).all()

        return [
            {
                "query": search.query,
                "category": search.category,
                "results": search.results_count,
                "date": search.created_at,
                "conversion": search.conversion
            }
            for search in searches
        ]

search_analytics_service = SearchAnalyticsService() 