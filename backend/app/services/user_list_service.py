from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..models.database_models import UserList, Product
from ..models.schemas import UserListCreate, UserListUpdate
from datetime import datetime
from typing import List, Optional
import uuid

class UserListService:
    async def create_list(
        self,
        db: Session,
        user_id: str,
        list_data: UserListCreate
    ) -> UserList:
        """Vytvoří nový seznam pro uživatele."""
        db_list = UserList(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name=list_data.name,
            type=list_data.type,
            products=list_data.products,
            created_at=datetime.utcnow()
        )
        db.add(db_list)
        db.commit()
        db.refresh(db_list)
        return db_list

    async def get_user_lists(
        self,
        db: Session,
        user_id: str,
        list_type: Optional[str] = None
    ) -> List[UserList]:
        """Získá všechny seznamy uživatele."""
        query = db.query(UserList).filter(UserList.user_id == user_id)
        if list_type:
            query = query.filter(UserList.type == list_type)
        return query.all()

    async def get_list(
        self,
        db: Session,
        list_id: str,
        user_id: str
    ) -> Optional[UserList]:
        """Získá konkrétní seznam uživatele."""
        return db.query(UserList).filter(
            and_(
                UserList.id == list_id,
                UserList.user_id == user_id
            )
        ).first()

    async def update_list(
        self,
        db: Session,
        list_id: str,
        user_id: str,
        list_data: UserListUpdate
    ) -> Optional[UserList]:
        """Aktualizuje seznam."""
        db_list = await self.get_list(db, list_id, user_id)
        if not db_list:
            return None

        if list_data.name is not None:
            db_list.name = list_data.name
        if list_data.products is not None:
            db_list.products = list_data.products
        
        db_list.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_list)
        return db_list

    async def delete_list(
        self,
        db: Session,
        list_id: str,
        user_id: str
    ) -> bool:
        """Smaže seznam."""
        db_list = await self.get_list(db, list_id, user_id)
        if not db_list:
            return False

        db.delete(db_list)
        db.commit()
        return True

    async def add_to_list(
        self,
        db: Session,
        list_id: str,
        user_id: str,
        product_id: str
    ) -> Optional[UserList]:
        """Přidá produkt do seznamu."""
        db_list = await self.get_list(db, list_id, user_id)
        if not db_list:
            return None

        if product_id not in db_list.products:
            db_list.products.append(product_id)
            db_list.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(db_list)

        return db_list

    async def remove_from_list(
        self,
        db: Session,
        list_id: str,
        user_id: str,
        product_id: str
    ) -> Optional[UserList]:
        """Odebere produkt ze seznamu."""
        db_list = await self.get_list(db, list_id, user_id)
        if not db_list:
            return None

        if product_id in db_list.products:
            db_list.products.remove(product_id)
            db_list.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(db_list)

        return db_list

    async def get_list_with_products(
        self,
        db: Session,
        list_id: str,
        user_id: str
    ) -> Optional[dict]:
        """Získá seznam včetně detailů produktů."""
        db_list = await self.get_list(db, list_id, user_id)
        if not db_list:
            return None

        products = db.query(Product).filter(
            Product.id.in_(db_list.products)
        ).all()

        return {
            "id": db_list.id,
            "name": db_list.name,
            "type": db_list.type,
            "products": products,
            "created_at": db_list.created_at,
            "updated_at": db_list.updated_at
        }

    async def add_to_history(
        self,
        db: Session,
        user_id: str,
        product_id: str
    ) -> None:
        """Přidá produkt do historie prohlížení."""
        history_list = db.query(UserList).filter(
            and_(
                UserList.user_id == user_id,
                UserList.type == "history"
            )
        ).first()

        if not history_list:
            history_list = await self.create_list(
                db,
                user_id,
                UserListCreate(
                    name="Historie prohlížení",
                    type="history",
                    products=[]
                )
            )

        # Omezíme historii na posledních 100 produktů
        if product_id in history_list.products:
            history_list.products.remove(product_id)
        history_list.products.insert(0, product_id)
        history_list.products = history_list.products[:100]
        
        history_list.updated_at = datetime.utcnow()
        db.commit()

user_list_service = UserListService() 