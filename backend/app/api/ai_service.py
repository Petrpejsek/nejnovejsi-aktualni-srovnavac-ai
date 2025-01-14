from sqlalchemy.orm import Session
from ..models.database_models import Product
from ..models.schemas import ComparisonResult, ComparisonPoint
from typing import List, Optional, Dict
import re

class AIService:
    def get_product(self, db: Session, product_id: str) -> Optional[Product]:
        """Získá produkt podle ID."""
        return db.query(Product).filter(Product.id == product_id).first()

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

    def _compare_price(self, product1: Product, product2: Product) -> ComparisonPoint:
        """Porovná ceny produktů."""
        price1, currency1 = self._parse_price(product1.price)
        price2, currency2 = self._parse_price(product2.price)
        
        # Pokud jsou různé měny, převedeme vše na CZK (zjednodušený převod)
        conversion_rates = {
            "czk": 1.0,
            "eur": 25.0,  # přibližný kurz
            "usd": 23.0   # přibližný kurz
        }
        
        price1_czk = price1 * conversion_rates[currency1]
        price2_czk = price2 * conversion_rates[currency2]
        
        # Určení vítěze (nižší cena vyhrává)
        winner = None
        if price1_czk < price2_czk and price1_czk > 0:
            winner = product1.title
        elif price2_czk < price1_czk and price2_czk > 0:
            winner = product2.title
            
        # Formátování cen pro zobrazení
        price1_display = f"{price1} {currency1.upper()}" if price1 > 0 else "Cena není uvedena"
        price2_display = f"{price2} {currency2.upper()}" if price2 > 0 else "Cena není uvedena"
        
        explanation = f"Ceny jsou uvedeny za produkt/službu. "
        if currency1 != currency2 and price1 > 0 and price2 > 0:
            explanation += f"Pro srovnání: {price1_czk:.2f} CZK vs {price2_czk:.2f} CZK"
        
        return ComparisonPoint(
            aspect="Cena",
            product1_value=price1_display,
            product2_value=price2_display,
            winner=winner,
            explanation=explanation
        )

    def compare_products(self, db: Session, product1_id: str, product2_id: str) -> Optional[ComparisonResult]:
        """Porovná dva produkty a vytvoří doporučení."""
        product1 = self.get_product(db, product1_id)
        product2 = self.get_product(db, product2_id)

        if not product1 or not product2:
            return None

        comparison_points = [
            self._compare_price(product1, product2),
            self._compare_rating(product1, product2),
            self._compare_features(product1, product2),
            self._compare_pros_cons(product1, product2)
        ]

        recommendation, explanation = self._generate_recommendation(product1, product2, comparison_points)

        return ComparisonResult(
            product1=product1,
            product2=product2,
            comparison_points=comparison_points,
            recommendation=recommendation,
            explanation=explanation
        )

    def _compare_rating(self, product1: Product, product2: Product) -> ComparisonPoint:
        """Porovná hodnocení produktů."""
        winner = None
        if product1.rating > product2.rating:
            winner = product1.title
        elif product2.rating > product1.rating:
            winner = product2.title

        return ComparisonPoint(
            aspect="Hodnocení",
            product1_value=f"{product1.rating:.1f}/5.0",
            product2_value=f"{product2.rating:.1f}/5.0",
            winner=winner,
            explanation="Hodnocení je průměrem uživatelských recenzí."
        )

    def _compare_features(self, product1: Product, product2: Product) -> ComparisonPoint:
        """Porovná funkce produktů."""
        common_features = set(product1.features) & set(product2.features)
        unique_features1 = set(product1.features) - set(product2.features)
        unique_features2 = set(product2.features) - set(product1.features)

        explanation = f"Společné funkce: {', '.join(common_features)}\n"
        if unique_features1:
            explanation += f"Unikátní pro {product1.title}: {', '.join(unique_features1)}\n"
        if unique_features2:
            explanation += f"Unikátní pro {product2.title}: {', '.join(unique_features2)}"

        return ComparisonPoint(
            aspect="Funkce",
            product1_value=", ".join(product1.features),
            product2_value=", ".join(product2.features),
            winner=None,  # Funkce jsou subjektivní, nezvolíme vítěze
            explanation=explanation
        )

    def _compare_pros_cons(self, product1: Product, product2: Product) -> ComparisonPoint:
        """Porovná výhody a nevýhody produktů."""
        explanation = f"{product1.title}:\n"
        explanation += f"+ {', '.join(product1.pros)}\n"
        explanation += f"- {', '.join(product1.cons)}\n\n"
        explanation += f"{product2.title}:\n"
        explanation += f"+ {', '.join(product2.pros)}\n"
        explanation += f"- {', '.join(product2.cons)}"

        return ComparisonPoint(
            aspect="Výhody a nevýhody",
            product1_value=f"Výhody: {', '.join(product1.pros)}\nNevýhody: {', '.join(product1.cons)}",
            product2_value=f"Výhody: {', '.join(product2.pros)}\nNevýhody: {', '.join(product2.cons)}",
            winner=None,  # Výhody a nevýhody jsou subjektivní, nezvolíme vítěze
            explanation=explanation
        )

    def _generate_recommendation(self, product1: Product, product2: Product, comparison_points: List[ComparisonPoint]) -> tuple[str, str]:
        """Vygeneruje doporučení na základě porovnání."""
        # Počítání skóre pro každý produkt
        score1 = 0
        score2 = 0

        for point in comparison_points:
            if point.winner == product1.title:
                score1 += 1
            elif point.winner == product2.title:
                score2 += 1

        # Generování doporučení
        if score1 > score2:
            recommendation = product1.title
            explanation = f"Doporučujeme {product1.title} díky lepšímu hodnocení v {score1} kategoriích."
        elif score2 > score1:
            recommendation = product2.title
            explanation = f"Doporučujeme {product2.title} díky lepšímu hodnocení v {score2} kategoriích."
        else:
            recommendation = "Oba produkty"
            explanation = "Oba produkty jsou srovnatelné, výběr závisí na vašich konkrétních potřebách."

        return recommendation, explanation

    def get_recommendations(self, db: Session, category: Optional[str], budget: Optional[float], features: List[str]) -> List[Product]:
        """Získá doporučené produkty na základě požadavků."""
        # Získání všech produktů v dané kategorii
        query = db.query(Product)
        if category:
            query = query.filter(Product.category == category)

        products = query.all()
        if not products:
            return []

        # Ohodnocení produktů podle požadavků
        scored_products = []
        for product in products:
            score = self._calculate_product_score(product, budget, features)
            details = {
                'price_match': self._get_price_match_description(product, budget),
                'matching_features': list(set(features) & set(product.features)),
                'rating': f"{product.rating:.1f}/5.0" if product.rating else "Bez hodnocení",
                'pros_count': len(product.pros),
                'cons_count': len(product.cons)
            }
            scored_products.append((product, score, details))

        # Seřazení produktů podle skóre
        scored_products.sort(key=lambda x: x[1], reverse=True)

        # Vrácení nejlépe hodnocených produktů s vysvětlením
        return [
            {
                'product': product,
                'score': score,
                'explanation': self._generate_recommendation_explanation(details)
            }
            for product, score, details in scored_products[:5]
        ]

    def _get_price_match_description(self, product: Product, budget: Optional[float]) -> str:
        """Vytvoří popis shody s rozpočtem."""
        if not budget:
            return "Rozpočet nebyl specifikován"
            
        price, currency = self._parse_price(product.price)
        if price == 0:
            return "Cena není uvedena"
            
        if price <= budget:
            return f"V rámci rozpočtu ({price} {currency.upper()} <= {budget} {currency.upper()})"
        else:
            return f"Nad rozpočtem o {price - budget} {currency.upper()}"

    def _generate_recommendation_explanation(self, details: Dict) -> str:
        """Vytvoří vysvětlení doporučení."""
        explanation = []
        
        # Přidání informace o ceně
        explanation.append(details['price_match'])
        
        # Přidání informace o shodujících se funkcích
        if details['matching_features']:
            explanation.append(f"Obsahuje požadované funkce: {', '.join(details['matching_features'])}")
        
        # Přidání informace o hodnocení
        explanation.append(f"Hodnocení: {details['rating']}")
        
        # Přidání informace o výhodách a nevýhodách
        explanation.append(f"Počet výhod: {details['pros_count']}, Počet nevýhod: {details['cons_count']}")
        
        return " | ".join(explanation)

    def _calculate_product_score(self, product: Product, budget: Optional[float], features: List[str]) -> float:
        """Vypočítá skóre produktu na základě požadavků."""
        weights = {
            'price': 0.3,
            'features': 0.3,
            'rating': 0.2,
            'pros_cons': 0.2
        }
        
        score = 0.0
        
        # Hodnocení podle ceny
        price_score = 0.0
        if budget:
            price, _ = self._parse_price(product.price)
            if price > 0:
                if price <= budget:
                    price_score = 1.0
                else:
                    price_score = max(0, 1 - (price - budget) / budget)
        score += weights['price'] * price_score

        # Hodnocení podle funkcí
        features_score = 0.0
        if features:
            matching_features = set(features) & set(product.features)
            features_score = len(matching_features) / len(features)
        score += weights['features'] * features_score

        # Hodnocení podle ratingu
        rating_score = product.rating / 5.0 if product.rating else 0.0
        score += weights['rating'] * rating_score

        # Hodnocení podle poměru výhod a nevýhod
        pros_cons_score = 0.0
        total_points = len(product.pros) + len(product.cons)
        if total_points > 0:
            pros_cons_score = len(product.pros) / total_points
        score += weights['pros_cons'] * pros_cons_score

        return score

ai_service = AIService()
