from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from ..models.database_models import Product, Review
from ..models.schemas import PersonalizedRecommendation

class RecommendationService:
    def get_recommendations(
        self,
        db: Session,
        category: Optional[str] = None,
        budget: Optional[float] = None,
        features: Optional[List[str]] = None
    ) -> List[PersonalizedRecommendation]:
        """Získá personalizovaná doporučení produktů"""
        query = db.query(Product)

        if category:
            query = query.filter(Product.category == category)
        
        if budget:
            query = query.filter(Product.price <= budget)

        if features:
            for feature in features:
                query = query.filter(Product.features.contains([feature]))

        # Seřadíme podle hodnocení
        query = query.outerjoin(Review).group_by(Product.id).order_by(
            func.coalesce(func.avg(Review.rating), 0).desc()
        )

        # Získáme top produkty
        products = query.limit(5).all()

        # Vytvoříme doporučení
        recommendations = []
        for product in products:
            matching_features = []
            if features and product.features:
                matching_features = [f for f in features if f in product.features]

            recommendations.append(
                PersonalizedRecommendation(
                    product=product,
                    relevance_score=0.8,  # Zjednodušené skóre
                    matching_features=matching_features
                )
            )

        return recommendations

recommendation_service = RecommendationService() 