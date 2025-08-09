'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  CheckIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

interface TopListCategory {
  id: string
  title: string
  description: string
  detailedDescription: string
  toolsCount: number
  trending: boolean
  popular: boolean
  badge: string
  lastUpdated: string
  status: 'published' | 'draft' | 'archived'
  position: number
  clickCount: number
  conversionRate: number
  color: string
  gradient: string
  icon: string
  seoTitle?: string
  seoDescription?: string
  tools: Tool[]
}

interface Tool {
  id: string
  name: string
  description: string
  website: string
  pricing: string
  rating: number
  reviews: number
  position: number
  category: string
  tags: string[]
  logo?: string
}

export default function EditTopListCategory() {
  const params = useParams() || ({} as Record<string, string>)
  const router = useRouter()
  const categoryId = (params as any)?.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [category, setCategory] = useState<TopListCategory | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)

  // Load real data from API
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/top-lists/${categoryId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch category')
        }
        
        const data = await response.json()
        
        // Convert API data to component format
        const categoryData: TopListCategory = {
          id: data.id,
          title: data.title,
          description: data.description,
          detailedDescription: data.description,
          toolsCount: data.products?.length || 0,
          trending: false,
          popular: data.status === 'published',
          badge: data.status === 'published' ? 'LIVE' : 'DRAFT',
          lastUpdated: new Date(data.updatedAt).toISOString().split('T')[0],
          status: data.status,
          position: 1,
          clickCount: data.clicks || 0,
          conversionRate: data.conversion || 0,
          color: 'from-purple-500 to-blue-500',
          gradient: 'bg-gradient-to-br from-purple-50 to-blue-50',
          icon: 'trophy',
          seoTitle: `TOP 20 ${data.title} | Best Tools 2025`,
          seoDescription: data.description,
          tools: data.products?.slice(0, 20).map((productId: string, index: number) => ({
            id: productId,
            name: `Tool ${index + 1}`,
            description: 'Loading product details...',
            website: '',
            pricing: '',
            rating: 0,
            reviews: 0,
            position: index + 1,
            category: data.category,
            tags: [],
            logo: ''
          })) || []
        }
        
        setCategory(categoryData)

        // Hydrate tools with real product data so admin sees actual products
        const productIds: string[] = Array.isArray(data.products)
          ? (data.products as string[]).slice(0, 20)
          : []

        if (productIds.length > 0) {
          try {
            const detailsResp = await fetch(`/api/products?ids=${productIds.join(',')}`)
            if (detailsResp.ok) {
              const details = await detailsResp.json()
              const map: Map<string, any> = new Map((details as any[]).map((p: any) => [String(p.id), p as any]))
              setCategory(prev => {
                if (!prev) return prev
                const hydrated = prev.tools.map(t => {
                  const d: any = map.get(String(t.id)) as any
                  if (!d) return t
                  return {
                    ...t,
                    name: d.name || t.name,
                    description: d.description || t.description,
                    website: d.externalUrl || d.website || t.website,
                    logo: d.imageUrl || d.logo || t.logo,
                    tags: Array.isArray(d.tags) ? d.tags : t.tags,
                  }
                })
                return { ...prev, tools: hydrated }
              })
            }
          } catch (e) {
            console.warn('Failed to hydrate tool details', e)
          }
        }
      } catch (error) {
        console.error('Error fetching category:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategory()
  }, [categoryId])

  const handleSave = async () => {
    if (!category) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/top-lists/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: category.title,
          description: category.description,
          category: categoryId.replace('top20-', ''), // Remove prefix for category slug
          products: category.tools.map(tool => tool.id),
          status: category.status
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save category')
      }

      console.log('Category saved successfully')
      router.push('/admin/top-lists')
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof TopListCategory, value: any) => {
    if (!category) return
    setCategory({ ...category, [field]: value })
  }

  const handleToolChange = (toolIndex: number, field: keyof Tool, value: any) => {
    if (!category) return
    const updatedTools = [...category.tools]
    updatedTools[toolIndex] = { ...updatedTools[toolIndex], [field]: value }
    setCategory({ ...category, tools: updatedTools })
  }

  const addTool = () => {
    if (!category) return
    const newTool: Tool = {
      id: `new-${Date.now()}`,
      name: '',
      description: '',
      website: '',
      pricing: 'Free',
      rating: 4.0,
      reviews: 0,
      position: category.tools.length + 1,
      category: category.title,
      tags: [],
      logo: ''
    }
    setCategory({ ...category, tools: [...category.tools, newTool] })
  }

  const removeTool = (toolIndex: number) => {
    if (!category) return
    const updatedTools = category.tools.filter((_, index) => index !== toolIndex)
    setCategory({ ...category, tools: updatedTools })
  }

  const moveToolUp = (toolIndex: number) => {
    if (!category || toolIndex === 0) return
    const updatedTools = [...category.tools]
    const temp = updatedTools[toolIndex]
    updatedTools[toolIndex] = updatedTools[toolIndex - 1]
    updatedTools[toolIndex - 1] = temp
    
    // Update positions
    updatedTools[toolIndex].position = toolIndex + 1
    updatedTools[toolIndex - 1].position = toolIndex
    
    setCategory({ ...category, tools: updatedTools })
  }

  const moveToolDown = (toolIndex: number) => {
    if (!category || toolIndex === category.tools.length - 1) return
    const updatedTools = [...category.tools]
    const temp = updatedTools[toolIndex]
    updatedTools[toolIndex] = updatedTools[toolIndex + 1]
    updatedTools[toolIndex + 1] = temp
    
    // Update positions
    updatedTools[toolIndex].position = toolIndex + 1
    updatedTools[toolIndex + 1].position = toolIndex + 2
    
    setCategory({ ...category, tools: updatedTools })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Kategorie nenalezena</h2>
        <Link href="/admin/top-lists" className="mt-4 inline-block text-purple-600 hover:text-purple-800">
          ← Zpět na přehled
        </Link>
      </div>
    )
  }

  const tabs = [
    { id: 'basic', name: 'Základní info', icon: Cog6ToothIcon },
    { id: 'seo', name: 'SEO & Meta', icon: PhotoIcon },
    { id: 'tools', name: 'Nástroje & Řazení', icon: PlusIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/top-lists"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Editace: {category.title}
            </h1>
            <p className="text-gray-600 mt-1">
              Pozice #{category.position} • {category.toolsCount} nástrojů • {category.status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/top-lists/${category.id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <EyeIcon className="w-5 h-5 mr-2" />
            Náhled
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <CheckIcon className="w-5 h-5 mr-2" />
            {saving ? 'Ukládám...' : 'Uložit'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Základní informace</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Název kategorie *
                    </label>
                    <input
                      type="text"
                      value={category.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Krátký popis *
                    </label>
                    <textarea
                      value={category.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailní popis
                    </label>
                    <textarea
                      value={category.detailedDescription}
                      onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vzhled & Design</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge text
                    </label>
                    <input
                      type="text"
                      value={category.badge}
                      onChange={(e) => handleInputChange('badge', e.target.value)}
                      placeholder="HOT, NEW, POPULAR..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gradient barvy
                    </label>
                    <input
                      type="text"
                      value={category.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="from-red-500 to-pink-500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ikona (typ)
                    </label>
                    <select
                      value={category.icon}
                      onChange={(e) => handleInputChange('icon', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="video">Video</option>
                      <option value="social">Social Media</option>
                      <option value="writing">Writing</option>
                      <option value="design">Design</option>
                      <option value="chatbot">Chatbot</option>
                      <option value="automation">Automation</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nastavení publikace</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={category.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="draft">Koncept</option>
                      <option value="published">Publikované</option>
                      <option value="archived">Archivované</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pozice v žebříčku
                    </label>
                    <input
                      type="number"
                      value={category.position}
                      onChange={(e) => handleInputChange('position', parseInt(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={category.trending}
                        onChange={(e) => handleInputChange('trending', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Trending</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={category.popular}
                        onChange={(e) => handleInputChange('popular', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Popular</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiky</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Celkem nástrojů:</span>
                    <span className="text-sm font-medium">{category.tools.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Počet kliků:</span>
                    <span className="text-sm font-medium">{category.clickCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Konverze:</span>
                    <span className="text-sm font-medium">{category.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Poslední aktualizace:</span>
                    <span className="text-sm font-medium">
                      {new Date(category.lastUpdated).toLocaleDateString('cs-CZ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO & Meta informace</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Titulek
                </label>
                <input
                  type="text"
                  value={category.seoTitle || ''}
                  onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                  placeholder="Optimalizovaný titulek pro vyhledávače"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Doporučeno: 50-60 znaků
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta popis
                </label>
                <textarea
                  value={category.seoDescription || ''}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  rows={3}
                  placeholder="Popis kategorie pro vyhledávače"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Doporučeno: 150-160 znaků
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Náhled ve vyhledávání:</h4>
                <div className="space-y-1">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {category.seoTitle || category.title}
                  </div>
                  <div className="text-green-600 text-sm">
                    comparee.ai/top-lists/{category.id}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {category.seoDescription || category.description}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6">
            {/* Add Product Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Přidat produkty do kategorie
                </h3>
                <ProductSelector 
                  onProductAdd={(product) => {
                    const newTool: Tool = {
                      id: product.id,
                      name: product.name,
                      description: product.description,
                      website: product.website,
                      pricing: product.pricing || 'Free',
                      rating: product.rating || 4.0,
                      reviews: product.reviews || 0,
                      position: category.tools.length + 1,
                      category: category.title,
                      tags: product.tags || [],
                      logo: product.logo
                    }
                    setCategory({ ...category, tools: [...category.tools, newTool] })
                  }}
                  excludeIds={category.tools.map(t => t.id)}
                />
              </div>
            </div>

            {/* Tools Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Nástroje v kategorii ({category.tools.length})
                  </h3>
                  <button
                    onClick={addTool}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Vytvořit nový nástroj
                  </button>
                </div>
              </div>

            <div className="divide-y divide-gray-200">
              {category.tools.map((tool, index) => (
                <div key={tool.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm font-medium">
                        #{tool.position}
                      </span>
                      <h4 className="font-medium text-gray-900">
                        {tool.name || 'Nový nástroj'}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveToolUp(index)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Posunout nahoru"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveToolDown(index)}
                        disabled={index === category.tools.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Posunout dolů"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => setReplaceIndex(index)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                        title="Nahradit jiným produktem"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => removeTool(index)}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Odstranit"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Název *
                      </label>
                      <input
                        type="text"
                        value={tool.name}
                        onChange={(e) => handleToolChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website *
                      </label>
                      <input
                        type="url"
                        value={tool.website}
                        onChange={(e) => handleToolChange(index, 'website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cena
                      </label>
                      <select
                        value={tool.pricing}
                        onChange={(e) => handleToolChange(index, 'pricing', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      >
                        <option value="Free">Free</option>
                        <option value="Freemium">Freemium</option>
                        <option value="Paid">Paid</option>
                        <option value="Contact">Contact for pricing</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Popis
                      </label>
                      <textarea
                        value={tool.description}
                        onChange={(e) => handleToolChange(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hodnocení
                      </label>
                      <input
                        type="number"
                        value={tool.rating}
                        onChange={(e) => handleToolChange(index, 'rating', parseFloat(e.target.value))}
                        min="0"
                        max="5"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Počet recenzí
                      </label>
                      <input
                        type="number"
                        value={tool.reviews}
                        onChange={(e) => handleToolChange(index, 'reviews', parseInt(e.target.value))}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  </div>
                  {replaceIndex === index && (
                    <div className="mt-4 border rounded-md p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Nahradit položku #{tool.position}</span>
                        <button
                          type="button"
                          onClick={() => setReplaceIndex(null)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Zavřít
                        </button>
                      </div>
                      <ProductSelector
                        onProductAdd={(product) => {
                          const updated = [...category.tools]
                          updated[index] = {
                            id: product.id,
                            name: product.name,
                            description: product.description,
                            website: product.website,
                            pricing: product.pricing || 'Free',
                            rating: product.rating || 0,
                            reviews: product.reviews || 0,
                            position: index + 1,
                            category: category.title,
                            tags: product.tags || [],
                            logo: product.logo
                          }
                          setCategory({ ...category, tools: updated })
                          setReplaceIndex(null)
                        }}
                        excludeIds={category.tools
                          .map((t, i) => (i === index ? undefined : t.id))
                          .filter((v): v is string => Boolean(v))}
                      />
                    </div>
                  )}
                </div>
              ))}

              {category.tools.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Zatím nebyly přidány žádné nástroje.</p>
                  <button
                    onClick={addTool}
                    className="mt-3 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Přidat první nástroj
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Product Selector Component
interface Product {
  id: string
  name: string
  description: string
  website: string
  pricing?: string
  rating?: number
  reviews?: number
  tags?: string[]
  logo?: string
  category?: string
}

interface ProductSelectorProps {
  onProductAdd: (product: Product) => void
  excludeIds: string[]
}

function ProductSelector({ onProductAdd, excludeIds }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  // Load real products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products')
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        
        // Convert API data to component format
        const productsData: Product[] = data.map((product: any) => ({
          id: product.id,
          name: product.name || product.title,
          description: product.description || '',
          website: product.url || product.website || '',
          pricing: product.pricing || 'Not specified',
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          tags: product.tags || [],
          category: product.category || '',
          logo: product.imageUrl || product.logo || ''
        }))
        
        setProducts(productsData)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const notExcluded = !excludeIds.includes(product.id)
    return matchesSearch && matchesCategory && notExcluded
  })

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vyhledat produkt
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Název nebo popis produktu..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategorie produktu
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="">Všechny kategorie</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredProducts.map(product => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {product.logo ? (
                  <img src={product.logo} alt={product.name} className="w-8 h-8 rounded" />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                    {product.name[0]}
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                  <p className="text-xs text-gray-500">{product.pricing}</p>
                </div>
              </div>
              <button
                onClick={() => onProductAdd(product)}
                className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
              >
                Přidat
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span>⭐ {product.rating}</span>
                <span>({product.reviews} recenzí)</span>
              </div>
              {product.tags && product.tags.length > 0 && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {product.tags[0]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Žádné produkty nenalezeny</p>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
              }}
              className="mt-2 text-purple-600 hover:text-purple-800 text-sm"
            >
              Vymazat filtry
            </button>
          )}
        </div>
      )}
    </div>
  )
} 