'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  tags?: string[]
  advantages?: string[]
  disadvantages?: string[]
  reviews?: Array<{
    author: string
    rating: number
    text: string
  }>
  detailInfo?: string
  pricingInfo?: {
    basic?: string
    pro?: string
    enterprise?: string
  }
  videoUrls?: string[]
  externalUrl?: string
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { register, handleSubmit, reset, setValue, watch } = useForm<Product>()
  const [imagePreview, setImagePreview] = useState<string>("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [advantages, setAdvantages] = useState<string[]>([])
  const [newAdvantage, setNewAdvantage] = useState("")
  const [disadvantages, setDisadvantages] = useState<string[]>([])
  const [newDisadvantage, setNewDisadvantage] = useState("")
  const [videos, setVideos] = useState<string[]>([])
  const [newVideoUrl, setNewVideoUrl] = useState("")

  // Načtení produktů při prvním renderu
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        // Převedeme stringy JSON zpět na objekty
        const processedData = data.map((product: Product) => ({
          ...product,
          tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
          advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages,
          disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages,
          pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo,
          videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls,
          externalUrl: product.externalUrl || null  // Přidáme explicitní zpracování externalUrl
        }))
        setProducts(processedData)
        console.log('Načtené produkty:', processedData) // Pro debugování
      }
    } catch (error) {
      console.error('Chyba při načítání produktů:', error)
    }
  }

  // Přidáme useEffect pro automatické obnovení dat
  useEffect(() => {
    const interval = setInterval(fetchProducts, 5000) // Obnovení každých 5 sekund
    return () => clearInterval(interval)
  }, [])

  const onSubmit = async (data: Product) => {
    try {
      console.log('Odesílaná data před úpravou:', data) // Pro debugování
      // Přidáme tagy a další pole do dat
      const productData = {
        ...data,
        price: parseFloat(data.price?.toString() || "0"),
        tags: JSON.stringify(tags),
        advantages: JSON.stringify(advantages),
        disadvantages: JSON.stringify(disadvantages),
        videoUrls: JSON.stringify(videos),
        externalUrl: data.externalUrl || null,  // Změníme na null místo prázdného řetězce
        pricingInfo: JSON.stringify({
          basic: data.pricingInfo?.basic || null,
          pro: data.pricingInfo?.pro || null,
          enterprise: data.pricingInfo?.enterprise || null
        })
      }
      console.log('Odesílaná data po úpravě:', productData) // Pro debugování

      if (editingProduct) {
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
        
        if (response.ok) {
          await fetchProducts()
          setEditingProduct(null)
        }
      } else {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
        
        if (response.ok) {
          await fetchProducts()
        }
      }
      reset()
      setTags([])
      setAdvantages([])
      setDisadvantages([])
      setVideos([])
      setImagePreview("")
    } catch (error) {
      console.error('Chyba při ukládání produktu:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchProducts()
      }
    } catch (error) {
      console.error('Chyba při mazání produktu:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setValue('imageUrl', base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const addAdvantage = () => {
    if (newAdvantage && !advantages.includes(newAdvantage)) {
      setAdvantages([...advantages, newAdvantage])
      setNewAdvantage("")
    }
  }

  const removeAdvantage = (advantageToRemove: string) => {
    setAdvantages(advantages.filter(adv => adv !== advantageToRemove))
  }

  const addDisadvantage = () => {
    if (newDisadvantage && !disadvantages.includes(newDisadvantage)) {
      setDisadvantages([...disadvantages, newDisadvantage])
      setNewDisadvantage("")
    }
  }

  const removeDisadvantage = (disadvantageToRemove: string) => {
    setDisadvantages(disadvantages.filter(dis => dis !== disadvantageToRemove))
  }

  const addVideo = () => {
    if (newVideoUrl && !videos.includes(newVideoUrl)) {
      setVideos([...videos, newVideoUrl])
      setNewVideoUrl("")
    }
  }

  const removeVideo = (videoToRemove: string) => {
    setVideos(videos.filter(video => video !== videoToRemove))
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    // Nastavíme hodnoty pro formulář
    setValue('name', product.name)
    setValue('description', product.description)
    setValue('price', product.price)
    setValue('category', product.category)
    setValue('imageUrl', product.imageUrl || '')
    setValue('detailInfo', product.detailInfo || '')
    setValue('externalUrl', product.externalUrl)
    
    // Nastavíme tagy
    const productTags = typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags
    setTags(productTags || [])
    
    // Nastavíme výhody
    const productAdvantages = typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages
    setAdvantages(productAdvantages || [])
    
    // Nastavíme nevýhody
    const productDisadvantages = typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages
    setDisadvantages(productDisadvantages || [])
    
    // Nastavíme videa
    const productVideos = typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls
    setVideos(productVideos || [])
    
    // Nastavíme cenové informace
    const pricing = typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo
    if (pricing) {
      setValue('pricingInfo.basic', pricing.basic || '')
      setValue('pricingInfo.pro', pricing.pro || '')
      setValue('pricingInfo.enterprise', pricing.enterprise || '')
    }
    
    // Nastavíme náhled obrázku
    if (product.imageUrl) {
      setImagePreview(product.imageUrl)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Správa Produktů</h1>
          <Link href="/admin" className="text-purple-600 hover:text-purple-700 font-medium">
            ← Zpět na admin panel
          </Link>
        </div>

        {/* Formulář pro přidání/editaci produktu */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Upravit produkt' : 'Přidat nový produkt'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Základní informace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Název produktu
                </label>
                <input
                  {...register('name', { required: true })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Název produktu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cena
                </label>
                <input
                  {...register('price', { required: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Cena v Kč"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie
                </label>
                <input
                  {...register('category')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Kategorie"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Externí odkaz
                </label>
                <input
                  {...register('externalUrl')}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com"
                />
                <p className="mt-1 text-sm text-gray-500">URL, kam bude směřovat kliknutí na kartu produktu</p>
              </div>
            </div>

            {/* Obrázek */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Obrázek produktu
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              {imagePreview && (
                <div className="mt-2">
                  <Image
                    src={imagePreview}
                    alt="Náhled"
                    width={200}
                    height={200}
                    className="rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Popis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Popis
              </label>
              <textarea
                {...register('description')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Popis produktu"
              />
            </div>

            {/* Detailní popis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detailní popis
              </label>
              <textarea
                {...register('detailInfo')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={6}
                placeholder="Detailní popis produktu"
              />
            </div>

            {/* Tagy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagy
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Přidat tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Přidat
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Výhody */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Výhody
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAdvantage}
                  onChange={(e) => setNewAdvantage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Přidat výhodu"
                />
                <button
                  type="button"
                  onClick={addAdvantage}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Přidat
                </button>
              </div>
              <div className="space-y-2">
                {advantages.map((advantage, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-green-50 p-2 rounded-md"
                  >
                    <span className="text-green-800">{advantage}</span>
                    <button
                      type="button"
                      onClick={() => removeAdvantage(advantage)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Nevýhody */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nevýhody
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newDisadvantage}
                  onChange={(e) => setNewDisadvantage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Přidat nevýhodu"
                />
                <button
                  type="button"
                  onClick={addDisadvantage}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Přidat
                </button>
              </div>
              <div className="space-y-2">
                {disadvantages.map((disadvantage, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-red-50 p-2 rounded-md"
                  >
                    <span className="text-red-800">{disadvantage}</span>
                    <button
                      type="button"
                      onClick={() => removeDisadvantage(disadvantage)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Video ukázky */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video ukázky
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="URL videa (např. /videos/ukazka.mp4)"
                />
                <button
                  type="button"
                  onClick={addVideo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Přidat
                </button>
              </div>
              <div className="space-y-2">
                {videos.map((video, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 bg-blue-50 p-2 rounded-md"
                  >
                    <div className="flex-1">
                      <video
                        src={video}
                        className="w-full h-32 object-cover rounded"
                        controls
                      />
                      <p className="mt-1 text-sm text-blue-800 truncate">{video}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideo(video)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cenové podmínky */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Základní verze (cena)
                </label>
                <input
                  {...register('pricingInfo.basic')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="např. 15 $ měsíčně"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pro verze (cena)
                </label>
                <input
                  {...register('pricingInfo.pro')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="např. 30 $ měsíčně"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enterprise verze (cena)
                </label>
                <input
                  {...register('pricingInfo.enterprise')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="např. Individuální nacenění"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                {editingProduct ? 'Uložit změny' : 'Přidat produkt'}
              </button>
              
              {editingProduct && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null)
                    reset()
                    setTags([])
                    setAdvantages([])
                    setDisadvantages([])
                    setVideos([])
                    setImagePreview("")
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Zrušit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Seznam produktů */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Seznam produktů</h2>
            {products.length === 0 ? (
              <p className="text-gray-500">Zatím nejsou přidány žádné produkty.</p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        {product.imageUrl && (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={100}
                            height={100}
                            className="rounded-md"
                          />
                        )}
                        <div>
                          <h3 className="font-medium text-lg">{product.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                          <p className="text-sm text-gray-600">Cena: {product.price} Kč</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {product.tags && typeof product.tags === 'string' && JSON.parse(product.tags).map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          {product.advantages && typeof product.advantages === 'string' && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Výhody:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {JSON.parse(product.advantages).map((advantage: string, index: number) => (
                                  <li key={index}>{advantage}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Upravit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Smazat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 