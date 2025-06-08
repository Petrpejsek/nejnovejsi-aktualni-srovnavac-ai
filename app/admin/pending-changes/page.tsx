'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface PendingProduct {
  id: string
  name: string
  description: string
  company?: {
    id: string
    name: string
    email: string
  } | null
  changesSubmittedAt: string
  changesSubmittedBy: string
  pendingChanges: any
  currentData: any
}

export default function PendingChangesPage() {
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  const parseJSONSafely = (jsonString: string) => {
    try {
      return JSON.parse(jsonString)
    } catch {
      return []
    }
  }

  const renderComparisonField = (label: string, currentValue: any, pendingValue: any, isArray = false) => {
    // Normalize values for proper comparison
    const normalizeValue = (value: any) => {
      if (value === null || value === undefined) return ""
      if (typeof value === 'string') return value.trim()
      return value
    }

    let hasChanged = false
    let currentArray: string[] = []
    let pendingArray: string[] = []

    if (isArray) {
      currentArray = Array.isArray(currentValue) ? currentValue : parseJSONSafely(currentValue || '[]')
      pendingArray = Array.isArray(pendingValue) ? pendingValue : parseJSONSafely(pendingValue || '[]')
      
      // Check if arrays are actually different (not just different order)
      const currentSorted = [...currentArray].sort()
      const pendingSorted = [...pendingArray].sort()
      hasChanged = JSON.stringify(currentSorted) !== JSON.stringify(pendingSorted)
    } else {
      const currentNorm = normalizeValue(currentValue)
      const pendingNorm = normalizeValue(pendingValue)
      hasChanged = currentNorm !== pendingNorm
    }

    // If no change, show only on left side
    if (!hasChanged) {
      return (
        <div className="mb-4">
          <h5 className="font-medium text-gray-900 mb-2">{label}:</h5>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Současná hodnota (beze změn):</div>
              <div className="bg-gray-50 p-3 rounded border">
                {isArray ? (
                  currentArray.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {currentArray.map((item: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700">{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic">Žádné položky</span>
                  )
                ) : (
                  <span className="text-sm text-gray-700">
                    {currentValue || <span className="text-gray-400 italic">Není zadáno</span>}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    if (isArray) {
      return (
        <div className="mb-4">
          <h5 className="font-medium text-gray-900 mb-2">{label}:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Současné (schválené):</div>
              <div className="bg-gray-50 p-3 rounded border">
                {currentArray.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {currentArray.map((item: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400 italic">Žádné položky</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Navrhované změny:</div>
              <div className="bg-green-50 border-green-200 p-3 rounded border-2">
                {pendingArray.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {pendingArray.map((item: string, index: number) => {
                      const isNew = !currentArray.includes(item)
                      const isRemoved = !pendingArray.includes(item)
                      return (
                        <li key={index} className={`text-sm ${isNew ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                          {isNew && <span className="text-green-600 font-bold">+ </span>}
                          {item}
                        </li>
                      )
                    })}
                    {/* Show removed items */}
                    {currentArray.filter(item => !pendingArray.includes(item)).map((item: string, index: number) => (
                      <li key={`removed-${index}`} className="text-sm text-red-600 line-through">
                        <span className="text-red-600 font-bold">- </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400 italic">Žádné položky</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="mb-4">
        <h5 className="font-medium text-gray-900 mb-2">{label}:</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Současné (schválené):</div>
            <div className="bg-gray-50 p-3 rounded border text-sm text-gray-700">
              {currentValue || <span className="text-gray-400 italic">Není zadáno</span>}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Navrhované:</div>
            <div className="bg-green-50 border-green-200 p-3 rounded border-2 text-sm text-green-700 font-medium">
              {pendingValue || <span className="text-gray-400 italic">Není zadáno</span>}
              <span className="text-green-600 text-xs ml-2">(změněno)</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchPendingChanges()
  }, [])

  const fetchPendingChanges = async () => {
    try {
      const response = await fetch('/api/admin/pending-changes')
      if (response.ok) {
        const data = await response.json()
        setPendingProducts(data.products || [])
      } else {
        console.error('Chyba při načítání pending changes')
      }
    } catch (error) {
      console.error('Chyba při načítání pending changes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (productId: string) => {
    setProcessing(productId)
    try {
      const response = await fetch(`/api/admin/pending-changes/${productId}/approve`, {
        method: 'POST'
      })
      if (response.ok) {
        await fetchPendingChanges() // Refresh list
      } else {
        console.error('Chyba při schvalování změn')
      }
    } catch (error) {
      console.error('Chyba při schvalování změn:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (productId: string, reason: string) => {
    setProcessing(productId)
    try {
      const response = await fetch(`/api/admin/pending-changes/${productId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })
      if (response.ok) {
        await fetchPendingChanges() // Refresh list
      } else {
        console.error('Chyba při zamítání změn')
      }
    } catch (error) {
      console.error('Chyba při zamítání změn:', error)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Čekající změny produktů</h1>
          <p className="text-gray-600 mt-1">Načítání...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Čekající změny produktů</h1>
            <p className="text-gray-600 mt-1">
              Schvalte nebo zamítněte změny produktů od firem
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Zpět na dashboard
          </Link>
        </div>
      </div>

      {/* Pending Changes List */}
      {pendingProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné čekající změny</h3>
          <p className="text-gray-500">Všechny změny produktů jsou schváleny!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingProducts.map((product) => (
            <div key={product.id} className="bg-white shadow rounded-lg border-l-4 border-amber-400">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">
                      Změny od: <strong>{product.company?.name || 'Unknown Company'}</strong> ({product.company?.email || 'unknown@email.com'})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Odeslané: {new Date(product.changesSubmittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                      className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                    >
                      {expandedProduct === product.id ? '🔼 Skrýt detail' : '🔍 Zobrazit detail'}
                    </button>
                    <button
                      onClick={() => handleApprove(product.id)}
                      disabled={processing === product.id}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {processing === product.id ? 'Zpracovávám...' : '✅ Schválit'}
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Důvod zamítnutí:')
                        if (reason) handleReject(product.id, reason)
                      }}
                      disabled={processing === product.id}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      ❌ Zamítnout
                    </button>
                  </div>
                </div>
                
                {/* Quick Changes Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Rychlý přehled změn:</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    {product.pendingChanges ? (
                      <div className="space-y-1">
                        {(() => {
                          const currentAdvantages = parseJSONSafely(product.currentData?.advantages || '[]')
                          const pendingAdvantages = parseJSONSafely(product.pendingChanges.advantages || '[]')
                          const advantagesChanged = JSON.stringify(currentAdvantages.sort()) !== JSON.stringify(pendingAdvantages.sort())
                          
                          const changes = []
                          
                          if (advantagesChanged) {
                            const newItems = pendingAdvantages.filter((item: string) => !currentAdvantages.includes(item))
                            const removedItems = currentAdvantages.filter((item: string) => !pendingAdvantages.includes(item))
                            let changeText = `Upraveno (${pendingAdvantages.length} položek)`
                            if (newItems.length > 0) changeText += `, +${newItems.length} nové`
                            if (removedItems.length > 0) changeText += `, -${removedItems.length} odstraněné`
                            changes.push(
                              <div key="advantages" className="flex items-center">
                                <span className="text-green-600 font-medium">✓ Výhody:</span>
                                <span className="ml-2">{changeText}</span>
                              </div>
                            )
                          }
                          
                          if (product.pendingChanges.name && product.pendingChanges.name !== product.currentData?.name) {
                            changes.push(
                              <div key="name" className="flex items-center">
                                <span className="text-green-600 font-medium">✓ Název:</span>
                                <span className="ml-2">Upraven</span>
                              </div>
                            )
                          }
                          
                          if (product.pendingChanges.description && product.pendingChanges.description !== product.currentData?.description) {
                            changes.push(
                              <div key="description" className="flex items-center">
                                <span className="text-green-600 font-medium">✓ Popis:</span>
                                <span className="ml-2">Upraven</span>
                              </div>
                            )
                          }
                          
                          if (product.pendingChanges.price !== undefined && product.pendingChanges.price !== product.currentData?.price) {
                            changes.push(
                              <div key="price" className="flex items-center">
                                <span className="text-green-600 font-medium">✓ Cena:</span>
                                <span className="ml-2">${product.currentData?.price || 0} → ${product.pendingChanges.price}</span>
                              </div>
                            )
                          }
                          
                          return changes.length > 0 ? changes : (
                            <div className="text-gray-500 italic">Žádné změny nebyly detekovány</div>
                          )
                        })()}
                      </div>
                    ) : (
                      <p className="italic">Žádné detaily změn k dispozici</p>
                    )}
                  </div>
                </div>

                {/* Expanded Detail View */}
                {expandedProduct === product.id && (
                  <div className="mt-4 bg-white border-2 border-blue-100 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">📋 Detailní porovnání produktu</h4>
                      <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Informativní zobrazení
                      </span>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div>
                        <h5 className="text-base font-medium text-gray-900 mb-3 border-b pb-1">📝 Základní informace</h5>
                        {renderComparisonField("Název", product.currentData?.name, product.pendingChanges?.name)}
                        {renderComparisonField("Popis", product.currentData?.description, product.pendingChanges?.description)}
                        {renderComparisonField("Kategorie", product.currentData?.category, product.pendingChanges?.category)}
                        {renderComparisonField("Cena", `$${product.currentData?.price || 0}`, `$${product.pendingChanges?.price || 0}`)}
                        {renderComparisonField("Externí URL", product.currentData?.externalUrl, product.pendingChanges?.externalUrl)}
                      </div>

                      {/* Advantages & Disadvantages */}
                      <div>
                        <h5 className="text-base font-medium text-gray-900 mb-3 border-b pb-1">➕ Výhody a nevýhody</h5>
                        {renderComparisonField("Výhody", product.currentData?.advantages, product.pendingChanges?.advantages, true)}
                        {renderComparisonField("Nevýhody", product.currentData?.disadvantages, product.pendingChanges?.disadvantages, true)}
                      </div>

                      {/* Additional Details */}
                      {(product.currentData?.detailInfo || product.pendingChanges?.detailInfo) && (
                        <div>
                          <h5 className="text-base font-medium text-gray-900 mb-3 border-b pb-1">ℹ️ Detailní informace</h5>
                          {renderComparisonField("Detailní info", product.currentData?.detailInfo, product.pendingChanges?.detailInfo)}
                        </div>
                      )}

                      {/* Tags */}
                      {(product.currentData?.tags || product.pendingChanges?.tags) && (
                        <div>
                          <h5 className="text-base font-medium text-gray-900 mb-3 border-b pb-1">🏷️ Tagy</h5>
                          {renderComparisonField("Tagy", product.currentData?.tags, product.pendingChanges?.tags, true)}
                        </div>
                      )}

                      {/* Trial Info */}
                      <div>
                        <h5 className="text-base font-medium text-gray-900 mb-3 border-b pb-1">🆓 Zkušební verze</h5>
                        {renderComparisonField("Má zkušební verzi", product.currentData?.hasTrial ? "Ano" : "Ne", product.pendingChanges?.hasTrial ? "Ano" : "Ne")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 