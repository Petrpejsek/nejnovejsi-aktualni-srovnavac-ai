'use client'

import { useState } from 'react'
import { getImageUrl } from '@/lib/utils'

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

interface EditProductModalProps {
  product: ReviewProduct
  onClose: () => void
  onSave: (updatedProduct: ReviewProduct) => void
}

export default function EditProductModal({ product, onClose, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState<ReviewProduct>(product)
  const [isSaving, setIsSaving] = useState(false)
  const [isRegeneratingScreenshot, setIsRegeneratingScreenshot] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleInputChange = (field: keyof ReviewProduct, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field: 'advantages' | 'disadvantages' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: 'advantages' | 'disadvantages' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'advantages' | 'disadvantages' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const regenerateScreenshot = async () => {
    if (!formData.externalUrl) {
      alert('URL je vyžadována pro regeneraci screenshotu')
      return
    }

    const confirmed = window.confirm('Opravdu chcete regenerovat screenshot?')
    if (!confirmed) return

    setIsRegeneratingScreenshot(true)

    try {
      const response = await fetch('/api/screenshot/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: formData.externalUrl,
          productName: formData.name 
        })
      })

      const data = await response.json()

      if (data.success && data.screenshotUrl) {
        setFormData(prev => ({
          ...prev,
          screenshotUrl: data.screenshotUrl
        }))
        alert('✅ Screenshot byl úspěšně regenerován')
      } else {
        alert(`❌ Chyba při regeneraci: ${data.error}`)
      }
    } catch (error) {
      alert('Chyba při regeneraci screenshotu')
      console.error(error)
    } finally {
      setIsRegeneratingScreenshot(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Prosím vyberte obrázek')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Obrázek je příliš velký (max 10MB)')
      return
    }

    setSelectedImage(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    // Reset input value to allow re-selecting the same file (Safari/Chrome)
    event.target.value = ''
  }

  const uploadImage = async () => {
    if (!selectedImage) return

    const confirmed = window.confirm('Nahradit screenshot vlastním obrázkem?')
    if (!confirmed) return

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', selectedImage)
      formDataUpload.append('productName', formData.name)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formDataUpload
      })

      const data = await response.json()

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          screenshotUrl: data.imageUrl
        }))
        setSelectedImage(null)
        setImagePreview(null)
        alert('✅ Obrázek byl úspěšně nahrán')
      } else {
        alert(`❌ Chyba při uploadu: ${data.error}`)
      }
    } catch (error) {
      alert('Chyba při nahrávání obrázku')
      console.error(error)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Název produktu je vyžadován')
      return
    }

    if (!formData.description.trim()) {
      alert('Popis produktu je vyžadován')
      return
    }

    if (!formData.category.trim()) {
      alert('Kategorie je vyžadována')
      return
    }

    setIsSaving(true)

    try {
      const cleanFormData = {
        ...formData,
        advantages: formData.advantages.filter(item => item.trim()),
        disadvantages: formData.disadvantages.filter(item => item.trim()),
        tags: formData.tags.filter(item => item.trim())
      }

      const response = await fetch('/api/review-queue/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: product.reviewId,
          updatedData: cleanFormData
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Produkt byl úspěšně aktualizován')
        onSave(cleanFormData)
      } else {
        alert(`❌ Chyba při ukládání: ${data.error}`)
      }
    } catch (error) {
      alert('Chyba při ukládání produktu')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">✏️ Editace produktu</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Obsah */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Levý sloupec - Základní informace */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">📝 Základní informace</h3>

              {/* Název */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název produktu *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Název produktu"
                />
              </div>

              {/* Popis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Krátký popis *
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Krátký popis produktu"
                />
              </div>

              {/* Detailní info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailní informace
                </label>
                <textarea
                  rows={4}
                  value={formData.detailInfo}
                  onChange={(e) => handleInputChange('detailInfo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Detailní popis funkcí a možností"
                />
              </div>

              {/* Kategorie a cena */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Vyberte kategorii</option>
                    <option value="Content & Writing">📝 Content & Writing</option>
                    <option value="Meetings & Communication">🎤 Meetings & Communication</option>
                    <option value="Productivity & Organization">📊 Productivity & Organization</option>
                    <option value="Design & Visual">🎨 Design & Visual</option>
                    <option value="Marketing & Social Media">📢 Marketing & Social Media</option>
                    <option value="Audio & Music">🎵 Audio & Music</option>
                    <option value="Business & Enterprise">🏢 Business & Enterprise</option>
                    <option value="Developer & Technical">💻 Developer & Technical</option>
                    <option value="Browsing & Utilities">🔧 Browsing & Utilities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cena
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* URL a trial */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Externí URL
                  </label>
                  <input
                    type="url"
                    value={formData.externalUrl}
                    onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center pt-8">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hasTrial}
                      onChange={(e) => handleInputChange('hasTrial', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Má zkušební verzi</span>
                  </label>
                </div>
              </div>

              {/* Výhody */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Výhody ✅
                </label>
                {formData.advantages.map((advantage, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={advantage}
                      onChange={(e) => handleArrayChange('advantages', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Výhoda produktu"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('advantages', index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('advantages')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Přidat výhodu
                </button>
              </div>

              {/* Nevýhody */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nevýhody ❌
                </label>
                {formData.disadvantages.map((disadvantage, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={disadvantage}
                      onChange={(e) => handleArrayChange('disadvantages', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nevýhoda produktu"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('disadvantages', index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('disadvantages')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Přidat nevýhodu
                </button>
              </div>

              {/* Tagy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagy 🏷️
                </label>
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tag"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('tags', index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('tags')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Přidat tag
                </button>
              </div>
            </div>

            {/* Pravý sloupec - Screenshot */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">📸 Screenshot</h3>

              {/* Aktuální screenshot */}
              {formData.screenshotUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aktuální screenshot
                  </label>
                  <img
                    src={formData.screenshotUrl}
                    alt={formData.name}
                    className="w-full h-64 object-cover border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {/* Screenshot akce */}
              <div className="space-y-4">
                <button
                  onClick={regenerateScreenshot}
                  disabled={isRegeneratingScreenshot}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegeneratingScreenshot ? '⏳ Regeneruji...' : '🔄 Regenerovat screenshot'}
                </button>

                <div className="text-center text-gray-500">nebo</div>

                {/* Upload vlastního obrázku */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nahrát vlastní obrázek
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={uploadImage}
                        className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        📤 Nahrát obrázek
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cenové informace (JSON)
                </label>
                <textarea
                  rows={6}
                  value={typeof formData.pricingInfo === 'string' ? formData.pricingInfo : JSON.stringify(formData.pricingInfo, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      handleInputChange('pricingInfo', parsed)
                    } catch {
                      handleInputChange('pricingInfo', e.target.value)
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder='{"free": true, "plans": []}'
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Zrušit
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? '⏳ Ukládám...' : '💾 Uložit změny'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 