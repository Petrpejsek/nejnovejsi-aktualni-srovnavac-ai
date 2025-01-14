from sqlalchemy.orm import Session
from ..models.database_models import UserPreferences, Product
from typing import List, Dict, Any, Optional
from datetime import datetime

class PreferencesService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_preferences(self, user_id: str) -> Optional[UserPreferences]:
        """Získá uživatelské preference podle ID uživatele"""
        return self.db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()

    def create_user_preferences(self, user_id: str, preferences_data: Dict[str, Any]) -> UserPreferences:
        """Vytvoří nové uživatelské preference"""
        preferences = UserPreferences(
            user_id=user_id,
            preferred_categories=preferences_data.get('preferred_categories'),
            preferred_price_range=preferences_data.get('preferred_price_range'),
            preferred_companies=preferences_data.get('preferred_companies'),
            preferred_features=preferences_data.get('preferred_features')
        )
        self.db.add(preferences)
        self.db.commit()
        self.db.refresh(preferences)
        return preferences

    def update_user_preferences(self, user_id: str, preferences_data: Dict[str, Any]) -> Optional[UserPreferences]:
        """Aktualizuje existující uživatelské preference"""
        preferences = self.get_user_preferences(user_id)
        if not preferences:
            return None

        # Aktualizace jednotlivých polí, pokud jsou poskytnuty
        if 'preferred_categories' in preferences_data:
            preferences.preferred_categories = preferences_data['preferred_categories']
        if 'preferred_price_range' in preferences_data:
            preferences.preferred_price_range = preferences_data['preferred_price_range']
        if 'preferred_companies' in preferences_data:
            preferences.preferred_companies = preferences_data['preferred_companies']
        if 'preferred_features' in preferences_data:
            preferences.preferred_features = preferences_data['preferred_features']

        preferences.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(preferences)
        return preferences

    def delete_user_preferences(self, user_id: str) -> bool:
        """Smaže uživatelské preference"""
        preferences = self.get_user_preferences(user_id)
        if not preferences:
            return False

        self.db.delete(preferences)
        self.db.commit()
        return True

    def get_recommended_products(self, user_id: str, limit: int = 10) -> List[Product]:
        """Získá doporučené produkty na základě uživatelských preferencí"""
        preferences = self.get_user_preferences(user_id)
        if not preferences:
            return []

        # Získání všech produktů
        products = self.db.query(Product).all()

        # Ohodnocení produktů podle preferencí
        scored_products = [(product, self._calculate_relevance_score(product, preferences)) 
                          for product in products]

        # Seřazení produktů podle skóre a vrácení top N
        scored_products.sort(key=lambda x: x[1], reverse=True)
        return [product for product, _ in scored_products[:limit]]

    def _calculate_relevance_score(self, product: Product, preferences: UserPreferences) -> float:
        """Vypočítá skóre relevance produktu vzhledem k preferencím uživatele"""
        score = 0.0
        weights = {
            'category': 0.3,
            'price_range': 0.25,
            'company': 0.2,
            'features': 0.25
        }

        # Kategorie
        if preferences.preferred_categories and product.category:
            if product.category in preferences.preferred_categories:
                score += weights['category']

        # Cenové rozpětí
        if preferences.preferred_price_range and product.price:
            try:
                price = float(product.price)
                min_price = preferences.preferred_price_range.get('min')
                max_price = preferences.preferred_price_range.get('max')
                if min_price and max_price:
                    if min_price <= price <= max_price:
                        score += weights['price_range']
            except (ValueError, TypeError):
                pass

        # Výrobce
        if preferences.preferred_companies and product.company:
            if product.company in preferences.preferred_companies:
                score += weights['company']

        # Vlastnosti
        if preferences.preferred_features and product.features:
            matching_features = set(preferences.preferred_features) & set(product.features)
            if matching_features:
                feature_score = len(matching_features) / len(preferences.preferred_features)
                score += weights['features'] * feature_score

        return score

preferences_service = PreferencesService() 