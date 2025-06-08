from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from ..database.database import get_db
from ..models.database_models import Company, BillingRecord, Campaign
from ..core.security import get_current_company

router = APIRouter()

# Pydantic schemas
class BillingRecordResponse(BaseModel):
    id: int
    type: str
    amount: float
    description: str
    status: str
    created_at: datetime
    invoice_number: Optional[str] = None
    invoice_url: Optional[str] = None

    class Config:
        from_attributes = True

class CompanyBillingResponse(BaseModel):
    id: int
    name: str
    balance: float
    auto_recharge: bool
    auto_recharge_amount: Optional[float] = None
    auto_recharge_threshold: Optional[float] = None
    daily_spend_limit: Optional[float] = None
    current_daily_spend: float

    class Config:
        from_attributes = True

class PeriodSpendResponse(BaseModel):
    today: float
    week: float
    month: float

class BillingDataResponse(BaseModel):
    company: CompanyBillingResponse
    transactions: List[BillingRecordResponse]
    invoices: List = []  # Mock pro nyní
    period_spend: PeriodSpendResponse

class AddFundsRequest(BaseModel):
    action: str
    offer_id: Optional[str] = None
    payment_method: Optional[str] = None

class DailyLimitRequest(BaseModel):
    action: str
    daily_limit: float

# Promotional offers
PROMOTIONAL_OFFERS = {
    'starter-100': {'amount': 100, 'bonus': 100, 'description': 'Welcome Bonus - Double your first deposit'},
    'growth-500': {'amount': 500, 'bonus': 100, 'description': 'Growth Package - Extra $100 bonus'},
    'premium-1000': {'amount': 1000, 'bonus': 200, 'description': 'Premium Package - Extra $200 bonus'},
    'enterprise-2500': {'amount': 2500, 'bonus': 750, 'description': 'Enterprise Package - Extra $750 bonus'}
}

@router.get("/", response_model=BillingDataResponse)
async def get_billing_data(
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    """Načtení billing informací pro firmu"""
    
    # Získání aktuálního data a období pro statistiky
    now = datetime.utcnow()
    today = datetime(now.year, now.month, now.day)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Statistiky pro různá období
    today_stats = db.query(func.sum(BillingRecord.amount)).filter(
        and_(
            BillingRecord.company_id == current_company.id,
            BillingRecord.created_at >= today,
            BillingRecord.type == 'spend'
        )
    ).scalar() or 0.0
    
    week_stats = db.query(func.sum(BillingRecord.amount)).filter(
        and_(
            BillingRecord.company_id == current_company.id,
            BillingRecord.created_at >= week_ago,
            BillingRecord.type == 'spend'
        )
    ).scalar() or 0.0
    
    month_stats = db.query(func.sum(BillingRecord.amount)).filter(
        and_(
            BillingRecord.company_id == current_company.id,
            BillingRecord.created_at >= month_ago,
            BillingRecord.type == 'spend'
        )
    ).scalar() or 0.0
    
    # Načtení posledních 20 billing záznamů
    billing_records = db.query(BillingRecord).filter(
        BillingRecord.company_id == current_company.id
    ).order_by(BillingRecord.created_at.desc()).limit(20).all()
    
    # Sestavení odpovědi
    company_data = CompanyBillingResponse(
        id=current_company.id,
        name=current_company.name,
        balance=current_company.balance,
        auto_recharge=current_company.auto_recharge,
        auto_recharge_amount=current_company.auto_recharge_amount,
        auto_recharge_threshold=current_company.auto_recharge_threshold,
        daily_spend_limit=current_company.daily_spend_limit,
        current_daily_spend=today_stats
    )
    
    return BillingDataResponse(
        company=company_data,
        transactions=[BillingRecordResponse.from_orm(record) for record in billing_records],
        invoices=[],  # TODO: Implementovat skutečné faktury
        period_spend=PeriodSpendResponse(
            today=today_stats,
            week=week_stats,
            month=month_stats
        )
    )

@router.post("/add-funds")
async def add_funds(
    request: AddFundsRequest,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    """Přidání finančních prostředků"""
    
    if request.action != 'add-funds':
        raise HTTPException(status_code=400, detail="Invalid action")
    
    if not request.offer_id or request.offer_id not in PROMOTIONAL_OFFERS:
        raise HTTPException(status_code=400, detail="Invalid offer selected")
    
    offer = PROMOTIONAL_OFFERS[request.offer_id]
    
    # Kontrola first-time bonusu
    total_spent = db.query(func.sum(BillingRecord.amount)).filter(
        and_(
            BillingRecord.company_id == current_company.id,
            BillingRecord.type == 'spend'
        )
    ).scalar() or 0.0
    
    is_first_time = total_spent == 0
    
    base_amount = offer['amount']
    bonus_amount = offer['bonus']
    
    # Welcome bonus pouze pro první uživatele
    if request.offer_id == 'starter-100' and not is_first_time:
        bonus_amount = 0
    
    final_total_amount = base_amount + bonus_amount
    
    # Aktualizace balance
    current_company.balance += final_total_amount
    
    # Vytvoření billing záznamu pro deposit
    deposit_record = BillingRecord(
        company_id=current_company.id,
        type='deposit',
        amount=base_amount,
        description=f"Deposit - {offer['description']}",
        payment_method=request.payment_method or 'card',
        status='completed',
        invoice_number=f"INV-{int(datetime.utcnow().timestamp())}"
    )
    db.add(deposit_record)
    
    # Vytvoření billing záznamu pro bonus (pokud existuje)
    if bonus_amount > 0:
        bonus_record = BillingRecord(
            company_id=current_company.id,
            type='bonus',
            amount=bonus_amount,
            description=f"Promotional bonus - {offer['description']}",
            status='completed'
        )
        db.add(bonus_record)
    
    db.commit()
    
    return {
        "success": True,
        "message": "Funds added successfully",
        "data": {
            "base_amount": base_amount,
            "bonus_amount": bonus_amount,
            "total_added": final_total_amount,
            "new_balance": current_company.balance
        }
    }

@router.post("/daily-limit")
async def update_daily_limit(
    request: DailyLimitRequest,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    """Aktualizace denního limitu"""
    
    if request.action != 'update-daily-limit':
        raise HTTPException(status_code=400, detail="Invalid action")
    
    if request.daily_limit < 10:
        raise HTTPException(status_code=400, detail="Minimum daily limit is $10")
    
    # Aktualizace denního limitu
    current_company.daily_spend_limit = request.daily_limit
    db.commit()
    
    return {
        "success": True,
        "message": "Daily spend limit updated successfully"
    }

@router.post("/auto-recharge")
async def update_auto_recharge(
    auto_recharge: bool,
    auto_recharge_amount: Optional[float] = None,
    auto_recharge_threshold: Optional[float] = None,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    """Aktualizace auto-recharge nastavení"""
    
    if auto_recharge:
        if not auto_recharge_amount or not auto_recharge_threshold:
            raise HTTPException(
                status_code=400, 
                detail="Auto-recharge amount and threshold are required"
            )
        
        if auto_recharge_amount < 50:
            raise HTTPException(
                status_code=400, 
                detail="Minimum auto-recharge amount is $50"
            )
    
    # Aktualizace nastavení
    current_company.auto_recharge = auto_recharge
    current_company.auto_recharge_amount = auto_recharge_amount if auto_recharge else None
    current_company.auto_recharge_threshold = auto_recharge_threshold if auto_recharge else None
    
    db.commit()
    
    return {
        "success": True,
        "message": "Auto-recharge settings updated successfully"
    } 