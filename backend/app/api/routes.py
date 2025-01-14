from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from ..database import get_db
from ..models.schemas import (
    UserCreate,
    UserResponse,
    Token,
    ProductCreate,
    Product,
    ReviewCreate,
    Review,
    ComparisonResult,
    RecommendationRequest,
    ProductAnalytics,
    CategoryAnalytics,
    GlobalAnalytics,
    AffiliateLink,
    AffiliateLinkCreate,
    UserPreferencesCreate,
    UserPreferences,
    NotificationSettingsCreate,
    NotificationSettings,
    PersonalizedRecommendation,
    PriceHistory,
    PriceStatistics,
    PricePrediction,
    ExtendedPriceStatistics,
    UserList,
    UserListCreate,
    UserListUpdate,
    UserListResponse,
    SearchFilters,
    SearchResponse,
    SearchSuggestion,
    PopularSearch,
    SearchAnalytics,
    UserSearchHistory,
    SearchTrend,
    CategoryInsight,
    PopularSearchTerm,
    FailedSearch,
    NotificationList,
    Notification
)
from .auth_service import auth_service
from .google_auth_service import google_auth_service
from .product_service import product_service
from .ai_service import ai_service
from ..config.settings import settings
from ..services.cache_service import cache_response
from typing import List, Optional
from ..services.analytics_service import analytics_service
from ..services.affiliate_service import affiliate_service
from ..services.preferences_service import preferences_service
from ..services.price_history_service import price_history_service
from ..services.user_list_service import user_list_service
from ..services.search_service import search_service
from ..services.search_analytics_service import search_analytics_service
from ..services.notification_service import notification_service
import numpy as np

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Google OAuth endpointy
@router.get("/auth/google")
async def google_auth():
    """Přesměruje na Google přihlášení"""
    auth_url = google_auth_service.get_auth_url()
    return RedirectResponse(url=auth_url)

@router.get("/auth/google/callback")
async def google_auth_callback(code: str, db: Session = Depends(get_db)):
    """Zpracuje callback od Google a přihlásí uživatele"""
    try:
        # Získat informace o uživateli z Google
        user_info = await google_auth_service.verify_google_token(code)
        
        # Přihlásit nebo registrovat uživatele
        user, access_token = await google_auth_service.authenticate_google_user(db, user_info)
        
        # Přesměrovat zpět na frontend s tokenem
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback?token={access_token}",
            status_code=status.HTTP_302_FOUND
        )
    except Exception as e:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=Přihlášení pomocí Google se nezdařilo: {str(e)}",
            status_code=status.HTTP_302_FOUND
        )

# Registrace nového uživatele
@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    return await auth_service.create_user(db, user)

