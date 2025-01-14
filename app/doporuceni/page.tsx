'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import TagFilter from '../../components/TagFilter'
import CompareBar from '../../components/CompareBar'

interface Situation {
  id: string
  title: string
  description: string
  example: string
  imageUrl: string
  price: string
  hasTrial: boolean
  category: string
  rating: number
  pros?: string[]
  cons?: string[]
  detailedDescription?: string
  priceDetails?: string
  videoUrls?: string[]
}

const SITUATIONS: Situation[] = [
  {
    id: '1',
    title: 'Zákaznická podpora pro restauraci',
    description: 'Automatická odpověď na dotazy zákazníků na otevírací dobu, rezervace nebo nabídku jídel.',
    example: 'Odpovídá na 80 % dotazů automaticky',
    imageUrl: '/images/customer-support.svg',
    price: 'Od 15 $ měsíčně',
    hasTrial: true,
    category: 'Chatbot',
    rating: 4.8,
    pros: [
      'Okamžitá dostupnost 24/7',
      'Automatické odpovědi na časté dotazy',
      'Snadná integrace s existujícími systémy'
    ],
    cons: [
      'Omezená schopnost řešit složité problémy',
      'Vyžaduje počáteční nastavení a trénink',
      'Měsíční poplatek za prémiové funkce'
    ],
    detailedDescription: 'Komplexní řešení pro automatizaci zákaznické podpory v restauracích. Systém využívá pokročilé AI pro porozumění přirozenému jazyku a dokáže odpovídat na dotazy týkající se menu, rezervací, otevírací doby a dalších častých témat.',
    priceDetails: 'Základní verze: 15 $ měsíčně\nPro verze: 30 $ měsíčně\nEnterprise: individuální nacenění',
    videoUrls: [
      '/videos/chatbot-demo-1.mp4',
      '/videos/chatbot-demo-2.mp4',
      '/videos/chatbot-demo-3.mp4'
    ]
  },
  {
    id: '2',
    title: 'Generování marketingových textů',
    description: 'Vytváření poutavých textů pro sociální sítě, emaily a webové stránky.',
    example: 'Ušetří 70 % času při tvorbě obsahu',
    imageUrl: '/images/marketing.svg',
    price: 'Od 20 $ měsíčně',
    hasTrial: true,
    category: 'Marketing',
    rating: 4.7
  },
  {
    id: '3',
    title: 'Analýza zákaznických dat',
    description: 'Pokročilá analýza chování zákazníků a identifikace trendů.',
    example: 'Zvýšení konverze o 25 %',
    imageUrl: '/images/analysis.svg',
    price: 'Od 30 $ měsíčně',
    hasTrial: false,
    category: 'Analýza',
    rating: 4.9
  },
  {
    id: '4',
    title: 'Generování produktových obrázků',
    description: 'Tvorba profesionálních produktových fotografií pomocí AI.',
    example: 'Snížení nákladů na fotografování o 60 %',
    imageUrl: '/images/product-images.svg',
    price: 'Od 25 $ měsíčně',
    hasTrial: true,
    category: 'Obrázky',
    rating: 4.6
  },
  {
    id: '5',
    title: 'Automatizace e-mailové komunikace',
    description: 'Inteligentní třídění a odpovídání na e-maily.',
    example: 'Ušetří 2 hodiny denně',
    imageUrl: '/images/email.svg',
    price: 'Od 10 $ měsíčně',
    hasTrial: true,
    category: 'Text',
    rating: 4.8
  }
]

