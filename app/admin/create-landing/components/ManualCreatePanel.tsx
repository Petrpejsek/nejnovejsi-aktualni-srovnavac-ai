'use client'

import React, { useState } from 'react'
import { generateSlug, validateSlug } from '@/lib/utils'

interface ApiResponse {
  status: 'ok' | 'error'
  url?: string
  slug?: string
  error?: string
  details?: string[] | string
  warnings?: string[]
  conflictingPage?: {
    title: string
    createdAt: string
  }
}

export default function ManualCreatePanel() {
  const [jsonPayload, setJsonPayload] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generateUniqueSlug, setGenerateUniqueSlug] = useState(false)
  const [formatMessage, setFormatMessage] = useState<string | null>(null)

  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString)
      return true
    } catch {
      return false
    }
  }

  const handleFormatJson = () => {
    console.log('🧹 Format JSON called')
    setFormatMessage(null)
    setError(null)

    if (!jsonPayload.trim()) {
      setError('Není co formátovat - JSON je prázdný')
      return
    }

    console.log('📋 Raw JSON length:', jsonPayload.length)
    console.log('📋 First 100 chars:', jsonPayload.substring(0, 100))
    
    try {
      // Aggressive cleaning of AI watermarks and invisible characters
      let cleanJson = jsonPayload
        // Remove BOM and zero-width characters (common AI watermarks)
        .replace(/[\uFEFF\u200B-\u200D\u2060-\u206F]/g, '')
        // Remove invisible separators and formatting marks
        .replace(/[\u180E\u061C\u2066-\u2069]/g, '')
        // Remove soft hyphens and other control chars
        .replace(/[\u00AD\u034F\u115F\u1160\u17B4\u17B5]/g, '')
        // Remove variation selectors (Unicode watermarks)
        .replace(/[\uFE00-\uFE0F\uE0100-\uE01EF]/g, '')
        // Remove any remaining control characters except newlines/tabs
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
        // Clean multiple whitespaces
        .replace(/\s+/g, ' ')
        .trim()
      
      // Fix schema_org if it's an object (convert to string)
      const parsed = JSON.parse(cleanJson)
      if (parsed.schema_org && typeof parsed.schema_org === 'object') {
        parsed.schema_org = JSON.stringify(parsed.schema_org)
      }
      
      const formatted = JSON.stringify(parsed, null, 2)
      
      console.log('🧹 Original length:', jsonPayload.length)
      console.log('🧹 Cleaned length:', cleanJson.length)
      console.log('🧹 Removed watermarks/chars:', jsonPayload.length - cleanJson.length)
      
      // Check for common AI watermark patterns
      const suspiciousChars = jsonPayload.match(/[\uFEFF\u200B-\u200D\u2060-\u206F\uFE00-\uFE0F]/g)
      if (suspiciousChars) {
        console.log('🚨 Detected AI watermarks:', suspiciousChars.map(c => '\\u' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')))
      }
      
      setJsonPayload(formatted)
      
      const removedCount = jsonPayload.length - cleanJson.length
      const wasSchemaOrgFixed = parsed.schema_org && typeof JSON.parse(cleanJson).schema_org === 'object'
      
      let message = '✅ JSON úspěšně naformátován!'
      if (removedCount > 0 && wasSchemaOrgFixed) {
        message = `✅ JSON naformátován + odstraněno ${removedCount} watermark znaků + opraveno schema_org!`
      } else if (removedCount > 0) {
        message = `✅ JSON naformátován + odstraněno ${removedCount} watermark znaků!`
      } else if (wasSchemaOrgFixed) {
        message = `✅ JSON naformátován + opraveno schema_org (objekt → string)!`
      }
      
      setFormatMessage(message)
      
      // Clear message after 5 seconds (longer to read longer messages)
      setTimeout(() => setFormatMessage(null), 5000)
    } catch (error) {
      console.error('❌ JSON format error:', error)
      
      const errorMsg = error instanceof Error ? error.message : String(error)
      setError(`Nevalidní JSON formát: ${errorMsg}`)
    }
  }

  const handleSubmit = async () => {
    console.log('🔥 handleSubmit called')
    setIsSubmitting(true)
    setResult(null)
    setError(null)
    setFormatMessage(null)

    // Basic JSON validation
    if (!jsonPayload.trim()) {
      console.log('❌ Empty JSON payload')
      setError('JSON payload je povinný')
      setIsSubmitting(false)
      return
    }

    console.log('📋 JSON payload:', jsonPayload.substring(0, 100) + '...')
    
    if (!validateJson(jsonPayload)) {
      console.log('❌ JSON validation failed')
      setError('Nevalidní JSON formát')
      setIsSubmitting(false)
      return
    }
    
    console.log('✅ JSON validation passed')

    try {
      // Parse JSON to check and potentially modify slug
      let parsedPayload = JSON.parse(jsonPayload)
      let finalSlug = parsedPayload.slug
      
      console.log('🔍 Parsed payload:', { 
        title: parsedPayload.title, 
        slug: parsedPayload.slug,
        generateUniqueSlug 
      })

      // Check if slug is missing or should be auto-generated
      if (!parsedPayload.slug && !generateUniqueSlug) {
        console.log('❌ Missing slug and auto-generation disabled')
        setError('JSON payload neobsahuje slug. Buď jej přidejte do JSONu, nebo zaškrtněte "Generovat unikátní slug".')
        setIsSubmitting(false)
        return
      }

      // Generate unique slug if requested
      if (generateUniqueSlug) {
        finalSlug = generateSlug()
        parsedPayload.slug = finalSlug
        console.log('🎲 Generated slug:', finalSlug)
      }

      // Validate slug format
      if (finalSlug && !validateSlug(finalSlug)) {
        console.log('❌ Slug validation failed:', finalSlug)
        setError(`Slug "${finalSlug}" není ve správném formátu. Používejte pouze malá písmena, čísla a pomlčky (max. 100 znaků).`)
        setIsSubmitting(false)
        return
      }
      
      console.log('✅ Slug validation passed:', finalSlug)

      console.log('🚀 Making API request with payload:', parsedPayload)
      
      const response = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedPayload),
      })

      console.log('📡 API response status:', response.status)
      const data = await response.json()
      console.log('📋 API response data:', data)

      if (response.ok) {
        setResult({
          status: 'ok',
          url: data.url,
          slug: finalSlug
        })
      } else {
        setResult({
          status: 'error',
          error: data.error,
          details: data.details,
          warnings: data.warnings,
          conflictingPage: data.conflictingPage
        })
      }
    } catch (err) {
      console.error('❌ Error submitting landing page:', err)
      setError('Chyba při odesílání požadavku: ' + (err instanceof Error ? err.message : 'Neznámá chyba'))
    } finally {
      console.log('🏁 handleSubmit finished')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">JSON Payload (AI Farma formát)</h2>
          
          <textarea
            value={jsonPayload}
            onChange={(e) => setJsonPayload(e.target.value)}
            placeholder="Vložte JSON payload zde..."
            className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-purple-500 focus:border-purple-500"
            disabled={isSubmitting}
          />

          <div className="mt-4 space-y-4">
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !jsonPayload.trim()}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Publikuji...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Publikovat stránku
                  </>
                )}
              </button>

              <button
                onClick={handleFormatJson}
                disabled={isSubmitting || !jsonPayload.trim()}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>🧹</span>
                Učesat JSON
              </button>

              <button
                onClick={() => {
                  setJsonPayload('')
                  setResult(null)
                  setError(null)
                  setFormatMessage(null)
                }}
                disabled={isSubmitting}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Vymazat vše
              </button>
            </div>

            {/* Auto-generate slug checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="generateSlug"
                checked={generateUniqueSlug}
                onChange={(e) => setGenerateUniqueSlug(e.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label 
                htmlFor="generateSlug" 
                className="text-sm text-gray-700 select-none cursor-pointer"
              >
                ✨ Generovat unikátní slug (nahradí existující slug v JSONu)
              </label>
            </div>
            
            {generateUniqueSlug && (
              <div className="text-xs text-gray-500 ml-6">
                💡 Automaticky se vygeneruje slug ve formátu: test-landing-YYYYMMDDHHMM
              </div>
            )}
          </div>
        </div>

        {/* JSON Format Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">📋 Formát AI Farma payloadu</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Povinné:</strong> title, contentHtml, keywords</p>
            <p><strong>Nepovinné:</strong> slug, summary, imageUrl, publishedAt, category, faq</p>
            <p><strong>Slug:</strong> pokud není zadán a není zaškrtnuto "Generovat unikátní slug", zobrazí se chyba</p>
            <p><strong>Pozor:</strong> slug musí obsahovat pouze malá písmena, čísla a pomlčky (max. 100 znaků)</p>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {/* Format Success Message */}
        {formatMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🧹</span>
              <div>
                <h3 className="text-sm font-medium text-green-900">Formátování</h3>
                <p className="text-sm text-green-800 mt-1">{formatMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">❌</span>
              <div>
                <h3 className="text-sm font-medium text-red-900">Chyba</h3>
                <p className="text-sm text-red-800 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result?.status === 'ok' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <h3 className="text-sm font-medium text-green-900">Landing page úspěšně vytvořena!</h3>
                {result.slug && (
                  <p className="text-sm text-green-800 mt-1">
                    <strong>Použitý slug:</strong> <code className="bg-green-100 px-1 rounded">{result.slug}</code>
                  </p>
                )}
                <p className="text-sm text-green-800 mt-1">
                  Stránka je dostupná na: 
                  <a 
                    href={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${result.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 font-medium underline hover:no-underline text-blue-600"
                  >
                    {(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') + result.url}
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Result */}
        {result?.status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3 mt-1">❌</span>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-900">{result.error}</h3>
                
                {/* Validation errors */}
                {Array.isArray(result.details) && result.details.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-red-800 font-medium">Chyby validace:</p>
                    <ul className="text-sm text-red-700 mt-1 list-disc list-inside space-y-1">
                      {result.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Single error detail */}
                {typeof result.details === 'string' && (
                  <p className="text-sm text-red-800 mt-1">{result.details}</p>
                )}

                {/* Conflicting page info */}
                {result.conflictingPage && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <strong>Existující stránka:</strong> {result.conflictingPage.title}
                    </p>
                    <p className="text-xs text-red-600 mb-2">
                      Vytvořena: {new Date(result.conflictingPage.createdAt).toLocaleString('cs-CZ')}
                    </p>
                    <div className="flex gap-2">
                      <a
                        href="/admin/landing-pages"
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 transition-colors"
                      >
                        📝 Správa Landing Pages
                      </a>
                      <button
                        onClick={() => window.open('http://localhost:5555', '_blank')}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                        title="Otevřít Prisma Studio pro rychlé smazání"
                      >
                        🗄️ Prisma Studio
                      </button>
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-orange-800 font-medium">Upozornění:</p>
                    <ul className="text-sm text-orange-700 mt-1 list-disc list-inside space-y-1">
                      {result.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* API Documentation */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">📚 API Dokumentace</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Endpoint:</strong> POST /api/landing-pages</p>
            <p><strong>Status kódy:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
              <li>201 - Úspěšně vytvořeno</li>
              <li>422 - Validační chyby</li>
              <li>409 - Konflikt slugů</li>
              <li>500 - Serverová chyba</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
