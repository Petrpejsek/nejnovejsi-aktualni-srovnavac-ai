'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Robustní definice typů
interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  tags: any[] // Akceptujeme různé formáty
  advantages: any[]
  disadvantages: any[]
  detailInfo: string
  pricingInfo: any // Akceptujeme jakýkoliv formát
  videoUrls: any[]
  externalUrl: string
  hasTrial: boolean
}

// Pomocné funkce pro normalizaci dat
const normalizeString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

const normalizeNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Funkce pro normalizaci produktu
const normalizeProduct = (product: any): Product => {
  if (!product || typeof product !== 'object') {
    // Vrátíme prázdný produkt, pokud vstup není objekt
    return {
      id: '',
      name: 'Nevalidní produkt',
      description: '',
      price: 0,
      category: '',
      tags: [],
      advantages: [],
      disadvantages: [],
      detailInfo: '',
      pricingInfo: { basic: '0', pro: '0', enterprise: '0' },
      videoUrls: [],
      externalUrl: '',
      hasTrial: false
    };
  }

  // Normalizace polí, která jsou v databázi JSON řetězce
  const normalizeJsonField = (field: any, defaultValue: any[] = []): any[] => {
    if (Array.isArray(field)) return field;
    
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    }
    
    return defaultValue;
  };

  // Normalizace pricingInfo
  const normalizePricingInfo = (pricingData: any) => {
    // Výchozí objekt, pokud nelze parsovat
    const defaultPricing = { basic: '0', pro: '0', enterprise: '0' };
    
    if (!pricingData) return defaultPricing;
    
    // Pokud je to už objekt
    if (typeof pricingData === 'object' && pricingData !== null) {
      return {
        basic: normalizeString(pricingData.basic || '0'),
        pro: normalizeString(pricingData.pro || '0'),
        enterprise: normalizeString(pricingData.enterprise || '0')
      };
    }
    
    // Pokud je to string, zkusíme parsovat
    if (typeof pricingData === 'string') {
      try {
        const parsed = JSON.parse(pricingData);
        if (typeof parsed === 'object' && parsed !== null) {
          return {
            basic: normalizeString(parsed.basic || '0'),
            pro: normalizeString(parsed.pro || '0'),
            enterprise: normalizeString(parsed.enterprise || '0')
          };
        }
      } catch (e) {
        console.error('Chyba při parsování pricingInfo:', e);
      }
    }
    
    return defaultPricing;
  };

  // Vytvoření normalizovaného produktu
  return {
    id: normalizeString(product.id),
    name: normalizeString(product.name),
    description: normalizeString(product.description),
    price: normalizeNumber(product.price),
    category: normalizeString(product.category),
    imageUrl: normalizeString(product.imageUrl),
    tags: normalizeJsonField(product.tags),
    advantages: normalizeJsonField(product.advantages),
    disadvantages: normalizeJsonField(product.disadvantages),
    detailInfo: normalizeString(product.detailInfo),
    pricingInfo: normalizePricingInfo(product.pricingInfo),
    videoUrls: normalizeJsonField(product.videoUrls),
    externalUrl: normalizeString(product.externalUrl),
    hasTrial: Boolean(product.hasTrial)
  };
};

// Hlavní funkce pro načtení a zpracování dat
export const loadProductsData = async (): Promise<Product[]> => {
  try {
    const timestamp = new Date().getTime();
    console.log("Admin-DirectFix: Načítám produkty z API...");
    
    // Nastavíme timeout pro fetch operaci
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      const response = await fetch(`/api/products?pageSize=500&t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Chyba API: ${response.status} ${response.statusText}`);
      }
      
      // Načtení a parsování JSON
      const data = await response.json();
      console.log("Admin-DirectFix: Data z API načtena:", data);
      
      // Extrakce a normalizace produktů z odpovědi
      let products: any[] = [];
      
      if (Array.isArray(data)) {
        products = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.products)) {
          products = data.products;
        } else if (Array.isArray(data.data)) {
          products = data.data;
        }
      }
      
      if (products.length === 0) {
        console.warn("Admin-DirectFix: Žádné produkty nenalezeny");
        return [];
      }
      
      // Normalizace všech produktů
      const normalizedProducts = products
        .map(product => {
          try {
            return normalizeProduct(product);
          } catch (error) {
            console.error("Admin-DirectFix: Chyba při normalizaci produktu:", error, product);
            return null;
          }
        })
        .filter(Boolean) as Product[];
      
      console.log("Admin-DirectFix: Normalizováno produktů:", normalizedProducts.length);
      return normalizedProducts;
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if ((fetchError as any).name === 'AbortError') {
        throw new Error('Timeout při načítání dat z API');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Admin-DirectFix: Chyba při načítání produktů:", error);
    throw error;
  }
};

export default loadProductsData; 