# Přihlášení uživatele
@router.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = await auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Získání aktuálního uživatele
@router.get("/users/me", response_model=UserResponse)
async def read_users_me(
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    return current_user

# Produktové endpointy
@router.get("/products", response_model=List[Product])
@cache_response(prefix="products_list", ttl=300)  # Cache na 5 minut
def get_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    provider: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    products = product_service.get_products(
        db,
        skip=skip,
        limit=limit,
        category=category,
        provider=provider,
        min_price=min_price,
        max_price=max_price
    )
    return products

@router.get("/products/{product_id}", response_model=Product)
@cache_response(prefix="product_detail", ttl=600)  # Cache na 10 minut
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nenalezen")
    return product

@router.post("/products", response_model=Product)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Pouze administrátoři mohou vytvářet produkty")
    return product_service.create_product(db, product)

@router.put("/products/{product_id}", response_model=Product)
def update_product(
    product_id: str,
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Pouze administrátoři mohou upravovat produkty")
    updated_product = product_service.update_product(db, product_id, product)
    if not updated_product:
        raise HTTPException(status_code=404, detail="Produkt nenalezen")
    return updated_product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Pouze administrátoři mohou mazat produkty")
    if not product_service.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Produkt nenalezen")
    return {"message": "Produkt byl úspěšně smazán"}

# Recenzní endpointy
@router.post("/products/{product_id}/reviews", response_model=Review)
def create_review(
    product_id: str,
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    db_review = product_service.create_review(db, product_id, current_user.id, review)
    if not db_review:
        raise HTTPException(status_code=404, detail="Produkt nenalezen")
    return db_review

@router.get("/products/{product_id}/reviews", response_model=List[Review])
@cache_response(prefix="product_reviews", ttl=300)  # Cache na 5 minut
def get_product_reviews(
    product_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return product_service.get_product_reviews(db, product_id, skip, limit)

# Porovnávací a doporučovací endpointy
@router.get("/compare/{product1_id}/{product2_id}", response_model=ComparisonResult)
@cache_response(prefix="product_comparison", ttl=1800)  # Cache na 30 minut
def compare_products(
    product1_id: str,
    product2_id: str,
    db: Session = Depends(get_db)
):
    result = ai_service.compare_products(db, product1_id, product2_id)
    if not result:
        raise HTTPException(status_code=404, detail="Jeden nebo oba produkty nebyly nalezeny")
    return result

@router.post("/recommend", response_model=List[Product])
def get_recommendations(
    requirements: RecommendationRequest,
    db: Session = Depends(get_db)
):
    return ai_service.get_recommendations(
        db,
        category=requirements.category,
        budget=requirements.budget,
        features=requirements.features
    )

@router.get("/products/search", response_model=List[Product])
@cache_response(prefix="product_search", ttl=300)  # Cache na 5 minut
def search_products(
    query: str,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    sort_by: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Vyhledá produkty podle textu s možností filtrování a řazení.
    
    - query: Hledaný text v názvu nebo popisu produktu
    - category: Filtrování podle kategorie
    - min_price: Minimální cena
    - max_price: Maximální cena
    - min_rating: Minimální hodnocení
    - sort_by: Řazení podle (price_asc, price_desc, rating_desc)
    - skip: Počet přeskočených výsledků (pro stránkování)
    - limit: Maximální počet vrácených výsledků
    """
    return product_service.search_products(
        db,
        query=query,
        category=category,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        sort_by=sort_by,
        skip=skip,
        limit=limit
    )

# Analytické endpointy
@router.get("/analytics/product/{product_id}", response_model=ProductAnalytics)
@cache_response(prefix="product_analytics", ttl=300)  # Cache na 5 minut
def get_product_analytics(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá analytická data pro konkrétní produkt.
    Vyžaduje přihlášeného uživatele.
    """
    stats = analytics_service.get_product_stats(db, product_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Produkt nenalezen")
    return stats

@router.get("/analytics/category/{category}", response_model=CategoryAnalytics)
@cache_response(prefix="category_analytics", ttl=600)  # Cache na 10 minut
def get_category_analytics(
    category: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá analytická data pro kategorii produktů.
    Vyžaduje přihlášeného uživatele.
    """
    return analytics_service.get_category_stats(db, category)

@router.get("/analytics/global", response_model=GlobalAnalytics)
@cache_response(prefix="global_analytics", ttl=1800)  # Cache na 30 minut
def get_global_analytics(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá globální analytická data platformy.
    Vyžaduje přihlášeného uživatele.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Pouze administrátoři mají přístup ke globálním statistikám"
        )
    return analytics_service.get_global_stats(db)

# Affiliate endpointy
@router.post("/products/{product_id}/affiliate-links", response_model=AffiliateLink)
def create_affiliate_link(
    product_id: str,
    link: AffiliateLinkCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Vytvoří nový affiliate odkaz pro produkt.
    Vyžaduje administrátorská práva.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Pouze administrátoři mohou vytvářet affiliate odkazy")
    
    result = affiliate_service.create_affiliate_link(
        db,
        product_id=product_id,
        original_url=link.original_url,
        affiliate_url=link.affiliate_url,
        provider=link.provider,
        commission_rate=link.commission_rate
    )
    if not result:
        raise HTTPException(status_code=404, detail="Produkt nenalezen")
    return result

@router.get("/affiliate-links", response_model=List[AffiliateLink])
@cache_response(prefix="affiliate_links", ttl=300)  # Cache na 5 minut
def get_affiliate_links(
    product_id: Optional[str] = None,
    provider: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá seznam affiliate odkazů s možností filtrování.
    Vyžaduje administrátorská práva.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Pouze administrátoři mají přístup k affiliate odkazům")
    
    return affiliate_service.get_affiliate_links(
        db,
        product_id=product_id,
        provider=provider,
        skip=skip,
        limit=limit
    )

@router.put("/affiliate-links/{link_id}", response_model=AffiliateLink)
def update_affiliate_link(
    link_id: int,
    affiliate_url: Optional[str] = None,
    commission_rate: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Aktualizuje existující affiliate odkaz.
    Vyžaduje administrátorská práva.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Pouze administrátoři mohou upravovat affiliate odkazy")
    
    result = affiliate_service.update_affiliate_link(
        db,
        link_id=link_id,
        affiliate_url=affiliate_url,
        commission_rate=commission_rate
    )
    if not result:
        raise HTTPException(status_code=404, detail="Affiliate odkaz nenalezen")
    return result

@router.delete("/affiliate-links/{link_id}")
def delete_affiliate_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Smaže affiliate odkaz.
    Vyžaduje administrátorská práva.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Pouze administrátoři mohou mazat affiliate odkazy")
    
    if not affiliate_service.delete_affiliate_link(db, link_id):
        raise HTTPException(status_code=404, detail="Affiliate odkaz nenalezen")
    return {"message": "Affiliate odkaz byl úspěšně smazán"}

@router.get("/affiliate-links/{link_id}/redirect")
async def affiliate_redirect(
    link_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Přesměruje uživatele na affiliate odkaz a zaznamená kliknutí.
    Veřejný endpoint - nevyžaduje autentizaci.
    """
    redirect_url = affiliate_service.record_click(
        db,
        link_id=link_id,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent", ""),
        referrer=request.headers.get("referer")
    )
    if not redirect_url:
        raise HTTPException(status_code=404, detail="Affiliate odkaz nenalezen")
    
    return RedirectResponse(url=redirect_url)

@router.get("/affiliate-links/stats")
@cache_response(prefix="affiliate_stats", ttl=300)  # Cache na 5 minut
def get_affiliate_stats(
    link_id: Optional[int] = None,
    product_id: Optional[str] = None,
    provider: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá statistiky kliknutí na affiliate odkazy.
    Vyžaduje administrátorská práva.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Pouze administrátoři mají přístup ke statistikám")
    
    return affiliate_service.get_click_stats(
        db,
        link_id=link_id,
        product_id=product_id,
        provider=provider,
        from_date=from_date,
        to_date=to_date
    )

# Preference a notifikace endpointy
@router.get("/users/me/preferences", response_model=UserPreferences)
async def get_user_preferences(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá preference přihlášeného uživatele.
    """
    preferences = preferences_service.get_user_preferences(db, current_user.id)
    if not preferences:
        raise HTTPException(status_code=404, detail="Preference nebyly nalezeny")
    return preferences

@router.put("/users/me/preferences", response_model=UserPreferences)
async def update_user_preferences(
    preferences: UserPreferencesCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Aktualizuje preference přihlášeného uživatele.
    """
    return preferences_service.update_user_preferences(
        db,
        user_id=current_user.id,
        preferred_categories=preferences.preferred_categories,
        price_range=preferences.price_range.dict(),
        preferred_providers=preferences.preferred_providers,
        important_features=preferences.important_features
    )

@router.get("/users/me/notifications", response_model=NotificationList)
@cache_response(prefix="user_notifications", ttl=60)  # Cache na 1 minutu
async def get_user_notifications(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá seznam notifikací přihlášeného uživatele.
    
    - **limit**: Maximální počet notifikací (1-100)
    - **offset**: Počet přeskočených notifikací pro stránkování
    - **unread_only**: Pouze nepřečtené notifikace
    """
    notifications = await notification_service.get_user_notifications(
        db,
        current_user.id,
        limit=limit,
        offset=offset,
        unread_only=unread_only
    )
    
    # Získání celkového počtu a počtu nepřečtených notifikací
    total_count = db.query(NotificationLog).filter(
        NotificationLog.user_id == current_user.id
    ).count()
    
    unread_count = db.query(NotificationLog).filter(
        NotificationLog.user_id == current_user.id,
        NotificationLog.read == False
    ).count()
    
    return NotificationList(
        total=total_count,
        unread_count=unread_count,
        notifications=notifications
    )

@router.put("/users/me/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """Označí notifikaci jako přečtenou."""
    success = await notification_service.mark_notification_as_read(
        db,
        notification_id,
        current_user.id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Notifikace nenalezena")
    return {"message": "Notifikace byla označena jako přečtená"}

@router.put("/users/me/notifications/read-all")
async def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """Označí všechny notifikace jako přečtené."""
    count = await notification_service.mark_all_notifications_as_read(db, current_user.id)
    return {"message": f"Označeno {count} notifikací jako přečtené"}

@router.delete("/users/me/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """Smaže notifikaci."""
    success = await notification_service.delete_notification(
        db,
        notification_id,
        current_user.id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Notifikace nenalezena")
    return {"message": "Notifikace byla smazána"}

@router.get("/users/me/recommendations", response_model=List[PersonalizedRecommendation])
@cache_response(prefix="personalized_recommendations", ttl=300)  # Cache na 5 minut
async def get_personalized_recommendations(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá personalizovaná doporučení produktů na základě preferencí uživatele.
    """
    return preferences_service.get_personalized_recommendations(
        db,
        user_id=current_user.id,
        limit=limit
    )

@router.get("/products/{product_id}/price-history", response_model=PriceHistory)
async def get_price_history(
    product_id: str,
    days: Optional[int] = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    Získá historii cen produktu za zadané období.
    
    - **product_id**: ID produktu
    - **days**: Počet dní historie (1-365, výchozí 30)
    """
    try:
        return await price_history_service.get_price_history(db, product_id, days)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products/{product_id}/price-statistics", response_model=PriceStatistics)
async def get_price_statistics(
    product_id: str,
    db: Session = Depends(get_db)
):
    """
    Získá statistiky cen produktu.
    
    - **product_id**: ID produktu
    """
    try:
        return await price_history_service.get_price_statistics(db, product_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products/{product_id}/price-prediction", response_model=PricePrediction)
async def get_price_prediction(
    product_id: str,
    days_ahead: Optional[int] = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    Získá predikci ceny produktu.
    
    - **product_id**: ID produktu
    - **days_ahead**: Počet dní do budoucnosti pro predikci (1-365, výchozí 30)
    """
    try:
        # Získáme produkt
        product = product_service.get_product(db, product_id)
        if not product:
            raise ValueError("Produkt nenalezen")

        # Získáme predikci
        predicted_price, confidence = await price_prediction_service.predict_price(
            db, product_id, days_ahead
        )
        
        if predicted_price is None:
            raise ValueError("Nedostatek dat pro predikci")

        # Určíme trend
        current_price = float(product.price)
        price_diff = predicted_price - current_price
        price_diff_percent = (price_diff / current_price) * 100

        if abs(price_diff_percent) < 1:
            trend = "stable"
        else:
            trend = "rising" if price_diff > 0 else "falling"

        # Vypočítáme sílu trendu
        trend_strength = min(1.0, abs(price_diff_percent) / 10)  # Max síla při 10% změně

        # Zjistíme sezónnost
        history = await price_history_service.get_price_history(db, product_id)
        seasonality_detected = len(history.history) >= 14  # Potřebujeme alespoň 2 týdny dat

        return PricePrediction(
            product_id=product_id,
            product_title=product.title,
            current_price=current_price,
            predicted_price=predicted_price,
            prediction_date=datetime.utcnow() + timedelta(days=days_ahead),
            confidence=confidence,
            trend=trend,
            trend_strength=trend_strength,
            seasonality_detected=seasonality_detected
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products/{product_id}/extended-statistics", response_model=ExtendedPriceStatistics)
async def get_extended_price_statistics(
    product_id: str,
    db: Session = Depends(get_db)
):
    """
    Získá rozšířené statistiky cen produktu včetně predikcí.
    
    - **product_id**: ID produktu
    """
    try:
        # Získáme základní statistiky
        base_stats = await price_history_service.get_price_statistics(db, product_id)
        
        # Získáme predikce pro různá období
        prediction_30d = await get_price_prediction(product_id, 30, db)
        prediction_90d = await get_price_prediction(product_id, 90, db)

        # Vypočítáme volatilitu
        history = await price_history_service.get_price_history(db, product_id)
        if history.history:
            prices = [float(h.price) for h in history.history]
            price_volatility = float(np.std(prices) / np.mean(prices))
        else:
            price_volatility = 0.0

        # Určíme nejlepší čas pro nákup
        best_time_to_buy = None
        if prediction_30d and prediction_30d.trend == "falling":
            best_time_to_buy = prediction_30d.prediction_date
        elif prediction_90d and prediction_90d.trend == "falling":
            best_time_to_buy = prediction_90d.prediction_date

        return ExtendedPriceStatistics(
            **base_stats.dict(),
            prediction_30d=prediction_30d,
            prediction_90d=prediction_90d,
            best_time_to_buy=best_time_to_buy,
            price_volatility=price_volatility
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpointy pro uživatelské seznamy
@router.post("/users/me/lists", response_model=UserList)
async def create_user_list(
    list_data: UserListCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Vytvoří nový seznam pro přihlášeného uživatele.
    """
    return await user_list_service.create_list(db, current_user.id, list_data)

@router.get("/users/me/lists", response_model=List[UserList])
async def get_user_lists(
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá všechny seznamy přihlášeného uživatele.
    Volitelně lze filtrovat podle typu seznamu.
    """
    return await user_list_service.get_user_lists(db, current_user.id, type)

@router.get("/users/me/lists/{list_id}", response_model=UserListResponse)
async def get_user_list(
    list_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá konkrétní seznam včetně detailů produktů.
    """
    list_data = await user_list_service.get_list_with_products(db, list_id, current_user.id)
    if not list_data:
        raise HTTPException(status_code=404, detail="Seznam nenalezen")
    return list_data

@router.put("/users/me/lists/{list_id}", response_model=UserList)
async def update_user_list(
    list_id: str,
    list_data: UserListUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Aktualizuje seznam.
    """
    updated_list = await user_list_service.update_list(
        db, list_id, current_user.id, list_data
    )
    if not updated_list:
        raise HTTPException(status_code=404, detail="Seznam nenalezen")
    return updated_list

@router.delete("/users/me/lists/{list_id}")
async def delete_user_list(
    list_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Smaže seznam.
    """
    if not await user_list_service.delete_list(db, list_id, current_user.id):
        raise HTTPException(status_code=404, detail="Seznam nenalezen")
    return {"message": "Seznam byl úspěšně smazán"}

@router.post("/users/me/lists/{list_id}/products/{product_id}", response_model=UserList)
async def add_product_to_list(
    list_id: str,
    product_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Přidá produkt do seznamu.
    """
    updated_list = await user_list_service.add_to_list(
        db, list_id, current_user.id, product_id
    )
    if not updated_list:
        raise HTTPException(status_code=404, detail="Seznam nenalezen")
    return updated_list

@router.delete("/users/me/lists/{list_id}/products/{product_id}", response_model=UserList)
async def remove_product_from_list(
    list_id: str,
    product_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Odebere produkt ze seznamu.
    """
    updated_list = await user_list_service.remove_from_list(
        db, list_id, current_user.id, product_id
    )
    if not updated_list:
        raise HTTPException(status_code=404, detail="Seznam nenalezen")
    return updated_list

@router.post("/users/me/history/{product_id}")
async def add_to_history(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Přidá produkt do historie prohlížení.
    """
    await user_list_service.add_to_history(db, current_user.id, product_id)
    return {"message": "Produkt byl přidán do historie"}

# Vyhledávací endpointy
@router.post("/search", response_model=SearchResponse)
@cache_response(prefix="search_results", ttl=300)  # Cache na 5 minut
async def search_products(
    filters: SearchFilters,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Pokročilé vyhledávání produktů s filtrováním a řazením.
    
    Parametry:
    - query: Text pro vyhledávání v názvu a popisu
    - category: Filtrování podle kategorie
    - min_price/max_price: Cenové rozmezí
    - min_rating: Minimální hodnocení
    - providers: Seznam poskytovatelů
    - features: Seznam požadovaných vlastností
    - sort_by: Řazení podle (price, rating, reviews, date)
    - sort_order: Směr řazení (asc, desc)
    """
    return await search_service.search_products(
        db=db,
        query=filters.query,
        category=filters.category,
        min_price=filters.min_price,
        max_price=filters.max_price,
        min_rating=filters.min_rating,
        providers=filters.providers,
        features=filters.features,
        sort_by=filters.sort_by,
        sort_order=filters.sort_order,
        skip=skip,
        limit=limit
    )

@router.get("/search/suggestions", response_model=List[SearchSuggestion])
@cache_response(prefix="search_suggestions", ttl=300)  # Cache na 5 minut
async def get_search_suggestions(
    query: str = Query(..., min_length=2),
    limit: int = Query(5, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """
    Získá návrhy pro automatické doplňování vyhledávání.
    
    Parametry:
    - query: Text pro vyhledávání (min. 2 znaky)
    - limit: Maximální počet návrhů (1-10)
    """
    suggestions = await search_service.get_search_suggestions(db, query, limit)
    return [
        SearchSuggestion(
            text=sugg,
            type="product" if " " in sugg else "category",
            relevance=1.0 - (i * 0.1)  # Jednoduchý výpočet relevance
        )
        for i, sugg in enumerate(suggestions)
    ]

@router.get("/search/popular", response_model=List[PopularSearch])
@cache_response(prefix="popular_searches", ttl=3600)  # Cache na 1 hodinu
async def get_popular_searches(
    days: int = Query(7, ge=1, le=30),
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """
    Získá nejpopulárnější vyhledávací dotazy.
    
    Parametry:
    - days: Počet dní zpětně (1-30)
    - limit: Maximální počet výsledků (1-20)
    """
    return await search_service.get_popular_searches(db, days, limit)

# Endpointy pro analytiku vyhledávání
@router.get("/analytics/search", response_model=SearchAnalytics)
@cache_response(prefix="search_analytics", ttl=300)  # Cache na 5 minut
async def get_search_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá komplexní analytiku vyhledávání.
    Vyžaduje administrátorská práva.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Pouze administrátoři mají přístup k analytice vyhledávání"
        )

    # Získáme všechny potřebné statistiky
    popular = await search_analytics_service.get_popular_searches(db, days)
    trends = await search_analytics_service.get_search_trends(db, days)
    insights = await search_analytics_service.get_category_insights(db, days)
    failed = await search_analytics_service.get_zero_results_searches(db, days)

    # Vypočítáme celkové statistiky
    total_searches = sum(trend["searches"] for trend in trends)
    total_conversions = sum(trend["conversions"] for trend in trends)
    avg_results = sum(trend["avg_results"] * trend["searches"] for trend in trends) / total_searches if total_searches > 0 else 0

    return SearchAnalytics(
        total_searches=total_searches,
        unique_users=len(set(search.user_id for search in db.query(SearchLog.user_id).all())),
        avg_results_per_search=avg_results,
        overall_conversion_rate=(total_conversions / total_searches * 100) if total_searches > 0 else 0,
        popular_searches=popular,
        trends=trends,
        category_insights=insights,
        failed_searches=failed
    )

@router.get("/analytics/search/trends", response_model=List[SearchTrend])
@cache_response(prefix="search_trends", ttl=300)  # Cache na 5 minut
async def get_search_trends(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá trendy ve vyhledávání po dnech.
    Vyžaduje administrátorská práva.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Pouze administrátoři mají přístup k trendům vyhledávání"
        )
    return await search_analytics_service.get_search_trends(db, days)

@router.get("/analytics/search/categories", response_model=List[CategoryInsight])
@cache_response(prefix="category_insights", ttl=300)  # Cache na 5 minut
async def get_category_insights(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá přehledy vyhledávání podle kategorií.
    Vyžaduje administrátorská práva.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Pouze administrátoři mají přístup k přehledům kategorií"
        )
    return await search_analytics_service.get_category_insights(db, days)

@router.get("/analytics/search/failed", response_model=List[FailedSearch])
@cache_response(prefix="failed_searches", ttl=300)  # Cache na 5 minut
async def get_failed_searches(
    days: int = Query(7, ge=1, le=30),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá seznam vyhledávacích dotazů, které nevrátily žádné výsledky.
    Vyžaduje administrátorská práva.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Pouze administrátoři mají přístup k seznamu neúspěšných vyhledávání"
        )
    return await search_analytics_service.get_zero_results_searches(db, days, limit)

@router.get("/users/me/search-history", response_model=UserSearchHistory)
async def get_user_search_history(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(auth_service.get_current_user)
):
    """
    Získá historii vyhledávání přihlášeného uživatele.
    """
    searches = await search_analytics_service.get_user_search_history(db, current_user.id, limit)
    
    # Získáme oblíbené kategorie (ty, ve kterých uživatel nejvíce vyhledával)
    categories = {}
    successful_queries = {}
    
    for search in searches:
        if search["category"]:
            categories[search["category"]] = categories.get(search["category"], 0) + 1
        if search["conversion"]:
            successful_queries[search["query"]] = successful_queries.get(search["query"], 0) + 1
    
    favorite_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:5]
    most_successful = sorted(successful_queries.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return UserSearchHistory(
        user_id=current_user.id,
        total_searches=len(searches),
        searches=searches,
        favorite_categories=[cat for cat, _ in favorite_categories],
        most_successful_queries=[query for query, _ in most_successful]
    )