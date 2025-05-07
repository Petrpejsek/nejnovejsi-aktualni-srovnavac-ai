'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  pricingInfo?: any // Akceptujeme jakýkoliv formát
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

export default function SimpleProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  // Pokročilá funkce načtení produktů s ošetřením všech možných chyb
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("SimpleAdmin: Loading products from API...")
      
      // Použijeme čas jako query parametr pro vynucení obnovení cache
      const timestamp = new Date().getTime()
      
      // Pokusíme se načíst s delším timeoutem
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 sekund timeout
      
      try {
        const response = await fetch(`/api/products?pageSize=300&t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const rawData = await response.json()
          console.log("SimpleAdmin: Loaded raw data:", rawData)
          
          // Extrahujeme produkty bezpečně
          const rawProducts = Array.isArray(rawData.products) ? rawData.products : 
                            (rawData && typeof rawData === 'object' && Array.isArray(rawData.data)) ? rawData.data : 
                            [];
          
          if (rawProducts.length === 0) {
            console.warn("SimpleAdmin: Received empty products array from API")
            setError("API vrátila prázdné pole produktů. Zkontrolujte připojení k databázi nebo jestli jsou nějaké produkty v databázi.")
            setProducts([])
            return
          }
          
          // Normalizace dat - bezpečné vytvoření produktů
          const normalizedProducts = rawProducts.map((item: any) => {
            // Pokud položka není objekt, přeskočíme ji
            if (!item || typeof item !== 'object') return null;
            
            try {
              // Vytvoříme správnou strukturu produktu s defaultními hodnotami
              return {
                id: normalizeString(item.id),
                name: normalizeString(item.name),
                description: normalizeString(item.description),
                price: normalizeNumber(item.price),
                category: normalizeString(item.category),
                imageUrl: normalizeString(item.imageUrl),
              };
            } catch (itemError) {
              console.error("SimpleAdmin: Error normalizing product:", itemError, item);
              return null;
            }
          }).filter(Boolean) as Product[]; // Odstraníme null hodnoty
          
          console.log("SimpleAdmin: Normalized products:", normalizedProducts.length)
          setProducts(normalizedProducts)
        } else {
          console.error('SimpleAdmin: Error loading products:', response.status, response.statusText)
          setError(`Chyba při načítání produktů: ${response.status} ${response.statusText}`)
          
          try {
            const errorData = await response.json()
            console.error('SimpleAdmin: Error details:', errorData)
            setError(`Chyba při načítání produktů: ${errorData.error || 'Neznámá chyba'}`)
          } catch (e) {
            console.error('SimpleAdmin: Could not parse error response')
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if ((fetchError as any).name === 'AbortError') {
          console.error('SimpleAdmin: Request timeout');
          setError('Požadavek na server trval příliš dlouho. Zkuste to prosím znovu.');
        } else {
          console.error('SimpleAdmin: Fetch error:', fetchError);
          setError(`Chyba při komunikaci se serverem: ${(fetchError as Error).message || 'Neznámý problém'}`);
        }
      }
    } catch (error) {
      console.error('SimpleAdmin: Error:', error)
      setError(`Chyba: ${error instanceof Error ? error.message : 'Neznámá chyba'}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Nouzová správa produktů</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3">Načítání...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Nouzová správa produktů</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Chyba!</p>
          <p>{error}</p>
          <button 
            onClick={fetchProducts}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Nouzová správa produktů</h1>
        <div className="space-x-2">
          <Link 
            href="/admin"
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            Zpět do administrace
          </Link>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
          >
            Obnovit data
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <p>Celkem načteno: {products.length} produktů</p>
        <p className="text-sm text-gray-500 mt-1">
          Toto je nouzové rozhraní, které zobrazuje produkty i když hlavní administrace nefunguje.
        </p>
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
      
      {/* Pro ladění - výpis JSON s produkty */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug - JSON data</h2>
        <pre className="text-xs overflow-auto max-h-96">
          {(() => {
            try {
              return JSON.stringify(products, null, 2)
            } catch (error) {
              return "Chyba při vykreslování JSON dat"
            }
          })()}
        </pre>
      </div>
    </div>
  )
} 