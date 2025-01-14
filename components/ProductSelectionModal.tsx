'use client'

import { useState } from 'react'
import Modal from './Modal'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  price: string
  features: string[]
  rating: number
  category: string
  imageUrl: string
}

interface ProductSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (product: Product) => void
  availableProducts: Product[]
  selectedProducts: Product[]
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  onSelect,
  availableProducts,
  selectedProducts,
}: ProductSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Získat unikátní kategorie
  const categories = ['all', ...new Set(availableProducts.map((p) => p.category))]

  // Filtrovat produkty podle vyhledávání a kategorie
  const filteredProducts = availableProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory
    const isNotSelected = !selectedProducts.find((p) => p.id === product.id)
    return matchesSearch && matchesCategory && isNotSelected
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vyberte produkt k porovnání">
      <div className="space-y-6">
        {/* Vyhledávání */}
        <div className="relative">
          <input
            type="text"
            placeholder="Vyhledat produkt..."
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

        {/* Filtry kategorií */}
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

        {/* Seznam produktů */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                onSelect(product)
                onClose()
              }}
              className="w-full flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-500 transition-colors"
            >
              <div className="relative w-16 h-16 mr-4">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.category}</p>
              </div>
              <div className="text-purple-600 font-medium">{product.price}</div>
            </button>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Žádné produkty nebyly nalezeny
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
} 