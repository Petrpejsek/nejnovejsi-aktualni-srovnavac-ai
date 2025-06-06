'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BuildingOfficeIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

interface CompanyApplication {
  id: string
  companyName: string
  contactPerson: string
  businessEmail: string
  website?: string
  productUrls?: string[]
  description?: string
  status: 'pending' | 'approved' | 'rejected'
  adminNotes?: string
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

interface Product {
  id: string
  name: string
  description: string
  externalUrl: string
  imageUrl?: string
  category?: string
  price: number
}

export default function CompaniesAdmin() {
  const [activeTab, setActiveTab] = useState<'applications' | 'approved' | 'rejected'>('applications')
  const [applications, setApplications] = useState<CompanyApplication[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<CompanyApplication | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Statistiky pro dashboard
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  // Načtení aplikací z API
  const loadApplications = async () => {
    try {
      const response = await fetch('/api/company-applications')
      if (response.ok) {
        const data = await response.json()
        const apps = data.data || []
        setApplications(apps)
        
        // Vypočítáme statistiky
        setStats({
          total: apps.length,
          pending: apps.filter((app: CompanyApplication) => app.status === 'pending').length,
          approved: apps.filter((app: CompanyApplication) => app.status === 'approved').length,
          rejected: apps.filter((app: CompanyApplication) => app.status === 'rejected').length
        })
      }
    } catch (error) {
      console.error('Chyba při načítání aplikací:', error)
    } finally {
      setLoading(false)
    }
  }

  // Načtení všech produktů pro dropdown
  const loadAllProducts = async () => {
    try {
      const response = await fetch('/api/products/all')
      if (response.ok) {
        const data = await response.json()
        setAllProducts(data.products || [])
      }
    } catch (error) {
      console.error('Chyba při načítání produktů:', error)
    }
  }

  // Funkce pro nalezení spárovaných produktů
  const findMatchedProducts = async (application: CompanyApplication) => {
    if (!application.productUrls || application.productUrls.length === 0) {
      setMatchedProducts([])
      setSelectedProductId('')
      return
    }

    try {
      const response = await fetch('/api/products/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: application.productUrls,
          companyName: application.companyName,
          website: application.website
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const products = data.products || []
        setMatchedProducts(products)
        
        // Automaticky předvybere první nalezený produkt
        if (products.length > 0) {
          setSelectedProductId(products[0].id)
        }
      }
    } catch (error) {
      console.error('Chyba při vyhledávání produktů:', error)
      setMatchedProducts([])
      setSelectedProductId('')
    }
  }

  // Zpracování schválení/zamítnutí s možností přiřazení produktu
  const handleAction = async (applicationId: string, action: 'approve' | 'reject', notes?: string) => {
    setActionLoading(applicationId)
    
    try {
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        adminNotes: notes || ''
      }

      // Pokud schvalujeme a je vybraný produkt, přidáme info o produktu
      if (action === 'approve' && selectedProductId) {
        const selectedProduct = allProducts.find(p => p.id === selectedProductId)
        if (selectedProduct) {
          updateData.linkedProductId = selectedProductId
          updateData.linkedProductName = selectedProduct.name
        }
      }

      const response = await fetch(`/api/company-applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        await loadApplications()
        setSelectedApp(null)
        setSelectedProductId('')
        setMatchedProducts([])
      } else {
        alert('Chyba při zpracování akce')
      }
    } catch (error) {
      console.error('Chyba:', error)
      alert('Chyba při zpracování akce')
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    loadApplications()
    loadAllProducts()
  }, [])

  // Filtrování aplikací podle aktivního tabu a vyhledávání
  const filteredApplications = applications.filter(app => {
    const matchesTab = app.status === activeTab || (activeTab === 'applications' && app.status === 'pending')
    const matchesSearch = searchTerm === '' || 
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.businessEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesTab && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-3 h-3" />
      case 'approved': return <CheckIcon className="w-3 h-3" />
      case 'rejected': return <XMarkIcon className="w-3 h-3" />
      default: return <ExclamationTriangleIcon className="w-3 h-3" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BuildingOfficeIcon className="w-8 h-8 mr-3 text-purple-600" />
            Správa firem
          </h1>
          <p className="text-gray-600">Správa firemních žádostí o registraci a schválených firem</p>
        </div>
      </div>

      {/* Dashboard s proklikovými kontejnery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          onClick={() => setActiveTab('applications')}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-blue-600 transition-colors">
                  Celkem žádostí
                </dt>
                <dd className="text-lg font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                  {stats.total}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('applications')}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⏰</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-yellow-600 transition-colors">
                  Čekající na schválení
                </dt>
                <dd className="text-lg font-medium text-gray-900 group-hover:text-yellow-700 transition-colors">
                  {stats.pending}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('approved')}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-green-600 transition-colors">
                  Schválené firmy
                </dt>
                <dd className="text-lg font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                  {stats.approved}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('rejected')}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-red-600 transition-colors">
                  Zamítnuté žádosti
                </dt>
                <dd className="text-lg font-medium text-gray-900 group-hover:text-red-700 transition-colors">
                  {stats.rejected}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Fulltextové vyhledávání */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Vyhledat firmy podle názvu, kontaktní osoby nebo emailu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabuky */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('applications')}
              className={`${
                activeTab === 'applications'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap`}
            >
              Žádosti o registraci
              {stats.pending > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full text-xs">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`${
                activeTab === 'approved'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap`}
            >
              Schválené firmy
              <span className="ml-2 bg-green-100 text-green-800 py-1 px-2 rounded-full text-xs">
                {stats.approved}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`${
                activeTab === 'rejected'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap`}
            >
              Zamítnuté žádosti
              <span className="ml-2 bg-red-100 text-red-800 py-1 px-2 rounded-full text-xs">
                {stats.rejected}
              </span>
            </button>
          </nav>
        </div>

        {/* Seznam aplikací */}
        <div className="divide-y divide-gray-200">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné aplikace</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Žádné výsledky pro vaše vyhledávání.' : 'V této kategorii nejsou žádné aplikace.'}
              </p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <div key={app.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900 truncate">{app.companyName}</h3>
                          <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            <span className="ml-1">
                              {app.status === 'pending' && 'Čeká na schválení'}
                              {app.status === 'approved' && 'Schváleno'}
                              {app.status === 'rejected' && 'Zamítnuto'}
                            </span>
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span className="truncate">{app.contactPerson} ({app.businessEmail})</span>
                        </div>
                        {app.website && (
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <GlobeAltIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            <a 
                              href={app.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-500 truncate"
                            >
                              {app.website}
                            </a>
                          </div>
                        )}
                        <div className="mt-1 text-sm text-gray-500">
                          Podáno: {new Date(app.submittedAt).toLocaleDateString('cs-CZ', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedApp(app)
                        if (app.status === 'pending') {
                          findMatchedProducts(app)
                        }
                      }}
                      className="text-purple-600 hover:text-purple-900 font-medium"
                    >
                      <EyeIcon className="w-4 h-4 inline mr-1" />
                      Detail
                    </button>
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(app.id, 'approve')}
                          disabled={actionLoading === app.id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <CheckIcon className="w-4 h-4 mr-1" />
                          Schválit
                        </button>
                        <button
                          onClick={() => handleAction(app.id, 'reject')}
                          disabled={actionLoading === app.id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          Zamítnout
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal pro detail */}
      {selectedApp && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Detail firemní žádosti</h3>
              <button
                onClick={() => {
                  setSelectedApp(null)
                  setSelectedProductId('')
                  setMatchedProducts([])
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Název firmy</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApp.companyName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Kontaktní osoba</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApp.contactPerson}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApp.businessEmail}</p>
                </div>

                {selectedApp.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Web</label>
                    <a 
                      href={selectedApp.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-purple-600 hover:text-purple-500"
                    >
                      {selectedApp.website}
                    </a>
                  </div>
                )}

                {selectedApp.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Popis</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApp.description}</p>
                  </div>
                )}

                {selectedApp.productUrls && selectedApp.productUrls.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL produktů</label>
                    <div className="mt-1 space-y-1">
                      {selectedApp.productUrls.map((url, index) => (
                        <a 
                          key={index}
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-sm text-purple-600 hover:text-purple-500"
                        >
                          <LinkIcon className="w-4 h-4 inline mr-1" />
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {selectedApp.adminNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin poznámky</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApp.adminNotes}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedApp.status)}`}>
                    {getStatusIcon(selectedApp.status)}
                    <span className="ml-1">
                      {selectedApp.status === 'pending' && 'Čeká na schválení'}
                      {selectedApp.status === 'approved' && 'Schváleno'}
                      {selectedApp.status === 'rejected' && 'Zamítnuto'}
                    </span>
                  </span>
                </div>

                {/* Dropdown s produkty pro pending aplikace */}
                {selectedApp.status === 'pending' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Přiřadit existující produkt
                    </label>
                    
                    {/* Automaticky nalezené produkty */}
                    {matchedProducts.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-2">
                          🔍 Automaticky nalezené produkty:
                        </p>
                        <div className="space-y-2">
                          {matchedProducts.map(product => (
                            <label key={product.id} className="flex items-center">
                              <input
                                type="radio"
                                name="matchedProduct"
                                value={product.id}
                                checked={selectedProductId === product.id}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                className="mr-2"
                              />
                              <span className="text-sm text-blue-700">{product.name}</span>
                              {product.externalUrl && (
                                <a 
                                  href={product.externalUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 text-xs text-blue-500 hover:text-blue-600"
                                >
                                  🔗
                                </a>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dropdown se všemi produkty */}
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">-- Vyberte produkt --</option>
                      {allProducts.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} {product.category ? `(${product.category})` : ''}
                        </option>
                      ))}
                    </select>

                    {selectedProductId && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        {(() => {
                          const product = allProducts.find(p => p.id === selectedProductId)
                          return product ? (
                            <div>
                              <p className="text-sm font-medium">{product.name}</p>
                              {product.description && (
                                <p className="text-xs text-gray-600 mt-1">{product.description.substring(0, 100)}...</p>
                              )}
                              {product.externalUrl && (
                                <a 
                                  href={product.externalUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-purple-600 hover:text-purple-500 mt-1 block"
                                >
                                  {product.externalUrl}
                                </a>
                              )}
                            </div>
                          ) : null
                        })()}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Datum podání</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedApp.submittedAt).toLocaleDateString('cs-CZ', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Akční tlačítka pro pending aplikace */}
            {selectedApp.status === 'pending' && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleAction(selectedApp.id, 'reject', 'Zamítnuto administrátorem')}
                  disabled={actionLoading === selectedApp.id}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Zamítnout
                </button>
                <button
                  onClick={() => {
                    const notes = selectedProductId 
                      ? `Schváleno a propojeno s produktem: ${allProducts.find(p => p.id === selectedProductId)?.name || 'Neznámý produkt'}`
                      : 'Schváleno administrátorem'
                    handleAction(selectedApp.id, 'approve', notes)
                  }}
                  disabled={actionLoading === selectedApp.id}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {actionLoading === selectedApp.id ? 'Zpracovávám...' : 'Schválit'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}