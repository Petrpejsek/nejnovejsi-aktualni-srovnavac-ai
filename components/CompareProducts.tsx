'use client'

import { useState } from 'react'
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

interface CompareProductsProps {
  products: Product[]
  onRemoveProduct: (id: string) => void
  onAddProduct: () => void
}

export default function CompareProducts({
  products,
  onRemoveProduct,
  onAddProduct,
}: CompareProductsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Existující produkty */}
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl shadow-lg p-6 relative group hover:shadow-xl transition-all"
        >
          {/* Tlačítko pro odebrání */}
          <button
            onClick={() => onRemoveProduct(product.id)}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Obrázek produktu */}
          <div className="relative w-full h-48 mb-4">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>

          {/* Informace o produktu */}
          <h3 className="font-bold text-xl mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{product.description}</p>
          <p className="text-purple-600 font-semibold">{product.price}</p>

          {/* Hodnocení */}
          <div className="flex items-center mt-4">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i < product.rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      ))}

      {/* Tlačítko pro přidání produktu */}
      <button
        onClick={onAddProduct}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-purple-500 hover:text-purple-500 transition-colors h-full"
      >
        <svg
          className="w-12 h-12 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <span className="font-medium">Přidat produkt</span>
      </button>
    </div>
  )
} 