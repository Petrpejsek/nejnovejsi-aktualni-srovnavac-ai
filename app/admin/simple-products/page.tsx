'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import ErrorDisplay from './ErrorDisplay'

// Extrémně jednoduchá verze stránky bez složitého zpracování
export default function SimpleProductsAdminPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Načítám produkty...')
      
      // Jednoduchý požadavek bez parametrů
      const response = await fetch('/api/products?pageSize=300', {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      })
      
      if (!response.ok) {
        setError(`Chyba serveru: ${response.status} ${response.statusText}`)
        return
      }
      
      let responseText
      try {
        // Získáme odpověď jako text
        responseText = await response.text()
        
        // Ověříme, že odpověď není prázdná
        if (!responseText || responseText.trim() === '') {
          setError('Server vrátil prázdnou odpověď')
          return
        }
        
        console.log('Odpověď serveru:', responseText.substring(0, 100) + '...')
        
        // Zkusíme text parsovat jako JSON
        const data = JSON.parse(responseText)
        
        // Jednoduchá kontrola struktury
        if (!data || !data.products || !Array.isArray(data.products)) {
          setError('Neplatná struktura dat z API')
          return
        }
        
        // Zpracování produktů bez složitého parsování
        const safeProducts = data.products.map((item: any) => ({
          id: item?.id || 'unknown',
          name: item?.name || 'Neznámý produkt',
          description: item?.description || '',
          price: typeof item?.price === 'number' ? item.price : 0,
          category: item?.category || ''
        }))
        
        setProducts(safeProducts)
        console.log(`Načteno ${safeProducts.length} produktů`)
      } catch (parseError) {
        console.error('Chyba při zpracování odpovědi:', parseError, responseText?.substring(0, 500))
        setError(`Chyba při zpracování odpovědi: ${parseError instanceof Error ? parseError.message : 'Neplatná data'}`)
      }
    } catch (error) {
      console.error('Chyba při načítání produktů:', error)
      setError(`Chyba: ${error instanceof Error ? error.message : 'Neznámá chyba'}`)
    } finally {
      setLoading(false)
    }
  }

  // Zjednodušené zobrazení při načítání
  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Produkty</h1>
        <div>Načítání...</div>
      </div>
    )
  }

  // Zjednodušené zobrazení při chybě
  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Produkty</h1>
        <ErrorDisplay 
          error={error} 
          onRetry={loadProducts} 
        />
      </div>
    )
  }

  // Zjednodušené zobrazení tabulky
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Produkty</h1>
        <div className="space-x-2">
          <Link 
            href="/admin"
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            Zpět do administrace
          </Link>
          <button
            onClick={loadProducts}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
          >
            Obnovit
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <p>Zobrazeno: {products.length} produktů</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Název</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Žádné produkty nebyly nalezeny
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {product.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{product.price}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
} 