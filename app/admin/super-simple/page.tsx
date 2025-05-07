'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

// Žádné složité typy - jen jednoduchý objekt
type SimpleProduct = {
  id: string
  name: string
  price: number
  category: string
}

export default function SuperSimpleAdminPage() {
  const [products, setProducts] = useState<SimpleProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Jednoduchá fetch funkce - téměř identická s tou, která se používá na homepage
  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Použijeme nové super-jednoduché API
        const response = await fetch('/api/simple-products')
        
        if (!response.ok) {
          throw new Error(`API vrátila chybu: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data && data.products && Array.isArray(data.products)) {
          // Jednoduchá konverze - bereme jen data která zobrazujeme
          const simpleProducts = data.products.map((p: any) => ({
            id: p.id || '',
            name: p.name || '',
            price: typeof p.price === 'number' ? p.price : 0,
            category: p.category || ''
          }))
          setProducts(simpleProducts)
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

  // Jednoduchá komponenta pro zobrazení načítání
  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Super jednoduchá správa produktů</h1>
        <p>Načítání produktů...</p>
      </div>
    )
  }

  // Jednoduchá komponenta pro zobrazení chyby
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Super jednoduchá správa produktů</h1>
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

  // Velmi jednoduchý UI pro zobrazení produktů
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Super jednoduchá správa produktů</h1>
        <Link href="/admin" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Zpět
        </Link>
      </div>
      
      <p className="mb-4">Nalezeno produktů: {products.length}</p>
      
      <div className="overflow-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Název</th>
              <th className="px-4 py-2 border">Kategorie</th>
              <th className="px-4 py-2 border">Cena</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-2 text-center border">
                  Žádné produkty nebyly nalezeny
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{product.id}</td>
                  <td className="px-4 py-2 border">{product.name}</td>
                  <td className="px-4 py-2 border">{product.category}</td>
                  <td className="px-4 py-2 border">{product.price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
} 