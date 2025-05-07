'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasMore: boolean
}

export default function SimpleProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null) 
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts(1, true)
  }, [])

  const fetchProducts = async (page: number = 1, resetList: boolean = false) => {
    try {
      if (resetList) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)
      console.log(`SimpleAdmin: Načítám produkty, stránka ${page}...`)
      
      // Použijeme parametr page a limit pro paginaci
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/products?page=${page}&pageSize=30&t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.products && Array.isArray(data.products) && data.pagination) {
          // Přidáme produkty buď jako nový seznam nebo na konec existujícího
          if (resetList) {
            setProducts(data.products)
          } else {
            setProducts(prev => [...prev, ...data.products])
          }
          
          // Nastavíme informace o stránkování
          setPagination(data.pagination)
          setCurrentPage(page)
          console.log(`SimpleAdmin: Načteno ${data.products.length} produktů (stránka ${page})`)
        } else {
          setError('Neplatná odpověď z API')
        }
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
    } catch (error) {
      console.error('SimpleAdmin: Error:', error)
      setError(`Chyba: ${error instanceof Error ? error.message : 'Neznámá chyba'}`)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Funkce pro načtení další stránky
  const handleLoadMore = () => {
    if (pagination && currentPage < pagination.totalPages) {
      fetchProducts(currentPage + 1, false)
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Jednoduchá správa produktů</h1>
        <div>Načítání...</div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Jednoduchá správa produktů</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={() => fetchProducts(1, true)}
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
        <h1 className="text-2xl font-bold">Jednoduchá správa produktů</h1>
        <div className="space-x-2">
          <Link 
            href="/admin"
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            Zpět do administrace
          </Link>
          <button
            onClick={() => fetchProducts(1, true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
          >
            Obnovit data
          </button>
        </div>
      </div>
      
      <div className="mb-4 flex justify-between items-center">
        <p>
          Zobrazeno: {products.length} produktů
          {pagination && ` z celkových ${pagination.totalCount}`}
        </p>
        {pagination && (
          <p className="text-sm text-gray-500">
            Stránka {currentPage} z {pagination.totalPages}
          </p>
        )}
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
      
      {/* Tlačítko pro načtení dalších produktů */}
      {pagination && currentPage < pagination.totalPages && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Načítání...
              </>
            ) : (
              `Načíst další produkty (${currentPage}/${pagination.totalPages})`
            )}
          </button>
        </div>
      )}
      
      {/* Pro ladění - výpis JSON s produkty */}
      {error && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Debug - JSON data</h2>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(products, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 