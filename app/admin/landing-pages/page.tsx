'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { 
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  LanguageIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface LandingPage {
  id: string
  slug: string
  title: string
  language: string
  metaDescription: string
  format: string
  publishedAt: string
  createdAt: string
  updatedAt: string
}

interface LandingPagesResponse {
  landingPages: LandingPage[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export default function LandingPagesAdmin() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabParam = (searchParams?.get('tab') as 'manage' | 'create') || 'manage'
  const [landingPages, setLandingPages] = useState<LandingPage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [languageFilter, setLanguageFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  
  // Bulk selection states
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  // Load landing pages from API
  useEffect(() => {
    loadLandingPages()
  }, [currentPage, searchTerm, languageFilter])

  // Reset selection when filters change
  useEffect(() => {
    setSelectedPages(new Set())
  }, [searchTerm, languageFilter])

  const loadLandingPages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '20'
      })
      
      const response = await fetch(`/api/landing-pages?${params}`)
      if (response.ok) {
        const data: LandingPagesResponse = await response.json()
        setLandingPages(data.landingPages)
        setTotalPages(data.pagination.totalPages)
      } else {
        setError('Chyba při načítání landing pages')
      }
    } catch (error) {
      setError('Chyba při načítání landing pages')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      return
    }

    try {
      const response = await fetch(`/api/landing-pages/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccessMessage(`Landing page "${title}" byla úspěšně smazána`)
        setDeleteConfirm(null)
        loadLandingPages()
        // Remove from selected if it was selected
        setSelectedPages(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      } else {
        const data = await response.json()
        setError(data.error || 'Chyba při mazání landing page')
      }
    } catch (error) {
      setError('Chyba při mazání landing page')
      console.error(error)
    }
  }

  // Bulk selection functions
  const handleSelectAll = () => {
    if (selectedPages.size === filteredPages.length) {
      setSelectedPages(new Set())
    } else {
      setSelectedPages(new Set(filteredPages.map(page => page.id)))
    }
  }

  const handleSelectPage = (pageId: string) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pageId)) {
        newSet.delete(pageId)
      } else {
        newSet.add(pageId)
      }
      return newSet
    })
  }

  const handleBulkDelete = async () => {
    if (!bulkDeleteConfirm) {
      setBulkDeleteConfirm(true)
      return
    }

    try {
      setLoading(true)
      const selectedPagesList = Array.from(selectedPages)
      
      // Delete all selected pages
      const deletePromises = selectedPagesList.map(id => 
        fetch(`/api/landing-pages/${id}`, { method: 'DELETE' })
      )
      
      const results = await Promise.all(deletePromises)
      const successCount = results.filter(r => r.ok).length
      
      if (successCount === selectedPagesList.length) {
        setSuccessMessage(`Úspěšně smazáno ${successCount} landing pages`)
      } else {
        setError(`Smazáno ${successCount} z ${selectedPagesList.length} landing pages. Některé se nepodařilo smazat.`)
      }
      
      setSelectedPages(new Set())
      setBulkDeleteConfirm(false)
      loadLandingPages()
    } catch (error) {
      setError('Chyba při bulk mazání landing pages')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Filter landing pages
  const filteredPages = landingPages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLanguage = languageFilter === 'all' || page.language === languageFilter
    
    return matchesSearch && matchesLanguage
  })

  const getLanguageFlag = (lang: string) => {
    const flags: { [key: string]: string } = {
      'cs': '🇨🇿',
      'en': '🇬🇧', 
      'de': '🇩🇪',
      'fr': '🇫🇷',
      'es': '🇪🇸'
    }
    return flags[lang] || '🌐'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                Landing Pages
              </h1>
              <div className="mt-3 bg-gray-100 inline-flex rounded-lg p-1">
                <button
                  onClick={() => router.replace(`${pathname}?tab=manage`, { scroll: false })}
                  className={`px-4 py-2 text-sm rounded-md ${tabParam === 'manage' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Správa
                </button>
                <button
                  onClick={() => router.replace(`${pathname}?tab=create`, { scroll: false })}
                  className={`px-4 py-2 text-sm rounded-md ${tabParam === 'create' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Vytvořit
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/admin/create-landing"
                target="_blank"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
              >
                <PlusIcon className="w-5 h-5" />
                Vytvořit Landing Page
              </Link>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            {error}
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
            <button onClick={() => setSuccessMessage('')} className="ml-auto text-green-500 hover:text-green-700 float-right">
              ×
            </button>
          </div>
        )}

        {tabParam === 'manage' && (
        <>
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat podle názvu nebo slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Language Filter */}
            <div className="relative">
              <LanguageIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">Všechny jazyky</option>
                <option value="cs">🇨🇿 Čeština</option>
                <option value="en">🇬🇧 Angličtina</option>
                <option value="de">🇩🇪 Němčina</option>
                <option value="fr">🇫🇷 Francouzština</option>
                <option value="es">🇪🇸 Španělština</option>
              </select>
            </div>

            {/* Stats */}
            <div className="text-sm text-gray-600 flex items-center">
              Celkem: <span className="font-medium ml-1">{filteredPages.length}</span> landing pages
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedPages.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-800">
                  Vybráno: {selectedPages.size} položek
                </span>
                <button
                  onClick={() => setSelectedPages(new Set())}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Zrušit výběr
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkDelete}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    bulkDeleteConfirm 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  <TrashIcon className="w-4 h-4 inline mr-2" />
                  {bulkDeleteConfirm ? 'Potvrdit smazání' : 'Smazat vybrané'}
                </button>
                {bulkDeleteConfirm && (
                  <button
                    onClick={() => setBulkDeleteConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    Zrušit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Načítání landing pages...</p>
          </div>
        )}

        {/* Landing Pages Table */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedPages.size === filteredPages.length && filteredPages.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        title="Vybrat vše"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Název & Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jazyk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vytvořeno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Publikováno
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akce
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedPages.has(page.id)}
                          onChange={() => handleSelectPage(page.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {page.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            /landing/{page.slug}
                          </div>
                          {page.metaDescription && (
                            <div className="text-xs text-gray-400 mt-1 max-w-md truncate">
                              {page.metaDescription}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getLanguageFlag(page.language)} {page.language.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {formatDate(page.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(page.publishedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* View */}
                          <Link
                            href={`/landing/${page.slug}`}
                            target="_blank"
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Zobrazit stránku"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          
                          {/* Edit */}
                          <Link
                            href={`/admin/landing-pages/${page.id}/edit`}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Upravit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(page.id, page.title)}
                            className={`p-1 ${deleteConfirm === page.id 
                              ? 'text-red-800 bg-red-100 rounded' 
                              : 'text-red-600 hover:text-red-800'}`}
                            title={deleteConfirm === page.id ? 'Potvrdit smazání' : 'Smazat'}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                          
                          {deleteConfirm === page.id && (
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-gray-400 hover:text-gray-600 text-xs px-2"
                            >
                              Zrušit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPages.length === 0 && !loading && (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Žádné landing pages nenalezeny
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || languageFilter !== 'all' 
                    ? 'Zkuste upravit filtry nebo vyhledávací dotaz.'
                    : 'Vytvořte svou první landing page.'}
                </p>
                <Link
                  href="/admin/create-landing"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Vytvořit Landing Page
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Stránka {currentPage} z {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Předchozí
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Další
              </button>
            </div>
          </div>
        )}
        </>
        )}

        {tabParam === 'create' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Vytvořit Landing Page</h2>
            <p className="text-gray-600 mb-4">Pro vytvoření nové landing page použij odkaz níže (otevře editor v nové záložce).</p>
            <Link
              href="/admin/create-landing"
              target="_blank"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <PlusIcon className="w-5 h-5" />
              Otevřít editor (nová záložka)
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}