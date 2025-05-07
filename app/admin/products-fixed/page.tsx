'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import loadProductsData from '../products/direct-fix'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  tags: any[]
  advantages: any[]
  disadvantages: any[]
  detailInfo: string
  pricingInfo: any
  videoUrls: any[]
  externalUrl: string
  hasTrial: boolean
}

export default function ProductsFixedAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("ProductsFixed: Načítám produkty...")
      
      // Použijeme helper funkci, která zajistí robustní načtení dat
      const data = await loadProductsData()
      
      console.log(`ProductsFixed: Načteno ${data.length} produktů`)
      setProducts(data)
    } catch (error) {
      console.error('ProductsFixed: Chyba při načítání:', error)
      setError(`Chyba: ${error instanceof Error ? error.message : 'Neznámá chyba'}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Opravená správa produktů</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3">Načítání...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Opravená správa produktů</h1>
          <Link 
            href="/admin"
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            Zpět do administrace
          </Link>
        </div>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Chyba!</p>
          <p>{error}</p>
        </div>
        
        <button 
          onClick={fetchProducts}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
        >
          Zkusit znovu
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Opravená správa produktů</h1>
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
        <p className="text-lg">Celkem načteno: <span className="font-bold">{products.length}</span> produktů</p>
        <p className="text-sm text-green-600">Toto je speciální opravená verze administrace.</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Náhled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Název</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Žádné produkty nebyly nalezeny
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative w-16 h-16">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover rounded-md"
                          onError={(e) => {
                            // Pokud obrázek nelze načíst, nastavíme placeholder
                            e.currentTarget.src = "https://placehold.co/200x200/cccccc/333333?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{product.price} Kč</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      href={`/admin/products/detail/${product.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Zobrazit detail
                    </Link>
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