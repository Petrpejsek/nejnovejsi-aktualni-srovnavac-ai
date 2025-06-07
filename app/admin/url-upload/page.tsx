'use client'

import React, { useState, useEffect } from 'react'
import { Inter } from 'next/font/google'
import EditProductModal from './components/EditProductModal'

const inter = Inter({ subsets: ['latin'] })

interface ScrapingResult {
  url: string
  success: boolean
  reviewData?: any
  error?: string
  existingId?: string
}

interface ScrapingResponse {
  success: boolean
  totalProcessed: number
  successCount: number
  failCount: number
  results: ScrapingResult[]
  reviewQueueAdded: number
  error?: string
}

interface ReviewProduct {
  reviewId: string
  name: string
  description: string
  category: string
  price: number
  advantages: string[]
  disadvantages: string[]
  hasTrial: boolean
  tags: string[]
  detailInfo: string
  pricingInfo: any
  externalUrl: string
  screenshotUrl: string | null
  scrapedAt: string
}

interface ReviewQueueResponse {
  success: boolean
  count: number
  maxCapacity: number
  products: ReviewProduct[]
}

interface DuplicateCheckResponse {
  success: boolean
  totalChecked: number
  duplicatesCount: number
  uniqueCount: number
  duplicates: string[]
  uniqueUrls: string[]
  duplicateDetails: Array<{
    url: string
    existingProduct: string
  }>
  error?: string
}

