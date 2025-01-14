from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc, asc
from ..models.database_models import Product, Review
from typing import List, Optional, Dict
from datetime import datetime, timedelta

class SearchService:
    def search_products(
        self,
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = None,
        providers: Optional[List[str]] = None,
        features: Optional[List[str]] = None,
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = "desc",
        skip: int = 0,
        limit: int = 100
    ) -> Dict:
        """
        Pokročilé vyhledávání produktů s filtrováním a řazením.
        Vrací slovník s výsledky a celkovým počtem.
        """
        # Základní query
        base_query = db.query(Product)

        # Fulltextové vyhledávání
        if query:
            search_filter = or_(
                Product.title.ilike(f"%{query}%"),
                Product.description.ilike(f"%{query}%"),
                Product.features.any(lambda x: x.ilike(f"%{query}%"))
            )
            base_query = base_query.filter(search_filter)

        # Filtry
        if category:
            base_query = base_query.filter(Product.category == category)
        
        if min_price is not None:
            base_query = base_query.filter(Product.price >= min_price)
        
        if max_price is not None:
            base_query = base_query.filter(Product.price <= max_price)
        
        if providers:
            base_query = base_query.filter(Product.provider.in_(providers))

        if features:
            for feature in features:
                base_query = base_query.filter(Product.features.any(feature))

        # Filtr podle hodnocení
        if min_rating is not None:
            base_query = base_query.join(Review).group_by(Product.id).having(
                func.avg(Review.rating) >= min_rating
            )

        # Řazení
        if sort_by:
            if sort_by == "price":
                order = asc(Product.price) if sort_order == "asc" else desc(Product.price)
            elif sort_by == "rating":
                order = desc(func.avg(Review.rating))
            elif sort_by == "reviews":
                order = desc(func.count(Review.id))
            elif sort_by == "date":
                order = desc(Product.created_at)
            else:
                order = desc(Product.created_at)  # Výchozí řazení
            
            base_query = base_query.order_by(order)

        # Získáme celkový počet výsledků
        total_count = base_query.count()

        # Aplikujeme stránkování
        results = base_query.offset(skip).limit(limit).all()

        # Přidáme průměrné hodnocení ke každému produktu
        for product in results:
            reviews = db.query(Review).filter(Review.product_id == product.id).all()
            if reviews:
                product.average_rating = sum(r.rating for r in reviews) / len(reviews)
                product.reviews_count = len(reviews)
            else:
                product.average_rating = None
                product.reviews_count = 0

        return {
            "total": total_count,
            "items": results,
            "page": skip // limit + 1,
            "pages": (total_count + limit - 1) // limit
        }

    def get_search_suggestions(
        self,
        db: Session,
        query: str,
        limit: int = 5
    ) -> List[str]:
        """
        Získá návrhy pro automatické doplňování vyhledávání.
        """
        # Hledáme v názvech produktů
        title_suggestions = db.query(Product.title).filter(
            Product.title.ilike(f"%{query}%")
        ).limit(limit).all()

        # Hledáme v kategoriích
        category_suggestions = db.query(Product.category).filter(
            Product.category.ilike(f"%{query}%")
        ).distinct().limit(limit).all()

        # Hledáme ve vlastnostech
        feature_suggestions = db.query(func.unnest(Product.features)).filter(
            func.unnest(Product.features).ilike(f"%{query}%")
        ).distinct().limit(limit).all()

        # Spojíme všechny návrhy a odstraníme duplicity
        all_suggestions = (
            [t.title for t in title_suggestions] +
            [c.category for c in category_suggestions] +
            [f[0] for f in feature_suggestions]
        )

        return list(dict.fromkeys(all_suggestions))[:limit]

    def get_popular_searches(
        self,
        db: Session,
        days: int = 7,
        limit: int = 10
    ) -> List[Dict]:
        """
        Získá nejpopulárnější vyhledávací dotazy za poslední období.
        """
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Toto by vyžadovalo tabulku pro logování vyhledávání
        # Pro demonstraci vrátíme nejpopulárnější kategorie
        popular_categories = db.query(
            Product.category,
            func.count(Product.id).label('count')
        ).group_by(
            Product.category
        ).order_by(
            desc('count')
        ).limit(limit).all()

        return [
            {
                "term": category,
                "count": count,
                "type": "category"
            }
            for category, count in popular_categories
        ]

search_service = SearchService() 