export default function DoporuceniPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('query')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [expandedSituationId, setExpandedSituationId] = useState<string | null>(null)
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (query) {
      // TODO: Implementovat filtrování na základě query
      console.log('Vyhledávací dotaz:', query)
    }
  }, [query])

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  // Filtrování situací podle vybraných tagů
  const filteredSituations = SITUATIONS.filter(situation => {
    if (selectedTags.size === 0) return true
    return selectedTags.has(situation.category)
  })

  const toggleExpand = (id: string) => {
    setExpandedSituationId(expandedSituationId === id ? null : id)
  }

  const handleSave = (id: string) => {
    const newSaved = new Set(savedItems)
    if (newSaved.has(id)) {
      newSaved.delete(id)
    } else {
      newSaved.add(id)
    }
    setSavedItems(newSaved)
  }

  const getPersonalizedHeadline = (query: string | null) => {
    if (!query) return 'Vyberte, kde potřebujete pomoci'

    // Základní klíčová slova a jejich odpovídající personalizované nadpisy
    const keywords = {
      'restaurac': ['Vylepšete svou ', 'restauraci', ' pomocí AI'],
      'jídl': ['Zefektivněte své ', 'stravovací zařízení', ' s AI'],
      'hotel': ['Posuňte svůj ', 'hotel', ' na další úroveň s AI'],
      'obchod': ['Zmodernizujte svůj ', 'obchod', ' pomocí AI'],
      'eshop': ['Zvyšte prodeje svého ', 'e-shopu', ' s AI'],
      'market': ['Vylepšete svůj ', 'marketing', ' pomocí AI'],
      'prodej': ['Zvyšte své ', 'prodeje', ' s pomocí AI'],
      'účetnictví': ['Zjednodušte své ', 'účetnictví', ' pomocí AI'],
      'komunikac': ['Zefektivněte svou ', 'komunikaci', ' s AI'],
      'psaní': ['Vytvářejte lepší ', 'obsah', ' s pomocí AI'],
      'analýz': ['Získejte lepší ', 'přehled o datech', ' s AI'],
      'web': ['Vylepšete svůj ', 'web', ' s pomocí AI'],
      'social': ['Posuňte své ', 'sociální sítě', ' na další úroveň'],
      'výrob': ['Optimalizujte svou ', 'výrobu', ' s pomocí AI'],
      'škol': ['Zmodernizujte své ', 'vzdělávání', ' pomocí AI']
    }

    // Kontrola, zda dotaz obsahuje některé z klíčových slov
    const matchedKeyword = Object.entries(keywords).find(([key]) => 
      query.toLowerCase().includes(key.toLowerCase())
    )

    if (matchedKeyword) {
      const [prefix, highlight, suffix] = matchedKeyword[1]
      return (
        <>
          <span className="text-gradient-primary">{prefix}</span>
          <span className="text-gray-900">{highlight}</span>
          <span className="text-gradient-primary">{suffix}</span>
        </>
      )
    }

    // Pokud není nalezeno žádné klíčové slovo, vytvoříme obecnější personalizovaný nadpis
    return (
      <>
        <span className="text-gradient-primary">Pomůžeme vám s </span>
        <span className="text-gray-900">"{query}"</span>
        <span className="text-gradient-primary"> pomocí AI</span>
      </>
    )
  }

  const handleCompare = () => {
    // TODO: Implementovat logiku pro srovnání
    console.log('Srovnávám produkty:', Array.from(selectedItems))
  }

  const handleClearSelection = () => {
    setSelectedItems(new Set())
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Úvodní sekce */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold mb-4">
          {getPersonalizedHeadline(query)}
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-4">
          {query 
            ? 'Na základě vašich potřeb jsme připravili seznam AI nástrojů, které vám pomohou růst a být efektivnější.' 
            : 'Na základě vašeho dotazu jsme připravili seznam konkrétních situací, kde vám AI může pomoci. Vyberte tu, která vás zajímá.'
          }
        </p>
        <p className="text-gray-500 text-base">
          Procházejte jednotlivé možnosti a uložte si ty, které vás zaujmou. Později si je můžete detailně porovnat.
        </p>
      </div>

      {/* TagFilter místo dropdown menu */}
      <div className="mb-8">
        <TagFilter selectedTags={selectedTags} onTagsChange={setSelectedTags} />
      </div>

      {/* Seznam situací */}
      <div className="space-y-4 mb-12">
        {filteredSituations.map((situation) => (
          <div
            key={situation.id}
            className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative"
          >
            <div 
              onClick={(e) => {
                if (expandedSituationId === situation.id || (e.target as HTMLElement).closest('button, label')) {
                  return
                }
                window.open(`https://www.${situation.id === '1' ? 'openai.com/chatgpt' : 
                  situation.id === '2' ? 'anthropic.com/claude' :
                  situation.id === '3' ? 'github.com/features/copilot' :
                  situation.id === '4' ? 'openai.com/dall-e' :
                  'midjourney.com'}`, '_blank')
              }}
              className="flex flex-col md:flex-row items-center md:items-start gap-6 cursor-pointer"
            >
              <div className="w-full md:max-w-[240px] flex flex-col gap-3">
                <div className="w-full aspect-video relative rounded-[14px] overflow-hidden bg-gray-50 group flex items-center justify-center">
                  <span className="text-2xl font-medium text-gray-400">
                    {situation.id === '1' && 'ChatGPT'}
                    {situation.id === '2' && 'Claude'}
                    {situation.id === '3' && 'Copilot'}
                    {situation.id === '4' && 'DALL-E'}
                    {situation.id === '5' && 'Midjourney'}
                  </span>
                </div>
                <label className="flex items-center justify-center md:justify-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(situation.id)}
                    onChange={() => toggleItem(situation.id)}
                    className="w-4 h-4 text-purple-600/90 rounded-[6px] border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    Porovnat
                  </span>
                </label>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-medium text-gray-800">
                      {situation.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">{situation.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gradient-primary font-medium">
                      {situation.price}
                    </p>
                    {situation.hasTrial && (
                      <span className="text-xs text-purple-600/90 bg-purple-50/80 px-2 py-1 rounded-full">
                        Free trial
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-2">
                  {situation.description}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {situation.example}
                </p>
                
                <div className="flex items-center justify-center md:justify-end gap-3 flex-wrap">                  
                  <button 
                    onClick={() => toggleExpand(situation.id)}
                    className="w-full md:w-auto px-4 py-2 text-sm font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all flex items-center justify-center gap-2"
                  >
                    <span>{expandedSituationId === situation.id ? 'Méně informací' : 'Více informací'}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      className={`w-4 h-4 transition-transform ${expandedSituationId === situation.id ? 'rotate-180' : ''}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleSave(situation.id)}
                    className={`w-full md:w-auto px-4 py-2 text-sm font-medium rounded-[14px] border transition-all duration-300 ${
                      savedItems.has(situation.id)
                        ? 'border-green-500 text-green-600 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {savedItems.has(situation.id) ? 'Uloženo ✓' : 'Uložit'}
                  </button>
                </div>

                {/* Rozbalovací sekce */}
                {expandedSituationId === situation.id && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Výhody</h4>
                        <ul className="space-y-2">
                          {situation.pros?.map((pro, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Nevýhody</h4>
                        <ul className="space-y-2">
                          {situation.cons?.map((con, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-12 mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Detailní popis</h4>
                      <p className="text-sm text-gray-600">{situation.detailedDescription}</p>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Cenové podmínky</h4>
                      <div className="space-y-2 mb-4">
                        {situation.priceDetails?.split('\n').map((line, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="w-2 h-2 rounded-full bg-gradient-primary"></div>
                            <span className="text-gray-700 font-medium">{line}</span>
                          </div>
                        ))}
                      </div>
                      {situation.hasTrial && (
                        <button className="px-6 py-2.5 text-sm font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all flex items-center gap-2">
                          <span>Vyzkoušet zdarma</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {situation.videoUrls && situation.videoUrls.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Video ukázky</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {situation.videoUrls.map((url, index) => (
                            <div key={index} className="aspect-[9/16] relative rounded-[14px] overflow-hidden bg-gray-100">
                              <video
                                src={url}
                                className="w-full h-full object-cover"
                                controls
                                poster="/video-thumbnail.jpg"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CompareBar */}
      <CompareBar 
        selectedCount={selectedItems.size}
        onCompare={handleCompare}
        onClear={handleClearSelection}
      />

      {/* Vysvětlující sekce */}
    </div>
  )
} 