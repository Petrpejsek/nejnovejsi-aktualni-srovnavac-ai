'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Základní typy podobné těm na homepage
interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  tags?: string[]
  pricingInfo?: {
    basic?: string
    pro?: string
    enterprise?: string
  }
  externalUrl?: string
  hasTrial?: boolean
}

export default function NovaSpravaProduktu() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Načtení produktů z API podobným způsobem jako na hlavní stránce
  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Použijeme nový admin API endpoint, který je optimalizovaný pro admin sekci
        const response = await fetch('/api/admin-products')
        
        if (!response.ok) {
          throw new Error(`API vrátila chybu: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data && data.products && Array.isArray(data.products)) {
          setProducts(data.products)
        } else {
          setError('Neplatná odpověď z API')
        }
      } catch (err) {
        setError(`Chyba při načítání produktů: ${err instanceof Error ? err.message : 'Neznámá chyba'}`)
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProducts()
  }, [])

  // Komponenta pro zobrazení načítání
  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Nová správa produktů</h1>
        <p>Načítání produktů...</p>
      </div>
    )
  }

  // Komponenta pro zobrazení chyby
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Nová správa produktů</h1>
        <div className="p-4 bg-red-100 text-red-800 rounded">
          <p>Chyba: {error}</p>
          <button 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    )
  }

  // UI pro zobrazení produktů s více detaily
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nová správa produktů</h1>
        <Link href="/admin" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Zpět
        </Link>
      </div>
      
      <p className="mb-4">Nalezeno produktů: {products.length}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full p-4 bg-gray-50 text-center">
            Žádné produkty nebyly nalezeny
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {product.imageUrl && (
                <div className="relative h-40 bg-gray-100">
                  <Image 
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold">{product.price} Kč</span>
                  {product.hasTrial && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Trial</span>
                  )}
                </div>
                
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {product.tags.length > 3 && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        +{product.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 