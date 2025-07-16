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

interface NewTopListCategory {
  title: string
  description: string
  detailedDescription: string
  badge: string
  status: 'published' | 'draft' | 'archived'
  position: number
  trending: boolean
  popular: boolean
  color: string
  gradient: string
  icon: string
  seoTitle: string
  seoDescription: string
}

export default function NewTopListCategory() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  const [category, setCategory] = useState<NewTopListCategory>({
    title: '',
    description: '',
    detailedDescription: '',
    badge: '',
    status: 'draft',
    position: 1,
    trending: false,
    popular: false,
    color: 'from-blue-500 to-purple-500',
    gradient: 'bg-gradient-to-br from-blue-50 to-purple-50',
    icon: 'video',
    seoTitle: '',
    seoDescription: ''
  })

  const handleInputChange = (field: keyof NewTopListCategory, value: any) => {
    setCategory({ ...category, [field]: value })
  }

  const handleSave = async () => {
    setSaving(true)
    
    // Validace
    if (!category.title || !category.description) {
      alert('Vyplňte prosím povinná pole (název a popis)')
      setSaving(false)
      return
    }
    
    // Simulace API volání
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Creating new category:', category)
    setSaving(false)
    
    // Redirect po vytvoření
    router.push('/admin/top-lists')
  }

  const tabs = [
    { id: 'basic', name: 'Základní info', icon: Cog6ToothIcon },
    { id: 'seo', name: 'SEO & Meta', icon: PhotoIcon }
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrophyIcon className="w-8 h-8 text-purple-600" />
              Nová TOP kategorie
            </h1>
            <p className="text-gray-600 mt-1">
              Vytvořte nový žebříček AI nástrojů
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/top-lists"
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Zrušit
          </Link>
          <button
            onClick={handleSave}
            disabled={saving || !category.title || !category.description}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <CheckIcon className="w-5 h-5 mr-2" />
            {saving ? 'Vytvářím...' : 'Vytvořit kategorii'}
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
                      placeholder="např. Video Editing Tools"
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
                      placeholder="Stručný popis kategorie pro karty a náhledy"
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
                      placeholder="Podrobný popis kategorie pro detail stránku"
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
                      placeholder="HOT, NEW, POPULAR, TRENDING..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gradient barvy
                    </label>
                    <select
                      value={category.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="from-red-500 to-pink-500">Červená → Růžová</option>
                      <option value="from-blue-500 to-cyan-500">Modrá → Tyrkysová</option>
                      <option value="from-green-500 to-emerald-500">Zelená → Smaragdová</option>
                      <option value="from-purple-500 to-indigo-500">Fialová → Indigo</option>
                      <option value="from-orange-500 to-red-500">Oranžová → Červená</option>
                      <option value="from-teal-500 to-green-500">Teal → Zelená</option>
                      <option value="from-yellow-400 to-orange-500">Žlutá → Oranžová</option>
                      <option value="from-pink-500 to-purple-500">Růžová → Fialová</option>
                    </select>
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
                      <option value="video">🎬 Video</option>
                      <option value="social">📱 Social Media</option>
                      <option value="writing">✍️ Writing</option>
                      <option value="design">🎨 Design</option>
                      <option value="chatbot">🤖 Chatbot</option>
                      <option value="automation">⚙️ Automation</option>
                      <option value="analytics">📊 Analytics</option>
                      <option value="productivity">⚡ Productivity</option>
                      <option value="marketing">📈 Marketing</option>
                      <option value="audio">🎵 Audio</option>
                    </select>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Náhled karty:</h4>
                    <div className={`p-4 rounded-lg ${category.gradient || 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {category.title || 'Název kategorie'}
                        </h3>
                        {category.badge && (
                          <span className="bg-white/80 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                            {category.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {category.description || 'Popis kategorie se zobrazí zde'}
                      </p>
                    </div>
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
                      <option value="draft">💾 Koncept (neuveřejněné)</option>
                      <option value="published">✅ Publikované (veřejné)</option>
                      <option value="archived">📦 Archivované</option>
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
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Čím nižší číslo, tím vyšší pozice v žebříčku
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={category.trending}
                        onChange={(e) => handleInputChange('trending', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        🔥 Trending (zobrazí fire ikonu)
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={category.popular}
                        onChange={(e) => handleInputChange('popular', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        ⭐ Popular (zobrazí star ikonu)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tip</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• Po vytvoření kategorie budete moci přidat nástroje na edit stránce</p>
                  <p>• Doporučujeme začít s konceptem a publikovat až po přidání nástrojů</p>
                  <p>• SEO optimalizace zvýší viditelnost ve vyhledávačích</p>
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
                  value={category.seoTitle}
                  onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                  placeholder={`${category.title ? `Best ${category.title} 2024 - Complete Guide` : 'Optimalizovaný titulek pro vyhledávače'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Doporučeno: 50-60 znaků • Aktuální: {category.seoTitle.length} znaků
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta popis
                </label>
                <textarea
                  value={category.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  rows={3}
                  placeholder={category.description ? `${category.description} Compare features, pricing, and reviews to find the perfect tool for your needs.` : 'Popis kategorie pro vyhledávače'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Doporučeno: 150-160 znaků • Aktuální: {category.seoDescription.length} znaků
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">📱 Náhled ve vyhledávání:</h4>
                <div className="space-y-1">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {category.seoTitle || category.title || 'Název kategorie'}
                  </div>
                  <div className="text-green-600 text-sm">
                    comparee.ai/top-lists/{category.title ? category.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'kategorie'}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {category.seoDescription || category.description || 'Popis kategorie pro vyhledávače'}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">🎯 SEO Tipy</h4>
                <ul className="space-y-1 text-sm text-yellow-800">
                  <li>• Použijte klíčová slova "AI tools", "best", aktuální rok</li>
                  <li>• Meta popis by měl obsahovat CTA (call-to-action)</li>
                  <li>• Zahrňte kategorii do titulku pro lepší targeting</li>
                  <li>• Udržujte konzistentní terminologii napříč stránkami</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 