from typing import Dict, List, Optional, Tuple
import re
from ..models.schemas import RecommendationRequest

class NLPService:
    def __init__(self):
        # Klíčová slova pro kategorie
        self.category_keywords = {
            'text': ['text', 'psaní', 'copywriting', 'článk', 'obsah', 'blog'],
            'image': ['obraz', 'foto', 'obrázk', 'design', 'grafik'],
            'video': ['video', 'film', 'animac', 'střih'],
            'audio': ['zvuk', 'hudb', 'audio', 'podcast'],
            'code': ['kód', 'program', 'vývoj', 'web', 'aplikac'],
            'data': ['data', 'analýz', 'excel', 'tabulk'],
            'marketing': ['marketing', 'reklam', 'propagac', 'kampaň'],
            'assistant': ['asistent', 'pomocník', 'chat', 'konverzac'],
        }

        # Klíčová slova pro funkce
        self.feature_keywords = {
            'export': ['export', 'stažení', 'výstup'],
            'collaboration': ['spolupráce', 'tým', 'sdílení'],
            'api': ['api', 'integrace', 'propojení'],
            'templates': ['šablon', 'předloh', 'vzor'],
            'customization': ['přizpůsobení', 'nastavení', 'vlastní'],
            'automation': ['automatizace', 'automatické', 'robot'],
        }

        # Klíčová slova pro rozpočet
        self.budget_patterns = [
            (r'do (\d+)\s*(?:kč|korun)', lambda x: float(x)),
            (r'max[.imálně]* (\d+)\s*(?:kč|korun)', lambda x: float(x)),
            (r'rozpočet (\d+)\s*(?:kč|korun)', lambda x: float(x)),
            (r'(\d+)\s*(?:kč|korun)', lambda x: float(x))
        ]

    def analyze_query(self, query: str) -> RecommendationRequest:
        """Analyzuje dotaz v přirozeném jazyce a vytvoří strukturovaný požadavek."""
        # Převod na malá písmena pro jednodušší zpracování
        query = query.lower()
        
        # Získání kategorie
        category = self._extract_category(query)
        
        # Získání rozpočtu
        budget = self._extract_budget(query)
        
        # Získání požadovaných funkcí
        features = self._extract_features(query)
        
        return RecommendationRequest(
            category=category,
            budget=budget,
            features=features
        )

    def _extract_category(self, query: str) -> Optional[str]:
        """Extrahuje kategorii z dotazu."""
        max_matches = 0
        best_category = None

        for category, keywords in self.category_keywords.items():
            matches = sum(1 for keyword in keywords if keyword in query)
            if matches > max_matches:
                max_matches = matches
                best_category = category

        return best_category if max_matches > 0 else None

    def _extract_budget(self, query: str) -> Optional[float]:
        """Extrahuje rozpočet z dotazu."""
        for pattern, converter in self.budget_patterns:
            match = re.search(pattern, query)
            if match:
                try:
                    return converter(match.group(1))
                except ValueError:
                    continue
        return None

    def _extract_features(self, query: str) -> List[str]:
        """Extrahuje požadované funkce z dotazu."""
        features = []
        for feature, keywords in self.feature_keywords.items():
            if any(keyword in query for keyword in keywords):
                features.append(feature)
        return features

nlp_service = NLPService() 