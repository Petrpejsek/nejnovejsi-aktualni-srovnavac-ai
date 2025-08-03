'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  ArrowLeftIcon, 
  PhotoIcon, 
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PlayIcon,
  LinkIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { getImageUrl } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  pendingImageUrl?: string | null
  imageApprovalStatus?: 'pending' | 'approved' | 'rejected' | null
  tags: string[]
  advantages: string[]
  disadvantages: string[]
  detailInfo: string
  pricingInfo: {
    basic: string
    pro: string
    enterprise: string
  }
  videoUrls: string[]
  externalUrl: string
  hasTrial: boolean
  createdAt?: string
  updatedAt?: string
}

interface AssignedCompany {
  id: string
  name: string
  email: string
  contactPerson: string
  website?: string
  status: string
  createdAt: string
  lastLoginAt?: string
}

export default function AdminProductEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [assignedCompany, setAssignedCompany] = useState<AssignedCompany | null>(null)
  const [isLoadingCompany, setIsLoadingCompany] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')
  const [newAdvantage, setNewAdvantage] = useState('')
  const [newDisadvantage, setNewDisadvantage] = useState('')
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isRegeneratingScreenshot, setIsRegeneratingScreenshot] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  
  const [product, setProduct] = useState<Product>({
    id: params.id,
    name: '',
    description: '',
    price: 0,
    category: 'AI Writing',
    imageUrl: '',
    pendingImageUrl: null,
    imageApprovalStatus: null,
    tags: [],
    advantages: [],
    disadvantages: [],
    detailInfo: '',
    pricingInfo: {
      basic: '29',
      pro: '49', 
      enterprise: '99'
    },
    videoUrls: [],
    externalUrl: '',
    hasTrial: false
  })

  // Načtení produktu a přiřazené firmy při načtení stránky
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoadingProduct(true)
        setIsLoadingCompany(true)
        
        // Načítání produktu a přiřazené firmy paralelně
        const [productResponse, companyResponse] = await Promise.all([
          fetch(`/api/products/${params.id}`),
          fetch(`/api/products/${params.id}/assigned-company`)
        ])
        
        if (productResponse.ok) {
          const productData = await productResponse.json()
          
          // Zpracovat JSON pole z databáze
          const processedProduct = {
            ...productData,
            tags: Array.isArray(productData.tags) ? productData.tags : 
                  (typeof productData.tags === 'string' ? JSON.parse(productData.tags || '[]') : []),
            advantages: Array.isArray(productData.advantages) ? productData.advantages : 
                       (typeof productData.advantages === 'string' ? JSON.parse(productData.advantages || '[]') : []),
            disadvantages: Array.isArray(productData.disadvantages) ? productData.disadvantages : 
                          (typeof productData.disadvantages === 'string' ? JSON.parse(productData.disadvantages || '[]') : []),
            videoUrls: Array.isArray(productData.videoUrls) ? productData.videoUrls : 
                      (typeof productData.videoUrls === 'string' ? JSON.parse(productData.videoUrls || '[]') : []),
            pricingInfo: typeof productData.pricingInfo === 'object' ? productData.pricingInfo : 
                        (typeof productData.pricingInfo === 'string' ? JSON.parse(productData.pricingInfo || '{"basic":"29","pro":"49","enterprise":"99"}') : {basic:"29",pro:"49",enterprise:"99"})
          }
          
          setProduct(processedProduct)
          
          // V super adminu se pending obrázky nemají zobrazovat jako preview
          // Pokud existuje pending obrázek, přesunout ho přímo do hlavního obrázku
          if (productData.pendingImageUrl && productData.imageApprovalStatus === 'pending') {
            // Přesunout pending obrázek do hlavního
            const updatedProduct = {
              ...processedProduct,
              imageUrl: productData.pendingImageUrl,
              pendingImageUrl: null,
              imageApprovalStatus: null
            }
            setProduct(updatedProduct)
            
            // Automaticky uložit tuto změnu (bez zobrazení zprávy)
            setTimeout(() => {
              handleSubmit(new Event('submit') as any, false)
            }, 100)
          }
        } else {
          setErrorMessage('Nepodařilo se načíst produkt')
        }
        
        // Načtení přiřazené firmy
        if (companyResponse.ok) {
          const companyData = await companyResponse.json()
          setAssignedCompany(companyData.assignedCompany)
        } else {
          console.error('Failed to load assigned company')
        }
        
      } catch (error) {
        console.error('Error loading product:', error)
        setErrorMessage('Chyba při načítání produktu')
      } finally {
        setIsLoadingProduct(false)
        setIsLoadingCompany(false)
      }
    }

    loadProduct()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent, showMessage: boolean = true) => {
    e.preventDefault()
    
    console.log('🔧 DEBUG: handleSubmit called, showMessage:', showMessage)
    console.log('🔧 DEBUG: Current product data:', product)
    
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    
    try {
      // Připravit data pro odeslání
      const dataToSave = {
        ...product,
        // Převést pole na JSON stringy pro databázi
        tags: JSON.stringify(product.tags),
        advantages: JSON.stringify(product.advantages),
        disadvantages: JSON.stringify(product.disadvantages),
        videoUrls: JSON.stringify(product.videoUrls),
        pricingInfo: JSON.stringify(product.pricingInfo)
      }

      console.log('🔧 DEBUG: Data to save:', dataToSave)
      console.log('🔧 DEBUG: Sending PUT request to:', `/api/products/${params.id}`)

      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      })

      console.log('🔧 DEBUG: Response status:', response.status)
      console.log('🔧 DEBUG: Response ok:', response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log('🔧 DEBUG: Response data:', result)
        
        if (showMessage) {
          setSuccessMessage('✅ Produkt byl úspěšně uložen!')
          setErrorMessage(null)
          
          // Zpráva se zobrazí na 5 sekund
          setTimeout(() => setSuccessMessage(null), 5000)
        }
        console.log('✅ DEBUG: Product saved successfully')
      } else {
        const errorData = await response.text()
        console.error('❌ DEBUG: Server error response:', errorData)
        setErrorMessage('❌ Chyba při ukládání produktu: ' + response.status)
        setSuccessMessage(null)
      }
    } catch (error) {
      console.error('💥 DEBUG: Exception in handleSubmit:', error)
      setErrorMessage('Chyba při ukládání produktu: ' + (error instanceof Error ? error.message : String(error)))
      setSuccessMessage(null)
    } finally {
      console.log('🏁 DEBUG: handleSubmit finished, setting isLoading to false')
      setIsLoading(false)
    }
  }

  // Funkce pro správu tagů
  const addTag = () => {
    if (newTag.trim()) {
      setProduct(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setProduct(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Funkce pro správu výhod
  const addAdvantage = () => {
    if (newAdvantage.trim()) {
      setProduct(prev => ({
        ...prev,
        advantages: [...prev.advantages, newAdvantage.trim()]
      }))
      setNewAdvantage('')
    }
  }

  const removeAdvantage = (advantageToRemove: string) => {
    setProduct(prev => ({
      ...prev,
      advantages: prev.advantages.filter(advantage => advantage !== advantageToRemove)
    }))
  }

  // Funkce pro správu nevýhod
  const addDisadvantage = () => {
    if (newDisadvantage.trim()) {
      setProduct(prev => ({
        ...prev,
        disadvantages: [...prev.disadvantages, newDisadvantage.trim()]
      }))
      setNewDisadvantage('')
    }
  }

  const removeDisadvantage = (disadvantageToRemove: string) => {
    setProduct(prev => ({
      ...prev,
      disadvantages: prev.disadvantages.filter(disadvantage => disadvantage !== disadvantageToRemove)
    }))
  }

  // Funkce pro správu video URL
  const addVideoUrl = () => {
    if (newVideoUrl.trim()) {
      setProduct(prev => ({
        ...prev,
        videoUrls: [...prev.videoUrls, newVideoUrl.trim()]
      }))
      setNewVideoUrl('')
    }
  }

  const removeVideoUrl = (urlToRemove: string) => {
    setProduct(prev => ({
      ...prev,
      videoUrls: prev.videoUrls.filter(url => url !== urlToRemove)
    }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0])
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0])
    }
  }

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('productName', product.name || 'product')

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setImagePreview(result.imageUrl)
        setProduct(prev => ({
          ...prev,
          imageUrl: result.imageUrl, // V super adminu se nastaví přímo jako hlavní obrázek
          pendingImageUrl: null,
          imageApprovalStatus: null
        }))
        
        // Automaticky uložit produkt s novým obrázkem a pak zobrazit zprávu
        setTimeout(async () => {
          try {
            const updatedData = {
              ...product,
              imageUrl: result.imageUrl,
              pendingImageUrl: null,
              imageApprovalStatus: null,
              tags: JSON.stringify(product.tags),
              advantages: JSON.stringify(product.advantages),
              disadvantages: JSON.stringify(product.disadvantages),
              videoUrls: JSON.stringify(product.videoUrls),
              pricingInfo: JSON.stringify(product.pricingInfo)
            }

            const saveResponse = await fetch(`/api/products/${params.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedData),
            })

            if (saveResponse.ok) {
              setSuccessMessage('📸 Obrázek byl úspěšně nahrán a uložen!')
              setTimeout(() => setSuccessMessage(null), 5000)
            }
          } catch (error) {
            console.error('Error auto-saving product with new image:', error)
          }
        }, 100)
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.error || 'Chyba při nahrávání obrázku')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setErrorMessage('Chyba při nahrávání obrázku')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleRemoveCurrentImage = () => {
    setProduct(prev => ({
      ...prev,
      imageUrl: ''
    }))
    setSuccessMessage('🗑️ Aktuální obrázek bude odstraněn po uložení')
  }

  const handleRemoveNewImage = () => {
    setImagePreview(null)
    setProduct(prev => ({
      ...prev,
      imageUrl: product.imageUrl !== imagePreview ? product.imageUrl : '', // Pokud je nový obrázek stejný jako aktuální, odstraň ho
      pendingImageUrl: null,
      imageApprovalStatus: null
    }))
    setSuccessMessage('🗑️ Nový obrázek byl odstraněn')
  }

  const handleRegenerateScreenshot = async () => {
    console.log('🔄 Spouštím regeneraci screenshotu...')
    
    if (!product.externalUrl) {
      setErrorMessage('❌ Pro regeneraci screenshotu je vyžadována externí URL')
      console.error('❌ Chybí external URL')
      return
    }

    // Kontrola prostředí
    if (process.env.NODE_ENV !== 'development') {
      setErrorMessage('❌ Regenerace screenshotu je dostupná pouze v development prostředí')
      console.error('❌ Nesprávné prostředí:', process.env.NODE_ENV)
      return
    }

    console.log('📋 Produkt:', product.name)
    console.log('🌐 External URL:', product.externalUrl)

    const confirmed = window.confirm(`Opravdu chcete regenerovat screenshot pro "${product.name}"?\n\nNový screenshot bude vytvořen z URL: ${product.externalUrl}`)
    if (!confirmed) {
      console.log('❌ Uživatel zrušil regeneraci')
      return
    }

    console.log('⏳ Nastavuji loading state...')
    setIsRegeneratingScreenshot(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      console.log('📸 Posílám request na regeneraci...')
      const response = await fetch('/api/screenshot/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: product.externalUrl,
          productName: product.name 
        })
      })

      const data = await response.json()
      console.log('📊 Response z API:', data)

      if (data.success && data.screenshotUrl) {
        console.log('🎉 Screenshot úspěšně regenerován:', data.screenshotUrl)
        
        // Aktualizovat produkt s novým screenshotem
        setProduct(prev => ({
          ...prev,
          imageUrl: data.screenshotUrl,
          pendingImageUrl: null,
          imageApprovalStatus: null
        }))
        
        setSuccessMessage(`✅ Screenshot byl úspěšně regenerován! Nová cesta: ${data.screenshotUrl}`)
        
        console.log('💾 Automaticky ukládám změny...')
        // Automaticky uložit změny
        setTimeout(() => {
          const syntheticEvent = new Event('submit') as any
          handleSubmit(syntheticEvent, false)
        }, 500)
        
      } else {
        console.error('❌ API vrátilo chybu:', data)
        setErrorMessage(`❌ Chyba při regeneraci screenshotu: ${data.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('💥 Chyba při regeneraci screenshotu:', error)
      setErrorMessage('❌ Chyba při regeneraci screenshotu. Zkontrolujte zda je screenshot server spuštěný a zkuste to znovu.')
    } finally {
      console.log('🏁 Ukončuji loading state...')
      setIsRegeneratingScreenshot(false)
    }
  }

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám produkt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/products')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Zpět na produkty
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Editace produktu</h1>
          <p className="mt-2 text-gray-600">Upravte informace o produktu</p>
        </div>

        {/* Zprávy */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 bg-green-50 p-4 rounded-r shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 bg-red-50 p-4 rounded-r shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informace o přiřazené firmě */}
        {!isLoadingCompany && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BuildingOfficeIcon className="w-6 h-6 mr-2 text-purple-600" />
              Přiřazená firma
            </h2>
            
            {assignedCompany ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <BuildingOfficeIcon className="w-5 h-5 mr-2 text-blue-600" />
                      <h3 className="text-lg font-medium text-blue-900">{assignedCompany.name}</h3>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                        assignedCompany.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignedCompany.status === 'active' ? 'Aktivní' : 'Schválená'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">Email:</span>
                        <a 
                          href={`mailto:${assignedCompany.email}`}
                          className="ml-2 text-blue-600 hover:text-blue-800 underline"
                        >
                          {assignedCompany.email}
                        </a>
                      </div>
                      
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">Kontakt:</span>
                        <span className="ml-2 text-gray-900">{assignedCompany.contactPerson}</span>
                      </div>
                      
                      {assignedCompany.website && (
                        <div className="flex items-center">
                          <LinkIcon className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-gray-600">Web:</span>
                          <a 
                            href={assignedCompany.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-800 underline"
                          >
                            {assignedCompany.website}
                          </a>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">Registrace:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(assignedCompany.createdAt).toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <a
                      href={`/admin/companies?search=${encodeURIComponent(assignedCompany.email)}`}
                      className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Detail firmy
                    </a>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Důležité:</strong> Tento produkt je již přiřazen k firmě. 
                    Změny produktu se projeví v jejich reklamních kampaních.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <BuildingOfficeIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-2">Žádná firma nemá přiřazený tento produkt</p>
                <p className="text-sm text-gray-500">
                  Produkt lze přiřadit firmě v sekci 
                  <a href="/admin/companies" className="text-blue-600 hover:text-blue-800 underline ml-1">
                    Správa firem
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Formulář */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Základní informace</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Název produktu *
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => setProduct(prev => ({...prev, name: e.target.value}))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kategorie *
                </label>
                <select
                  value={product.category}
                  onChange={(e) => setProduct(prev => ({...prev, category: e.target.value}))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="AI Writing">AI Writing</option>
                  <option value="AI Video">AI Video</option>
                  <option value="AI Audio">AI Audio</option>
                  <option value="AI Image">AI Image</option>
                  <option value="AI Coding">AI Coding</option>
                  <option value="AI Business">AI Business</option>
                  <option value="AI Analytics">AI Analytics</option>
                  <option value="AI Tools">AI Tools</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cena ($) *
                </label>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => setProduct(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Externí odkaz *
                </label>
                <input
                  type="url"
                  value={product.externalUrl}
                  onChange={(e) => setProduct(prev => ({...prev, externalUrl: e.target.value}))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Popis produktu *
              </label>
              <textarea
                value={product.description}
                onChange={(e) => setProduct(prev => ({...prev, description: e.target.value}))}
                rows={4}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="Stručný popis produktu..."
                required
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Detailní informace
              </label>
              <textarea
                value={product.detailInfo}
                onChange={(e) => setProduct(prev => ({...prev, detailInfo: e.target.value}))}
                rows={6}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="Podrobné informace o produktu, funkcích, použití..."
              />
            </div>

            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={product.hasTrial}
                  onChange={(e) => setProduct(prev => ({...prev, hasTrial: e.target.checked}))}
                  className="rounded border-gray-300 text-purple-600 shadow-sm focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Má bezplatnou zkušební verzi</span>
              </label>
            </div>
          </div>

          {/* Obrázek */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Obrázek produktu</h2>
            
            <div className="space-y-4">
              {/* Aktuální obrázek */}
              {product.imageUrl && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Aktuální obrázek:</p>
                    <button
                      type="button"
                      onClick={handleRemoveCurrentImage}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Smazat
                    </button>
                  </div>
                  <div className="relative inline-block">
                    <Image
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Upload area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragActive 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Nahrát nový obrázek
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PNG, JPG, GIF do 10MB
                      </span>
                    </label>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUploadingImage}
                    />
                  </div>
                </div>

                {isUploadingImage && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Nahrávám obrázek...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Regenerace screenshotu */}
              {process.env.NODE_ENV === 'development' && (
                <div className={`border rounded-lg p-4 transition-all ${
                  isRegeneratingScreenshot 
                    ? 'border-blue-400 bg-blue-100 shadow-lg' 
                    : 'border-blue-200 bg-blue-50'
                }`}>
                  {isRegeneratingScreenshot && (
                    <div className="mb-4 p-3 bg-blue-200 rounded-lg border border-blue-300">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                        <div>
                          <div className="text-sm font-medium text-blue-900">🚀 Regeneruji screenshot...</div>
                          <div className="text-xs text-blue-700 mt-1">
                            Vytváří se nový screenshot z: {product.externalUrl}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-blue-900 mb-1">
                        🔄 Automatická regenerace screenshotu
                      </h3>
                      <p className="text-sm text-blue-700">
                        Vytvoří nový screenshot z externí URL produktu ({product.externalUrl || 'URL není nastavena'})
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        💡 Dostupné pouze v development prostředí (localhost)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRegenerateScreenshot}
                      disabled={isRegeneratingScreenshot || !product.externalUrl}
                      className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isRegeneratingScreenshot ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Regeneruji...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Regenerovat Screenshot
                        </>
                      )}
                    </button>
                  </div>
                  {!product.externalUrl && (
                    <div className="mt-2 text-xs text-red-600">
                      ⚠️ Pro regeneraci screenshotu je nutné mít nastavenou externí URL
                    </div>
                  )}
                </div>
              )}

              {/* Preview nového obrázku */}
              {imagePreview && imagePreview !== product.imageUrl && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Nový obrázek (před uložením):
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveNewImage}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Smazat
                    </button>
                  </div>
                  <div className="relative inline-block">
                    <Image
                      src={getImageUrl(imagePreview)}
                      alt="Preview"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Připraven k uložení
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tagy */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tagy</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Přidat nový tag..."
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Výhody */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Výhody</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAdvantage}
                  onChange={(e) => setNewAdvantage(e.target.value)}
                  placeholder="Přidat novou výhodu..."
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAdvantage())}
                />
                <button
                  type="button"
                  onClick={addAdvantage}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {product.advantages.map((advantage, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <span className="text-green-800">{advantage}</span>
                    <button
                      type="button"
                      onClick={() => removeAdvantage(advantage)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nevýhody */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nevýhody</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newDisadvantage}
                  onChange={(e) => setNewDisadvantage(e.target.value)}
                  placeholder="Přidat novou nevýhodu..."
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDisadvantage())}
                />
                <button
                  type="button"
                  onClick={addDisadvantage}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {product.disadvantages.map((disadvantage, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <span className="text-red-800">{disadvantage}</span>
                    <button
                      type="button"
                      onClick={() => removeDisadvantage(disadvantage)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cenové informace */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cenové informace</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Basic plán ($)
                </label>
                <input
                  type="text"
                  value={product.pricingInfo.basic}
                  onChange={(e) => setProduct(prev => ({
                    ...prev,
                    pricingInfo: { ...prev.pricingInfo, basic: e.target.value }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="29"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pro plán ($)
                </label>
                <input
                  type="text"
                  value={product.pricingInfo.pro}
                  onChange={(e) => setProduct(prev => ({
                    ...prev,
                    pricingInfo: { ...prev.pricingInfo, pro: e.target.value }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="49"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enterprise plán ($)
                </label>
                <input
                  type="text"
                  value={product.pricingInfo.enterprise}
                  onChange={(e) => setProduct(prev => ({
                    ...prev,
                    pricingInfo: { ...prev.pricingInfo, enterprise: e.target.value }
                  }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="99"
                />
              </div>
            </div>
          </div>

          {/* Video URL */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Video odkazy</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Přidat video URL..."
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())}
                />
                <button
                  type="button"
                  onClick={addVideoUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {product.videoUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <PlayIcon className="h-4 w-4 text-blue-600 mr-2" />
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {url}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideoUrl(url)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tlačítka */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ukládám...
                </>
              ) : (
                'Uložit změny'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}