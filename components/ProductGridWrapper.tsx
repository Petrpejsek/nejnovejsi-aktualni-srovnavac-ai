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

export default function ProductGridWrapper() {
  // Globální optimistické funkce pro stránky s ProductCards
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Optimistická funkce pro saved products
      window.addToSavedProducts = (product) => {
        console.log('🎯 Optimistic (Grid): Product will be saved:', product.name)
        // Uložíme do localStorage cache pro quick access
        const cacheKey = 'tempSavedProducts'
        try {
          const existing = JSON.parse(localStorage.getItem(cacheKey) || '[]')
          const updated = [product, ...existing]
          localStorage.setItem(cacheKey, JSON.stringify(updated))
          console.log('💾 Saved to temp cache for My Account')
        } catch (error) {
          console.error('Cache error:', error)
        }
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

  return <ProductGrid />
} 