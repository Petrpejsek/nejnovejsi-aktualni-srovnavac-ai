from sqlalchemy.orm import Session
from typing import List
from ..models.database_models import Review
from ..models.schemas import ReviewCreate

class ReviewService:
    def get_reviews(self, db: Session, product_id: int = None) -> List[Review]:
        """Získá seznam recenzí s možností filtrování podle produktu"""
        query = db.query(Review)
        if product_id:
            query = query.filter(Review.product_id == product_id)
        return query.all()
    
    def create_review(self, db: Session, review: ReviewCreate) -> Review:
        """Vytvoří novou recenzi"""
        db_review = Review(
            rating=review.rating,
            comment=review.comment,
            user_id=review.user_id,
            product_id=review.product_id
        )
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        return db_review 