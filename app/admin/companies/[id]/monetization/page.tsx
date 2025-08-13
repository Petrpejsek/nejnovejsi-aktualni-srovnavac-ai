'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

type RangeKey = 'today' | '7d' | '30d' | '90d' | 'all'

function CompanyMonetizationPage() {
  const params = useParams() as { id: string }
  const search = useSearchParams()
  const [tab, setTab] = useState('overview')
  const [range, setRange] = useState<RangeKey>('7d')

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'cpc', label: 'CPC' },
    { key: 'affiliate', label: 'Affiliate' },
    { key: 'configs', label: 'Link settings' },
    { key: 'billing', label: 'Billing' },
  ]

  const [companyName, setCompanyName] = useState<string>('Company')
  const [company, setCompany] = useState<any>(null)
  const [assignedProduct, setAssignedProduct] = useState<any>(null)
  const [overview, setOverview] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any>(null)
  const [billing, setBilling] = useState<any>(null)
  const [risk, setRisk] = useState<any>(null)
  const [cpcDetailed, setCpcDetailed] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  // Affiliate
  const [affiliateDetailed, setAffiliateDetailed] = useState<any>(null)
  const [convItems, setConvItems] = useState<any[]>([])
  const [convTotals, setConvTotals] = useState<any>(null)
  const [convPage, setConvPage] = useState<number>(1)
  const [convPageSize, setConvPageSize] = useState<number>(50)
  const [convTotalPages, setConvTotalPages] = useState<number>(1)
  const [convStatus, setConvStatus] = useState<string>('')
  const [convRefCode, setConvRefCode] = useState<string>('')
  const [convBilled, setConvBilled] = useState<string>('')
  const [convPaid, setConvPaid] = useState<string>('')
  const [convQuery, setConvQuery] = useState<string>('')
  const [convLoading, setConvLoading] = useState<boolean>(false)
  const [clickItems, setClickItems] = useState<any[]>([])
  const [clickPage, setClickPage] = useState<number>(1)
  const [clickTotalPages, setClickTotalPages] = useState<number>(1)
  const [clickValid, setClickValid] = useState<string>('')
  const [clickRefCode, setClickRefCode] = useState<string>('')
  const [clickLoading, setClickLoading] = useState<boolean>(false)
  const [refCodes, setRefCodes] = useState<any[]>([])
  const [newRef, setNewRef] = useState<{ ref_code: string; monetizable_type: string; monetizable_id: string; affiliate_rate?: number; affiliate_link?: string; is_active?: boolean }>({ ref_code: '', monetizable_type: 'landing', monetizable_id: '', affiliate_rate: undefined, affiliate_link: '', is_active: true })
  const [savingRef, setSavingRef] = useState<boolean>(false)
  const [webhookSettings, setWebhookSettings] = useState<any>({})
  const [savingWebhook, setSavingWebhook] = useState<boolean>(false)
  const [logs, setLogs] = useState<any[]>([])
  // Billing
  const [billingSummary, setBillingSummary] = useState<any>(null)
  const [txItems, setTxItems] = useState<any[]>([])
  const [txPage, setTxPage] = useState<number>(1)
  const [txTotalPages, setTxTotalPages] = useState<number>(1)
  const [txType, setTxType] = useState<string>('')
  const [txStatus, setTxStatus] = useState<string>('')
  const [txRange, setTxRange] = useState<RangeKey>('30d')
  const [invoiceItems, setInvoiceItems] = useState<any[]>([])
  const [invRange, setInvRange] = useState<RangeKey>('30d')
  const [invStatus, setInvStatus] = useState<string>('')
  const [invLoading, setInvLoading] = useState<boolean>(false)
  const [billingSettings, setBillingSettings] = useState<any>(null)
  const [savingBillingSettings, setSavingBillingSettings] = useState<boolean>(false)
  // Internal invoices & payouts
  const [internalInvoices, setInternalInvoices] = useState<any[]>([])
  const [internalInvRange, setInternalInvRange] = useState<RangeKey>('90d')
  const [internalInvStatus, setInternalInvStatus] = useState<string>('')
  const [internalInvLoading, setInternalInvLoading] = useState<boolean>(false)
  const [payouts, setPayouts] = useState<any[]>([])
  const [payoutsRange, setPayoutsRange] = useState<RangeKey>('90d')
  const [payoutsStatus, setPayoutsStatus] = useState<string>('')
  const [payoutsLoading, setPayoutsLoading] = useState<boolean>(false)
  // Link settings
  const [linkSettings, setLinkSettings] = useState<any>(null)
  const [savingLinkSettings, setSavingLinkSettings] = useState<boolean>(false)
  // Link builder
  const [builderEntityType, setBuilderEntityType] = useState<'landing' | 'product'>('landing')
  const [builderEntityId, setBuilderEntityId] = useState<string>('')
  const [builderRefCode, setBuilderRefCode] = useState<string>('')
  const [builderDomain, setBuilderDomain] = useState<string>('')
  const [builderSub1, setBuilderSub1] = useState<string>('')
  const [builderSub2, setBuilderSub2] = useState<string>('')
  const [builderResultUrl, setBuilderResultUrl] = useState<string>('')
  const [builderHeadStatus, setBuilderHeadStatus] = useState<number | null>(null)
  const [builderLoading, setBuilderLoading] = useState<boolean>(false)

  useEffect(() => {
    async function loadData() {
      try {
        // Company basic data
        const res = await fetch(`/api/admin/companies?companyId=${params.id}`)
        if (res.ok) {
          const js = await res.json()
          const found = js?.data?.companies?.find?.((c: any) => c.id === params.id)
          if (found) {
            setCompany(found)
            setCompanyName(found.name || params.id)
            if (found.assignedProductId) {
              try {
                const pr = await fetch(`/api/products/${found.assignedProductId}`)
                if (pr.ok) setAssignedProduct(await pr.json())
              } catch {}
            } else {
              setAssignedProduct(null)
            }
          } else {
            setCompany(null)
          }
        }

        // Parallel API calls
        const [ovRes, campRes, billRes, riskRes, cpcRes] = await Promise.all([
          fetch(`/api/admin/companies/${params.id}/monetization/overview?range=${range}`, { cache: 'no-store' }),
          fetch(`/api/admin/companies/${params.id}/campaigns/summary?range=${range}`, { cache: 'no-store' }),
          fetch(`/api/admin/companies/${params.id}/billing/summary`, { cache: 'no-store' }),
          fetch(`/api/admin/companies/${params.id}/risk?range=${range}`, { cache: 'no-store' }),
          fetch(`/api/admin/companies/${params.id}/cpc/detailed?range=${range}`, { cache: 'no-store' })
        ])

        if (ovRes.ok) setOverview(await ovRes.json())
        if (campRes.ok) setCampaigns(await campRes.json())
        if (billRes.ok) setBilling(await billRes.json())
        if (riskRes.ok) setRisk(await riskRes.json())
        if (cpcRes.ok) setCpcDetailed(await cpcRes.json())

      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, range]);

  useEffect(() => {
    if (tab !== 'affiliate') return
    async function loadAffiliate() {
      try {
        const base = `/api/admin/companies/${params.id}/affiliate`
        const detRes = await fetch(`${base}/detailed?range=${range}`, { cache: 'no-store' })
        if (detRes.ok) setAffiliateDetailed(await detRes.json()); else setAffiliateDetailed(null)

        setConvLoading(true)
        const convUrl = new URL(window.location.origin + `${base}/conversions`)
        convUrl.searchParams.set('range', range)
        convUrl.searchParams.set('page', String(convPage))
        convUrl.searchParams.set('pageSize', String(convPageSize))
        if (convStatus) convUrl.searchParams.set('status', convStatus)
        if (convRefCode) convUrl.searchParams.set('ref_code', convRefCode)
        if (convBilled) convUrl.searchParams.set('billed', convBilled)
        if (convPaid) convUrl.searchParams.set('paid', convPaid)
        if (convQuery) convUrl.searchParams.set('q', convQuery)
        const convRes = await fetch(convUrl.toString(), { cache: 'no-store' })
        if (convRes.ok) {
          const js = await convRes.json()
          setConvItems(js.items || [])
          setConvTotals(js.totals || null)
          setConvTotalPages(js.pagination?.totalPages || 1)
        } else {
          setConvItems([]); setConvTotals(null); setConvTotalPages(1)
        }
        setConvLoading(false)

        setClickLoading(true)
        const clickUrl = new URL(window.location.origin + `${base}/clicks`)
        clickUrl.searchParams.set('range', range)
        clickUrl.searchParams.set('page', String(clickPage))
        clickUrl.searchParams.set('pageSize', '50')
        if (clickValid) clickUrl.searchParams.set('valid', clickValid)
        if (clickRefCode) clickUrl.searchParams.set('ref_code', clickRefCode)
        const clickRes = await fetch(clickUrl.toString(), { cache: 'no-store' })
        if (clickRes.ok) {
          const js = await clickRes.json()
          setClickItems(js.items || [])
          setClickTotalPages(js.pagination?.totalPages || 1)
        } else { setClickItems([]); setClickTotalPages(1) }
        setClickLoading(false)

        const refRes = await fetch(`${base}/ref-codes`, { cache: 'no-store' })
        if (refRes.ok) { const js = await refRes.json(); setRefCodes(js.items || []) } else setRefCodes([])

        const whRes = await fetch(`${base}/webhook-settings`, { cache: 'no-store' })
        if (whRes.ok) { const js = await whRes.json(); setWebhookSettings(js.settings || {}) } else setWebhookSettings({})

        const logsRes = await fetch(`${base}/logs?limit=100`, { cache: 'no-store' })
        if (logsRes.ok) { const js = await logsRes.json(); setLogs(js.items || []) } else setLogs([])
      } catch (e) { console.error('Load affiliate failed', e) }
    }
    loadAffiliate()
  }, [tab, params.id, range, convPage, convPageSize, convStatus, convRefCode, convBilled, convPaid, convQuery, clickPage, clickValid, clickRefCode])

  // Load Billing when tab is billing
  useEffect(() => {
    if (tab !== 'billing') return
    (async () => {
      try {
        const sumRes = await fetch(`/api/admin/companies/${params.id}/billing/summary`, { cache: 'no-store' })
        if (sumRes.ok) setBillingSummary(await sumRes.json())
        // Load Stripe invoices
        setInvLoading(true)
        const invUrl = new URL(window.location.origin + `/api/admin/companies/${params.id}/billing/invoices/list`)
        invUrl.searchParams.set('range', invRange)
        if (invStatus) invUrl.searchParams.set('status', invStatus)
        const invRes = await fetch(invUrl.toString(), { cache: 'no-store' })
        if (invRes.ok) { const js = await invRes.json(); setInvoiceItems(js.items || []) } else { setInvoiceItems([]) }
        setInvLoading(false)
        // Load billing settings
        const setRes = await fetch(`/api/admin/companies/${params.id}/billing/settings`, { cache: 'no-store' })
        if (setRes.ok) { const js = await setRes.json(); setBillingSettings(js.settings || {}) } else setBillingSettings({})
        const txUrl = new URL(window.location.origin + `/api/admin/companies/${params.id}/billing/transactions`)
        txUrl.searchParams.set('range', txRange)
        txUrl.searchParams.set('page', String(txPage))
        if (txType) txUrl.searchParams.set('type', txType)
        if (txStatus) txUrl.searchParams.set('status', txStatus)
        const txRes = await fetch(txUrl.toString(), { cache: 'no-store' })
        if (txRes.ok) {
          const js = await txRes.json(); setTxItems(js.items || []); setTxTotalPages(js.pagination?.totalPages || 1)
        } else { setTxItems([]); setTxTotalPages(1) }
      } catch (e) { console.error('Load billing failed', e) }
    })()
  }, [tab, params.id, txRange, txPage, txType, txStatus, invRange, invStatus])

  // Load internal invoices and payouts when Billing tab is active
  useEffect(() => {
    if (tab !== 'billing') return
    (async () => {
      try {
        setInternalInvLoading(true)
        const invRes = await fetch(`/api/admin/companies/${params.id}/billing/invoices/list-internal?range=${internalInvRange}${internalInvStatus?`&status=${internalInvStatus}`:''}`, { cache: 'no-store' })
        if (invRes.ok) { const js = await invRes.json(); setInternalInvoices(js.items||[]) } else setInternalInvoices([])
        setInternalInvLoading(false)
        setPayoutsLoading(true)
        const payRes = await fetch(`/api/admin/companies/${params.id}/billing/payouts/list?range=${payoutsRange}${payoutsStatus?`&status=${payoutsStatus}`:''}`, { cache: 'no-store' })
        if (payRes.ok) { const js = await payRes.json(); setPayouts(js.items||[]) } else setPayouts([])
        setPayoutsLoading(false)
      } catch (e) { console.error('Load internal invoices/payouts failed', e) }
    })()
  }, [tab, params.id, internalInvRange, internalInvStatus, payoutsRange, payoutsStatus])

  // Load Link settings when tab active
  useEffect(() => {
    if (tab !== 'configs') return
    (async () => {
      try {
        const res = await fetch(`/api/admin/companies/${params.id}/affiliate/link-settings`, { cache: 'no-store' })
        if (res.ok) { const js = await res.json(); setLinkSettings(js.linkSettings || {}) } else setLinkSettings({})
      } catch { setLinkSettings({}) }
    })()
  }, [tab, params.id])

  // Local editing state and helpers
  const [editingBasic, setEditingBasic] = useState(false)
  const [editingFinance, setEditingFinance] = useState(false)
  const [editingProduct, setEditingProduct] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formBasic, setFormBasic] = useState({
    name: company?.name || '',
    contactPerson: company?.contactPerson || '',
    website: company?.website || '',
    description: company?.description || '',
    taxId: company?.taxId || '',
    billingAddress: company?.billingAddress || '',
    billingCountry: company?.billingCountry || '',
    status: company?.status || 'active',
  })

  const [formFinance, setFormFinance] = useState({
    autoRecharge: Boolean(company?.autoRecharge),
    autoRechargeAmount: Number(company?.autoRechargeAmount || 0),
    autoRechargeThreshold: Number(company?.autoRechargeThreshold || 0),
  })

  const [formProduct, setFormProduct] = useState({
    assignedProductId: company?.assignedProductId || ''
  })

  useEffect(() => {
    setFormBasic({
      name: company?.name || '',
      contactPerson: company?.contactPerson || '',
      website: company?.website || '',
      description: company?.description || '',
      taxId: company?.taxId || '',
      billingAddress: company?.billingAddress || '',
      billingCountry: company?.billingCountry || '',
      status: company?.status || 'active',
    })
    setFormFinance({
      autoRecharge: Boolean(company?.autoRecharge),
      autoRechargeAmount: Number(company?.autoRechargeAmount || 0),
      autoRechargeThreshold: Number(company?.autoRechargeThreshold || 0),
    })
    setFormProduct({ assignedProductId: company?.assignedProductId || '' })
  }, [company])

  const updateCompany = async (updates: Record<string, any>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: params.id, updates })
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || 'Failed to update')
      }
      await refreshCompany()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <div className="text-gray-600">Loading company data...</div>
        </div>
      </div>
    )
  }

  // Normalize webhook health object for safe rendering
  const webhookHealthObj = risk?.webhookHealth
  const webhookIsHealthy = typeof webhookHealthObj === 'object'
    ? Boolean(webhookHealthObj?.isHealthy)
    : webhookHealthObj === 'healthy'
  const webhookStatusText = typeof webhookHealthObj === 'object'
    ? (webhookHealthObj?.status ?? (webhookIsHealthy ? 'healthy' : 'unhealthy'))
    : (webhookHealthObj ?? 'unknown')
  const webhookLastCallText = (typeof webhookHealthObj === 'object' && webhookHealthObj?.lastCall)
    ? new Date(webhookHealthObj.lastCall).toLocaleString('cs-CZ')
    : null

  // Helpers
  const refreshCompany = async () => {
    try {
      const res = await fetch(`/api/admin/companies?companyId=${params.id}`, { cache: 'no-store' })
      if (res.ok) {
        const js = await res.json()
        const found = js?.data?.companies?.[0]
        if (found) {
          setCompany(found)
          setCompanyName(found.name || params.id)
        }
      }
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{companyName}</h1>
          <p className="text-gray-600 mt-1">Partner ID: {params.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Období</label>
          <select 
            value={range} 
            onChange={(e) => setRange(e.target.value as RangeKey)} 
            className="min-w-[160px] text-sm border rounded-md px-3 py-1.5"
          >
            <option value="today">Dnes</option>
            <option value="7d">7 dní</option>
            <option value="30d">30 dní</option>
            <option value="90d">90 dní</option>
            <option value="all">Max</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-100 inline-flex rounded-lg p-1">
        {tabs.map(t => (
          <button 
            key={t.key} 
            onClick={() => setTab(t.key)} 
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              tab === t.key 
                ? 'bg-white shadow text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Basic Company Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">🏢 Základní informace</h2>
              {!editingBasic ? (
                <button onClick={() => setEditingBasic(true)} className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50">Edit</button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await updateCompany(formBasic)
                      setEditingBasic(false)
                    }}
                    disabled={saving}
                    className="text-sm px-3 py-1.5 rounded-md border bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >Save</button>
                  <button onClick={() => { setEditingBasic(false); }} className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50">Cancel</button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-500">Název firmy</div>
                {editingBasic ? (
                  <input value={formBasic.name} onChange={e => setFormBasic({ ...formBasic, name: e.target.value })} className="mt-1 w-full border rounded px-3 py-1.5 text-sm" />
                ) : (
                  <div className="text-lg font-medium">{company?.name || 'N/A'}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-lg font-medium">{company?.email || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Kontakt</div>
                {editingBasic ? (
                  <input value={formBasic.contactPerson} onChange={e => setFormBasic({ ...formBasic, contactPerson: e.target.value })} className="mt-1 w-full border rounded px-3 py-1.5 text-sm" />
                ) : (
                  <div className="text-lg font-medium">{company?.contactPerson || 'N/A'}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500">Web</div>
                {editingBasic ? (
                  <input value={formBasic.website} onChange={e => setFormBasic({ ...formBasic, website: e.target.value })} className="mt-1 w-full border rounded px-3 py-1.5 text-sm" />
                ) : (
                  <div className="text-lg font-medium">
                    {company?.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {company.website}
                      </a>
                    ) : 'N/A'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500">IČO</div>
                {editingBasic ? (
                  <input value={formBasic.taxId} onChange={e => setFormBasic({ ...formBasic, taxId: e.target.value })} className="mt-1 w-full border rounded px-3 py-1.5 text-sm" />
                ) : (
                  <div className="text-lg font-medium">{company?.taxId || 'N/A'}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-lg font-medium">
                  {editingBasic ? (
                    <select value={formBasic.status} onChange={e => setFormBasic({ ...formBasic, status: e.target.value })} className="mt-1 border rounded px-3 py-1.5 text-sm">
                      <option value="active">active</option>
                      <option value="suspended">suspended</option>
                      <option value="cancelled">cancelled</option>
                      <option value="rejected">rejected</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded text-sm ${
                      company?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {company?.status || 'N/A'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500">Vytvořeno</div>
                <div className="text-lg font-medium">
                  {company?.createdAt ? new Date(company.createdAt).toLocaleDateString('cs-CZ') : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Poslední přihlášení</div>
                <div className="text-lg font-medium">
                  {company?.lastLoginAt ? new Date(company.lastLoginAt).toLocaleDateString('cs-CZ') : 'Nikdy'}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm text-gray-500">Popis</div>
              {editingBasic ? (
                <textarea value={formBasic.description} onChange={e => setFormBasic({ ...formBasic, description: e.target.value })} className="mt-1 w-full border rounded px-3 py-2 text-sm" rows={3} />
              ) : (
                <div className="text-lg font-medium mt-1">{company?.description || '—'}</div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500">Fakturační adresa</div>
                {editingBasic ? (
                  <input value={formBasic.billingAddress} onChange={e => setFormBasic({ ...formBasic, billingAddress: e.target.value })} className="mt-1 w-full border rounded px-3 py-1.5 text-sm" />
                ) : (
                  <div className="text-lg font-medium mt-1">{company?.billingAddress || '—'}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500">Země</div>
                {editingBasic ? (
                  <input value={formBasic.billingCountry} onChange={e => setFormBasic({ ...formBasic, billingCountry: e.target.value })} className="mt-1 w-full border rounded px-3 py-1.5 text-sm" />
                ) : (
                  <div className="text-lg font-medium mt-1">{company?.billingCountry || '—'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">💰 Finanční nastavení</h2>
              {!editingFinance ? (
                <button onClick={() => setEditingFinance(true)} className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50">Edit</button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await updateCompany(formFinance)
                      setEditingFinance(false)
                    }}
                    disabled={saving}
                    className="text-sm px-3 py-1.5 rounded-md border bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >Save</button>
                  <button onClick={() => setEditingFinance(false)} className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50">Cancel</button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-500">Aktuální zůstatek</div>
                <div className="text-2xl font-bold text-green-600">
                  {(company?.balance || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Celkem utraceno</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(company?.totalSpent || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Auto-dobíjení</div>
                <div className="text-lg font-medium">
                  {editingFinance ? (
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={formFinance.autoRecharge} onChange={e => setFormFinance({ ...formFinance, autoRecharge: e.target.checked })} />
                        Zapnuto
                      </label>
                    </div>
                  ) : (
                    <span className={`px-2 py-1 rounded text-sm ${
                      company?.autoRecharge ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {company?.autoRecharge ? 'Zapnuto' : 'Vypnuto'}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Částka: {editingFinance ? (
                    <input type="number" className="border rounded px-2 py-1 text-sm w-32" value={formFinance.autoRechargeAmount} onChange={e => setFormFinance({ ...formFinance, autoRechargeAmount: Number(e.target.value) })} />
                  ) : (
                    (Number(company?.autoRechargeAmount) || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Threshold: {editingFinance ? (
                    <input type="number" className="border rounded px-2 py-1 text-sm w-32" value={formFinance.autoRechargeThreshold} onChange={e => setFormFinance({ ...formFinance, autoRechargeThreshold: Number(e.target.value) })} />
                  ) : (
                    (Number(company?.autoRechargeThreshold) || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Poslední dobití</div>
                <div className="text-lg font-medium">
                  {company?.lastRechargeAt ? new Date(company.lastRechargeAt).toLocaleDateString('cs-CZ') : 'Nikdy'}
                </div>
                {company?.lastRechargeAmount && (
                  <div className="text-sm text-gray-500 mt-1">
                    Částka: {(Number(company.lastRechargeAmount) || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Product */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">📦 Přiřazený produkt</h2>
              {!editingProduct ? (
                <button onClick={() => setEditingProduct(true)} className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50">Edit</button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await updateCompany(formProduct)
                      if (formProduct.assignedProductId) {
                        const pr = await fetch(`/api/products/${formProduct.assignedProductId}`)
                        if (pr.ok) setAssignedProduct(await pr.json())
                      } else {
                        setAssignedProduct(null)
                      }
                      setEditingProduct(false)
                    }}
                    disabled={saving}
                    className="text-sm px-3 py-1.5 rounded-md border bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >Save</button>
                  <button onClick={() => setEditingProduct(false)} className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50">Cancel</button>
                </div>
              )}
            </div>
            
            {assignedProduct ? (
              <div className="flex items-center gap-4">
                {assignedProduct?.imageUrl && (
                  <img 
                    src={assignedProduct?.imageUrl} 
                    alt={assignedProduct?.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  {editingProduct ? (
                    <div className="flex items-center gap-2">
                      <input value={formProduct.assignedProductId} onChange={e => setFormProduct({ assignedProductId: e.target.value })} placeholder="Product ID" className="border rounded px-3 py-1.5 text-sm w-72" />
                      {formProduct.assignedProductId && (
                        <a href={`/admin/products/${formProduct.assignedProductId}/edit`} className="text-blue-600 text-sm hover:underline" target="_blank" rel="noreferrer">Open product</a>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-semibold">{assignedProduct?.name}</div>
                      <div className="text-sm text-gray-600">{assignedProduct?.category}</div>
                      <div className="text-sm text-gray-500 mt-1">{assignedProduct?.description}</div>
                    </>
                  )}
                  <div className="text-lg font-bold text-green-600 mt-2">
                    {(Number(assignedProduct?.price) || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Status</div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    assignedProduct?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {assignedProduct?.isActive ? 'Aktivní' : 'Neaktivní'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📦</div>
                <div className="text-lg">Žádný přiřazený produkt</div>
                <div className="text-sm">Firma nemá zatím přiřazený žádný produkt</div>
              </div>
            )}
          </div>

          {/* Campaigns Overview */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">🎯 Kampaně – přehled</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <div className="text-sm text-gray-500">Celkem kampaní</div>
                <div className="text-2xl font-bold text-gray-900">{campaigns?.totalCampaigns || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Aktivní</div>
                <div className="text-2xl font-bold text-green-600">{campaigns?.activeCampaigns || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Pozastavené</div>
                <div className="text-2xl font-bold text-orange-600">{campaigns?.pausedCampaigns || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Čekající</div>
                <div className="text-2xl font-bold text-blue-600">{campaigns?.pendingCampaigns || 0}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-500">CTR</div>
                <div className="text-lg font-bold">{campaigns?.ctr ? `${(Number(campaigns.ctr) || 0).toFixed(2)}%` : 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Dnes utraceno</div>
                <div className="text-lg font-bold text-red-600">
                  {(campaigns?.todaySpend || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Denní budget</div>
                <div className="text-lg font-bold">
                  {(campaigns?.dailyBudget || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                </div>
              </div>
            </div>

            {campaigns?.topCampaigns && campaigns.topCampaigns.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Top kampaně</h3>
                <div className="space-y-2">
                  {campaigns.topCampaigns.slice(0, 3).map((campaign: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.clicks} kliknutí</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{(Number(campaign.spend) || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}</div>
                        <div className="text-sm text-gray-500">CPC: {(Number(campaign.avgCpc) || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Billing Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">🧾 Billing</h2>
            
            <div className="mb-6">
              <div className="text-sm text-gray-500">Celkem nezaplaceno</div>
              <div className="text-2xl font-bold text-red-600">
                {(billing?.totalUnpaid || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
              </div>
            </div>

            {billing?.recentTransactions && billing.recentTransactions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Poslední transakce</h3>
                <div className="space-y-2">
                  {billing.recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{new Date(transaction.createdAt).toLocaleDateString('cs-CZ')}</div>
                        <div className="text-sm text-gray-500">{transaction.description || 'Platba'}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount.toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded text-xs ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Spend Trends */}
          {company?.spendTrends && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">📈 Spend Trends</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-500">7 dní</div>
                  <div className="text-lg font-bold">
                    {(company.spendTrends.last7Days || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">30 dní</div>
                  <div className="text-lg font-bold">
                    {(company.spendTrends.last30Days || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">90 dní</div>
                  <div className="text-lg font-bold">
                    {(company.spendTrends.last90Days || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Assessment */}
          {risk && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">⚠️ Risk Assessment</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <div className="text-sm text-gray-500">Risk Score</div>
                  <div className={`text-2xl font-bold ${
                    risk.riskScore < 30 ? 'text-green-600' : 
                    risk.riskScore < 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {risk.riskScore}/100
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Invalid Clicks</div>
                  <div className="text-lg font-bold text-red-600">{(Number(risk.invalidClicks) || 0).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Recent Conversions</div>
                  <div className="text-lg font-bold">{risk.recentConversions || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Webhook Health</div>
                  <div className="text-lg font-bold">
                    <span className={`px-2 py-1 rounded text-sm ${
                      webhookIsHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {webhookStatusText}{webhookLastCallText ? ` • ${webhookLastCallText}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {Array.isArray(risk.flags) && risk.flags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">🚩 Flags</h3>
                  <div className="space-y-2">
                    {risk.flags.map((flag: any, index: number) => {
                      const isObj = flag && typeof flag === 'object'
                      const severity = isObj ? (flag.severity || 'warning') : 'warning'
                      const styleBySeverity =
                        severity === 'high'
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : severity === 'medium'
                          ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                          : severity === 'low'
                          ? 'bg-blue-50 border-blue-200 text-blue-800'
                          : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                      const label = isObj && flag.type ? `${flag.type}: ` : ''
                      const text = isObj ? (flag.message ?? JSON.stringify(flag)) : String(flag)
                      return (
                        <div key={index} className={`p-3 rounded border ${styleBySeverity}`}>
                          <div>
                            <span className="font-medium">{label}</span>
                            {text}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">⚡ Quick Actions</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-sm font-medium">Add Credit</div>
              </button>
              <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
                <div className="text-2xl mb-1">▶️</div>
                <div className="text-sm font-medium">Resume All</div>
              </button>
              <button className="p-3 bg-red-50 hover:bg-red-100 rounded-lg text-center transition-colors">
                <div className="text-2xl mb-1">⏸️</div>
                <div className="text-sm font-medium">Pause All</div>
              </button>
              <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition-colors">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-sm font-medium">Generate Report</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CPC Tab */}
      {tab === 'cpc' && (
        <div className="space-y-6">
          {/* KPI Dashboard Header */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">📊 CPC Performance Dashboard</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <div className="text-sm text-gray-500">Total Spend</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(cpcDetailed?.kpis?.totalSpend || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Clicks</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(cpcDetailed?.kpis?.totalClicks || 0).toLocaleString('cs-CZ')}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Avg CPC</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(cpcDetailed?.kpis?.avgCpc || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Fraud Rate</div>
                <div className={`text-2xl font-bold ${
                  (cpcDetailed?.kpis?.fraudRate || 0) > 10 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {(cpcDetailed?.kpis?.fraudRate || 0).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Active Campaigns</div>
                <div className="text-2xl font-bold text-blue-600">
                  {cpcDetailed?.kpis?.activeCampaigns || 0}/{cpcDetailed?.kpis?.totalCampaigns || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spend Timeline */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">📈 Spend Timeline (14 days)</h3>
              
              {cpcDetailed?.timeline && cpcDetailed.timeline.length > 0 ? (
                <div className="space-y-2">
                  {cpcDetailed.timeline.map((day: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">{day.date}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${Math.min(100, (day.spend / Math.max(...cpcDetailed.timeline.map((d: any) => d.spend))) * 100)}%`}}
                          ></div>
                        </div>
                        <div className="text-sm font-medium w-20 text-right">
                          {day.spend.toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">📈</div>
                  <div className="text-sm">Žádná data pro timeline</div>
                </div>
              )}
            </div>

            {/* Click Quality Monitoring */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">🔍 Click Quality</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Valid Clicks</span>
                    <span>{cpcDetailed?.fraud?.validClicks || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{width: `${100 - (cpcDetailed?.kpis?.fraudRate || 0)}%`}}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Invalid Clicks</span>
                    <span className="text-red-600">{cpcDetailed?.fraud?.invalidClicks || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{width: `${cpcDetailed?.kpis?.fraudRate || 0}%`}}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 rounded">
                  <div className="text-sm font-medium text-yellow-800">Fraud Trend</div>
                  <div className="text-xs text-yellow-600 mt-1">
                    {cpcDetailed?.fraud?.trend || 'Stabilní úroveň detekce'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Campaigns Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                🎯 Campaigns Overview (Active: {cpcDetailed?.kpis?.activeCampaigns || 0})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Campaign</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ref Code</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Clicks</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Spend</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">CPC</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">CTR</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cpcDetailed?.campaigns?.length > 0 ? (
                    cpcDetailed.campaigns.map((campaign: any, index: number) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{campaign.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' : 
                            campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-blue-600">{campaign.refCode}</td>
                        <td className="px-6 py-4 text-sm">{(Number(campaign.clicks) || 0).toLocaleString('cs-CZ')}</td>
                        <td className="px-6 py-4 text-sm font-medium">{(Number(campaign.spend) || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}</td>
                        <td className="px-6 py-4 text-sm">{(Number(campaign.avgCpc) || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}</td>
                        <td className="px-6 py-4 text-sm">{campaign.ctr ? `${(Number(campaign.ctr) || 0).toFixed(2)}%` : 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800 text-xs">
                              {campaign.status === 'active' ? 'Pause' : 'Resume'}
                            </button>
                            <button className="text-green-600 hover:text-green-800 text-xs">Analytics</button>
                            <button className="text-gray-600 hover:text-gray-800 text-xs">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        <div className="text-4xl mb-2">🎯</div>
                        <div className="text-sm">Žádné CPC kampaně</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Geographic & Device Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geographic Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">🌍 Geographic Distribution</h3>
              
              {cpcDetailed?.geographic && cpcDetailed.geographic.length > 0 ? (
                <div className="space-y-3">
                  {cpcDetailed.geographic.slice(0, 5).map((geo: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{geo.flag}</span>
                        <span className="text-sm font-medium">{geo.country}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{geo.clicks} clicks</div>
                        <div className="text-xs text-gray-500">
                          {(Number(geo.spend) || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">🌍</div>
                  <div className="text-sm">Žádná geografická data</div>
                </div>
              )}
            </div>

            {/* Device Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">📱 Device Breakdown</h3>
              
              {cpcDetailed?.devices ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💻</span>
                      <span className="text-sm font-medium">Desktop</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{cpcDetailed.devices.desktop}%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📱</span>
                      <span className="text-sm font-medium">Mobile</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{cpcDetailed.devices.mobile}%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📟</span>
                      <span className="text-sm font-medium">Tablet</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{cpcDetailed.devices.tablet}%</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">📱</div>
                  <div className="text-sm">Žádná data o zařízeních</div>
                </div>
              )}
            </div>
          </div>

          {/* Time Pattern Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">⏰ Time Pattern Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium mb-3">Peak Hours</h4>
                {cpcDetailed?.timePattern?.peak ? (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Best: </span>
                      {cpcDetailed.timePattern.peak.best} ({cpcDetailed.timePattern.peak.bestValue} clicks)
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Worst: </span>
                      {cpcDetailed.timePattern.peak.worst} ({cpcDetailed.timePattern.peak.worstValue} clicks)
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Nedostatek dat</div>
                )}
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-3">Weekend Impact</h4>
                {cpcDetailed?.timePattern?.weekend ? (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Weekend vs Weekday: </span>
                      {cpcDetailed.timePattern.weekend.impact > 0 ? '+' : ''}{cpcDetailed.timePattern.weekend.impact}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {cpcDetailed.timePattern.weekend.description}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Nedostatek dat</div>
                )}
              </div>
            </div>
          </div>

          {/* Ref Codes Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">🔗 Ref Codes Management</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ref Code</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Landing Page</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Clicks</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Conversion</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">CPC</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cpcDetailed?.refCodes?.length > 0 ? (
                    cpcDetailed.refCodes.map((refCode: any, index: number) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-blue-600">{refCode.code}</td>
                        <td className="px-6 py-4 text-sm">{refCode.landingPage}</td>
                        <td className="px-6 py-4 text-sm">{(Number(refCode.clicks) || 0).toLocaleString('cs-CZ')}</td>
                        <td className="px-6 py-4 text-sm">{(Number(refCode.conversion) || 0).toFixed(2)}%</td>
                        <td className="px-6 py-4 text-sm">{(Number(refCode.cpc) || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800 text-xs">Copy</button>
                            <button className="text-green-600 hover:text-green-800 text-xs">Edit</button>
                            <button className="text-purple-600 hover:text-purple-800 text-xs">Analytics</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        <div className="text-4xl mb-2">🔗</div>
                        <div className="text-sm">Žádné ref codes</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Budget Management & Bidding */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">💰 Budget Management</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Daily Budget</div>
                  <div className="text-lg font-bold text-blue-600">
                    {(cpcDetailed?.budget?.daily || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Monthly Cap</div>
                  <div className="text-lg font-bold">
                    {(cpcDetailed?.budget?.monthly || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Emergency Stop</div>
                  <div className="text-lg font-bold">
                    <span className={`px-2 py-1 rounded text-sm ${
                      cpcDetailed?.budget?.emergencyStop ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {cpcDetailed?.budget?.emergencyStop ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">🎯 Auto-bidding</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="text-lg font-bold">
                    <span className={`px-2 py-1 rounded text-sm ${
                      cpcDetailed?.bidding?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cpcDetailed?.bidding?.enabled ? 'Active' : 'Manual'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Target CPC</div>
                  <div className="text-lg font-bold text-green-600">
                    {(cpcDetailed?.bidding?.targetCpc || 0).toLocaleString('cs-CZ', {style: 'currency', currency: 'USD'})}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Bid Adjustments</div>
                  <div className="text-sm">
                    Mobile: {cpcDetailed?.bidding?.adjustments?.mobile || 0}% | 
                    Desktop: {cpcDetailed?.bidding?.adjustments?.desktop || 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Operations */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">⚡ Quick Actions & Operations</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
                <div className="text-2xl mb-1">🔄</div>
                <div className="text-xs font-medium">Refresh</div>
              </button>
              <button className="p-3 bg-red-50 hover:bg-red-100 rounded-lg text-center transition-colors">
                <div className="text-2xl mb-1">⏸️</div>
                <div className="text-xs font-medium">Pause Under</div>
              </button>
              <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
                <div className="text-2xl mb-1">🚀</div>
                <div className="text-xs font-medium">Boost Top</div>
              </button>
              <button className="p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-center transition-colors">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-xs font-medium">Add Budget</div>
              </button>
              <button className="p-3 bg-red-50 hover:bg-red-100 rounded-lg text-center transition-colors">
                <div className="text-2xl mb-1">🛑</div>
                <div className="text-xs font-medium">Emergency Stop</div>
              </button>
              <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-xs font-medium">Send Report</div>
              </button>
            </div>

            {/* Recent Actions */}
            {cpcDetailed?.recentActions && cpcDetailed.recentActions.length > 0 && (
              <div>
                <h4 className="text-md font-medium mb-3">Recent Actions</h4>
                <div className="space-y-2">
                  {cpcDetailed.recentActions.slice(0, 3).map((action: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span>{action.description}</span>
                      <span className="text-gray-500">{action.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Market Intelligence Preview */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">🔍 Market Intelligence (Preview)</h3>
            
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">🔍</div>
              <div className="text-lg">Competitive Data</div>
              <div className="text-sm">Připraveno k implementaci - analýza konkurence a market insights</div>
            </div>
          </div>
        </div>
      )}

      {/* Other Tabs */}
      {tab === 'billing' && (
        <div className="space-y-6">
          {/* KPI Overview */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">🧾 Billing Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              <div><div className="text-sm text-gray-500">Balance</div><div className="text-2xl font-bold">{(Number(billingSummary?.balance)||0).toLocaleString('cs-CZ',{style:'currency',currency:'USD'})}</div></div>
              <div><div className="text-sm text-gray-500">Payable (Affiliate)</div><div className="text-2xl font-bold text-blue-600">{(Number(billingSummary?.payableAffiliate)||0).toLocaleString('cs-CZ',{style:'currency',currency:'USD'})}</div></div>
              <div><div className="text-sm text-gray-500">Unpaid invoices</div><div className="text-2xl font-bold text-red-600">{(Number(billingSummary?.unpaidInvoices?.amount)||0).toLocaleString('cs-CZ',{style:'currency',currency:'USD'})}</div><div className="text-xs text-gray-500">{billingSummary?.unpaidInvoices?.count||0} pcs</div></div>
              <div><div className="text-sm text-gray-500">Last payment</div><div className="text-lg font-medium">{billingSummary?.lastPayment? `${(Number(billingSummary.lastPayment.amount)||0).toLocaleString('cs-CZ',{style:'currency',currency:'USD'})} • ${new Date(billingSummary.lastPayment.createdAt).toLocaleDateString('cs-CZ')}`:'—'}</div></div>
              <div><div className="text-sm text-gray-500">Total deposited</div><div className="text-2xl font-bold">{(Number(billingSummary?.totalDeposited)||0).toLocaleString('cs-CZ',{style:'currency',currency:'USD'})}</div></div>
              <div><div className="text-sm text-gray-500">Spent (30d)</div><div className="text-2xl font-bold">{(Number(billingSummary?.totalSpent30d)||0).toLocaleString('cs-CZ',{style:'currency',currency:'USD'})}</div></div>
            </div>
            {/* Quick Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="px-3 py-1.5 text-sm border rounded" onClick={async ()=>{ const res=await fetch(`/api/admin/companies/${params.id}/billing/invoices/generate?range=30d`,{method:'POST'}); if(res.ok){ alert('Invoice generated'); setTab('billing') } else { alert(await res.text()) } }}>Generate invoice</button>
              <button className="px-3 py-1.5 text-sm border rounded" onClick={async ()=>{ const amt=prompt('Amount (USD)?'); const method=amt?prompt('Method (e.g. bank, stripe)?'):''; if(!amt||!method)return; const r=await fetch(`/api/admin/companies/${params.id}/billing/recharge`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:Number(amt),method})}); if(r.ok){ alert('Credited'); setTab('billing') } else { alert(await r.text()) } }}>Add credit</button>
              <button className="px-3 py-1.5 text-sm border rounded" onClick={async ()=>{ const r=await fetch(`/api/admin/companies/${params.id}/billing/payouts/generate`,{method:'POST'}); if(r.ok){ alert('Payout generated'); setTab('billing') } else { alert(await r.text()) } }}>Generate payout</button>
            </div>
          </div>

          {/* Cashflow Timeline */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">📊 Cashflow (90d)</h3>
            {billingSummary?.timeline?.length ? (
              <div className="space-y-2">
                {billingSummary.timeline.map((d:any,i:number)=> (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 w-28">{d.date}</span>
                    <div className="flex-1 mx-2">
                      <div className="w-full bg-gray-200 h-2 rounded-full relative">
                        <div className="bg-green-600 h-2 rounded-full" style={{width:`${Math.min(100,(d.inflow/Math.max(1,Math.max(...billingSummary.timeline.map((x:any)=>x.inflow))))*100)}%`}} />
                        <div className="bg-red-600 h-2 rounded-full absolute top-0" style={{width:`${Math.min(100,(d.outflow/Math.max(1,Math.max(...billingSummary.timeline.map((x:any)=>x.outflow))))*100)}%`, opacity:0.5}} />
                      </div>
                    </div>
                    <span className="w-40 text-right">+{(d.inflow||0).toLocaleString('cs-CZ',{style:'currency',currency:'USD'})} / −{(d.outflow||0).toLocaleString('cs-CZ',{style:'currency',currency:'USD'})}</span>
                  </div>
                ))}
              </div>
            ) : (<div className="text-sm text-gray-500">No data</div>)}
          </div>

      {/* Invoices (Stripe) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold mr-auto">🧾 Invoices (Stripe)</h3>
          <select value={invRange} onChange={e=>setInvRange(e.target.value as RangeKey)} className="border rounded px-3 py-1.5 text-sm min-w-[140px]"><option value="today">today</option><option value="7d">7d</option><option value="30d">30d</option><option value="90d">90d</option><option value="all">all</option></select>
          <select value={invStatus} onChange={e=>setInvStatus(e.target.value)} className="border rounded px-3 py-1.5 text-sm min-w-[160px]">
            <option value="">Status: All</option>
            <option value="draft">draft</option>
            <option value="open">open</option>
            <option value="paid">paid</option>
            <option value="uncollectible">uncollectible</option>
            <option value="void">void</option>
          </select>
          <button className="px-3 py-1.5 text-sm border rounded" onClick={()=>{ const u=new URL(window.location.origin+`/api/admin/companies/${params.id}/billing/invoices/list`); u.searchParams.set('range',invRange); if(invStatus)u.searchParams.set('status',invStatus); u.searchParams.set('format','csv'); window.open(u.toString(),'_blank') }}>Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">number</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">amount_due</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">paid</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">created</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">due_date</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">link</th>
            </tr></thead>
            <tbody>
              {invLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading…</td></tr>
              ) : invoiceItems.length>0 ? (
                invoiceItems.map((i:any)=> (
                  <tr key={i.id} className="border-t">
                    <td className="px-6 py-3 text-sm font-mono">{i.number}</td>
                    <td className="px-6 py-3 text-sm">{i.status}</td>
                    <td className="px-6 py-3 text-sm">{(Number(i.amount_due)||0).toLocaleString('cs-CZ',{style:'currency',currency:i.currency||'USD'})}</td>
                    <td className="px-6 py-3 text-sm">{i.paid? 'yes' : 'no'}</td>
                    <td className="px-6 py-3 text-sm">{i.created? new Date(i.created).toLocaleString('cs-CZ') : '—'}</td>
                    <td className="px-6 py-3 text-sm">{i.due_date? new Date(i.due_date).toLocaleDateString('cs-CZ') : '—'}</td>
                    <td className="px-6 py-3 text-sm">{i.hosted_invoice_url? <a className="text-blue-600 hover:underline" href={i.hosted_invoice_url} target="_blank" rel="noopener noreferrer">open</a> : '—'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No invoices</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">⚙️ Billing Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!billingSettings?.auto_recharge_enabled} onChange={e=>setBillingSettings((s:any)=>({...s,auto_recharge_enabled:e.target.checked}))} />
            <span>Auto‑recharge enabled</span>
          </label>
          <input type="number" placeholder="auto_recharge_threshold" value={billingSettings?.auto_recharge_threshold ?? ''} onChange={e=>setBillingSettings((s:any)=>({...s,auto_recharge_threshold:Number(e.target.value||0)}))} className="border rounded px-3 py-1.5" />
          <input type="number" placeholder="auto_recharge_amount" value={billingSettings?.auto_recharge_amount ?? ''} onChange={e=>setBillingSettings((s:any)=>({...s,auto_recharge_amount:Number(e.target.value||0)}))} className="border rounded px-3 py-1.5" />
          <input type="number" placeholder="daily_spend_limit" value={billingSettings?.daily_spend_limit ?? ''} onChange={e=>setBillingSettings((s:any)=>({...s,daily_spend_limit:Number(e.target.value||0)}))} className="border rounded px-3 py-1.5" />
          <input type="number" placeholder="monthly_spend_limit" value={billingSettings?.monthly_spend_limit ?? ''} onChange={e=>setBillingSettings((s:any)=>({...s,monthly_spend_limit:Number(e.target.value||0)}))} className="border rounded px-3 py-1.5" />
          <input type="number" placeholder="affiliate_billing_threshold" value={billingSettings?.affiliate_billing_threshold ?? ''} onChange={e=>setBillingSettings((s:any)=>({...s,affiliate_billing_threshold:Number(e.target.value||0)}))} className="border rounded px-3 py-1.5" />
        </div>
        <div className="mt-4">
          <button disabled={savingBillingSettings} className="px-3 py-1.5 text-sm border rounded" onClick={async()=>{ setSavingBillingSettings(true); try { await fetch(`/api/admin/companies/${params.id}/billing/settings`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(billingSettings||{}) }); } finally { setSavingBillingSettings(false) } }}>Save settings</button>
        </div>
      </div>

          {/* Transactions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold mr-auto">💳 Transactions</h3>
              <select value={txRange} onChange={e=>{ setTxPage(1); setTxRange(e.target.value as RangeKey) }} className="border rounded px-3 py-1.5 text-sm min-w-[140px]"><option value="today">today</option><option value="7d">7d</option><option value="30d">30d</option><option value="90d">90d</option><option value="all">all</option></select>
              <input placeholder="type (recharge/spend/payout/invoice/refund/adjustment)" value={txType} onChange={e=>{ setTxPage(1); setTxType(e.target.value) }} className="border rounded px-3 py-1.5 text-sm w-72" />
              <input placeholder="status" value={txStatus} onChange={e=>{ setTxPage(1); setTxStatus(e.target.value) }} className="border rounded px-3 py-1.5 text-sm w-52" />
              <button className="px-3 py-1.5 text-sm border rounded" onClick={()=>{ const u=new URL(window.location.origin+`/api/admin/companies/${params.id}/billing/transactions`); u.searchParams.set('range',txRange); if(txType)u.searchParams.set('type',txType); if(txStatus)u.searchParams.set('status',txStatus); u.searchParams.set('format','csv'); window.open(u.toString(),'_blank') }}>Export CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">timestamp</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">method</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">invoice</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">description</th>
                </tr></thead>
                <tbody>
                  {txItems.length>0 ? txItems.map((r:any)=>(
                    <tr key={r.id} className="border-t">
                      <td className="px-6 py-3 text-sm">{new Date(r.createdAt).toLocaleString('cs-CZ')}</td>
                      <td className="px-6 py-3 text-sm">{r.type}</td>
                      <td className="px-6 py-3 text-sm">{(Number(r.amount)||0).toLocaleString('cs-CZ',{style:'currency',currency:'USD'})}</td>
                      <td className="px-6 py-3 text-sm">{r.status||'—'}</td>
                      <td className="px-6 py-3 text-sm">{r.paymentMethod||'—'}</td>
                      <td className="px-6 py-3 text-sm">{r.invoiceNumber||'—'}</td>
                      <td className="px-6 py-3 text-sm">{r.description||'—'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No transactions</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-6 py-3 text-sm">
              <div>Page {txPage} / {txTotalPages}</div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border rounded disabled:opacity-50" disabled={txPage<=1} onClick={()=>setTxPage(p=>Math.max(1,p-1))}>Prev</button>
                <button className="px-3 py-1.5 border rounded disabled:opacity-50" disabled={txPage>=txTotalPages} onClick={()=>setTxPage(p=>Math.min(txTotalPages,p+1))}>Next</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'configs' && (
        <div className="space-y-6">
          {/* Global tracking presets */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">🔧 Link settings – Global tracking</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input placeholder="utm_source" value={linkSettings?.utmDefaults?.source || ''} onChange={e => setLinkSettings((s: any) => ({ ...(s||{}), utmDefaults: { ...(s?.utmDefaults||{}), source: e.target.value } }))} className="border rounded px-3 py-1.5 text-sm" />
              <input placeholder="utm_medium" value={linkSettings?.utmDefaults?.medium || ''} onChange={e => setLinkSettings((s: any) => ({ ...(s||{}), utmDefaults: { ...(s?.utmDefaults||{}), medium: e.target.value } }))} className="border rounded px-3 py-1.5 text-sm" />
              <input placeholder="utm_campaign (${companyId})" value={linkSettings?.utmDefaults?.campaign || ''} onChange={e => setLinkSettings((s: any) => ({ ...(s||{}), utmDefaults: { ...(s?.utmDefaults||{}), campaign: e.target.value } }))} className="border rounded px-3 py-1.5 text-sm" />
              <input placeholder="utm_content (${ref_code})" value={linkSettings?.utmDefaults?.content || ''} onChange={e => setLinkSettings((s: any) => ({ ...(s||{}), utmDefaults: { ...(s?.utmDefaults||{}), content: e.target.value } }))} className="border rounded px-3 py-1.5 text-sm" />
              <input placeholder="utm_term (${landingSlug})" value={linkSettings?.utmDefaults?.term || ''} onChange={e => setLinkSettings((s: any) => ({ ...(s||{}), utmDefaults: { ...(s?.utmDefaults||{}), term: e.target.value } }))} className="border rounded px-3 py-1.5 text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <input placeholder="paramKeys.ref (např. ref)" value={linkSettings?.paramKeys?.ref || ''} onChange={e => setLinkSettings((s: any) => ({ ...(s||{}), paramKeys: { ...(s?.paramKeys||{}), ref: e.target.value } }))} className="border rounded px-3 py-1.5 text-sm" />
              <input placeholder="paramKeys.sub1 (např. s1)" value={linkSettings?.paramKeys?.sub1 || ''} onChange={e => setLinkSettings((s: any) => ({ ...(s||{}), paramKeys: { ...(s?.paramKeys||{}), sub1: e.target.value } }))} className="border rounded px-3 py-1.5 text-sm" />
              <input placeholder="paramKeys.sub2 (např. s2)" value={linkSettings?.paramKeys?.sub2 || ''} onChange={e => setLinkSettings((s: any) => ({ ...(s||{}), paramKeys: { ...(s?.paramKeys||{}), sub2: e.target.value } }))} className="border rounded px-3 py-1.5 text-sm" />
              <input placeholder="allowlistDomains (čárkou)" value={(linkSettings?.allowlistDomains||[]).join(',')} onChange={e => setLinkSettings((s: any) => ({ ...(s||{}), allowlistDomains: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))} className="border rounded px-3 py-1.5 text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input placeholder="templates.default (https://{domain}/landing/${'{'}landingSlug{'}'}?${'{'}params{'}'})" value={linkSettings?.templates?.default || ''} onChange={e => setLinkSettings((s: any) => ({ ...(s||{}), templates: { ...(s?.templates||{}), default: e.target.value } }))} className="border rounded px-3 py-1.5 text-sm" />
            </div>
            <div className="mt-4">
              <button disabled={savingLinkSettings} onClick={async () => { setSavingLinkSettings(true); try { await fetch(`/api/admin/companies/${params.id}/affiliate/link-settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ linkSettings }) }); } finally { setSavingLinkSettings(false) } }} className="px-3 py-1.5 text-sm border rounded">Save settings</button>
            </div>
          </div>

      {/* Internal Invoices */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold mr-auto">📄 Internal Invoices</h3>
          <select value={internalInvRange} onChange={e=>setInternalInvRange(e.target.value as RangeKey)} className="border rounded px-3 py-1.5 text-sm min-w-[140px]"><option value="today">today</option><option value="7d">7d</option><option value="30d">30d</option><option value="90d">90d</option><option value="all">all</option></select>
          <input placeholder="status (sent/paid/canceled)" value={internalInvStatus} onChange={e=>setInternalInvStatus(e.target.value)} className="border rounded px-3 py-1.5 text-sm w-64" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">timestamp</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">invoiceNumber</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">amount</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {internalInvLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading…</td></tr>
              ) : internalInvoices.length>0 ? (
                internalInvoices.map((r:any)=>(
                  <tr key={r.id} className="border-t">
                    <td className="px-6 py-3 text-sm">{new Date(r.createdAt).toLocaleString('cs-CZ')}</td>
                    <td className="px-6 py-3 text-sm font-mono">{r.invoiceNumber}</td>
                    <td className="px-6 py-3 text-sm">{(Number(r.amount)||0).toLocaleString('cs-CZ',{style:'currency',currency:'USD'})}</td>
                    <td className="px-6 py-3 text-sm">{r.status||'—'}</td>
                    <td className="px-6 py-3 text-xs">
                      <div className="flex gap-2">
                        <button className="text-green-600 hover:underline" onClick={async()=>{ const amount=Number(prompt('Confirm paid amount')||0); const method=prompt('Method?')||''; if(!amount||!method)return; const resp=await fetch(`/api/admin/companies/${params.id}/billing/invoices/${r.id}/mark-paid`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount,method})}); if(resp.ok){ alert('Marked paid'); setInternalInvRange(internalInvRange) } else { alert(await resp.text()) } }}>Mark paid</button>
                        <button className="text-red-600 hover:underline" onClick={async()=>{ const resp=await fetch(`/api/admin/companies/${params.id}/billing/invoices/${r.id}/cancel`,{method:'POST'}); if(resp.ok){ alert('Canceled'); setInternalInvRange(internalInvRange) } else { alert(await resp.text()) } }}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No internal invoices</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payouts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold mr-auto">💸 Payouts</h3>
          <select value={payoutsRange} onChange={e=>setPayoutsRange(e.target.value as RangeKey)} className="border rounded px-3 py-1.5 text-sm min-w-[140px]"><option value="today">today</option><option value="7d">7d</option><option value="30d">30d</option><option value="90d">90d</option><option value="all">all</option></select>
          <input placeholder="status (pending/paid/canceled)" value={payoutsStatus} onChange={e=>setPayoutsStatus(e.target.value)} className="border rounded px-3 py-1.5 text-sm w-64" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">timestamp</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">amount</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">status</th>
            </tr></thead>
            <tbody>
              {payoutsLoading ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Loading…</td></tr>
              ) : payouts.length>0 ? (
                payouts.map((r:any)=>(
                  <tr key={r.id} className="border-t">
                    <td className="px-6 py-3 text-sm">{new Date(r.createdAt).toLocaleString('cs-CZ')}</td>
                    <td className="px-6 py-3 text-sm">{(Number(r.amount)||0).toLocaleString('cs-CZ',{style:'currency',currency:'USD'})}</td>
                    <td className="px-6 py-3 text-sm">{r.status||'—'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No payouts</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
          {/* Link builder */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">🔗 Link builder</h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <select value={builderEntityType} onChange={e => setBuilderEntityType(e.target.value as any)} className="border rounded px-3 py-1.5 text-sm">
                <option value="landing">landing</option>
                <option value="product">product</option>
              </select>
              <input placeholder="entityId (slug/id)" value={builderEntityId} onChange={e => setBuilderEntityId(e.target.value)} className="border rounded px-3 py-1.5 text-sm" />
              <input placeholder="ref_code" value={builderRefCode} onChange={e => setBuilderRefCode(e.target.value)} className="border rounded px-3 py-1.5 text-sm" />
              <input placeholder="domain (allowlisted)" value={builderDomain} onChange={e => setBuilderDomain(e.target.value)} className="border rounded px-3 py-1.5 text-sm" />
              <input placeholder="sub1" value={builderSub1} onChange={e => setBuilderSub1(e.target.value)} className="border rounded px-3 py-1.5 text-sm" />
              <input placeholder="sub2" value={builderSub2} onChange={e => setBuilderSub2(e.target.value)} className="border rounded px-3 py-1.5 text-sm" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button disabled={builderLoading} onClick={async () => { setBuilderLoading(true); try { const url = new URL(window.location.origin + `/api/admin/companies/${params.id}/affiliate/link-builder`); url.searchParams.set('entityType', builderEntityType); url.searchParams.set('entityId', builderEntityId); url.searchParams.set('ref_code', builderRefCode); url.searchParams.set('domain', builderDomain); if (builderSub1) url.searchParams.set('sub1', builderSub1); if (builderSub2) url.searchParams.set('sub2', builderSub2); const res = await fetch(url.toString()); const js = await res.json(); setBuilderResultUrl(js.url || ''); setBuilderHeadStatus(js.headStatus ?? null) } finally { setBuilderLoading(false) } }} className="px-3 py-1.5 text-sm border rounded">Generate</button>
              <button disabled={!builderResultUrl} onClick={async () => { await navigator.clipboard.writeText(builderResultUrl) }} className="px-3 py-1.5 text-sm border rounded disabled:opacity-50">Copy URL</button>
              {builderHeadStatus != null && (<span className="text-sm text-gray-600">HEAD: {builderHeadStatus}</span>)}
            </div>
            {builderResultUrl && (
              <div className="mt-3 text-sm font-mono break-all bg-gray-50 p-3 rounded border">{builderResultUrl}</div>
            )}
          </div>
        </div>
      )}

      {tab === 'affiliate' && (
        <div className="space-y-6">
          {/* Webhook Settings & Logs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold mr-auto">🔔 Webhooks</h3>
              <button disabled={savingWebhook} onClick={async()=>{ setSavingWebhook(true); try { await fetch(`/api/admin/companies/${params.id}/affiliate/webhook-settings`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ settings: webhookSettings }) }); } finally { setSavingWebhook(false) } }} className="px-3 py-1.5 text-sm border rounded">Save</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <input placeholder="Endpoint URL" value={webhookSettings?.url || ''} onChange={e=>setWebhookSettings((s:any)=>({...(s||{}), url: e.target.value}))} className="border rounded px-3 py-1.5" />
              <input placeholder="Secret" value={webhookSettings?.secret || ''} onChange={e=>setWebhookSettings((s:any)=>({...(s||{}), secret: e.target.value}))} className="border rounded px-3 py-1.5" />
              <input placeholder="Retry policy (e.g. 3x exponential)" value={webhookSettings?.retry || ''} onChange={e=>setWebhookSettings((s:any)=>({...(s||{}), retry: e.target.value}))} className="border rounded px-3 py-1.5" />
            </div>
            <div className="p-6 border-t border-gray-200">
              <h4 className="font-medium mb-3">Logs (last 100)</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50"><tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">timestamp</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">event</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">duration</th>
                  </tr></thead>
                  <tbody>
                    {logs?.length ? logs.map((l:any)=> (
                      <tr key={l.id} className="border-t">
                        <td className="px-6 py-3 text-sm">{l.createdAt ? new Date(l.createdAt).toLocaleString('cs-CZ') : '—'}</td>
                        <td className="px-6 py-3 text-sm">{l.event || '—'}</td>
                        <td className="px-6 py-3 text-sm">{l.status || '—'}</td>
                        <td className="px-6 py-3 text-sm">{l.duration_ms != null ? `${l.duration_ms}ms` : '—'}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No logs</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* KPI Dashboard */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">🤝 Affiliate – KPI</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              <div><div className="text-sm text-gray-500">Clicks</div><div className="text-2xl font-bold">{affiliateDetailed?.kpis?.clicks ?? '—'}</div></div>
              <div><div className="text-sm text-gray-500">Valid</div><div className="text-2xl font-bold text-green-600">{affiliateDetailed?.kpis?.validClicks ?? '—'}</div></div>
              <div><div className="text-sm text-gray-500">Invalid ratio</div><div className="text-2xl font-bold text-red-600">{affiliateDetailed?.kpis?.invalidRatio != null ? `${affiliateDetailed.kpis.invalidRatio.toFixed(1)}%` : '—'}</div></div>
              <div><div className="text-sm text-gray-500">Conversions</div><div className="text-2xl font-bold">{affiliateDetailed?.kpis?.conversions ?? '—'}</div></div>
              <div><div className="text-sm text-gray-500">Commission</div><div className="text-2xl font-bold">{(affiliateDetailed?.kpis?.commission || 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'USD' })}</div></div>
              <div><div className="text-sm text-gray-500">CR / EPC / AOV</div><div className="text-sm font-medium">{affiliateDetailed?.kpis?.cr != null ? `${affiliateDetailed.kpis.cr.toFixed(2)}%` : '—'} / {(affiliateDetailed?.kpis?.epc || 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'USD' })} / {(affiliateDetailed?.kpis?.aov || 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'USD' })}</div></div>
            </div>
          </div>

          {/* Timeline + Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">📈 Daily Timeline</h3>
              {affiliateDetailed?.timeline?.length ? (
                <div className="space-y-2">
                  {affiliateDetailed.timeline.map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 w-28">{d.date}</span>
                      <div className="flex-1 mx-2">
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, (d.clicks / Math.max(1, Math.max(...affiliateDetailed.timeline.map((x: any) => x.clicks)))) * 100)}%` }} />
                        </div>
                      </div>
                      <span className="w-20 text-right">{(d.commission || 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">No timeline data</div>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">🪆 Funnel</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Clicks</span>
                  <span className="font-medium">{affiliateDetailed?.kpis?.clicks ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Valid</span>
                  <span className="font-medium">{affiliateDetailed?.kpis?.validClicks ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Conversions</span>
                  <span className="font-medium">{affiliateDetailed?.kpis?.conversions ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Geo / Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">🌍 Geo</h3>
              {affiliateDetailed?.geo?.length ? (
                <div className="space-y-2">
                  {affiliateDetailed.geo.slice(0, 10).map((g: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{g.country}</span>
                      <span className="text-gray-600">{g.clicks} clicks</span>
                      <span className="font-medium">{(g.commission || 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No geo data</div>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">📱 Devices</h3>
              {affiliateDetailed?.devices ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between"><span>Desktop</span><span className="font-medium">{affiliateDetailed.devices.desktop}%</span></div>
                  <div className="flex items-center justify-between"><span>Mobile</span><span className="font-medium">{affiliateDetailed.devices.mobile}%</span></div>
                  <div className="flex items-center justify-between"><span>Tablet</span><span className="font-medium">{affiliateDetailed.devices.tablet}%</span></div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No device data</div>
              )}
            </div>
          </div>

          {/* Top landing pages */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">🔗 Top landing pages</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Key</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Clicks</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Conversions</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateDetailed?.topPages?.length ? (
                    affiliateDetailed.topPages.map((p: any, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="px-6 py-3 text-sm font-mono">{p.key}</td>
                        <td className="px-6 py-3 text-sm">{p.clicks}</td>
                        <td className="px-6 py-3 text-sm">{p.conversions}</td>
                        <td className="px-6 py-3 text-sm">{(p.commission || 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'USD' })}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="px-6 py-6 text-center text-gray-500">No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conversions table with filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold mr-auto">🧾 Conversions</h3>
              <input value={convQuery} onChange={e => { setConvPage(1); setConvQuery(e.target.value) }} placeholder="Search external ID" className="border rounded px-3 py-1.5 text-sm w-56" />
              <input value={convRefCode} onChange={e => { setConvPage(1); setConvRefCode(e.target.value) }} placeholder="ref_code" className="border rounded px-3 py-1.5 text-sm w-36" />
              <select value={convStatus} onChange={e => { setConvPage(1); setConvStatus(e.target.value) }} className="border rounded px-3 py-1.5 text-sm min-w-[160px]">
                <option value="">Status: All</option>
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="reversed">reversed</option>
                <option value="paid">paid</option>
              </select>
              <select value={convBilled} onChange={e => { setConvPage(1); setConvBilled(e.target.value) }} className="border rounded px-3 py-1.5 text-sm min-w-[140px]">
                <option value="">Billed: All</option>
                <option value="true">Billed</option>
                <option value="false">Not billed</option>
              </select>
              <select value={convPaid} onChange={e => { setConvPage(1); setConvPaid(e.target.value) }} className="border rounded px-3 py-1.5 text-sm min-w-[140px]">
                <option value="">Paid: All</option>
                <option value="true">Paid</option>
                <option value="false">Not paid</option>
              </select>
              <button
                onClick={() => {
                  const url = new URL(window.location.origin + `/api/admin/companies/${params.id}/affiliate/conversions`)
                  url.searchParams.set('range', range)
                  if (convStatus) url.searchParams.set('status', convStatus)
                  if (convRefCode) url.searchParams.set('ref_code', convRefCode)
                  if (convBilled) url.searchParams.set('billed', convBilled)
                  if (convPaid) url.searchParams.set('paid', convPaid)
                  if (convQuery) url.searchParams.set('q', convQuery)
                  url.searchParams.set('format', 'csv')
                  window.open(url.toString(), '_blank')
                }}
                className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
              >Export CSV</button>
            </div>

      {/* Clicks table with filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold mr-auto">🖱 Clicks</h3>
          <select value={clickValid} onChange={e=>{ setClickPage(1); setClickValid(e.target.value) }} className="border rounded px-3 py-1.5 text-sm min-w-[140px]">
            <option value="">Valid: All</option>
            <option value="true">Valid</option>
            <option value="false">Invalid</option>
          </select>
          <input value={clickRefCode} onChange={e=>{ setClickPage(1); setClickRefCode(e.target.value) }} placeholder="ref_code" className="border rounded px-3 py-1.5 text-sm w-36" />
          <button className="px-3 py-1.5 text-sm border rounded" onClick={()=>{ const u=new URL(window.location.origin+`/api/admin/companies/${params.id}/affiliate/clicks`); u.searchParams.set('range',range); u.searchParams.set('page','1'); u.searchParams.set('pageSize','1000'); if(clickValid)u.searchParams.set('valid',clickValid); if(clickRefCode)u.searchParams.set('ref_code',clickRefCode); window.open(u.toString(),'_blank') }}>Open API</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ref_code</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">entity</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">country</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">session</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">valid</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">reason</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clickLoading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading…</td></tr>
              ) : clickItems.length>0 ? (
                clickItems.map((r:any)=> (
                  <tr key={r.id} className="border-t">
                    <td className="px-6 py-3 text-sm">{new Date(r.timestamp).toLocaleString('cs-CZ')}</td>
                    <td className="px-6 py-3 text-sm font-mono">{r.ref_code}</td>
                    <td className="px-6 py-3 text-sm">{r.monetizable_type}:{r.monetizable_id}</td>
                    <td className="px-6 py-3 text-sm">{r.country || '—'}</td>
                    <td className="px-6 py-3 text-sm font-mono">{r.session_id || '—'}</td>
                    <td className="px-6 py-3 text-sm">{r.is_valid ? 'valid' : 'invalid'}</td>
                    <td className="px-6 py-3 text-sm">{r.fraud_reason || '—'}</td>
                    <td className="px-6 py-3 text-xs">
                      <div className="flex gap-2">
                        {r.is_valid ? (
                          <button className="text-red-600 hover:underline" onClick={async()=>{ const reason=prompt('Fraud reason?')||''; await fetch(`/api/admin/companies/${params.id}/affiliate/clicks`,{method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: r.id, is_valid: false, fraud_reason: reason })}); setClickPage(1) }}>Mark invalid</button>
                        ) : (
                          <button className="text-green-600 hover:underline" onClick={async()=>{ await fetch(`/api/admin/companies/${params.id}/affiliate/clicks`,{method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: r.id, is_valid: true })}); setClickPage(1) }}>Mark valid</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No clicks</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-3 text-sm">
          <div>Page {clickPage} / {clickTotalPages}</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border rounded disabled:opacity-50" disabled={clickPage<=1} onClick={()=>setClickPage(p=>Math.max(1,p-1))}>Prev</button>
            <button className="px-3 py-1.5 border rounded disabled:opacity-50" disabled={clickPage>=clickTotalPages} onClick={()=>setClickPage(p=>Math.min(clickTotalPages,p+1))}>Next</button>
          </div>
        </div>
      </div>
            <div className="px-6 py-4 text-sm text-gray-600">
              {convTotals && (
                <div className="flex gap-6">
                  <div>Count: <span className="font-medium">{convTotals.count || 0}</span></div>
                  <div>Revenue: <span className="font-medium">{(Number(convTotals.revenue) || 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'USD' })}</span></div>
                  <div>Commission: <span className="font-medium">{(Number(convTotals.commission) || 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'USD' })}</span></div>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ref_code</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">external_id</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">entity</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">revenue</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">commission</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">rate</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">billed</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">paid</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {convLoading ? (
                    <tr><td colSpan={11} className="px-6 py-8 text-center text-gray-500">Loading…</td></tr>
                  ) : convItems.length > 0 ? (
                    convItems.map((r: any) => {
                      let status: string | undefined
                      let paidAt: string | undefined
                      try { const m = r.metadata ? JSON.parse(r.metadata) : {}; status = m.status; paidAt = m.paid_at } catch {}
                      return (
                        <tr key={r.id} className="border-t">
                          <td className="px-6 py-3 text-sm">{new Date(r.timestamp).toLocaleString('cs-CZ')}</td>
                          <td className="px-6 py-3 text-sm font-mono">{r.ref_code}</td>
                          <td className="px-6 py-3 text-sm">{r.external_conversion_id || '—'}</td>
                          <td className="px-6 py-3 text-sm">{r.monetizable_type}:{r.monetizable_id}</td>
                          <td className="px-6 py-3 text-sm">{(Number(r.conversion_value) || 0).toLocaleString('cs-CZ', { style: 'currency', currency: r.currency || 'USD' })}</td>
                          <td className="px-6 py-3 text-sm">{(Number(r.commission_amount) || 0).toLocaleString('cs-CZ', { style: 'currency', currency: r.currency || 'USD' })}</td>
                          <td className="px-6 py-3 text-sm">{r.commission_rate != null ? `${r.commission_rate}` : '—'}</td>
                          <td className="px-6 py-3 text-sm">{status || '—'}</td>
                          <td className="px-6 py-3 text-sm">{r.billed_at ? new Date(r.billed_at).toLocaleDateString('cs-CZ') : '—'}</td>
                          <td className="px-6 py-3 text-sm">{paidAt ? new Date(paidAt).toLocaleDateString('cs-CZ') : '—'}</td>
                          <td className="px-6 py-3 text-xs">
                            <div className="flex gap-2">
                              <button className="text-green-600 hover:underline" onClick={async () => { await fetch(`/api/admin/companies/${params.id}/affiliate/conversions/${r.id}?action=approve`, { method: 'POST' }); setConvPage(1) }}>Approve</button>
                              <button className="text-red-600 hover:underline" onClick={async () => { await fetch(`/api/admin/companies/${params.id}/affiliate/conversions/${r.id}?action=reverse`, { method: 'POST' }); setConvPage(1) }}>Reverse</button>
                              <button className="text-blue-600 hover:underline" onClick={async () => { const invoice_id = prompt('Invoice ID?') || ''; if (!invoice_id) return; await fetch(`/api/admin/companies/${params.id}/affiliate/conversions/${r.id}?action=bill`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoice_id }) }); setConvPage(1) }}>Bill</button>
                              <button className="text-gray-600 hover:underline" onClick={async () => { await fetch(`/api/admin/companies/${params.id}/affiliate/conversions/${r.id}?action=unbill`, { method: 'POST' }); setConvPage(1) }}>Unbill</button>
                              <button className="text-purple-600 hover:underline" onClick={async () => { await fetch(`/api/admin/companies/${params.id}/affiliate/conversions/${r.id}?action=mark-paid`, { method: 'POST' }); setConvPage(1) }}>Mark paid</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr><td colSpan={11} className="px-6 py-8 text-center text-gray-500">No conversions</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-6 py-3 text-sm">
              <div>Page {convPage} / {convTotalPages}</div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border rounded disabled:opacity-50" disabled={convPage <= 1} onClick={() => setConvPage(p => Math.max(1, p - 1))}>Prev</button>
                <button className="px-3 py-1.5 border rounded disabled:opacity-50" disabled={convPage >= convTotalPages} onClick={() => setConvPage(p => Math.min(convTotalPages, p + 1))}>Next</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyMonetizationPage