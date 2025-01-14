'use client'

import React, { useState, useMemo } from 'react'
import { useCompareStore } from '../../store/compareStore'
import Link from 'next/link'

// Pomocné funkce
const getProductCategory = (productId: string): AICategory => {
  if (productId === '1' || productId === '4' || productId === '8') return 'text'
  if (productId === '2' || productId === '3' || productId === '5') return 'image'
  if (productId === '6') return 'code'
  if (productId === '7') return 'audio'
  return 'other'
}

const getFeatureSupport = (productId: string, featureId: string): boolean => {
  return Math.random() > 0.3 // Pro demonstraci náhodně generujeme podporu
}

// Typy a rozhraní
interface Feature {
  id: string
  name: string
  description: string
  category: 'basic' | 'advanced' | 'enterprise'
}

type AICategory = 'text' | 'image' | 'code' | 'audio' | 'other'

interface CategoryInfo {
  id: AICategory
  name: string
  description: string
  icon: React.ReactNode
}

// Konstanty
const AI_CATEGORIES: CategoryInfo[] = [
  {
    id: 'text',
    name: 'Textová AI',
    description: 'Chatboti, zpracování textu a jazykové modely',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    )
  },
  {
    id: 'image',
    name: 'Obrazová AI',
    description: 'Generování a úprava obrázků',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    )
  },
  {
    id: 'code',
    name: 'Programování',
    description: 'Asistence s kódem a vývojem',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    )
  },
  {
    id: 'audio',
    name: 'Audio AI',
    description: 'Zpracování zvuku a řeči',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    )
  },
  {
    id: 'other',
    name: 'Ostatní',
    description: 'Další typy AI řešení',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    )
  }
]

const FEATURES: Feature[] = [
  { id: 'ownership', name: 'Vlastnictví obsahu', description: 'Plné vlastnictví vytvořeného obsahu', category: 'basic' },
  { id: 'gamification', name: 'Gamifikace', description: 'Herní prvky pro větší zapojení uživatelů', category: 'advanced' },
  { id: 'revenue', name: 'Generování příjmů', description: 'Možnosti monetizace obsahu', category: 'basic' },
  { id: 'scheduling', name: 'Plánování', description: 'Pokročilé nástroje pro plánování', category: 'advanced' },
  { id: 'live-events', name: 'Live události', description: 'Podpora živých událostí a streamování', category: 'enterprise' },
  { id: 'community', name: 'Komunitní funkce', description: 'Nástroje pro budování komunity', category: 'advanced' },
  { id: 'course-builder', name: 'Tvorba kurzů', description: 'Nástroje pro vytváření vzdělávacího obsahu', category: 'basic' },
  { id: 'pricing', name: 'Nastavení cen', description: 'Flexibilní cenové modely', category: 'basic' },
  { id: 'chat', name: 'Chat a zprávy', description: 'Komunikační nástroje', category: 'basic' },
  { id: 'video', name: 'Video konference', description: 'Integrované video hovory', category: 'enterprise' },
  { id: 'meal', name: 'Plánování jídel', description: 'Nástroje pro plánování stravy', category: 'advanced' },
  { id: 'blog', name: 'Blog systém', description: 'Integrovaný blog a CMS', category: 'basic' }
]

