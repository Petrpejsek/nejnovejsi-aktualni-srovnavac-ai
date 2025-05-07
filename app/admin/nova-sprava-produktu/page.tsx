'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Zjednodušený typ produktu odpovídající novému formátu z API
interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  imageUrl?: string | null
  tags?: string[]
  externalUrl?: string | null
  hasTrial?: boolean
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasMore: boolean
}

export default function NovaSpravaProduktu() {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Načtení první stránky produktů
  useEffect(() => {
    loadProducts(1, true)
  }, [])

  // Funkce pro načtení produktů z API
  const loadProducts = async (page: number, resetProducts: boolean = false) => {
    try {
      if (resetProducts) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)

      // Použijeme zjednodušený admin API endpoint s paginací
      const response = await fetch(`/api/admin-products?page=${page}&limit=30`)
      
      if (!response.ok) {
        throw new Error(`API vrátila chybu: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data && data.products && Array.isArray(data.products) && data.pagination) {
        if (resetProducts) {
          setProducts(data.products)
        } else {
          setProducts(prev => [...prev, ...data.products])
        }
        
        setPagination(data.pagination)
        setCurrentPage(page)
        
        console.log(`Načteno ${data.products.length} produktů (stránka ${page} z ${data.pagination.totalPages})`)
      } else {
        setError('Neplatná odpověď z API')
      }
    } catch (err) {
      setError(`Chyba při načítání produktů: ${err instanceof Error ? err.message : 'Neznámá chyba'}`)
      console.error(err)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  // Funkce pro načtení další stránky
  const handleLoadMore = () => {
    if (pagination && pagination.hasMore) {
      loadProducts(currentPage + 1)
    }
  }

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
            onClick={() => loadProducts(1, true)}
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    )
  }

  // UI pro zobrazení produktů
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nová správa produktů</h1>
        <Link href="/admin" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Zpět
        </Link>
      </div>
      
      <div className="mb-4 flex justify-between items-center">
        <p>
          Zobrazeno produktů: {products.length} 
          {pagination && ` z celkových ${pagination.totalCount}`}
        </p>
        <p className="text-gray-500 text-sm">
          Stránka {currentPage} z {pagination?.totalPages || 1}
        </p>
      </div>
      
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
      
      {/* Tlačítko pro načtení dalších produktů */}
      {pagination && pagination.hasMore && (
        <div className="mt-8 text-center">
          <button
            className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 disabled:opacity-50"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <span className="inline-block mr-2 animate-spin">⟳</span>
                Načítání...
              </>
            ) : (
              `Načíst další produkty (${pagination.page}/${pagination.totalPages})`
            )}
          </button>
        </div>
      )}
    </div>
  )
} 