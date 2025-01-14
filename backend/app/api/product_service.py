from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc, Float
from ..models.database_models import Product, Review
from ..models.schemas import ProductCreate, ReviewCreate
import uuid
from typing import List, Optional
import re

class ProductService:
    def __init__(self):
        pass

    def _parse_price(self, price_str: str) -> tuple[float, str]:
        """Převede cenový řetězec na číslo a měnu."""
        if not price_str:
            return (0.0, "")
        
        # Odstranění mezer a převod na malá písmena
        price_str = price_str.strip().lower()
        
        # Základní měny a jejich symboly
        currency_patterns = {
            "czk": r"(kč|czk)",
            "eur": r"(€|eur)",
            "usd": r"(\$|usd)"
        }
        
        # Nalezení čísla a měny v řetězci
        number_pattern = r"([0-9]+(?:[.,][0-9]+)?)"
        found_number = re.search(number_pattern, price_str)
        
        if not found_number:
            return (0.0, "")
            
        price_value = float(found_number.group(1).replace(",", "."))
        
        # Zjištění měny
        currency = "czk"  # výchozí měna
        for curr, pattern in currency_patterns.items():
            if re.search(pattern, price_str):
                currency = curr
                break
                
        return (price_value, currency)

    def create_product(self, db: Session, product: ProductCreate) -> Product:
        """Vytvoří nový produkt."""
        db_product = Product(
            id=str(uuid.uuid4()),
            title=product.title,
            description=product.description,
            category=product.category,
            price=product.price,
            imageUrl=product.imageUrl,
            externalUrl=product.externalUrl,
            company=product.company,
            features=product.features,
            pros=product.pros,
            cons=product.cons,
            tags=product.tags
        )
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product

    def get_product(self, db: Session, product_id: str) -> Optional[Product]:
        """Získá produkt podle ID."""
        return db.query(Product).filter(Product.id == product_id).first()

    def get_products(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        provider: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> List[Product]:
        """Získá seznam produktů s možností filtrování."""
        query = db.query(Product)

        if category:
            query = query.filter(Product.category == category)
        if provider:
            query = query.filter(Product.company == provider)

        return query.offset(skip).limit(limit).all()

    def update_product(self, db: Session, product_id: str, product: ProductCreate) -> Optional[Product]:
        """Aktualizuje existující produkt."""
        db_product = self.get_product(db, product_id)
        if not db_product:
            return None

        for field, value in product.dict().items():
            setattr(db_product, field, value)

        db.commit()
        db.refresh(db_product)
        return db_product

    def delete_product(self, db: Session, product_id: str) -> bool:
        """Smaže produkt."""
        db_product = self.get_product(db, product_id)
        if not db_product:
            return False

        db.delete(db_product)
        db.commit()
        return True

    def create_review(self, db: Session, product_id: str, user_id: str, review: ReviewCreate) -> Optional[Review]:
        """Vytvoří novou recenzi pro produkt."""
        db_product = self.get_product(db, product_id)
        if not db_product:
            return None

        db_review = Review(
            id=str(uuid.uuid4()),
            product_id=product_id,
            user_id=user_id,
            rating=review.rating,
            comment=review.comment
        )
        db.add(db_review)
        
        # Aktualizace průměrného hodnocení produktu
        reviews = db.query(Review).filter(Review.product_id == product_id).all()
        total_rating = sum(r.rating for r in reviews) + review.rating
        db_product.rating = total_rating / (len(reviews) + 1)
        
        db.commit()
        db.refresh(db_review)
        return db_review

    def get_product_reviews(self, db: Session, product_id: str, skip: int = 0, limit: int = 100) -> List[Review]:
        """Získá seznam recenzí pro produkt."""
        return db.query(Review).filter(Review.product_id == product_id).offset(skip).limit(limit).all()

    def search_products(
        self,
        db: Session,
        query: str,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = None,
        sort_by: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """
        Vyhledá produkty podle zadaných kritérií.
        """
        # Základní query
        db_query = db.query(Product)

        # Přidání textového vyhledávání
        if query:
            search_filter = or_(
                Product.title.ilike(f"%{query}%"),
                Product.description.ilike(f"%{query}%")
            )
            db_query = db_query.filter(search_filter)

        # Filtrování podle kategorie
        if category:
            db_query = db_query.filter(Product.category == category)

        # Filtrování podle ceny
        if min_price is not None or max_price is not None:
            price_filters = []
            if min_price is not None:
                price_filters.append(
                    Product.price.regexp_match(f"[0-9]+") != None
                )
                price_value = self._parse_price(str(min_price))[0]
                price_filters.append(
                    Product.price.regexp_match(f"[0-9]+").cast(Float) >= price_value
                )
            if max_price is not None:
                price_filters.append(
                    Product.price.regexp_match(f"[0-9]+") != None
                )
                price_value = self._parse_price(str(max_price))[0]
                price_filters.append(
                    Product.price.regexp_match(f"[0-9]+").cast(Float) <= price_value
                )
            db_query = db_query.filter(and_(*price_filters))

        # Filtrování podle hodnocení
        if min_rating is not None:
            db_query = db_query.filter(Product.rating >= min_rating)

        # Řazení
        if sort_by:
            if sort_by == "price_asc":
                db_query = db_query.order_by(asc(Product.price.regexp_match(f"[0-9]+").cast(Float)))
            elif sort_by == "price_desc":
                db_query = db_query.order_by(desc(Product.price.regexp_match(f"[0-9]+").cast(Float)))
            elif sort_by == "rating_desc":
                db_query = db_query.order_by(desc(Product.rating))

        # Aplikace stránkování
        db_query = db_query.offset(skip).limit(limit)

        return db_query.all()

product_service = ProductService()

from .ai_service import AIService
product_service.ai_service = AIService()
