'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  CheckIcon,
  PlusIcon,
  TrophyIcon,
  Cog6ToothIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { FIXED_CATEGORIES, isValidCategorySlug } from '@/lib/categories'

interface NewTopListCategory {
  title: string
  description: string
  category: string
  products: string[] // Array of product IDs
  status: 'published' | 'draft'
}

export default function NewTopListCategory() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  
  const [category, setCategory] = useState<NewTopListCategory>({
    title: '',
    description: '',
    category: '',
    products: [],
    status: 'draft'
  })

  const handleInputChange = (field: keyof NewTopListCategory, value: any) => {
    setCategory({ ...category, [field]: value })
    
    // Pokud se mění kategorie, automaticky nastav název podle výběru
    if (field === 'category' && value) {
      const selectedCategory = FIXED_CATEGORIES.find(cat => cat.slug === value)
      if (selectedCategory && !category.title) {
        setCategory(prev => ({ ...prev, [field]: value, title: `TOP 20 ${selectedCategory.name}` }))
        return
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    // Validation
    if (!category.title || !category.description || !category.category) {
      alert('Please fill in all required fields (title, description and category)')
      setSaving(false)
      return
    }

    // Verify that category is from allowed list
    if (!isValidCategorySlug(category.category)) {
      alert('Category must be selected from the predefined 20 categories')
      setSaving(false)
      return
    }

    if (category.products.length !== 20) {
      alert('TOP 20 list must contain exactly 20 tools')
      setSaving(false)
      return
    }
    
    try {
      const response = await fetch('/api/top-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(category)
      })

      if (response.ok) {
        console.log('Successfully created new category')
        router.push('/admin/top-lists')
      } else {
        const error = await response.json()
        alert(`Chyba při vytváření kategorie: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Chyba při vytváření kategorie')
    } finally {
    setSaving(false)
    }
  }

  const addProduct = (productId: string) => {
    if (category.products.length >= 20) {
      alert('TOP 20 list může obsahovat maximálně 20 nástrojů')
      return
    }
    
    if (category.products.includes(productId)) {
      alert('Tento nástroj je již v seznamu')
      return
    }

    setCategory({
      ...category,
      products: [...category.products, productId]
    })
  }

  const removeProduct = (productId: string) => {
    setCategory({
      ...category,
      products: category.products.filter(id => id !== productId)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/top-lists"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Zpět na přehled
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrophyIcon className="w-8 h-8 text-purple-600" />
              Nová TOP 20 kategorie
            </h1>
            <p className="text-gray-600 mt-1">
              Vytvořte novou kategorii s TOP 20 AI nástroji
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
      <div className="space-y-6">
            {/* Basic Info */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Základní informace</h3>
                
              <div className="grid grid-cols-1 gap-6">
                  <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Název kategorie *
                    </label>
                    <input
                      type="text"
                    id="title"
                      value={category.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="např. AI Video Editing Tools"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    />
                  </div>

                  <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Kategorie *
                    </label>
                  <select
                    id="category"
                    value={category.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Vyberte kategorii...</option>
                    {FIXED_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Použije se v URL: /top-lists/{category.category || 'kategorie'}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    💡 Pouze z těchto 20 pevně stanovených kategorií je možné vytvořit TOP 20 list
                  </p>
                  </div>

                  <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Popis kategorie *
                    </label>
                    <textarea
                    id="description"
                    value={category.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Stručný popis kategorie pro uživatele..."
                    rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    />
                </div>
                
                  <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                    </label>
                    <select
                    id="status"
                    value={category.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'published' | 'draft')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                    <option value="draft">Koncept</option>
                    <option value="published">Publikováno</option>
                    </select>
                </div>
              </div>
            </div>

            {/* Products Selection */}
                  <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Výběr nástrojů ({category.products.length}/20)
              </h3>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Důležité:</strong> TOP 20 list musí obsahovat přesně 20 nástrojů. 
                  Aktuálně máte vybráno {category.products.length} nástrojů.
                    </p>
                  </div>

              {category.products.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Vybrané nástroje:</h4>
                  <div className="space-y-2">
                    {category.products.map((productId, index) => (
                      <div key={productId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">#{index + 1} - {productId}</span>
                        <button
                          onClick={() => removeProduct(productId)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Odebrat
                        </button>
                  </div>
                    ))}
            </div>
          </div>
        )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Pro výběr nástrojů do TOP 20 listu budete přesměrováni do editačního rozhraní po vytvoření kategorie.
                </p>
                <p className="text-xs text-gray-500">
                  Tip: Nejprve vytvořte kategorii s základními informacemi, pak přidejte nástroje v editaci.
                </p>
              </div>
                  </div>
                </div>
              </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <Link
            href="/admin/top-lists"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Zrušit
          </Link>
          
          <button
            onClick={handleSave}
            disabled={saving || !category.title || !category.description || !category.category}
            className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Ukládám...
              </>
            ) : (
              <>
                <CheckIcon className="w-5 h-5 mr-2" />
                Vytvořit kategorii
              </>
            )}
          </button>
          </div>
      </div>
    </div>
  )
} 