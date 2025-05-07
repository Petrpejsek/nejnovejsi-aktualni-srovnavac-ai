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

type Pagination = {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasMore: boolean
}

export default function SuperSimpleAdminPage() {
  const [products, setProducts] = useState<SimpleProduct[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Funkce pro načtení produktů
  const loadProducts = async (page: number, resetList: boolean = false) => {
    try {
      if (resetList) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)

      // Použijeme API s paginací
      const response = await fetch(`/api/simple-products?page=${page}&limit=30`)

      if (!response.ok) {
        throw new Error(`API vrátila chybu: ${response.status}`)
      }

      const data = await response.json()

      if (data && data.products && Array.isArray(data.products) && data.pagination) {
        // Aktualizujeme stav podle toho, zda reset nebo přidáváme další
        if (resetList) {
          setProducts(data.products)
        } else {
          setProducts(prev => [...prev, ...data.products])
        }
        setPagination(data.pagination)
        setCurrentPage(page)
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

  // Načtení první stránky při startu
  useEffect(() => {
    loadProducts(1, true)
  }, [])

  // Funkce pro načtení další stránky
  const handleLoadMore = () => {
    if (pagination?.hasMore) {
      loadProducts(currentPage + 1)
    }
  }

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
            onClick={() => loadProducts(1, true)}
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
      
      <div className="mb-4 flex justify-between items-center">
        <p>
          Zobrazeno produktů: {products.length} 
          {pagination && ` z celkových ${pagination.totalCount}`}
        </p>
        {pagination && (
          <p className="text-sm text-gray-500">
            Stránka {pagination.page} z {pagination.totalPages}
          </p>
        )}
      </div>
      
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

      {/* Tlačítko pro načtení dalších produktů */}
      {pagination && pagination.hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoadingMore ? 'Načítání...' : 'Načíst další produkty'}
          </button>
        </div>
      )}
    </div>
  )
} 