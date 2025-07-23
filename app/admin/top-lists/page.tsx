'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TrophyIcon,
  ListBulletIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FireIcon,
  StarIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { TrophyIcon as TrophyFilledIcon } from '@heroicons/react/24/solid'

interface TopListCategory {
  id: string
  title: string
  description: string
  category: string
  products: string[] // Array of product IDs
  status: 'published' | 'draft'
  clicks: number
  conversion: number
  createdAt: string
  updatedAt: string
}

export default function TopListsAdmin() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [topLists, setTopLists] = useState<TopListCategory[]>([])
  const [loading, setLoading] = useState(true)

  // Load top lists from API
  useEffect(() => {
    fetchTopLists()
  }, [])

  const fetchTopLists = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/top-lists')
      if (response.ok) {
        const data = await response.json()
        setTopLists(data)
      } else {
        console.error('Failed to fetch top lists')
      }
    } catch (error) {
      console.error('Error fetching top lists:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = topLists.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || category.status === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'clicks':
        return b.clicks - a.clicks
      case 'conversion':
        return b.conversion - a.conversion
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (confirm('Opravdu chcete smazat tuto kategorii? Tato akce je nevratná.')) {
      try {
        const response = await fetch(`/api/top-lists/${categoryId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          // Refresh the list
          fetchTopLists()
        } else {
          alert('Chyba při mazání kategorie')
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Chyba při mazání kategorie')
      }
    }
  }

  const handleDuplicate = async (categoryId: string) => {
    const originalCategory = topLists.find(c => c.id === categoryId)
    if (!originalCategory) return

    try {
      const response = await fetch('/api/top-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `${originalCategory.title} (Kopie)`,
          description: originalCategory.description,
          category: originalCategory.category,
          products: originalCategory.products,
          status: 'draft'
        })
      })

      if (response.ok) {
        fetchTopLists()
      } else {
        alert('Chyba při duplikování kategorie')
      }
    } catch (error) {
      console.error('Error duplicating category:', error)
      alert('Chyba při duplikování kategorie')
    }
  }

  const stats = {
    total: topLists.length,
    published: topLists.filter(c => c.status === 'published').length,
    draft: topLists.filter(c => c.status === 'draft').length,
    totalClicks: topLists.reduce((sum, c) => sum + c.clicks, 0),
    averageConversion: topLists.length > 0 
      ? (topLists.reduce((sum, c) => sum + c.conversion, 0) / topLists.length).toFixed(1)
      : '0.0'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 text-purple-600" />
            Správa TOP žebříčků
          </h1>
          <p className="text-gray-600 mt-1">
            Spravuj kategorie nástrojů, jejich pořadí a obsah TOP listů
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTopLists}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowDownIcon className="w-5 h-5 mr-2" />
            Obnovit
          </button>
          <Link
            href="/admin/top-lists/new"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nová kategorie
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ListBulletIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkem kategorií</p>
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
              <DocumentDuplicateIcon className="h-6 w-6 text-yellow-500" />
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
              <FireIcon className="h-6 w-6 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkem kliků</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Průměrná konverze</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageConversion}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Vyhledat kategorii
            </label>
            <input
              type="text"
              id="search"
              placeholder="Název kategorie..."
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
            </select>
          </div>

          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              Řadit podle
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="createdAt">Datum vytvoření</option>
              <option value="title">Název</option>
              <option value="clicks">Počet kliků</option>
              <option value="conversion">Konverze</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nástroje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktualizace
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <TrophyFilledIcon className="w-5 h-5 text-yellow-500" />
                          <h3 className="text-sm font-semibold text-gray-900">{category.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Kategorie: {category.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{category.products.length} nástrojů</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-gray-900">{category.clicks.toLocaleString()} kliků</div>
                      <div className="text-gray-500">{category.conversion}% konverze</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                      {category.status === 'published' ? 'Publikované' : 'Koncept'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(category.updatedAt).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/top-lists/${category.category}`}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Zobrazit"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/top-lists/${category.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Editovat"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(category.id)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Duplikovat"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Smazat"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné kategorie</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nebyli nalezeny žádné kategorie odpovídající filtru.'
                : 'Začněte vytvořením první kategorie TOP listu.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <div className="mt-6">
                <Link
                  href="/admin/top-lists/new"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Vytvořit kategorii
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 