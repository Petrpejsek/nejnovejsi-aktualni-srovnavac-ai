'use client'

import React, { useState, useEffect } from 'react'
import ProductGrid from './ProductGrid'

// Rozšíření Window interface pro globální funkce
declare global {
  interface Window {
    addToSavedProducts?: (product: {
      id: string
      name: string
      category?: string
      imageUrl?: string
      price?: number
      tags?: string[]
      externalUrl?: string
      description?: string
    }) => void;
    addToClickHistory?: (product: {
      id: string
      name: string
      category?: string
      imageUrl?: string
      price?: number
      externalUrl?: string
    }) => void;
  }
}

export default function ProductGridWrapper({ initialProducts }: { initialProducts?: any[] }) {
  // Globální optimistické funkce pro stránky s ProductCards
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Optimistická funkce pro saved products - ZJEDNODUŠENÁ
      window.addToSavedProducts = (product) => {
        console.log('🎯 Optimistic (Grid): Product will be saved:', product.name)
        // Už se nepoužívá temp cache - vše se řeší přímo v user-area
        // Tato funkce existuje pouze pro konzistenci s historií
      }
      
      // Optimistická funkce pro click history  
      window.addToClickHistory = (product) => {
        console.log('🎯 Optimistic (Grid): Click will be tracked:', product.name)
        // Uložíme do localStorage cache pro quick access
        const cacheKey = 'tempClickHistory'
        try {
          const existing = JSON.parse(localStorage.getItem(cacheKey) || '[]')
          const clickItem = {
            id: `temp-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            category: product.category || null,
            imageUrl: product.imageUrl || null,
            price: product.price || null,
            externalUrl: product.externalUrl || null,
            clickedAt: new Date().toISOString()
          }
          const updated = [clickItem, ...existing]
          localStorage.setItem(cacheKey, JSON.stringify(updated))
          console.log('💾 Click saved to temp cache for My Account history')
        } catch (error) {
          console.error('Cache error:', error)
        }
      }
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.addToSavedProducts
        delete window.addToClickHistory
      }
    }
  }, [])

  return <ProductGrid initialProducts={initialProducts as any} initialTotalProducts={initialProducts?.length || 0} />
} 