'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  BuildingOfficeIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface Company {
  id: number
  name: string
  email: string
  phone: string
  website: string
  description: string
  logo?: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  registeredAt: string
  approvedAt?: string
  lastActive: string
  products: number
  contactPerson: string
  address: string
}

export default function CompaniesAdmin() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Mock data firem
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: 1,
      name: 'TechCorp s.r.o.',
      email: 'info@techcorp.cz',
      phone: '+420 123 456 789',
      website: 'https://techcorp.cz',
      description: 'Vývoj AI nástrojů pro enterprise segment',
      logo: 'https://via.placeholder.com/64x64/3B82F6/FFFFFF?text=TC',
      status: 'pending',
      registeredAt: '2024-01-25',
      lastActive: '2024-01-25',
      products: 0,
      contactPerson: 'Jan Novák',
      address: 'Praha 1, Václavské náměstí 1'
    },
    {
      id: 2,
      name: 'AI Solutions Ltd.',
      email: 'contact@aisolutions.com',
      phone: '+420 987 654 321',
      website: 'https://aisolutions.com',
      description: 'Poskytujeme AI řešení pro malé a střední firmy',
      logo: 'https://via.placeholder.com/64x64/10B981/FFFFFF?text=AI',
      status: 'approved',
      registeredAt: '2024-01-20',
      approvedAt: '2024-01-22',
      lastActive: '2024-01-24',
      products: 3,
      contactPerson: 'Sarah Johnson',
      address: 'Brno, Náměstí Svobody 10'
    },
    {
      id: 3,
      name: 'DataMine Analytics',
      email: 'hello@datamine.cz',
      phone: '+420 555 123 456',
      website: 'https://datamine.cz',
      description: 'Analytické nástroje a business intelligence',
      logo: 'https://via.placeholder.com/64x64/8B5CF6/FFFFFF?text=DM',
      status: 'approved',
      registeredAt: '2024-01-15',
      approvedAt: '2024-01-16',
      lastActive: '2024-01-23',
      products: 5,
      contactPerson: 'Marie Svobodová',
      address: 'Ostrava, Stodolní 15'
    },
    {
      id: 4,
      name: 'ScamBot Inc.',
      email: 'scam@suspicious.com',
      phone: '+1 000 000 0000',
      website: 'https://suspicious-ai.com',
      description: 'Suspicious AI tools with unrealistic claims',
      status: 'rejected',
      registeredAt: '2024-01-24',
      lastActive: '2024-01-24',
      products: 0,
      contactPerson: 'Suspicious Person',
      address: 'Unknown location'
    },
    {
      id: 5,
      name: 'AutoFlow Systems',
      email: 'info@autoflow.cz',
      phone: '+420 444 555 666',
      website: 'https://autoflow.cz',
      description: 'Automatizace procesů pomocí AI',
      logo: 'https://via.placeholder.com/64x64/F59E0B/FFFFFF?text=AF',
      status: 'suspended',
      registeredAt: '2024-01-10',
      approvedAt: '2024-01-12',
      lastActive: '2024-01-18',
      products: 2,
      contactPerson: 'Tomáš Dvořák',
      address: 'Plzeň, Náměstí Republiky 5'
    }
  ])

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'suspended':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckIcon className="w-4 h-4 text-green-600" />
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-600" />
      case 'rejected':
        return <XMarkIcon className="w-4 h-4 text-red-600" />
      case 'suspended':
        return <ExclamationTriangleIcon className="w-4 h-4 text-gray-600" />
      default:
        return null
    }
  }

  const handleApprove = (companyId: number) => {
    setCompanies(companies.map(company => 
      company.id === companyId 
        ? { ...company, status: 'approved' as const, approvedAt: new Date().toISOString().split('T')[0] }
        : company
    ))
  }

  const handleReject = (companyId: number) => {
    if (confirm('Opravdu chcete zamítnout tuto firmu?')) {
      setCompanies(companies.map(company => 
        company.id === companyId 
          ? { ...company, status: 'rejected' as const }
          : company
      ))
    }
  }

  const handleSuspend = (companyId: number) => {
    if (confirm('Opravdu chcete pozastavit tuto firmu?')) {
      setCompanies(companies.map(company => 
        company.id === companyId 
          ? { ...company, status: 'suspended' as const }
          : company
      ))
    }
  }

  const handleDelete = (companyId: number) => {
    if (confirm('Opravdu chcete smazat tuto firmu? Tato akce je nevratná.')) {
      setCompanies(companies.filter(company => company.id !== companyId))
    }
  }

  const stats = {
    total: companies.length,
    approved: companies.filter(c => c.status === 'approved').length,
    pending: companies.filter(c => c.status === 'pending').length,
    rejected: companies.filter(c => c.status === 'rejected').length,
    totalProducts: companies.reduce((sum, c) => sum + c.products, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BuildingOfficeIcon className="w-8 h-8 text-purple-600" />
            Správa firem
          </h1>
          <p className="text-gray-600 mt-1">
            Schvalování, moderace a správa registrovaných firem
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkem firem</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Schválené</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Čeká na schválení</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Zamítnuté</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Produkty firem</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {stats.pending > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>{stats.pending} firem</strong> čeká na vaše schválení.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Vyhledat firmu
            </label>
            <input
              type="text"
              id="search"
              placeholder="Název firmy, email nebo kontaktní osoba..."
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
              <option value="pending">Čeká na schválení</option>
              <option value="approved">Schválené</option>
              <option value="rejected">Zamítnuté</option>
              <option value="suspended">Pozastavené</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Firma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontakt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produkty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrace
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {company.logo && (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{company.description}</div>
                        <div className="text-xs text-gray-400">{company.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <EnvelopeIcon className="w-3 h-3 mr-1" />
                        {company.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <PhoneIcon className="w-3 h-3 mr-1" />
                        {company.phone}
                      </div>
                      {company.website && (
                        <div className="flex items-center text-sm text-gray-500">
                          <GlobeAltIcon className="w-3 h-3 mr-1" />
                          <a href={company.website} target="_blank" className="hover:text-purple-600">
                            {company.website.replace('https://', '')}
                          </a>
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Kontakt: {company.contactPerson}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(company.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(company.status)}`}>
                        {company.status === 'approved' ? 'Schváleno' :
                         company.status === 'pending' ? 'Čeká na schválení' :
                         company.status === 'rejected' ? 'Zamítnuto' : 'Pozastaveno'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.products}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{company.registeredAt}</div>
                    <div className="text-xs text-gray-400">
                      Aktivní: {company.lastActive}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {company.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(company.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Schválit firmu"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(company.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Zamítnout firmu"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {company.status === 'approved' && (
                        <button
                          onClick={() => handleSuspend(company.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Pozastavit firmu"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4" />
                        </button>
                      )}

                      <Link
                        href={`/company-admin`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Zobrazit profil"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      
                      <button
                        className="text-purple-600 hover:text-purple-900"
                        title="Upravit firmu"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Smazat firmu"
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

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné firmy</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Nenalezeny žádné firmy odpovídající filtrům.'
                : 'Zatím se neregistrovala žádná firma.'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions for Pending */}
      {stats.pending > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rychlé akce</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                const pendingCompanies = companies.filter(c => c.status === 'pending')
                if (confirm(`Opravdu chcete schválit všech ${pendingCompanies.length} čekajících firem?`)) {
                  setCompanies(companies.map(company => 
                    company.status === 'pending' 
                      ? { ...company, status: 'approved' as const, approvedAt: new Date().toISOString().split('T')[0] }
                      : company
                  ))
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Schválit všechny čekající
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 