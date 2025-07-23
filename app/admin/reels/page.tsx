'use client'

import React, { useState, useEffect } from 'react'
import { FilmIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { getReelThumbnail } from '../../../lib/videoUtils'

interface Reel {
  id: string
  title: string
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  createdAt: string
  updatedAt: string
  adText: string | null
  adLink: string | null
  adEnabled: boolean
}

interface EditFormData {
  title: string
  description: string
  adText: string
  adLink: string
  adEnabled: boolean
}

export default function ReelsAdmin() {
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editingReel, setEditingReel] = useState<Reel | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState<EditFormData>({
    title: '',
    description: '',
    adText: '',
    adLink: '',
    adEnabled: false
  })
  const [submitting, setSubmitting] = useState(false)

  // Load reels from API
  useEffect(() => {
    loadReels()
  }, [])

  const loadReels = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reels')
      if (response.ok) {
        const data = await response.json()
        setReels(data)
      } else {
        setError('Chyba při načítání reels')
      }
    } catch (error) {
      setError('Chyba při načítání reels')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (reel: Reel) => {
    setEditingReel(reel)
    setFormData({
      title: reel.title,
      description: reel.description || '',
      adText: reel.adText || '',
      adLink: reel.adLink || '',
      adEnabled: reel.adEnabled
    })
    setShowEditModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReel) return

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/reels/${editingReel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadReels()
        setShowEditModal(false)
        setEditingReel(null)
        setSuccessMessage('Reel byl úspěšně aktualizován')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Chyba při ukládání')
      }
    } catch (error) {
      setError('Chyba při ukládání')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento reel? Tato akce je nevratná.')) {
      return
    }

    try {
      const response = await fetch(`/api/reels/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadReels()
        setSuccessMessage('Reel byl úspěšně smazán')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Chyba při mazání')
      }
    } catch (error) {
      setError('Chyba při mazání')
      console.error(error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Komponenta pro zobrazení thumbnails v admin rozhraní
  const AdminThumbnail = ({ reel }: { reel: Reel }) => {
    const finalThumbnail = getReelThumbnail(reel.thumbnailUrl, null)
    
    return (
             <div className="flex-shrink-0 relative">
         {/* Thumbnail nebo video preview */}
         <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 relative">
           {reel.thumbnailUrl ? (
             // Použij vlastní thumbnail pokud existuje
             <img
               src={finalThumbnail}
               alt={reel.title}
               className="w-full h-full object-cover"
               loading="lazy"
               onError={(e) => {
                 // Fallback na video preview při chybě
                 e.currentTarget.style.display = 'none'
                 const video = e.currentTarget.parentElement?.querySelector('video')
                 if (video) video.style.display = 'block'
               }}
             />
           ) : null}
           
           {/* Video fallback preview */}
           <video
             src={reel.videoUrl}
             className={`w-full h-full object-cover ${reel.thumbnailUrl ? 'hidden' : 'block'}`}
             preload="metadata"
             muted
             playsInline
             style={{ display: reel.thumbnailUrl ? 'none' : 'block' }}
             onError={() => {
               // Ultimate fallback na placeholder
               const placeholder = document.createElement('img')
               placeholder.src = '/img/reel-placeholder.svg'
               placeholder.className = 'w-full h-full object-cover'
               placeholder.alt = reel.title
             }}
           />
         </div>
         
         {/* Indikátor typu thumbnail */}
         <div className="absolute -top-1 -right-1">
           {reel.thumbnailUrl ? (
             <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full" title="Vlastní thumbnail">
               📷
             </span>
           ) : (
             <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-500 rounded-full" title="Video preview">
               🎬
             </span>
           )}
         </div>
       </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FilmIcon className="w-8 h-8 text-purple-600" />
            Správa Reels
          </h1>
          <p className="text-gray-600 mt-1">
            Spravuj video obsah, edituj banner reklamy a nastav propagační odkazy
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/reels/upload'}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nahrát nový reel
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FilmIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkem reels</p>
              <p className="text-2xl font-semibold text-gray-900">{reels.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl">📢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">S reklamou</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reels.filter(r => r.adEnabled).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktivní bannery</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reels.filter(r => r.adEnabled && r.adText && r.adLink).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Bez reklamy</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reels.filter(r => !r.adEnabled).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reels List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Seznam reels
          </h3>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : reels.length === 0 ? (
            <div className="text-center py-8">
              <FilmIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné reels</h3>
              <p className="mt-1 text-sm text-gray-500">
                Začněte nahráním prvního reelu.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      {/* Thumbnail */}
                      <AdminThumbnail reel={reel} />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {reel.title}
                          </h3>
                          
                          {/* Ad Status Badge */}
                          {reel.adEnabled ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Reklama ON
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              ⚪ Reklama OFF
                            </span>
                          )}
                        </div>

                        {reel.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {reel.description}
                          </p>
                        )}

                        {/* Ad Banner Info */}
                        {reel.adEnabled && reel.adText && reel.adLink && (
                          <div className="bg-purple-50 border border-purple-200 rounded-md p-3 mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-purple-800">📢 BANNER REKLAMA:</span>
                            </div>
                            <p className="text-sm text-purple-700 font-medium mb-1">
                              "{reel.adText}"
                            </p>
                            <a
                              href={reel.adLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-purple-600 hover:text-purple-800 underline break-all"
                            >
                              {reel.adLink}
                            </a>
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>📅 {formatDate(reel.createdAt)}</span>
                          {reel.updatedAt !== reel.createdAt && (
                            <span>✏️ Upraveno {formatDate(reel.updatedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(reel.videoUrl, '_blank')}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        title="Zobrazit video"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(reel)}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors"
                        title="Upravit reel a banner"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(reel.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        title="Smazat reel"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingReel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Upravit reel a banner nastavení
              </h3>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b pb-2">
                  📹 Základní informace
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Název reelu *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Popis
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Volitelný popis reelu..."
                  />
                </div>
              </div>

              {/* Banner Settings */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b pb-2">
                  📢 Nastavení reklamního banneru
                </h4>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    <strong>ℹ️ Jak to funguje:</strong> Banner se zobrazí po 5 sekundách přehrávání na spodku videa. 
                    Obsahuje váš text + tlačítko "Learn More" které vede na zadaný odkaz.
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="adEnabled"
                    checked={formData.adEnabled}
                    onChange={(e) => setFormData({ ...formData, adEnabled: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="adEnabled" className="ml-2 block text-sm text-gray-900">
                    Povolit reklamní banner pro tento reel
                  </label>
                </div>

                {formData.adEnabled && (
                  <div className="space-y-4 ml-6 border-l-2 border-purple-200 pl-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text banneru *
                      </label>
                      <input
                        type="text"
                        value={formData.adText}
                        onChange={(e) => setFormData({ ...formData, adText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Např. Objevte AI nástroj pro vytváření obsahu"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximálně 60 znaků. Aktuálně: {formData.adText.length}/60
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cílový odkaz *
                      </label>
                      <input
                        type="url"
                        value={formData.adLink}
                        onChange={(e) => setFormData({ ...formData, adLink: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://example.com/product"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Úplná URL adresa včetně https://
                      </p>
                    </div>

                    {/* Preview */}
                    {formData.adText && formData.adLink && (
                      <div className="bg-gray-900 rounded-lg p-4 relative">
                        <div className="text-xs text-gray-400 mb-2">👁️ Náhled banneru:</div>
                        <div className="h-12 bg-gradient-to-r from-black/80 via-black/70 to-black/80 backdrop-blur-sm flex items-center justify-between px-4 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {formData.adText}
                            </p>
                          </div>
                          <div className="ml-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-semibold flex-shrink-0">
                            Learn More
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingReel(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={submitting}
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50"
                  disabled={submitting || !formData.title || (formData.adEnabled && (!formData.adText || !formData.adLink))}
                >
                  {submitting ? 'Ukládám...' : 'Uložit změny'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 