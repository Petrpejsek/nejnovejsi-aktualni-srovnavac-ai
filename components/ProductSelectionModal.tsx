'use client'

import React, { useState, useEffect } from 'react'
import { useCompareStore } from '../store/compareStore'
import Modal from './Modal'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  imageUrl?: string
  tags?: string[]
  externalUrl?: string
  hasTrial?: boolean
}

interface ProductSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (product: Product) => void
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  onSelect
}: ProductSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          setAvailableProducts(data.products || [])
        }
      } catch (error) {
        console.error('Chyba při načítání produktů:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchProducts()
    }
  }, [isOpen])

  // Získat unikátní kategorie
  const categories = ['all', ...availableProducts
    .map(p => p.category)
    .filter((value, index, self) => self.indexOf(value) === index)]

  // Filtrovat produkty podle vyhledávání a kategorie
  const filteredProducts = availableProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Product to Compare">
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <svg
            className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Product list */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No products found
            </div>
          ) : (
            filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  onSelect(product)
                  onClose()
                }}
                className="w-full flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-500 transition-colors"
              >
                <div className="relative w-16 h-16 mr-4">
                  {product.imageUrl && (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.description}</p>
                </div>
                <div className="text-purple-600 font-medium">{product.price}</div>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
} 