// Hlavní komponenta
export default function ComparisonPage() {
  const { selectedProducts } = useCompareStore()
  const [showFeatureDescriptions, setShowFeatureDescriptions] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<AICategory>('text')
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  // Filtrování produktů podle aktivní kategorie
  const filteredProducts = useMemo(() => {
    return selectedProducts.filter(product => getProductCategory(product.id) === activeCategory)
  }, [selectedProducts, activeCategory])

  // Filtrování a řazení funkcí
  const filteredFeatures = useMemo(() => {
    let features = [...FEATURES]
    if (!showAllFeatures) {
      features = features.filter(feature => {
        const supportCount = filteredProducts.filter(product => 
          getFeatureSupport(product.id, feature.id)
        ).length
        return supportCount > 0
      })
    }
    return features.sort((a, b) => {
      const aSupport = filteredProducts.filter(p => getFeatureSupport(p.id, a.id)).length
      const bSupport = filteredProducts.filter(p => getFeatureSupport(p.id, b.id)).length
      return bSupport - aSupport
    })
  }, [filteredProducts, showAllFeatures])

  const toggleFeatureDescription = (featureId: string) => {
    const newDescriptions = new Set(showFeatureDescriptions)
    if (newDescriptions.has(featureId)) {
      newDescriptions.delete(featureId)
    } else {
      newDescriptions.add(featureId)
    }
    setShowFeatureDescriptions(newDescriptions)
  }

  if (selectedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8 p-6 bg-white rounded-[20px] shadow-sm border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-purple-50 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                Žádné produkty k porovnání
              </h1>
              <p className="text-gray-600 mb-8">
                Vraťte se na hlavní stránku a vyberte produkty, které chcete porovnat.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2 text-white rounded-[14px] text-sm font-medium transition-all bg-gradient-primary hover:opacity-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Zpět na hlavní stránku
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-8">
      {/* Hlavička */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            Detailní srovnání AI řešení
        </h1>
          <p className="text-gray-600">
            Přehledné srovnání všech funkcí a vlastností vybraných řešení. Porovnejte si nástroje podle kategorií a najděte to nejlepší pro vaše potřeby.
        </p>
      </div>

        {/* Kategorie */}
      <div className="mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            {AI_CATEGORIES.map((category) => {
              const count = selectedProducts.filter(p => getProductCategory(p.id) === category.id).length
              if (count === 0) return null
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`group flex items-center gap-3 px-5 py-3 rounded-[16px] transition-all ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md hover:shadow-lg'
                      : 'border-2 border-purple-100 bg-white hover:border-purple-200 hover:shadow-sm text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <div className={`transition-colors ${
                    activeCategory === category.id ? 'text-white' : 'text-purple-400 group-hover:text-purple-500'
                  }`}>
                    {category.icon}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className={`text-xs ${
                      activeCategory === category.id ? 'text-white/90' : 'text-gray-500'
                    }`}>
                      {count} {count === 1 ? 'produkt' : count < 5 ? 'produkty' : 'produktů'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
      </div>

        {filteredProducts.length > 0 ? (
          <>
            {/* Ovládací prvky srovnání */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-gray-800">
                Srovnání funkcí
              </h2>
            </div>

            {/* Srovnávací tabulka */}
            <div className="space-y-4 mb-12">
              <button
                onClick={() => {
                  // TODO: Implementovat logiku pro přidání dalších AI řešení do tabulky
                }}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium ml-auto block"
              >
                + Přidat do srovnání podobná AI řešení
              </button>
              
              <div className="bg-white rounded-[20px] border border-gray-300 shadow-lg overflow-hidden">
                {/* Wrapper pro horizontální scrollování */}
                <div className="overflow-x-auto">
                  <div className="min-w-[800px] relative"> {/* Minimální šířka pro zajištění scrollování */}
                    {/* Hlavička tabulky s produkty */}
                    <div className="grid grid-cols-[250px_repeat(auto-fill,minmax(200px,1fr))] sticky top-0 z-10">
                      <div className="p-4 md:p-6 bg-white sticky left-0 border-r border-gray-300">
                        <h3 className="font-medium text-gray-800">Funkce</h3>
                      </div>
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="p-4 md:p-6 border-l border-r border-gray-300 bg-white">
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-lg font-medium text-gray-800">{product.title}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    className={`w-4 h-4 ${
                                      i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                  >
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-medium text-purple-600">{product.price}</span>
                              {Math.random() > 0.8 && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-purple-50 text-purple-600 rounded-full">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                    <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                  </svg>
                                  Exkluzivně
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {product.description}
                            </p>
                            <a
                              href={product.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium rounded-[14px] hover:opacity-90 transition-opacity w-full justify-center group"
                            >
                              Vyzkoušet
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tělo tabulky */}
                    {filteredFeatures.map((feature, index) => (
                      <div 
                        key={feature.id}
                        className={`grid grid-cols-[250px_repeat(auto-fill,minmax(200px,1fr))] ${
                          index !== filteredFeatures.length - 1 ? 'border-b border-gray-300' : ''
                        } hover:bg-gray-50/50 transition-colors group`}
                      >
                        <div 
                          className="p-4 md:p-6 flex flex-col gap-2 cursor-help bg-white sticky left-0"
                          onClick={() => toggleFeatureDescription(feature.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{feature.name}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                          </div>
                          {showFeatureDescriptions.has(feature.id) && (
                            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                          )}
                          <div className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${
                            feature.category === 'basic'
                              ? 'bg-blue-50 text-blue-600'
                              : feature.category === 'advanced'
                              ? 'bg-purple-50 text-purple-600'
                              : 'bg-orange-50 text-orange-600'
                          }`}>
                            {feature.category === 'basic' ? 'Základní'
                              : feature.category === 'advanced' ? 'Pokročilé'
                              : 'Enterprise'}
                          </div>
                        </div>
                        {filteredProducts.map((product) => {
                          const isSupported = getFeatureSupport(product.id, feature.id)
                          return (
                            <div 
                              key={product.id} 
                              className={`p-4 md:p-6 border-l border-r border-gray-300 flex items-center justify-center ${
                                isSupported ? 'bg-green-100/30' : 'bg-red-100/30'
                              }`}
                            >
                              {isSupported ? (
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
                                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
                                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pomocný text */}
            <div className="bg-white rounded-[20px] border border-gray-100 p-8 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Hledáte konkrétní funkce?</h3>
                    <p className="text-gray-600">
                      Popište, jaké funkce od AI řešení potřebujete a my vám doporučíme ta nejvhodnější.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Např.: Generování obrázků z textu, editace fotografií..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-600"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
                    Najít řešení
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 bg-purple-50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              V této kategorii nejsou žádné produkty
            </h2>
            <p className="text-gray-600">
              Vyberte jinou kategorii nebo se vraťte na hlavní stránku a přidejte další produkty k porovnání.
            </p>
          </div>
        )}
          </div>
        </div>
  )
} 