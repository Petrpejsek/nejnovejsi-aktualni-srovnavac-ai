'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  LanguageIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Page {
  id: number
  title: string
  slug: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  status: 'published' | 'draft' | 'scheduled'
  lastModified: string
  author: string
  views: number
  language: 'cs' | 'en'
  content: string
  publishedAt?: string
}

export default function PagesAdmin() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [languageFilter, setLanguageFilter] = useState('all')

  // Mock data stránek
  const [pages, setPages] = useState<Page[]>([
    {
      id: 1,
      title: 'O nás',
      slug: 'o-nas',
      metaTitle: 'O nás - AI Nástroje | Nejlepší AI nástroje pro váš business',
      metaDescription: 'Seznamte se s naší misí pomáhat firmám najít ty nejlepší AI nástroje. Expertní recenze, srovnání a doporučení.',
      keywords: ['o nás', 'AI nástroje', 'mise', 'team'],
      status: 'published',
      lastModified: '2024-01-25',
      author: 'Petr Admin',
      views: 1250,
      language: 'cs',
      content: 'Naše mise je pomáhat firmám...',
      publishedAt: '2024-01-01'
    },
    {
      id: 2,
      title: 'Podmínky použití',
      slug: 'podminky-pouziti',
      metaTitle: 'Podmínky použití - AI Nástroje',
      metaDescription: 'Přečtěte si podmínky použití našeho webu s AI nástroji. Aktuální verze platných podmínek.',
      keywords: ['podmínky', 'použití', 'legal', 'pravidla'],
      status: 'published',
      lastModified: '2024-01-20',
      author: 'Petr Admin',
      views: 890,
      language: 'cs',
      content: 'Tyto podmínky použití...',
      publishedAt: '2024-01-01'
    },
    {
      id: 3,
      title: 'Ochrana osobních údajů',
      slug: 'ochrana-osobnich-udaju',
      metaTitle: 'GDPR - Ochrana osobních údajů | AI Nástroje',
      metaDescription: 'Informace o zpracování osobních údajů v souladu s GDPR. Kompletní podmínky ochrany soukromí.',
      keywords: ['GDPR', 'ochrana údajů', 'soukromí', 'cookies'],
      status: 'published',
      lastModified: '2024-01-22',
      author: 'Petr Admin',
      views: 650,
      language: 'cs',
      content: 'Ochrana vašich osobních údajů...',
      publishedAt: '2024-01-01'
    },
    {
      id: 4,
      title: 'FAQ - Časté otázky',
      slug: 'faq',
      metaTitle: 'FAQ - Časté otázky o AI nástrojích',
      metaDescription: 'Odpovědi na nejčastější otázky týkající se AI nástrojů, jejich použití a našich služeb.',
      keywords: ['FAQ', 'otázky', 'odpovědi', 'help'],
      status: 'draft',
      lastModified: '2024-01-24',
      author: 'Jana Editorka',
      views: 0,
      language: 'cs',
      content: 'Nejčastější otázky...',
    },
    {
      id: 5,
      title: 'Contact Us',
      slug: 'contact',
      metaTitle: 'Contact Us - AI Tools Platform',
      metaDescription: 'Get in touch with our team. Contact information and support for AI tools platform.',
      keywords: ['contact', 'support', 'email', 'help'],
      status: 'draft',
      lastModified: '2024-01-23',
      author: 'Petr Admin',
      views: 0,
      language: 'en',
      content: 'Contact our team...',
    }
  ])

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.metaTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter
    const matchesLanguage = languageFilter === 'all' || page.language === languageFilter
    
    return matchesSearch && matchesStatus && matchesLanguage
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLanguageFlag = (language: string) => {
    switch (language) {
      case 'cs':
        return '🇨🇿'
      case 'en':
        return '🇺🇸'
      default:
        return '🌍'
    }
  }

  const handleDelete = (pageId: number) => {
    if (confirm('Opravdu chcete smazat tuto stránku? Tato akce je nevratná.')) {
      setPages(pages.filter(page => page.id !== pageId))
    }
  }

  const calculateSEOScore = (page: Page) => {
    let score = 0
    
    // Meta title
    if (page.metaTitle.length >= 30 && page.metaTitle.length <= 60) score += 25
    else if (page.metaTitle.length > 0) score += 15
    
    // Meta description
    if (page.metaDescription.length >= 120 && page.metaDescription.length <= 160) score += 25
    else if (page.metaDescription.length > 0) score += 15
    
    // Keywords
    if (page.keywords.length >= 3 && page.keywords.length <= 7) score += 25
    else if (page.keywords.length > 0) score += 15
    
    // Slug
    if (page.slug.length > 0 && !page.slug.includes(' ')) score += 25
    else if (page.slug.length > 0) score += 15
    
    return score
  }

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const stats = {
    total: pages.length,
    published: pages.filter(p => p.status === 'published').length,
    draft: pages.filter(p => p.status === 'draft').length,
    totalViews: pages.reduce((sum, p) => sum + p.views, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DocumentTextIcon className="w-8 h-8 text-purple-600" />
            Správa stránek
          </h1>
          <p className="text-gray-600 mt-1">
            Editor statických stránek, SEO optimalizace a správa obsahu
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nová stránka
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkem stránek</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Publikované</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.published}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PencilIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Koncepty</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.draft}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EyeIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkové zobrazení</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Vyhledat stránku
            </label>
            <input
              type="text"
              id="search"
              placeholder="Název, slug nebo meta title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Všechny stavy</option>
              <option value="published">Publikované</option>
              <option value="draft">Koncepty</option>
              <option value="scheduled">Naplánované</option>
            </select>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              Jazyk
            </label>
            <select
              id="language"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Všechny jazyky</option>
              <option value="cs">Čeština</option>
              <option value="en">Angličtina</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stránka
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SEO Skóre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zobrazení
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poslední úprava
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPages.map((page) => {
                const seoScore = calculateSEOScore(page)
                return (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <span className="text-2xl">{getLanguageFlag(page.language)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{page.title}</div>
                          <div className="text-sm text-gray-500">/{page.slug}</div>
                          <div className="text-xs text-gray-400 max-w-md truncate">
                            {page.metaDescription}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              seoScore >= 80 ? 'bg-green-500' : 
                              seoScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${seoScore}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${getSEOScoreColor(seoScore)}`}>
                          {seoScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(page.status)}`}>
                        {page.status === 'published' ? 'Publikováno' : 
                         page.status === 'draft' ? 'Koncept' : 'Naplánováno'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{page.lastModified}</div>
                      <div className="text-xs text-gray-400">{page.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/${page.slug}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Zobrazit stránku"
                          target="_blank"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/pages/${page.id}/edit`}
                          className="text-purple-600 hover:text-purple-900"
                          title="Upravit stránku"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Smazat stránku"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné stránky</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || languageFilter !== 'all'
                ? 'Nenalezeny žádné stránky odpovídající filtrům.'
                : 'Začněte vytvořením nové stránky.'}
            </p>
            {!searchTerm && statusFilter === 'all' && languageFilter === 'all' && (
              <div className="mt-6">
                <Link
                  href="/admin/pages/new"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Vytvořit první stránku
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEO Tips */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">SEO Tipy pro lepší optimalizaci</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-medium mb-2">Meta Title</h4>
            <p className="text-sm opacity-90">30-60 znaků, obsahuje hlavní klíčové slovo</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-medium mb-2">Meta Description</h4>
            <p className="text-sm opacity-90">120-160 znaků, atraktivní a popisný text</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-medium mb-2">Keywords</h4>
            <p className="text-sm opacity-90">3-7 relevantních klíčových slov</p>
          </div>
        </div>
      </div>
    </div>
  )
} 