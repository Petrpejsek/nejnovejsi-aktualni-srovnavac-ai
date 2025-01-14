from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from ..models.database_models import Product, Review, AffiliateLink, ClickLog
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class AnalyticsService:
    def get_product_stats(self, db: Session, product_id: str) -> Dict:
        """Získá statistiky pro konkrétní produkt."""
        # Základní informace o produktu
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None

        # Počet recenzí a průměrné hodnocení
        reviews_stats = db.query(
            func.count(Review.id).label('count'),
            func.avg(Review.rating).label('avg_rating')
        ).filter(Review.product_id == product_id).first()

        # Statistiky affiliate odkazů
        affiliate_stats = db.query(
            func.sum(AffiliateLink.clicks).label('total_clicks'),
            func.count(AffiliateLink.id).label('link_count')
        ).filter(AffiliateLink.product_id == product_id).first()

        # Trendy kliknutí za poslední týden
        week_ago = datetime.utcnow() - timedelta(days=7)
        daily_clicks = db.query(
            func.date(ClickLog.timestamp).label('date'),
            func.count(ClickLog.id).label('clicks')
        ).join(AffiliateLink).filter(
            AffiliateLink.product_id == product_id,
            ClickLog.timestamp >= week_ago
        ).group_by(func.date(ClickLog.timestamp)).all()

        return {
            'product_id': product_id,
            'title': product.title,
            'reviews_count': reviews_stats.count if reviews_stats else 0,
            'average_rating': float(reviews_stats.avg_rating) if reviews_stats.avg_rating else 0.0,
            'total_clicks': affiliate_stats.total_clicks if affiliate_stats.total_clicks else 0,
            'affiliate_links_count': affiliate_stats.link_count if affiliate_stats else 0,
            'daily_clicks': [
                {'date': str(dc.date), 'clicks': dc.clicks}
                for dc in daily_clicks
            ]
        }

    def get_category_stats(self, db: Session, category: str) -> Dict:
        """Získá statistiky pro kategorii produktů."""
        # Počet produktů v kategorii
        products_count = db.query(func.count(Product.id)).filter(
            Product.category == category
        ).scalar()

        # Průměrná cena v kategorii (pouze pro CZK)
        avg_price = db.query(
            func.avg(
                func.cast(
                    func.regexp_replace(Product.price, r'[^0-9.]', '', 'g'),
                    float
                )
            )
        ).filter(
            Product.category == category,
            Product.price.like('%CZK%')
        ).scalar()

        # Nejlépe hodnocené produkty
        top_rated = db.query(Product).filter(
            Product.category == category
        ).order_by(desc(Product.rating)).limit(5).all()

        # Nejpopulárnější produkty podle počtu recenzí
        most_reviewed = db.query(
            Product,
            func.count(Review.id).label('review_count')
        ).join(Review).filter(
            Product.category == category
        ).group_by(Product.id).order_by(
            desc('review_count')
        ).limit(5).all()

        return {
            'category': category,
            'products_count': products_count,
            'average_price_czk': float(avg_price) if avg_price else 0.0,
            'top_rated_products': [
                {
                    'id': p.id,
                    'title': p.title,
                    'rating': p.rating
                }
                for p in top_rated
            ],
            'most_reviewed_products': [
                {
                    'id': p[0].id,
                    'title': p[0].title,
                    'reviews_count': p[1]
                }
                for p in most_reviewed
            ]
        }

    def get_global_stats(self, db: Session) -> Dict:
        """Získá globální statistiky platformy."""
        # Celkový počet produktů, recenzí a kliknutí
        total_products = db.query(func.count(Product.id)).scalar()
        total_reviews = db.query(func.count(Review.id)).scalar()
        total_clicks = db.query(func.sum(AffiliateLink.clicks)).scalar()

        # Statistiky podle kategorií
        category_stats = db.query(
            Product.category,
            func.count(Product.id).label('count'),
            func.avg(Product.rating).label('avg_rating')
        ).group_by(Product.category).all()

        # Trendy za poslední měsíc
        month_ago = datetime.utcnow() - timedelta(days=30)
        daily_activity = db.query(
            func.date(Review.created_at).label('date'),
            func.count(Review.id).label('reviews'),
            func.count(distinct(ClickLog.id)).label('clicks')
        ).outerjoin(
            ClickLog, func.date(Review.created_at) == func.date(ClickLog.timestamp)
        ).filter(Review.created_at >= month_ago).group_by(
            func.date(Review.created_at)
        ).all()

        return {
            'total_stats': {
                'products': total_products,
                'reviews': total_reviews,
                'clicks': total_clicks or 0
            },
            'category_stats': [
                {
                    'category': cat,
                    'product_count': count,
                    'average_rating': float(avg) if avg else 0.0
                }
                for cat, count, avg in category_stats
            ],
            'daily_activity': [
                {
                    'date': str(day.date),
                    'reviews': day.reviews,
                    'clicks': day.clicks
                }
                for day in daily_activity
            ]
        }

analytics_service = AnalyticsService() 