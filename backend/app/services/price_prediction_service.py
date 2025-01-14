from sqlalchemy.orm import Session
from ..models.database_models import Product, PriceHistory
from datetime import datetime, timedelta
import numpy as np
from typing import List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class PricePredictionService:
    def __init__(self):
        self.min_history_points = 5  # Minimální počet bodů pro predikci
        self.prediction_days = 30    # Počet dní pro predikci dopředu

    async def predict_price(
        self,
        db: Session,
        product_id: str,
        days_ahead: Optional[int] = None
    ) -> Tuple[float, float]:
        """
        Předpoví cenu produktu za určitý počet dní.
        Vrací tuple (predikovaná_cena, spolehlivost_predikce).
        Spolehlivost je od 0 do 1, kde 1 je nejvyšší spolehlivost.
        """
        if days_ahead is None:
            days_ahead = self.prediction_days

        try:
            # Získáme historii cen
            history = self._get_price_history(db, product_id)
            if len(history) < self.min_history_points:
                return None, 0.0

            # Připravíme data pro analýzu
            prices = [float(h.price) for h in history]
            days = [(h.created_at - history[0].created_at).days for h in history]

            # Analyzujeme trend
            trend = self._analyze_trend(days, prices)
            
            # Analyzujeme sezónnost
            seasonality = self._analyze_seasonality(days, prices)
            
            # Vypočítáme predikci
            prediction = self._calculate_prediction(
                days, prices, trend, seasonality, days_ahead
            )
            
            # Vypočítáme spolehlivost predikce
            confidence = self._calculate_confidence(
                days, prices, prediction, len(history)
            )

            return max(0, prediction), min(1.0, confidence)

        except Exception as e:
            logger.error(f"Chyba při predikci ceny pro produkt {product_id}: {str(e)}")
            return None, 0.0

    def _get_price_history(
        self,
        db: Session,
        product_id: str,
        days: int = 90
    ) -> List[PriceHistory]:
        """Získá historii cen za poslední 3 měsíce."""
        start_date = datetime.utcnow() - timedelta(days=days)
        return db.query(PriceHistory).filter(
            PriceHistory.product_id == product_id,
            PriceHistory.created_at >= start_date
        ).order_by(PriceHistory.created_at.asc()).all()

    def _analyze_trend(
        self,
        days: List[int],
        prices: List[float]
    ) -> Tuple[float, float]:
        """
        Analyzuje cenový trend pomocí lineární regrese.
        Vrací tuple (směrnice, posun).
        """
        x = np.array(days)
        y = np.array(prices)
        A = np.vstack([x, np.ones(len(x))]).T
        slope, intercept = np.linalg.lstsq(A, y, rcond=None)[0]
        return slope, intercept

    def _analyze_seasonality(
        self,
        days: List[int],
        prices: List[float]
    ) -> Optional[float]:
        """
        Analyzuje sezónnost v datech.
        Vrací koeficient sezónnosti (nebo None pokud není detekována).
        """
        if len(prices) < 14:  # Potřebujeme alespoň 2 týdny dat
            return None

        # Detekce týdenního vzoru
        weekly_pattern = []
        for i in range(7):
            day_prices = [p for j, p in enumerate(prices) if days[j] % 7 == i]
            if day_prices:
                weekly_pattern.append(np.mean(day_prices))

        if not weekly_pattern:
            return None

        # Vypočítáme variaci v týdenním vzoru
        variation = np.std(weekly_pattern) / np.mean(weekly_pattern)
        return variation if variation > 0.02 else None  # Ignorujeme malé variace

    def _calculate_prediction(
        self,
        days: List[int],
        prices: List[float],
        trend: Tuple[float, float],
        seasonality: Optional[float],
        days_ahead: int
    ) -> float:
        """
        Vypočítá predikci ceny na základě trendu a sezónnosti.
        """
        slope, intercept = trend
        last_day = days[-1]
        prediction_day = last_day + days_ahead

        # Základní predikce podle trendu
        base_prediction = slope * prediction_day + intercept

        # Přidáme sezónní komponentu
        if seasonality:
            seasonal_factor = 1 + (seasonality * np.sin(2 * np.pi * prediction_day / 7))
            return base_prediction * seasonal_factor
        
        return base_prediction

    def _calculate_confidence(
        self,
        days: List[int],
        prices: List[float],
        prediction: float,
        history_length: int
    ) -> float:
        """
        Vypočítá spolehlivost predikce na základě několika faktorů:
        1. Délka historie
        2. Volatilita cen
        3. Kvalita trendu
        """
        # Faktor délky historie (více dat = vyšší spolehlivost)
        history_factor = min(1.0, history_length / 30)  # Max spolehlivost při 30+ bodech

        # Faktor volatility (nižší volatilita = vyšší spolehlivost)
        price_std = np.std(prices)
        price_mean = np.mean(prices)
        volatility_factor = 1.0 - min(1.0, (price_std / price_mean))

        # Faktor kvality trendu (R²)
        x = np.array(days)
        y = np.array(prices)
        A = np.vstack([x, np.ones(len(x))]).T
        slope, intercept = np.linalg.lstsq(A, y, rcond=None)[0]
        y_pred = slope * x + intercept
        r2 = 1 - np.sum((y - y_pred) ** 2) / np.sum((y - np.mean(y)) ** 2)
        trend_factor = max(0, r2)

        # Kombinace faktorů s různými váhami
        confidence = (
            0.4 * history_factor +
            0.3 * volatility_factor +
            0.3 * trend_factor
        )

        return confidence

price_prediction_service = PricePredictionService() 