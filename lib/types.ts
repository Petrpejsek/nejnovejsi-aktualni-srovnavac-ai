/**
 * Typy pro doporučovací systém
 */

// Základní produkt
export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  externalUrl?: string;
  tags?: string[];
  advantages?: string[];
  disadvantages?: string[];
  hasTrial?: boolean;
  detailInfo?: string;
  pricingInfo?: {
    basic?: string;
    pro?: string;
    enterprise?: string;
  };
  videoUrls?: string[];
  embedding?: number[];
  similarity?: number; // Pro výsledky vyhledávání
}

// Doporučení od AI
export interface Recommendation {
  id: string;
  matchPercentage: number;
  recommendation: string;
  product: Product;
}

// Odpověď z API
export interface ApiResponse {
  recommendations: Recommendation[];
  error?: string;
  message?: string;
}

// Formát odpovědi od OpenAI (zjednodušený)
export interface OpenAIRecommendation {
  id: string;
  matchPercentage: number;
  recommendation: string;
  name?: string; // Občas AI vrací i jméno
}

// Pro práci s vektorovými daty
export interface VectorData {
  vector: number[];
  documentId: string;
  metadata?: {
    name: string;
    category?: string;
    [key: string]: any;
  };
} 