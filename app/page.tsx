'use client'
import React, { useEffect } from 'react'
import AiAdvisor from '../components/AiAdvisor'
import ProductGridWrapper from '../components/ProductGridWrapper'
import ReelsCarousel from '../components/ReelsCarousel'
import TopListsSection from '../components/TopListsSection'
import NewsletterSignup from '../components/NewsletterSignup'
import AiCoursesCarousel from '../components/AiCoursesCarousel'

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

export default function Home() {
  // Globální optimistické funkce pro hlavní stránku
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Optimistická funkce pro saved products na hlavní stránce
      window.addToSavedProducts = (product) => {
        console.log('🎯 Optimistic (Home): Product will be saved:', product.name)
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
      
      // Optimistická funkce pro click history na hlavní stránce  
      window.addToClickHistory = (product) => {
        console.log('🎯 Optimistic (Home): Click will be tracked:', product.name)
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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <AiAdvisor />
        <div className="mt-2">
          <ProductGridWrapper />
        </div>
        <div className="mt-2">
          <ReelsCarousel />
        </div>
        <div className="mt-2">
          <TopListsSection />
        </div>
        <div className="mt-2">
          <AiCoursesCarousel />
        </div>
        <div className="mt-2">
          <NewsletterSignup />
        </div>
      </div>
    </main>
  )
} 