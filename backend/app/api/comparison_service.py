from sqlalchemy.orm import Session
from app.models import schemas
from app.api import product_service
from typing import Optional, List, Dict

def compare_products(db: Session, product1_id: str, product2_id: str) -> Optional[schemas.ComparisonResult]:
    # Získání produktů
    product1 = product_service.get_product(db, product1_id)
    product2 = product_service.get_product(db, product2_id)
    
    if not product1 or not product2:
        return None
    
    # Vytvoření bodů pro porovnání
    comparison_points = [
        {
            "category": "Základní informace",
            "points": [
                {
                    "title": "Cena",
                    "product1Value": product1.price,
                    "product2Value": product2.price
                },
                {
                    "title": "Hodnocení",
                    "product1Value": f"{product1.rating:.1f}/5.0",
                    "product2Value": f"{product2.rating:.1f}/5.0"
                }
            ]
        },
        {
            "category": "Funkce",
            "points": [
                {
                    "title": "Kategorie",
                    "product1Value": ", ".join(product1.tags),
                    "product2Value": ", ".join(product2.tags)
                }
            ]
        }
    ]
    
    # Generování doporučení
    recommendation = _generate_recommendation(product1, product2)
    
    return schemas.ComparisonResult(
        product1=product1,
        product2=product2,
        comparisonPoints=comparison_points,
        recommendation=recommendation
    )

def _generate_recommendation(product1: schemas.AIProduct, product2: schemas.AIProduct) -> str:
    # Jednoduchá logika pro generování doporučení
    if product1.rating > product2.rating:
        return f"Doporučujeme {product1.title} díky lepšímu hodnocení uživatelů."
    elif product2.rating > product1.rating:
        return f"Doporučujeme {product2.title} díky lepšímu hodnocení uživatelů."
    else:
        return "Oba produkty jsou srovnatelné, vyberte si podle vašich specifických potřeb."

def get_recommendations(
    db: Session,
    category: Optional[str] = None,
    budget: Optional[float] = None,
    features: Optional[List[str]] = None
) -> List[schemas.AIProduct]:
    # Získání všech produktů s případným filtrováním podle kategorie
    products = product_service.get_products(db, category=category)
    
    if not products:
        return []
    
    # Ohodnocení produktů podle požadavků
    scored_products = []
    for product in products:
        score = _calculate_recommendation_score(product, budget, features)
        scored_products.append((product, score))
    
    # Seřazení produktů podle skóre
    scored_products.sort(key=lambda x: x[1], reverse=True)
    
    # Vrácení pouze produktů (bez skóre)
    return [product for product, _ in scored_products[:5]]

def _calculate_recommendation_score(
    product: schemas.AIProduct,
    budget: Optional[float] = None,
    features: Optional[List[str]] = None
) -> float:
    score = product.rating * 2  # Základní skóre podle hodnocení
    
    # Kontrola rozpočtu
    if budget:
        try:
            # Extrahování čísla z ceny (předpokládá formát "Od $X/měsíc")
            price_str = product.price.split("$")[1].split("/")[0]
            price = float(price_str)
            if price <= budget:
                score += 2
            elif price <= budget * 1.2:  # Tolerance 20%
                score += 1
        except:
            pass
    
    # Kontrola požadovaných funkcí
    if features:
        matching_features = set(features) & set(product.tags)
        score += len(matching_features)
    
    return score 