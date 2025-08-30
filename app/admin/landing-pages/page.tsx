'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useGscSummary } from './_hooks/useGscSummary'
import { GscBadge } from './_components/GscBadge'
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
  pingStatus?: 'scheduled' | 'sent' | 'failed' | 'not_scheduled'
  pingScheduledAt?: string | null
  pingSentAt?: string | null
  pingHttpStatus?: number | null
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
  return (
    <Suspense fallback={<div className="p-6">Loading landing pages…</div>}>
      <LandingPagesAdminContent />
    </Suspense>
  )
}

function compact<T>(arr: (T | null | undefined | false)[]) {
  return arr.filter(Boolean) as T[]
}

function normalizePath(p: string) {
  return (p || "").replace(/\/+$/, "") || "/"
}

function LandingPagesAdminContent() {
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
  const [pingFilter, setPingFilter] = useState<'all' | 'not_scheduled' | 'scheduled' | 'sent' | 'failed'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  
  // Bulk selection states
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  // GSC summary diagnostics (client-only)
  const { loading: gscLoading, propertyUrl, siteType, lastSyncAt, lastSyncStats, map } = useGscSummary()
  const [needsIndexingOnly, setNeedsIndexingOnly] = useState(false)


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

  // (total visits handled in TopStats component)

  function VisitsCellStyles() {
    return (
      <style jsx global>{`
        .visits-chip { display:inline-flex;align-items:center;gap:6px;padding:2px 8px;border-radius:9999px;border:1px solid #e5e7eb;background:#f9fafb;color:#111827;font-size:12px }
        .visits-chip svg { width:14px;height:14px;color:#6b7280 }
      `}</style>
    )
  }

  function VisitsCell({ slug }: { slug: string }) {
    const [range, setRange] = useState<'all' | '7d' | '28d'>('all')
    const [count, setCount] = useState<number | null>(null)
    useEffect(() => {
      const controller = new AbortController()
      const load = async () => {
        try {
          const res = await fetch(`/api/pageview/stats?path=${encodeURIComponent(`/landing/${slug}`)}&range=${range}`, { signal: controller.signal })
          if (!res.ok) return
          const data = await res.json()
          const c = data?.counts?.[`/landing/${slug}`] ?? 0
          setCount(c)
        } catch {}
      }
      load()
      return () => controller.abort()
    }, [slug, range])
    return (
      <div className="flex items-center gap-2">
        <span className="visits-chip" title={`Pageviews (${range})`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-2a3 3 0 100-6 3 3 0 000 6z"/></svg>
          {count ?? '—'}
        </span>
        <select value={range} onChange={e => setRange(e.target.value as any)} className="text-xs border rounded px-1 py-0.5">
          <option value="all">All</option>
          <option value="7d">7d</option>
          <option value="28d">28d</option>
        </select>
      </div>
    )
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
    const matchesPing = pingFilter === 'all' || (page.pingStatus || 'not_scheduled') === pingFilter
    
    return matchesSearch && matchesLanguage && matchesPing
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

  const formatDate = (d: any) => {
    const date = typeof d === 'string' ? new Date(d) : d instanceof Date ? d : null
    if (!date || isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // GSC helpers
  const kindFromStatus = (status?: string): 'error'|'not_indexed'|'queued'|'indexed'|'unknown' => {
    const s = (status || '').toLowerCase()
    if (s.includes('error')) return 'error'
    if (s === 'indexed' || s.includes('indexed')) return 'indexed'
    if (s === 'queued' || s.includes('submitted') || s.includes('queue')) return 'queued'
    if (s.includes('not') || s.includes('exclude')) return 'not_indexed'
    return 'unknown'
  }
  const severity = (k: 'error'|'not_indexed'|'queued'|'indexed'|'unknown') => (
    k === 'error' ? 0 : k === 'not_indexed' ? 1 : k === 'queued' ? 2 : k === 'indexed' ? 3 : 4
  )
  const normalizeKindToLabel = (statusRaw?: string) => {
    const s = (statusRaw || '').toLowerCase()
    if (s === 'indexed' || s.includes('indexed')) return 'indexed'
    if (s === 'queued' || s.includes('submitted') || s.includes('queue')) return 'queued'
    if (s.includes('error')) return 'error'
    if (s.includes('not') || s.includes('exclude')) return 'not_indexed'
    return '—'
  }
  const timeAgoLocal = (iso?: string | null) => {
    if (!iso) return 'Never'
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    const s = Math.floor(diff / 1000)
    if (s < 60) return `${s}s ago`
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const days = Math.floor(h / 24)
    return `${days}d ago`
  }

  return (
    <Suspense fallback={<div className="p-6">Loading landing pages…</div>}>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
              {/* Compact diagnostics right-aligned */}
              <div className="ml-4 text-sm text-gray-700 flex items-center gap-3">
                <span className="hidden sm:inline">Property:</span>
                {propertyUrl && propertyUrl.startsWith('http') ? (
                  <a href={propertyUrl} target="_blank" rel="noreferrer" className="underline break-all max-w-[260px] truncate">{propertyUrl}</a>
                ) : (
                  <code className="px-1.5 py-0.5 bg-gray-50 border border-gray-200 rounded break-all max-w-[260px] truncate">{propertyUrl || '—'}</code>
                )}
                <span className="hidden sm:inline">Type:</span>
                <span className={`px-2 py-0.5 rounded text-xs border ${siteType === 'domain' ? 'bg-violet-50 text-violet-700 border-violet-200' : siteType === 'url-prefix' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {siteType === 'domain' ? 'DOMAIN' : siteType === 'url-prefix' ? 'URL-PREFIX' : 'UNKNOWN'}
                </span>
                <span className="hidden sm:inline">Last sync:</span>
                <b>{timeAgoLocal(lastSyncAt)}</b>
              </div>
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
        {/* Visits cell component */}
        <VisitsCellStyles />
        {/* Top bar: Pages count + Total visits + Filters (one line) */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <TopStats pagesCount={filteredPages.length} />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Language</span>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="min-w-[140px] px-3 py-1.5 border rounded-md"
              >
                <option value="all">All</option>
                <option value="en">English</option>
                <option value="cs">Czech</option>
                <option value="de">German</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Ping</span>
              <select
                value={pingFilter}
                onChange={(e) => setPingFilter(e.target.value as any)}
                className="min-w-[180px] px-3 py-1.5 border rounded-md"
              >
                <option value="all">All</option>
                <option value="not_scheduled">Not scheduled</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            {/* GSC diagnostics header */}
            <div className="flex items-center gap-3 text-sm ml-auto">
              <span className="text-gray-600">GSC Property:</span>
              <code className="px-1.5 py-0.5 bg-gray-50 border border-gray-200 rounded">{propertyUrl || '—'}</code>
              <span className="text-gray-600">Site type:</span>
              <b>{siteType}</b>
              <span className="text-gray-600">Last sync:</span>
              <b>{lastSyncAt ? new Date(lastSyncAt).toLocaleString() : '—'}</b>
              <label className="inline-flex items-center gap-2 ml-4">
                <input
                  type="checkbox"
                  checked={needsIndexingOnly}
                  onChange={(e) => setNeedsIndexingOnly(e.target.checked)}
                  data-testid="gsc-needs-indexing-toggle"
                />
                <span>Needs indexing</span>
              </label>
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
            <div className="w-full">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[320px]">Ping</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[260px]">Index</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[110px]">GSC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[160px]">Visits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vytvořeno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Publikováno
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    const enriched = filteredPages.map((page) => {
                      const pathCandidates = compact([
                        `/landing/${page.slug}`,
                        `/en/landing/${page.slug}`,
                        `/cs/landing/${page.slug}`,
                      ]).map(normalizePath)
                      const sample = map[pathCandidates[0]] || map[pathCandidates[1]] || map[pathCandidates[2]]
                      const statusRaw = sample?.status || 'Unknown'
                      const kind = kindFromStatus(statusRaw)
                      return { page, statusRaw, kind, reason: sample?.reason }
                    })
                    .filter(item => {
                      if (!needsIndexingOnly) return true
                      return item.kind === 'error' || item.kind === 'not_indexed'
                    })
                    .sort((a, b) => {
                      if (!needsIndexingOnly) return 0
                      return severity(a.kind) - severity(b.kind)
                    })

                    return enriched.map(({ page, statusRaw, reason }) => (
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
                          {/* Inline actions + language chip vpravo od koše */}
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <Link href={`/landing/${page.slug}`} target="_blank" className="text-gray-400 hover:text-gray-600 p-1" title="Zobrazit">
                              <EyeIcon className="w-4 h-4" />
                            </Link>
                            <Link href={`/admin/landing-pages/${page.id}/edit`} className="text-blue-600 hover:text-blue-800 p-1" title="Upravit">
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDelete(page.id, page.title)} className="text-red-600 hover:text-red-800 p-1" title="Smazat">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] bg-blue-50 text-blue-800 border border-blue-200 ml-1">
                              {getLanguageFlag(page.language)} {page.language.toUpperCase()}
                            </span>
                          </div>
                          {page.metaDescription && (
                            <div className="text-xs text-gray-400 mt-1 max-w-md truncate">
                              {page.metaDescription}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Ping – do implementace queue neutrální stav */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-50 text-gray-700 border border-gray-200" title="Ping není naplánován">
                          — Not scheduled
                        </span>
                      </td>
                      {/* Index – placeholder pro budoucí GSC stav */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-50 text-gray-700 border border-gray-200" title="Index status zatím bez GSC">
                          Pending
                        </span>
                      </td>
                      {/* GSC Badge (immediately after Index) */}
                      <td className="px-6 py-4 whitespace-nowrap text-center w-[110px]">
                        <GscBadge status={normalizeKindToLabel(statusRaw)} reason={reason} propertyUrl={propertyUrl} siteType={siteType} lastSyncAt={lastSyncAt} lastSyncStats={lastSyncStats} />
                      </td>
                      {/* Visits – živé číslo přes /api/pageview/stats */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <VisitsCell slug={page.slug} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {formatDate((page as any).created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate((page as any).published_at)}
                      </td>
                    </tr>
                  ))
                  })()}
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
    </Suspense>
  )
}

function TopStats({ pagesCount }: { pagesCount: number }) {
  const [range, setRange] = React.useState<'all' | '7d' | '28d'>('all')
  const [total, setTotal] = React.useState<number | null>(null)
  React.useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const res = await fetch(`/api/pageview/stats?prefix=${encodeURIComponent('/landing/')}&range=${range}`,
          { signal: controller.signal })
        if (!res.ok) return
        const data = await res.json()
        setTotal(typeof data.total === 'number' ? data.total : 0)
      } catch {}
    }
    load()
    return () => controller.abort()
  }, [range])

  return (
    <div className="flex items-center gap-8 text-sm">
      <div>
        <span className="text-gray-600">Pages:</span>
        <span className="ml-2 font-semibold">{pagesCount}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-gray-600">Total visits:</span>
        <span className="font-semibold">{total ?? '—'}</span>
        <label className="flex items-center gap-2">
          <span className="text-gray-600">Range</span>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="min-w-[120px] text-sm border border-gray-300 rounded-md px-3 py-1.5"
          >
            <option value="all">All</option>
            <option value="7d">7d</option>
            <option value="28d">28d</option>
          </select>
        </label>
      </div>
    </div>
  )
}