export default function URLUploadPage() {
  // Kontrola prostředí - blokace na produkci
  const isAdminUploadEnabled = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_ADMIN_UPLOAD === 'true'
  
  if (!isAdminUploadEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🚫 Funkce není dostupná</h1>
          <p className="text-gray-600 mb-6">URL Upload funkcionalita je dostupná pouze v development prostředí.</p>
          <p className="text-sm text-gray-500">Pro aktivaci nastavte NEXT_PUBLIC_ENABLE_ADMIN_UPLOAD=true</p>
        </div>
      </div>
    )
  }

  // Základní stav
  const [urls, setUrls] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<ScrapingResponse | null>(null)
  
  // Review Queue stav
  const [reviewQueue, setReviewQueue] = useState<ReviewProduct[]>([])
  const [isLoadingReview, setIsLoadingReview] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ReviewProduct | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [isApproving, setIsApproving] = useState(false)
  
  // Nové state pro progress tracking
  const [processingStep, setProcessingStep] = useState('')
  const [processedCount, setProcessedCount] = useState(0)
  const [totalToProcess, setTotalToProcess] = useState(0)

  // Načíst review queue při načtení stránky
  const loadReviewQueue = async () => {
    try {
      setIsLoadingReview(true)
      const response = await fetch('/api/review-queue')
      const data: ReviewQueueResponse = await response.json()

      if (data.success) {
        setReviewQueue(data.products)
      }
    } catch (error) {
      console.error('Chyba při načítání review queue:', error)
    } finally {
      setIsLoadingReview(false)
    }
  }

  useEffect(() => {
    loadReviewQueue()
  }, [])

  // Znovu načíst po úspěšném scrapingu
  useEffect(() => {
    if (results && results.reviewQueueAdded > 0) {
      setTimeout(() => {
        loadReviewQueue()
      }, 1000)
    }
  }, [results])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!urls.trim()) {
      alert('Prosím zadejte alespoň jednu URL')
      return
    }

    // Kontrola kapacity review queue
    if (reviewQueue.length >= 50) {
      alert('Review queue je plná! Prosím nejdříve schvalte nebo smažte stávající produkty.')
      return
    }

    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0)

    if (urlList.length === 0) {
      alert('Prosím zadejte platné URL adresy')
      return
    }

    setIsProcessing(true)
    setResults(null)
    setProcessingStep('Kontroluji duplicity...')

    try {
      // KROK 1: Kontrola duplicit v databázi
      console.log('🔍 Kontroluji duplicity před scrapingem...')
      const duplicateCheckResponse = await fetch('/api/products/check-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ urls: urlList })
      })

      const duplicateData: DuplicateCheckResponse = await duplicateCheckResponse.json()

      if (!duplicateCheckResponse.ok) {
        throw new Error(duplicateData.error || 'Chyba při kontrole duplicit')
      }

      // Zobrazení výsledků kontroly duplicit
      let finalUrlList = urlList
      if (duplicateData.duplicatesCount > 0) {
        const message = `🔍 Kontrola duplicit dokončena!\n\n` +
          `📊 Celkem zkontrolováno: ${duplicateData.totalChecked} URL\n` +
          `🗑️ Duplicit odstraněno: ${duplicateData.duplicatesCount}\n` +
          `✅ Unikátních URL zůstalo: ${duplicateData.uniqueCount}\n\n` +
          `Duplikátní produkty:\n` +
          duplicateData.duplicateDetails.map((dup, index) => 
            `${index + 1}. ${dup.existingProduct} (${dup.url})`
          ).join('\n')

        alert(message)

        // Použijeme pouze unikátní URL pro scraping
        finalUrlList = duplicateData.uniqueUrls
        
        // Aktualizujeme textarea s vyčištěnými URL
        setUrls(finalUrlList.join('\n'))
      }

      // Pokud nezbývají žádné URL, ukončíme
      if (finalUrlList.length === 0) {
        alert('🚫 Všechny URL byly duplicitní. Nepokračuji se scrapingem.')
        setIsProcessing(false)
        setProcessingStep('')
        return
      }

      // KROK 2: Pokračování se scrapingem pouze s unikátními URL
      console.log(`🚀 Pokračuji se scrapingem ${finalUrlList.length} unikátních URL...`)
    
    // Progress tracking
      setTotalToProcess(finalUrlList.length)
    setProcessedCount(0)
    setProcessingStep('Spouštím scraping...')

      // Simulace progress kroků pro lepší UX
      const progressSteps = [
        'Načítám obsah stránek...',
        'Analytuji data pomocí AI...',
        'Vytvářím screenshoty...',
        'Dokončuji zpracování...'
      ]
      
      let stepIndex = 0
      const progressInterval = setInterval(() => {
        if (stepIndex < progressSteps.length) {
          setProcessingStep(progressSteps[stepIndex])
          setProcessedCount(Math.min(stepIndex + 1, finalUrlList.length))
          stepIndex++
        }
      }, 4000)

      const response = await fetch('/api/products/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ urls: finalUrlList })
      })

      clearInterval(progressInterval)
      setProcessingStep('Hotovo!')
      setProcessedCount(finalUrlList.length)

      const data: ScrapingResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Chyba při zpracování')
      }

      setResults(data)

    } catch (error) {
      console.error('Chyba při scrapingu:', error)
      alert('Došlo k chybě při zpracování: ' + (error instanceof Error ? error.message : 'Neočekávaná chyba'))
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
      setProcessedCount(0)
      setTotalToProcess(0)
    }
  }

  const clearResults = () => {
    setResults(null)
    setUrls('')
  }

  // Funkce pro výběr produktů
  const toggleProductSelection = (reviewId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId)
    } else {
      newSelected.add(reviewId)
    }
    setSelectedProducts(newSelected)
  }

  const selectAllProducts = () => {
    if (selectedProducts.size === reviewQueue.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(reviewQueue.map(p => p.reviewId)))
    }
  }

  // Schválení produktů
  const approveProducts = async (reviewIds: string[]) => {
    if (reviewIds.length === 0) return

    const confirmed = window.confirm(
      `Opravdu chcete schválit ${reviewIds.length} produkt${reviewIds.length === 1 ? '' : 'ů'}? Tento proces je nevratný.`
    )

    if (!confirmed) return

    // Dvojitá confirmace pro více produktů
    if (reviewIds.length > 1) {
      const doubleConfirmed = window.confirm(
        'POZOR: Schvalujete více produktů najednou. Jste si jistí? Tuto akci nelze vrátit zpět.'
      )
      if (!doubleConfirmed) return
    }

    try {
      setIsApproving(true)
      const response = await fetch('/api/review-queue/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewIds })
      })

      const data = await response.json()

      if (data.success) {
        // Detailní zpráva o výsledcích
        let message = `✅ Proces dokončen!\n\n`
        
        if (data.approvedCount > 0) {
          message += `📥 ${data.approvedCount} produktů úspěšně nahráno do databáze\n`
        }
        
        if (data.failedCount > 0) {
          message += `⚠️ ${data.failedCount} duplikátů nenahráno (produkty již existují)\n\n`
          
          // Zobrazit detaily duplikátů
          if (data.failedProducts && data.failedProducts.length > 0) {
            message += `Duplikáty (důvod):\n`
            data.failedProducts.forEach((failed: any, index: number) => {
              if (failed.error?.includes('již existuje')) {
                const productName = failed.productName || reviewQueue.find(p => p.reviewId === failed.reviewId)?.name || 'Neznámý produkt'
                const reason = failed.duplicateReason || 'neznámý'
                message += `${index + 1}. ${productName} (duplicitní ${reason})\n`
              }
            })
          }
        }
        
        message += `\n📊 Zbývá v review queue: ${data.remainingInQueue}`
        
        alert(message)
        setSelectedProducts(new Set())
        loadReviewQueue()
      } else {
        alert(`❌ Chyba při schvalování: ${data.error}`)
      }
    } catch (error) {
      alert('Chyba při schvalování produktů')
      console.error(error)
    } finally {
      setIsApproving(false)
    }
  }

  // Smazání produktu
  const deleteProduct = async (reviewId: string) => {
    const confirmed = window.confirm('Opravdu chcete smazat tento produkt z review queue?')
    if (!confirmed) return

    const doubleConfirmed = window.confirm('POZOR: Tuto akci nelze vrátit zpět. Jste si jistí?')
    if (!doubleConfirmed) return

    try {
      const response = await fetch(`/api/review-queue?reviewId=${reviewId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Produkt byl smazán')
        loadReviewQueue()
      } else {
        alert(`❌ Chyba při mazání: ${data.error}`)
      }
    } catch (error) {
      alert('Chyba při mazání produktu')
      console.error(error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Zdarma'
    return `$${price}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🚀 URL Upload & Review Systém</h1>
        <p className="mt-2 text-gray-600">
          Automaticky scrapuj produkty a zkontroluj je před přidáním do databáze
        </p>
      </div>

      {/* Kapacita Review Queue */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📊</span>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Review Queue Status</h3>
              <p className="text-xs text-blue-600">
                {reviewQueue.length} / 50 produktů ({selectedProducts.size} vybráno)
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-32">
            <div className="bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(reviewQueue.length / 50) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scraping formulář */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Přidání nových produktů</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="urls" className="block text-sm font-medium text-gray-700">
              URL adresy (každou na nový řádek)
            </label>
            <textarea
              id="urls"
              rows={8}
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isProcessing}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isProcessing || reviewQueue.length >= 50}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <span className="mr-2">⚡</span>
                  <div className="text-center">
                    <div>{processingStep}</div>
                    {totalToProcess > 0 && (
                      <div className="text-sm opacity-75">
                        {processedCount}/{totalToProcess} ({Math.round((processedCount/totalToProcess)*100)}%)
                      </div>
                    )}
                  </div>
                </div>
              ) : '🚀 Spustit Scraping'}
            </button>
            
            {results && (
              <button
                type="button"
                onClick={clearResults}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                🗑️ Vymazat
              </button>
            )}
          </div>
        </form>

        {/* Výsledky scrapingu */}
        {results && (
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Výsledky scrapingu</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{results.successCount}</div>
                <div className="text-sm text-green-700">Úspěšných</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{results.failCount}</div>
                <div className="text-sm text-red-700">Neúspěšných</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.totalProcessed}</div>
                <div className="text-sm text-blue-700">Celkem</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{results.reviewQueueAdded || 0}</div>
                <div className="text-sm text-purple-700">Do Review</div>
              </div>
            </div>

            {/* Detailní seznam všech výsledků */}
            {results.results && results.results.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">📋 Detailní výsledky</h4>
                <div className="space-y-2">
                  {results.results.map((result, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${
                        result.success 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className={`mr-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                              {result.success ? '✅' : '❌'}
                            </span>
                            <span className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                              {result.reviewData?.name || 'Neznámý produkt'}
                            </span>
                          </div>
                          <div className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                            🔗 {result.url}
                          </div>
                          {!result.success && result.error && (
                            <div className="text-sm text-red-600 mt-1 bg-red-100 p-2 rounded">
                              <strong>Chyba:</strong> {result.error}
                            </div>
                          )}
                          {result.success && result.reviewData && (
                            <div className="text-sm text-green-600 mt-1">
                              📊 {result.reviewData.category} • 💰 {result.reviewData.price > 0 ? `$${result.reviewData.price}` : 'Zdarma'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Queue tabulka */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">📋 Review Queue</h2>
            
            {reviewQueue.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={selectAllProducts}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  {selectedProducts.size === reviewQueue.length ? 'Zrušit výběr' : 'Vybrat vše'}
                </button>
                
                {selectedProducts.size > 0 && (
                  <button
                    onClick={() => approveProducts(Array.from(selectedProducts))}
                    disabled={isApproving}
                    className="px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    ✅ Schválit ({selectedProducts.size})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {isLoadingReview ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">🔄 Načítám review queue...</div>
          </div>
        ) : reviewQueue.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">📭 Review queue je prázdná</div>
            <p className="text-sm text-gray-400 mt-2">Přidejte nějaké URL adresy pro scraping</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === reviewQueue.length && reviewQueue.length > 0}
                      onChange={selectAllProducts}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produkt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cena
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Screenshot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviewQueue.map((product) => (
                  <tr key={product.reviewId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.reviewId)}
                        onChange={() => toggleProductSelection(product.reviewId)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 truncate max-w-xs">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                        <a
                          href={product.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 truncate max-w-xs block"
                        >
                          🔗 {product.externalUrl}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.screenshotUrl ? (
                        <img
                          src={product.screenshotUrl}
                          alt="Screenshot"
                          className="h-12 w-20 object-cover rounded border"
                        />
                      ) : (
                        <div className="h-12 w-20 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                          Bez screenshot
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ✏️ Upravit
                      </button>
                      <button
                        onClick={() => approveProducts([product.reviewId])}
                        disabled={isApproving}
                        className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                      >
                        ✅ Schválit
                      </button>
                      <button
                        onClick={() => deleteProduct(product.reviewId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Smazat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal pro editaci produktu */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={(updatedProduct: ReviewProduct) => {
            setEditingProduct(null)
            loadReviewQueue() // Reload queue po uložení
          }}
        />
      )}
    </div>
  )
} 