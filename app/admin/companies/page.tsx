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
  LinkIcon,
  CheckCircleIcon,
  CogIcon,
  CubeIcon
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
  isPPCAdvertiser?: boolean
  assignedProductId?: string // Pro PPC inzerenty
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

interface AdvertiserCompany {
  id: string
  name: string
  email: string
  contactPerson: string
  website?: string
  description?: string
  status: string
  isVerified: boolean
  balance: number
  totalSpent: number
  createdAt: string
  assignedProductId?: string
}

export default function CompaniesAdmin() {
  const [activeTab, setActiveTab] = useState<'applications' | 'approved' | 'rejected' | 'cancelled'>('applications')
  const [approvedSubTab, setApprovedSubTab] = useState<'with-product' | 'waiting-product' | 'future-categories'>('with-product')
  const [applications, setApplications] = useState<CompanyApplication[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<CompanyApplication | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [advertisers, setAdvertisers] = useState<AdvertiserCompany[]>([])
  const [advertisersLoading, setAdvertisersLoading] = useState(true)

  // Statistiky pro dashboard
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalCancelled: 0
  })

  // Načtení aplikací z API
  const loadApplications = async () => {
    try {
      const response = await fetch('/api/company-applications')
      if (response.ok) {
        const data = await response.json()
        const apps = data.data || []

        setApplications(apps)
        
        // Statistiky se aktualizují pomocí useEffect když se změní applications nebo advertisers
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

  // Načtení PPC inzerentů
  const loadAdvertisers = async () => {
    try {
      // Načteme všechny PPC inzerenty (bez filtru pro status)
      const response = await fetch('/api/admin/advertisers')
      if (response.ok) {
        const data = await response.json()
        const advertisersData = data.data || []
        setAdvertisers(advertisersData)
        // Statistiky se aktualizují pomocí useEffect když se změní applications nebo advertisers
      } else {
        console.log('Failed to load advertisers:', response.status)
      }
    } catch (error) {
      console.error('Error loading advertisers:', error)
    } finally {
      setAdvertisersLoading(false)
    }
  }

  // Funkce pro nalezení spárovaných produktů na základě domény
  const findMatchedProductsByDomain = (website: string) => {
    if (!website || allProducts.length === 0) {
      setMatchedProducts([])
      setSelectedProductId('')
      return
    }

    try {
      // Extrahuj doménu z URL
      const domain = new URL(website.startsWith('http') ? website : `https://${website}`).hostname.toLowerCase()
      
      // Najdi produkty se stejnou doménou
      const matches = allProducts.filter(product => {
        if (!product.externalUrl) return false
        try {
          const productDomain = new URL(product.externalUrl).hostname.toLowerCase()
          return productDomain === domain || 
                 productDomain.includes(domain.replace('www.', '')) ||
                 domain.includes(productDomain.replace('www.', ''))
        } catch {
          return false
        }
      })

      setMatchedProducts(matches)
      
      // Automaticky předvyber první nalezený produkt
      if (matches.length > 0) {
        setSelectedProductId(matches[0].id)
      } else {
        setSelectedProductId('')
      }
    } catch (error) {
      console.error('Chyba při matchování podle domény:', error)
      setMatchedProducts([])
      setSelectedProductId('')
    }
  }

  // Funkce pro nalezení spárovaných produktů
  const findMatchedProducts = async (application: CompanyApplication) => {
    if (!application.productUrls || application.productUrls.length === 0) {
      // Pokud nejsou URL produktů, zkus matchovat podle domény
      if (application.website) {
        findMatchedProductsByDomain(application.website)
      } else {
        setMatchedProducts([])
        setSelectedProductId('')
      }
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
  const handleAction = async (applicationId: string, action: 'approve' | 'reject' | 'delete' | 'cancel' | 'restore', notes?: string) => {
    setActionLoading(applicationId)
    
    try {
      // Zjistíme, jestli je to PPC inzerent podle toho, jestli existuje v advertisers
      const isPPCAdvertiser = advertisers.some(adv => adv.id === applicationId);
      console.log('🔍 Debug handleAction:', { applicationId, action, isPPCAdvertiser, selectedApp: selectedApp });
      
      // Pokud je to PPC inzerent
      if (isPPCAdvertiser) {
        if (action === 'delete') {
          // Skutečné smazání PPC inzerenta
          const response = await fetch(`/api/admin/advertisers?id=${applicationId}`, {
            method: 'DELETE'
          })
          
          if (response.ok) {
            await loadAdvertisers()
            setSelectedApp(null)
            alert('PPC inzerent byl úspěšně smazán')
          } else {
            alert('Chyba při mazání PPC inzerenta')
          }
        } else if (action === 'reject') {
          // Zamítnutí PPC inzerenta (změna statusu na rejected)
          const response = await fetch(`/api/admin/advertisers?id=${applicationId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'reject' })
          })
          
          if (response.ok) {
            await loadAdvertisers()
            setSelectedApp(null)
            alert('PPC inzerent byl zamítnut')
          } else {
            alert('Chyba při zamítání PPC inzerenta')
          }
        } else if (action === 'approve') {
          // Schválení PPC inzerenta s možností přiřazení produktu
          const requestBody: any = { action: 'approve' }
          
          // Pokud je vybraný produkt, přidej ho do requestu
          if (selectedProductId && selectedProductId !== 'CREATE_NEW') {
            requestBody.assignedProductId = selectedProductId
          }
          
          const response = await fetch(`/api/admin/advertisers?id=${applicationId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          })
          
          if (response.ok) {
            await loadAdvertisers()
            setSelectedApp(null)
            setSelectedProductId('')
            setMatchedProducts([])
            const productMessage = selectedProductId && selectedProductId !== 'CREATE_NEW' 
              ? ` a přiřazen produkt: ${allProducts.find(p => p.id === selectedProductId)?.name || 'Neznámý'}`
              : ''
            alert(`PPC inzerent byl úspěšně schválen${productMessage}`)
          } else {
            alert('Chyba při schvalování PPC inzerenta')
          }
        } else if (action === 'cancel') {
          // Zrušení již schváleného/aktivního PPC inzerenta (status->cancelled)
          const response = await fetch(`/api/admin/advertisers?id=${applicationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'cancel' })
          })
          if (response.ok) {
            await loadAdvertisers()
            setSelectedApp(null)
            alert('PPC inzerent byl zrušen (cancelled)')
          } else {
            alert('Chyba při rušení PPC inzerenta')
          }
        } else if (action === 'restore') {
          // Obnovení zrušeného PPC inzerenta (status->approved)
          const response = await fetch(`/api/admin/advertisers?id=${applicationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'restore' })
          })
          if (response.ok) {
            await loadAdvertisers()
            setSelectedApp(null)
            alert('PPC inzerent byl obnoven (approved)')
          } else {
            alert('Chyba při obnově PPC inzerenta')
          }
        }
        return
      }

      // Standardní logika pro company applications
      const updateData: any = {
        action: action,  // Pošleme 'approve' nebo 'reject'
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

  // Funkce pro přiřazení produktu k již schválenému PPC inzerentovi
  const handleAssignProduct = async (advertiserId: string) => {
    if (!selectedProductId || selectedProductId === 'CREATE_NEW') {
      alert('Prosím vyberte existující produkt')
      return
    }

    setActionLoading(advertiserId)
    
    try {
      const response = await fetch(`/api/admin/advertisers?id=${advertiserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'assign-product',
          assignedProductId: selectedProductId 
        })
      })
      
      if (response.ok) {
        await loadAdvertisers()
        setSelectedApp(null)
        setSelectedProductId('')
        setMatchedProducts([])
        const productName = allProducts.find(p => p.id === selectedProductId)?.name || 'Neznámý'
        alert(`Produkt "${productName}" byl úspěšně přiřazen`)
      } else {
        alert('Chyba při přiřazování produktu')
      }
    } catch (error) {
      console.error('Chyba:', error)
      alert('Chyba při přiřazování produktu')
    } finally {
      setActionLoading(null)
    }
  }

  // Funkce pro určení stavu kreditu PPC inzerenta
  const getCreditStatus = (advertiser: AdvertiserCompany) => {
    if (advertiser.balance > 0) {
      return {
        label: 'Nabitý kredit',
        color: 'bg-green-100 text-green-800',
        icon: '💳'
      }
    } else if (advertiser.totalSpent > 0) {
      return {
        label: 'Došel kredit',
        color: 'bg-orange-100 text-orange-800',
        icon: '⚠️'
      }
    } else {
      return {
        label: 'Nikdy nedostal kredit',
        color: 'bg-gray-100 text-gray-800',
        icon: '❌'
      }
    }
  }

  // Funkce pro aktualizaci statistik včetně PPC inzerentů (bez duplikátů)
  const updateStatsWithAdvertisers = (applications: CompanyApplication[], advertisers: AdvertiserCompany[]) => {
    const standardPending = applications.filter(app => app.status === 'pending').length
    const standardApproved = applications.filter(app => app.status === 'approved').length
    const standardRejected = applications.filter(app => app.status === 'rejected').length
    
    // Počítej pouze PPC inzerenty kteří nejsou v applications (aby se nepočítali dvakrát)
    const ppcPending = advertisers.filter(adv => 
      adv.status === 'pending' && 
      !applications.some(app => app.id === adv.id)
    ).length
    // OPRAVA: Počítej jak 'approved' tak 'active' firmy jako schválené
    const ppcApproved = advertisers.filter(adv => 
      (adv.status === 'approved' || adv.status === 'active') && 
      !applications.some(app => app.id === adv.id)
    ).length
    const ppcRejected = advertisers.filter(adv => 
      adv.status === 'rejected' && 
      !applications.some(app => app.id === adv.id)
    ).length
    const ppcCancelled = advertisers.filter(adv => 
      adv.status === 'cancelled' && 
      !applications.some(app => app.id === adv.id)
    ).length
    
    setStats({
      totalPending: standardPending + ppcPending,
      totalApproved: standardApproved + ppcApproved,
      totalRejected: standardRejected + ppcRejected,
      totalCancelled: ppcCancelled
    })
  }

  // Aktualizace statistik když se změní data
  useEffect(() => {
    updateStatsWithAdvertisers(applications, advertisers)
  }, [applications, advertisers])

  useEffect(() => {
    loadApplications()
    loadAllProducts()
    loadAdvertisers()
  }, [])

  // Filtrování aplikací podle aktivního tabu a vyhledávání
  const filteredApplications = applications.filter(app => {
    let matchesTab = false;
    
    // Správné mapování tab -> status
    if (activeTab === 'applications') {
      matchesTab = app.status === 'pending'
    } else if (activeTab === 'approved') {
      matchesTab = app.status === 'approved'
    } else if (activeTab === 'rejected') {
      matchesTab = app.status === 'rejected'
    }
    
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
      case 'cancelled': return 'bg-gray-200 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-3 h-3" />
      case 'approved': return <CheckIcon className="w-3 h-3" />
      case 'rejected': return <XMarkIcon className="w-3 h-3" />
      case 'cancelled': return <XMarkIcon className="w-3 h-3" />
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
                  {stats.totalPending + stats.totalApproved + stats.totalRejected}
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
                  {stats.totalPending}
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
                  {stats.totalApproved}
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
                  {stats.totalRejected}
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
              {stats.totalPending > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full text-xs">
                  {stats.totalPending}
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
                {stats.totalApproved}
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
                {stats.totalRejected}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`${
                activeTab === 'cancelled'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap`}
            >
              Zrušené firmy
              {stats.totalCancelled > 0 && (
                <span className="ml-2 bg-gray-200 text-gray-800 py-1 px-2 rounded-full text-xs">
                  {stats.totalCancelled}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Seznam aplikací */}
        <div className="divide-y divide-gray-200">
          {(filteredApplications.length === 0 && advertisers.length === 0) || 
           (filteredApplications.length === 0 && activeTab === 'applications' && advertisers.filter(adv => adv.status === 'pending').length === 0) ||
           (filteredApplications.length === 0 && activeTab === 'approved' && advertisers.filter(adv => adv.status === 'approved' || adv.status === 'active').length === 0) ||
           (filteredApplications.length === 0 && activeTab === 'rejected' && advertisers.filter(adv => adv.status === 'rejected').length === 0) ||
           (filteredApplications.length === 0 && activeTab === 'cancelled' && advertisers.filter(adv => adv.status === 'cancelled').length === 0) ? (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné aplikace</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Žádné výsledky pro vaše vyhledávání.' : 'V této kategorii nejsou žádné aplikace.'}
              </p>
            </div>
          ) : (
            <>
              {/* Filtrované aplikace - standardní žádosti */}
              {filteredApplications.map((application) => (
                <div key={application.id} className="p-6 hover:bg-gray-50 border-b">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => {
                      setSelectedApp(application);
                      findMatchedProducts(application);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900 truncate">{application.companyName}</h3>
                            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1">
                                {application.status === 'pending' && 'Čeká na schválení'}
                                {application.status === 'approved' && 'Schváleno'}
                                {application.status === 'rejected' && 'Zamítnuto'}
                              </span>
                            </span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            <span className="truncate">{application.contactPerson} ({application.businessEmail})</span>
                          </div>
                          {application.website && (
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <GlobeAltIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              <a 
                                href={application.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-500 truncate"
                              >
                                {application.website}
                              </a>
                            </div>
                          )}
                          <div className="mt-1 text-sm text-gray-500">
                            Podáno: {new Date(application.submittedAt).toLocaleDateString('cs-CZ', { 
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
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedApp(application)
                          if (application.status === 'pending') {
                            findMatchedProducts(application)
                          }
                        }}
                        className="text-purple-600 hover:text-purple-900 font-medium"
                      >
                        <EyeIcon className="w-4 h-4 inline mr-1" />
                        Detail
                      </button>
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Jen schválíme bez otevírání detailu
                              handleAction(application.id, 'approve')
                            }}
                            disabled={actionLoading === application.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <CheckIcon className="w-4 h-4 mr-1" />
                            Schválit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Jen zamítneme bez otevírání detailu
                              handleAction(application.id, 'reject')
                            }}
                            disabled={actionLoading === application.id}
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
              ))}

              {/* PPC Inzerenti - zobrazí se pouze v tab "applications" pro pending, ale pouze ti co nejsou již v applications */}
              {activeTab === 'applications' && advertisers.filter(adv => 
                adv.status === 'pending' && 
                !applications.some(app => app.id === adv.id)
              ).length > 0 && (
                <>
                  {filteredApplications.length > 0 && (
                    <div className="bg-blue-50 px-6 py-3">
                      <h4 className="text-sm font-medium text-blue-900 flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        Nové PPC Advertiser registrace
                      </h4>
                    </div>
                  )}
                  {advertisers.filter(adv => 
                    adv.status === 'pending' && 
                    !applications.some(app => app.id === adv.id)
                  ).map((advertiser) => (
                    <div key={`advertiser-${advertiser.id}`} className="p-6 bg-blue-50/30">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          const appData = {
                            id: advertiser.id,
                            companyName: advertiser.name,
                            contactPerson: advertiser.contactPerson,
                            businessEmail: advertiser.email,
                            website: advertiser.website,
                            description: advertiser.description,
                            status: 'pending',
                            submittedAt: advertiser.createdAt,
                            isPPCAdvertiser: true,
                            assignedProductId: advertiser.assignedProductId
                          } as any;
                          setSelectedApp(appData);
                          // Automaticky spustí matching podle domény pro PPC inzerenty
                          if (advertiser.website) {
                            setTimeout(() => findMatchedProductsByDomain(advertiser.website!), 100);
                          }
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <BuildingOfficeIcon className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="ml-4 flex-1 min-w-0">
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium text-gray-900 truncate">{advertiser.name}</h3>
                                {(() => {
                                  const creditStatus = getCreditStatus(advertiser);
                                  return (
                                    <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${creditStatus.color}`}>
                                      <span className="mr-1">{creditStatus.icon}</span>
                                      {creditStatus.label}
                                    </span>
                                  );
                                })()}
                                {advertiser.isVerified && (
                                  <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2" />
                                )}
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                <span className="truncate">{advertiser.contactPerson} (</span>
                                <a 
                                  href={`mailto:${advertiser.email}`}
                                  className="text-purple-600 hover:text-purple-500 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {advertiser.email}
                                </a>
                                <span>)</span>
                              </div>
                              {advertiser.website && (
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <GlobeAltIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                  <a 
                                    href={advertiser.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:text-purple-500 truncate"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {advertiser.website}
                                  </a>
                                </div>
                              )}
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <span>Registrováno: {new Date(advertiser.createdAt).toLocaleDateString('cs-CZ', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                                <span className="ml-3">Balance: ${advertiser.balance.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              // Nastavíme selectedApp před voláním handleAction
                              const appData = {
                                id: advertiser.id,
                                companyName: advertiser.name,
                                contactPerson: advertiser.contactPerson,
                                businessEmail: advertiser.email,
                                website: advertiser.website,
                                description: advertiser.description,
                                status: advertiser.status,
                                submittedAt: advertiser.createdAt,
                                isPPCAdvertiser: true,
                                assignedProductId: advertiser.assignedProductId
                              } as any;
                              setSelectedApp(appData);
                              handleAction(advertiser.id, 'approve');
                            }}
                            disabled={actionLoading === advertiser.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <CheckIcon className="w-4 h-4 mr-1" />
                            Schválit
                          </button>
                          <button
                            onClick={() => {
                              // Nastavíme selectedApp před voláním handleAction
                              const appData = {
                                id: advertiser.id,
                                companyName: advertiser.name,
                                contactPerson: advertiser.contactPerson,
                                businessEmail: advertiser.email,
                                website: advertiser.website,
                                description: advertiser.description,
                                status: advertiser.status,
                                submittedAt: advertiser.createdAt,
                                isPPCAdvertiser: true,
                                assignedProductId: advertiser.assignedProductId
                              } as any;
                              setSelectedApp(appData);
                              handleAction(advertiser.id, 'reject');
                            }}
                            disabled={actionLoading === advertiser.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            <XMarkIcon className="w-4 h-4 mr-1" />
                            Zamítnout
                          </button>
                        </div>
                      </div>
                      {advertiser.description && (
                        <div className="mt-3 ml-12">
                          <p className="text-sm text-gray-600 line-clamp-2">{advertiser.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Schválené firmy s proklikávacími podkategoriemi */}
              {activeTab === 'approved' && (
                <div className="space-y-4">
                  {/* Sub-tabs pro schválené firmy */}
                  <div className="border-b border-gray-200 bg-white rounded-lg">
                    <nav className="-mb-px flex space-x-8 px-6 pt-4" aria-label="Approved Sub-tabs">
                      <button
                        onClick={() => setApprovedSubTab('with-product')}
                        className={`${
                          approvedSubTab === 'with-product'
                            ? 'border-green-500 text-green-600 bg-green-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap rounded-t-md transition-colors`}
                      >
                        S přiřazeným produktem
                        {advertisers.filter(adv => (adv.status === 'approved' || adv.status === 'active') && adv.assignedProductId).length > 0 && (
                          <span className="ml-2 bg-green-100 text-green-800 py-1 px-2 rounded-full text-xs">
                            {advertisers.filter(adv => (adv.status === 'approved' || adv.status === 'active') && adv.assignedProductId).length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setApprovedSubTab('waiting-product')}
                        className={`${
                          approvedSubTab === 'waiting-product'
                            ? 'border-orange-500 text-orange-600 bg-orange-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap rounded-t-md transition-colors`}
                      >
                        Čekající na produkt
                        <span className="ml-2 bg-orange-100 text-orange-800 py-1 px-2 rounded-full text-xs">
                          {advertisers.filter(adv => (adv.status === 'approved' || adv.status === 'active') && !adv.assignedProductId).length}
                        </span>
                      </button>
                      <button
                        onClick={() => setApprovedSubTab('future-categories')}
                        className={`${
                          approvedSubTab === 'future-categories'
                            ? 'border-purple-500 text-purple-600 bg-purple-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap rounded-t-md transition-colors`}
                      >
                        Budoucí kategorie
                        <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                          0
                        </span>
                      </button>
                    </nav>
                  </div>

                  {/* Obsah sub-tabs */}
                  <div className="bg-white rounded-lg border">
                    {/* S přiřazeným produktem */}
                    {approvedSubTab === 'with-product' && (
                      <div>
                        {/* Schválené standardní aplikace */}
                        {filteredApplications.length > 0 && (
                          <>
                            <div className="bg-green-50 px-6 py-3 border-b">
                              <h4 className="text-sm font-medium text-green-900 flex items-center">
                                <CheckCircleIcon className="h-4 w-4 mr-2" />
                                Schválené standardní žádosti ({filteredApplications.length})
                              </h4>
                            </div>
                            {filteredApplications.map((application) => (
                              <div key={application.id} className="p-6 hover:bg-gray-50 border-b last:border-b-0">
                                <div 
                                  className="flex items-center justify-between cursor-pointer"
                                  onClick={() => {
                                    setSelectedApp(application);
                                    findMatchedProducts(application);
                                  }}
                                >
                                  {/* Zobrazení schválené aplikace */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0">
                                        <CheckCircleIcon className="h-8 w-8 text-green-500" />
                                      </div>
                                      <div className="ml-4 flex-1 min-w-0">
                                        <div className="flex items-center">
                                          <h3 className="text-lg font-medium text-gray-900 truncate">{application.companyName}</h3>
                                          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckIcon className="w-3 h-3 mr-1" />
                                            Schváleno
                                          </span>
                                        </div>
                                        <div className="mt-1 flex items-center text-sm text-gray-500">
                                          <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                          <span className="truncate">{application.contactPerson} (</span>
                                          <a 
                                            href={`mailto:${application.businessEmail}`}
                                            className="text-purple-600 hover:text-purple-500 hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {application.businessEmail}
                                          </a>
                                          <span>)</span>
                                        </div>
                                        {application.website && (
                                          <div className="mt-1 flex items-center text-sm text-gray-500">
                                            <GlobeAltIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                            <a 
                                              href={application.website} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-purple-600 hover:text-purple-500 truncate"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {application.website}
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}

                        {/* PPC Advertiseři s produktem */}
                        {advertisers.filter(adv => (adv.status === 'approved' || adv.status === 'active') && adv.assignedProductId).length > 0 && (
                          <>
                            <div className="bg-green-50 px-6 py-3 border-b">
                              <h4 className="text-sm font-medium text-green-900 flex items-center">
                                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                                PPC Advertiseři s přiřazeným produktem ({advertisers.filter(adv => (adv.status === 'approved' || adv.status === 'active') && adv.assignedProductId).length})
                              </h4>
                            </div>
                            {advertisers.filter(adv => (adv.status === 'approved' || adv.status === 'active') && adv.assignedProductId).map((advertiser) => (
                              <div key={`approved-advertiser-${advertiser.id}`} className="p-6 hover:bg-gray-50 border-b last:border-b-0">
                                <div 
                                  className="flex items-center justify-between cursor-pointer"
                                  onClick={() => {
                                    const appData = {
                                      id: advertiser.id,
                                      companyName: advertiser.name,
                                      contactPerson: advertiser.contactPerson,
                                      businessEmail: advertiser.email,
                                      website: advertiser.website,
                                      description: advertiser.description,
                                      status: 'approved',
                                      submittedAt: advertiser.createdAt,
                                      isPPCAdvertiser: true,
                                      assignedProductId: advertiser.assignedProductId
                                    } as any;
                                    setSelectedApp(appData);
                                    // Automaticky spustí matching podle domény pro PPC inzerenty
                                    if (advertiser.website) {
                                      setTimeout(() => findMatchedProductsByDomain(advertiser.website!), 100);
                                    }
                                  }}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0">
                                        <BuildingOfficeIcon className="h-8 w-8 text-green-500" />
                                      </div>
                                      <div className="ml-4 flex-1 min-w-0">
                                        <div className="flex items-center">
                                          <h3 className="text-lg font-medium text-gray-900 truncate">{advertiser.name}</h3>
                                          <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${advertiser.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            <CheckIcon className="w-3 h-3 mr-1" />
                                            {advertiser.status === 'active' ? 'Aktivní' : 'Schválen'}
                                          </span>
                                          {(() => {
                                            const creditStatus = getCreditStatus(advertiser);
                                            return (
                                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${creditStatus.color}`}>
                                                <span className="mr-1">{creditStatus.icon}</span>
                                                {creditStatus.label}
                                              </span>
                                            );
                                          })()}
                                          {advertiser.isVerified && (
                                            <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2" />
                                          )}
                                        </div>
                                        <div className="mt-1 flex items-center text-sm text-gray-500">
                                          <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                          <span className="truncate">{advertiser.contactPerson} (</span>
                                          <a 
                                            href={`mailto:${advertiser.email}`}
                                            className="text-purple-600 hover:text-purple-500 hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {advertiser.email}
                                          </a>
                                          <span>)</span>
                                        </div>
                                        {advertiser.website && (
                                          <div className="mt-1 flex items-center text-sm text-gray-500">
                                            <GlobeAltIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                            <a 
                                              href={advertiser.website} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-purple-600 hover:text-purple-500 truncate"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {advertiser.website}
                                            </a>
                                          </div>
                                        )}
                                        <div className="mt-1 flex items-center text-sm text-gray-500">
                                          <span>Registrováno: {new Date(advertiser.createdAt).toLocaleDateString('cs-CZ', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}</span>
                                          <span className="ml-3">Balance: ${advertiser.balance.toFixed(2)}</span>
                                        </div>
                                        {/* Zobrazení přiřazeného produktu */}
                                        {advertiser.assignedProductId && (() => {
                                          const assignedProduct = allProducts.find((p: Product) => p.id === advertiser.assignedProductId);
                                          return assignedProduct ? (
                                            <div className="mt-1 flex items-center text-sm text-blue-600">
                                              <CubeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                              <span className="font-medium">Přiřazený produkt: </span>
                                              <Link
                                                href={`/admin/products/${assignedProduct.id}/edit`}
                                                className="ml-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                {assignedProduct.name}
                                              </Link>
                                            </div>
                                          ) : (
                                            <div className="mt-1 flex items-center text-sm text-gray-500">
                                              <ExclamationTriangleIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-orange-500" />
                                              <span>Přiřazený produkt nebyl nalezen (ID: {advertiser.assignedProductId})</span>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                    <span className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-800 bg-green-100">
                                      <CheckIcon className="w-4 h-4 mr-1" />
                                      Aktivní
                                    </span>
                                    <button
                                      onClick={() => {
                                        setSelectedApp({
                                          id: advertiser.id,
                                          companyName: advertiser.name,
                                          contactPerson: advertiser.contactPerson,
                                          businessEmail: advertiser.email,
                                          website: advertiser.website,
                                          description: advertiser.description,
                                          status: 'approved',
                                          submittedAt: advertiser.createdAt,
                                          isPPCAdvertiser: true,
                                          assignedProductId: advertiser.assignedProductId
                                        } as any)
                                        handleAction(advertiser.id, 'cancel')
                                      }}
                                      disabled={actionLoading === advertiser.id}
                                      className="inline-flex items-center px-3 py-1 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                    >
                                      <XMarkIcon className="w-4 h-4 mr-1" />
                                      Zrušit
                                    </button>
                                  </div>
                                </div>
                                {advertiser.description && (
                                  <div className="mt-3 ml-12">
                                    <p className="text-sm text-gray-600 line-clamp-2">{advertiser.description}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </>
                        )}

                        {/* Prázdný stav */}
                        {filteredApplications.length === 0 && advertisers.filter(adv => (adv.status === 'approved' || adv.status === 'active') && adv.assignedProductId).length === 0 && (
                          <div className="text-center py-12">
                            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné firmy s přiřazeným produktem</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Zde se zobrazí schválené firmy, které mají přiřazený produkt.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Čekající na produkt */}
                    {approvedSubTab === 'waiting-product' && (
                      <div>
                        {/* PPC Advertiseři bez produktu */}
                        {advertisers.filter(adv => (adv.status === 'approved' || adv.status === 'active') && !adv.assignedProductId).length > 0 ? (
                          <>
                            <div className="bg-orange-50 px-6 py-3 border-b">
                              <h4 className="text-sm font-medium text-orange-900 flex items-center">
                                <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                                PPC Advertiseři čekající na přiřazení produktu ({advertisers.filter(adv => (adv.status === 'approved' || adv.status === 'active') && !adv.assignedProductId).length})
                              </h4>
                            </div>
                            {advertisers.filter(adv => (adv.status === 'approved' || adv.status === 'active') && !adv.assignedProductId).map((advertiser) => (
                              <div key={`waiting-advertiser-${advertiser.id}`} className="p-6 hover:bg-gray-50 border-b last:border-b-0">
                                <div 
                                  className="flex items-center justify-between cursor-pointer"
                                  onClick={() => {
                                    const appData = {
                                      id: advertiser.id,
                                      companyName: advertiser.name,
                                      contactPerson: advertiser.contactPerson,
                                      businessEmail: advertiser.email,
                                      website: advertiser.website,
                                      description: advertiser.description,
                                      status: 'approved',
                                      submittedAt: advertiser.createdAt,
                                      isPPCAdvertiser: true,
                                      assignedProductId: advertiser.assignedProductId
                                    } as any;
                                    setSelectedApp(appData);
                                    // Automaticky spustí matching podle domény pro PPC inzerenty
                                    if (advertiser.website) {
                                      setTimeout(() => findMatchedProductsByDomain(advertiser.website!), 100);
                                    }
                                  }}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0">
                                        <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
                                      </div>
                                      <div className="ml-4 flex-1 min-w-0">
                                        <div className="flex items-center">
                                          <h3 className="text-lg font-medium text-gray-900 truncate">{advertiser.name}</h3>
                                          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                                            Čeká na produkt
                                          </span>
                                          {(() => {
                                            const creditStatus = getCreditStatus(advertiser);
                                            return (
                                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${creditStatus.color}`}>
                                                <span className="mr-1">{creditStatus.icon}</span>
                                                {creditStatus.label}
                                              </span>
                                            );
                                          })()}
                                          {advertiser.isVerified && (
                                            <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2" />
                                          )}
                                        </div>
                                        <div className="mt-1 flex items-center text-sm text-gray-500">
                                          <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                          <span className="truncate">{advertiser.contactPerson} (</span>
                                          <a 
                                            href={`mailto:${advertiser.email}`}
                                            className="text-purple-600 hover:text-purple-500 hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {advertiser.email}
                                          </a>
                                          <span>)</span>
                                        </div>
                                        {advertiser.website && (
                                          <div className="mt-1 flex items-center text-sm text-gray-500">
                                            <GlobeAltIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                            <a 
                                              href={advertiser.website} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-purple-600 hover:text-purple-500 truncate"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {advertiser.website}
                                            </a>
                                          </div>
                                        )}
                                        <div className="mt-1 flex items-center text-sm text-gray-500">
                                          <span>Registrováno: {new Date(advertiser.createdAt).toLocaleDateString('cs-CZ', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}</span>
                                          <span className="ml-3">Balance: ${advertiser.balance.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {advertiser.description && (
                                  <div className="mt-3 ml-12">
                                    <p className="text-sm text-gray-600 line-clamp-2">{advertiser.description}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-center py-12">
                            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-orange-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Žádní advertiseři nečekají na produkt</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Všichni schválení PPC advertiseři mají již přiřazený produkt.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Budoucí kategorie */}
                    {approvedSubTab === 'future-categories' && (
                      <div className="text-center py-12">
                        <CogIcon className="mx-auto h-12 w-12 text-purple-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Připraveno pro budoucí rozšíření</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Systém je připraven na další typy kategorizace firem podle business potřeb.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Zamítnuté PPC Inzerenti - zobrazí se v tab "rejected" */}
              {activeTab === 'rejected' && advertisers.filter(adv => adv.status === 'rejected').length > 0 && (
                <>
                  {filteredApplications.length > 0 && (
                    <div className="bg-red-50 px-6 py-3">
                      <h4 className="text-sm font-medium text-red-900 flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        Zamítnutí PPC Advertiseři
                      </h4>
                    </div>
                  )}
                  {advertisers.filter(adv => adv.status === 'rejected').map((advertiser) => (
                    <div key={`rejected-advertiser-${advertiser.id}`} className="p-6 bg-red-50/30">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          const appData = {
                            id: advertiser.id,
                            companyName: advertiser.name,
                            contactPerson: advertiser.contactPerson,
                            businessEmail: advertiser.email,
                            website: advertiser.website,
                            description: advertiser.description,
                            status: 'rejected',
                            submittedAt: advertiser.createdAt,
                            isPPCAdvertiser: true,
                            assignedProductId: advertiser.assignedProductId
                          } as any;
                          setSelectedApp(appData);
                          // Automaticky spustí matching podle domény pro PPC inzerenty
                          if (advertiser.website) {
                            setTimeout(() => findMatchedProductsByDomain(advertiser.website!), 100);
                          }
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <BuildingOfficeIcon className="h-8 w-8 text-red-500" />
                            </div>
                            <div className="ml-4 flex-1 min-w-0">
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium text-gray-900 truncate">{advertiser.name}</h3>
                                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <XMarkIcon className="w-3 h-3 mr-1" />
                                  Zamítnuto
                                </span>
                                {(() => {
                                  const creditStatus = getCreditStatus(advertiser);
                                  return (
                                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${creditStatus.color}`}>
                                      <span className="mr-1">{creditStatus.icon}</span>
                                      {creditStatus.label}
                                    </span>
                                  );
                                })()}
                                {advertiser.isVerified && (
                                  <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2" />
                                )}
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                <span className="truncate">{advertiser.contactPerson} (</span>
                                <a 
                                  href={`mailto:${advertiser.email}`}
                                  className="text-purple-600 hover:text-purple-500 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {advertiser.email}
                                </a>
                                <span>)</span>
                              </div>
                              {advertiser.website && (
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <GlobeAltIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                  <a 
                                    href={advertiser.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:text-purple-500 truncate"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {advertiser.website}
                                  </a>
                                </div>
                              )}
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <span>Registrováno: {new Date(advertiser.createdAt).toLocaleDateString('cs-CZ', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                                <span className="ml-3">Balance: ${advertiser.balance.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              // Nastavíme selectedApp před voláním handleAction
                              const appData = {
                                id: advertiser.id,
                                companyName: advertiser.name,
                                contactPerson: advertiser.contactPerson,
                                businessEmail: advertiser.email,
                                website: advertiser.website,
                                description: advertiser.description,
                                status: advertiser.status,
                                submittedAt: advertiser.createdAt,
                                isPPCAdvertiser: true,
                                assignedProductId: advertiser.assignedProductId
                              } as any;
                              setSelectedApp(appData);
                              handleAction(advertiser.id, 'approve');
                            }}
                            disabled={actionLoading === advertiser.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <CheckIcon className="w-4 h-4 mr-1" />
                            Schválit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Opravdu chcete trvale smazat tuto firmu? Tato akce je nevratná.')) {
                                // Nastavíme selectedApp před voláním handleAction
                                const appData = {
                                  id: advertiser.id,
                                  companyName: advertiser.name,
                                  contactPerson: advertiser.contactPerson,
                                  businessEmail: advertiser.email,
                                  website: advertiser.website,
                                  description: advertiser.description,
                                  status: advertiser.status,
                                  submittedAt: advertiser.createdAt,
                                  isPPCAdvertiser: true,
                                  assignedProductId: advertiser.assignedProductId
                                } as any;
                                setSelectedApp(appData);
                                handleAction(advertiser.id, 'delete');
                              }
                            }}
                            disabled={actionLoading === advertiser.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            <XMarkIcon className="w-4 h-4 mr-1" />
                            Smazat
                          </button>
                        </div>
                      </div>
                      {advertiser.description && (
                        <div className="mt-3 ml-12">
                          <p className="text-sm text-gray-600 line-clamp-2">{advertiser.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Zrušené PPC Inzerenti - nový tab */}
              {activeTab === 'cancelled' && advertisers.filter(adv => adv.status === 'cancelled').length > 0 && (
                <>
                  <div className="bg-gray-50 px-6 py-3">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                      Zrušené PPC firmy
                    </h4>
                  </div>
                  {advertisers.filter(adv => adv.status === 'cancelled').map((advertiser) => (
                    <div key={`cancelled-advertiser-${advertiser.id}`} className="p-6 bg-gray-50/60">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <BuildingOfficeIcon className="h-8 w-8 text-gray-500" />
                            </div>
                            <div className="ml-4 flex-1 min-w-0">
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium text-gray-900 truncate">{advertiser.name}</h3>
                                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                                  <XMarkIcon className="w-3 h-3 mr-1" />
                                  Zrušeno
                                </span>
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                <span className="truncate">{advertiser.contactPerson} (</span>
                                <a href={`mailto:${advertiser.email}`} className="text-purple-600 hover:text-purple-500 hover:underline">
                                  {advertiser.email}
                                </a>
                                <span>)</span>
                              </div>
                              {advertiser.website && (
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <GlobeAltIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                  <a href={advertiser.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-500 truncate">
                                    {advertiser.website}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const name = advertiser.name
                              if (!confirm(`Obnovit zrušenou firmu "${name}"?`)) return
                              if (!confirm('Opravdu chcete obnovit? Stav se změní na Schváleno.')) return
                              setSelectedApp({
                                id: advertiser.id,
                                companyName: advertiser.name,
                                contactPerson: advertiser.contactPerson,
                                businessEmail: advertiser.email,
                                website: advertiser.website,
                                description: advertiser.description,
                                status: 'cancelled',
                                submittedAt: advertiser.createdAt,
                                isPPCAdvertiser: true,
                                assignedProductId: advertiser.assignedProductId
                              } as any)
                              handleAction(advertiser.id, 'restore')
                            }}
                            className="inline-flex items-center px-3 py-1 border border-green-200 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckIcon className="w-4 h-4 mr-1" />
                            Obnovit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApp({
                                id: advertiser.id,
                                companyName: advertiser.name,
                                contactPerson: advertiser.contactPerson,
                                businessEmail: advertiser.email,
                                website: advertiser.website,
                                description: advertiser.description,
                                status: 'cancelled',
                                submittedAt: advertiser.createdAt,
                                isPPCAdvertiser: true,
                                assignedProductId: advertiser.assignedProductId
                              } as any)
                            }}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
                  {filteredApplications.length > 0 && (
                    <div className="bg-red-50 px-6 py-3">
                      <h4 className="text-sm font-medium text-red-900 flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        Zamítnutí PPC Advertiseři
                      </h4>
                    </div>
                  )}
                  {advertisers.filter(adv => adv.status === 'rejected').map((advertiser) => (
                    <div key={`rejected-advertiser-${advertiser.id}`} className="p-6 bg-red-50/30">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          const appData = {
                            id: advertiser.id,
                            companyName: advertiser.name,
                            contactPerson: advertiser.contactPerson,
                            businessEmail: advertiser.email,
                            website: advertiser.website,
                            description: advertiser.description,
                            status: 'rejected',
                            submittedAt: advertiser.createdAt,
                            isPPCAdvertiser: true,
                            assignedProductId: advertiser.assignedProductId
                          } as any;
                          setSelectedApp(appData);
                          // Automaticky spustí matching podle domény pro PPC inzerenty
                          if (advertiser.website) {
                            setTimeout(() => findMatchedProductsByDomain(advertiser.website!), 100);
                          }
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <BuildingOfficeIcon className="h-8 w-8 text-red-500" />
                            </div>
                            <div className="ml-4 flex-1 min-w-0">
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium text-gray-900 truncate">{advertiser.name}</h3>
                                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <XMarkIcon className="w-3 h-3 mr-1" />
                                  Zamítnuto
                                </span>
                                {(() => {
                                  const creditStatus = getCreditStatus(advertiser);
                                  return (
                                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${creditStatus.color}`}>
                                      <span className="mr-1">{creditStatus.icon}</span>
                                      {creditStatus.label}
                                    </span>
                                  );
                                })()}
                                {advertiser.isVerified && (
                                  <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2" />
                                )}
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                <span className="truncate">{advertiser.contactPerson} (</span>
                                <a 
                                  href={`mailto:${advertiser.email}`}
                                  className="text-purple-600 hover:text-purple-500 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {advertiser.email}
                                </a>
                                <span>)</span>
                              </div>
                              {advertiser.website && (
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <GlobeAltIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                  <a 
                                    href={advertiser.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:text-purple-500 truncate"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {advertiser.website}
                                  </a>
                                </div>
                              )}
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <span>Registrováno: {new Date(advertiser.createdAt).toLocaleDateString('cs-CZ', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                                <span className="ml-3">Balance: ${advertiser.balance.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              // Nastavíme selectedApp před voláním handleAction
                              const appData = {
                                id: advertiser.id,
                                companyName: advertiser.name,
                                contactPerson: advertiser.contactPerson,
                                businessEmail: advertiser.email,
                                website: advertiser.website,
                                description: advertiser.description,
                                status: advertiser.status,
                                submittedAt: advertiser.createdAt,
                                isPPCAdvertiser: true,
                                assignedProductId: advertiser.assignedProductId
                              } as any;
                              setSelectedApp(appData);
                              handleAction(advertiser.id, 'approve');
                            }}
                            disabled={actionLoading === advertiser.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <CheckIcon className="w-4 h-4 mr-1" />
                            Schválit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Opravdu chcete trvale smazat tuto firmu? Tato akce je nevratná.')) {
                                // Nastavíme selectedApp před voláním handleAction
                                const appData = {
                                  id: advertiser.id,
                                  companyName: advertiser.name,
                                  contactPerson: advertiser.contactPerson,
                                  businessEmail: advertiser.email,
                                  website: advertiser.website,
                                  description: advertiser.description,
                                  status: advertiser.status,
                                  submittedAt: advertiser.createdAt,
                                  isPPCAdvertiser: true,
                                  assignedProductId: advertiser.assignedProductId
                                } as any;
                                setSelectedApp(appData);
                                handleAction(advertiser.id, 'delete');
                              }
                            }}
                            disabled={actionLoading === advertiser.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            <XMarkIcon className="w-4 h-4 mr-1" />
                            Smazat
                          </button>
                        </div>
                      </div>
                      {advertiser.description && (
                        <div className="mt-3 ml-12">
                          <p className="text-sm text-gray-600 line-clamp-2">{advertiser.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
        </div>
      </div>

      {/* Modal pro detail */}
      {selectedApp && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedApp.isPPCAdvertiser ? 'Detail PPC Inzerenta' : 'Detail firemní žádosti'}
                </h3>
                {selectedApp.isPPCAdvertiser && (() => {
                  // Najdeme advertiser data pro zobrazení kreditu
                  const advertiser = advertisers.find(adv => adv.id === selectedApp.id);
                  if (!advertiser) return null;
                  
                  const creditStatus = getCreditStatus(advertiser);
                  return (
                    <div className="ml-3 flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🏢 PPC Inzerent
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${creditStatus.color}`}>
                        <span className="mr-1">{creditStatus.icon}</span>
                        {creditStatus.label}
                      </span>
                    </div>
                  );
                })()}
              </div>
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
                  <a 
                    href={`mailto:${selectedApp.businessEmail}`}
                    className="mt-1 text-sm text-purple-600 hover:text-purple-500 hover:underline"
                  >
                    {selectedApp.businessEmail}
                  </a>
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

                {/* Dropdown s produkty pro pending aplikace (jen pro standardní aplikace) */}
                {selectedApp.status === 'pending' && !selectedApp.isPPCAdvertiser && (
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
                      {allProducts.map(product => {
                        // Zkontroluj jestli už je produkt přiřazený k jiné firmě
                        const isAlreadyAssigned = advertisers.some(adv => 
                          adv.assignedProductId === product.id && 
                          (adv.status === 'approved' || adv.status === 'active')
                        )
                        
                        return (
                          <option 
                            key={product.id} 
                            value={product.id}
                            disabled={isAlreadyAssigned}
                            style={isAlreadyAssigned ? { color: '#9CA3AF', backgroundColor: '#F3F4F6' } : {}}
                          >
                            {product.name} {product.category ? `(${product.category})` : ''}
                            {isAlreadyAssigned ? ' - ⚠️ Již přiřazeno' : ''}
                          </option>
                        )
                      })}
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

                {/* Dropdown s produkty pro PPC inzerenty (pending i approved) */}
                {selectedApp.isPPCAdvertiser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedApp.status === 'pending' ? 'Přiřadit produkt před schválením' : 'Správa přiřazeného produktu'}
                    </label>
                    
                    {/* Automaticky nalezené produkty */}
                    {matchedProducts.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-2">
                          🔍 Produkty se shodnou doménou ({selectedApp.website}):
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
                      <option value="">-- Vyberte existující produkt --</option>
                      {allProducts.map(product => {
                        // Zkontroluj jestli už je produkt přiřazený k jiné firmě (ale ne k aktuální)
                        const isAlreadyAssigned = advertisers.some(adv => 
                          adv.assignedProductId === product.id && 
                          (adv.status === 'approved' || adv.status === 'active') &&
                          adv.id !== selectedApp?.id // Nevylučuj aktuální firmu
                        )
                        
                        return (
                          <option 
                            key={product.id} 
                            value={product.id}
                            disabled={isAlreadyAssigned}
                            style={isAlreadyAssigned ? { color: '#9CA3AF', backgroundColor: '#F3F4F6' } : {}}
                          >
                            {product.name} {product.category ? `(${product.category})` : ''}
                            {isAlreadyAssigned ? ' - ⚠️ Již přiřazeno' : ''}
                          </option>
                        )
                      })}
                      <option value="CREATE_NEW">+ Založit nový produkt</option>
                    </select>

                    {selectedProductId && selectedProductId !== 'CREATE_NEW' && (
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

                    {selectedProductId === 'CREATE_NEW' && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                          <p className="text-sm text-yellow-800">
                            <strong>Nový produkt bude potřeba vytvořit:</strong>
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>• Název: {selectedApp.companyName}</p>
                          <p>• URL: {selectedApp.website}</p>
                          <p>• Popis: {selectedApp.description || 'Bude potřeba doplnit'}</p>
                        </div>
                        <p className="mt-2 text-xs text-yellow-600">
                          Po schválení firma obdrží instrukce pro dokončení profilu produktu.
                        </p>
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

            {/* Akční tlačítka */}
            {selectedApp.isPPCAdvertiser ? (
              // Tlačítka pro PPC inzerenty
              selectedApp.status === 'pending' ? (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => handleAction(selectedApp.id, 'reject')}
                    disabled={actionLoading === selectedApp.id}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    {actionLoading === selectedApp.id ? 'Mažu...' : 'Smazat firmu'}
                  </button>
                  <button
                    onClick={() => {
                      const productInfo = selectedProductId === 'CREATE_NEW' 
                        ? 'Nový produkt bude vytvořen'
                        : selectedProductId 
                          ? `Přiřazen produkt: ${allProducts.find(p => p.id === selectedProductId)?.name || 'Neznámý'}`
                          : 'Schváleno bez přiřazeného produktu (vyžaduje další akci)';
                      handleAction(selectedApp.id, 'approve', productInfo);
                    }}
                    disabled={actionLoading === selectedApp.id}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {actionLoading === selectedApp.id ? 'Schvaluji...' : (
                      selectedProductId === 'CREATE_NEW' ? 'Schválit + Vytvořit produkt' :
                      selectedProductId ? 'Schválit + Přiřadit produkt' :
                      'Schválit (bez produktu)'
                    )}
                  </button>
                </div>
              ) : (
                // Pro approved PPC inzerenty – správa produktu + možnost zrušit
                <div className="mt-6 flex justify-end space-x-3">
                  <div className="flex items-center text-sm text-gray-500">
                    {selectedApp.assignedProductId ? (() => {
                      const assignedProduct = allProducts.find((p: Product) => p.id === selectedApp.assignedProductId);
                      return assignedProduct ? (
                        <div className="flex items-center">
                          <CubeIcon className="w-4 h-4 mr-1 text-blue-500" />
                          <span className="mr-1">Přiřazen produkt:</span>
                                                     <Link
                             href={`/admin/products/${assignedProduct.id}/edit`}
                             className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                           >
                             {assignedProduct.name}
                           </Link>
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-500">
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          <span>Přiřazený produkt nebyl nalezen (ID: {selectedApp.assignedProductId})</span>
                        </div>
                      );
                    })() : (
                      <div className="flex items-center text-gray-500">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        <span>Žádný produkt není přiřazen</span>
                      </div>
                    )}
                  </div>
                  {selectedProductId && selectedProductId !== 'CREATE_NEW' && (
                    <button
                      onClick={() => handleAssignProduct(selectedApp.id)}
                      disabled={actionLoading === selectedApp.id}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      {actionLoading === selectedApp.id ? 'Přiřazuji...' : 'Přiřadit produkt'}
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(selectedApp.id, 'cancel')}
                    disabled={actionLoading === selectedApp.id}
                    className="inline-flex items-center px-3 py-1 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {actionLoading === selectedApp.id ? 'Ruším...' : 'Zrušit schválení'}
                  </button>
                </div>
              )
            ) : (
              // Tlačítka pro standardní aplikace
              selectedApp.status === 'pending' && (
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
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}