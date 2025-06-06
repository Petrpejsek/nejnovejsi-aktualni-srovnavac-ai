'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ForCompaniesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    businessEmail: '',
    website: '',
    productUrls: '',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Vyčistit chybu pro dané pole
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Název firmy je povinný'
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Kontaktní osoba je povinná'
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = 'Email je povinný'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.businessEmail)) {
        newErrors.businessEmail = 'Zadejte platný email'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Převod produktních URL na array
      const productUrlsArray = formData.productUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)

      const response = await fetch('/api/company-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          productUrls: productUrlsArray.length > 0 ? productUrlsArray : null
        })
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
      } else {
        setErrors({ general: data.error || 'Došlo k chybě při odesílání' })
      }
    } catch (error) {
      console.error('Chyba při odesílání formuláře:', error)
      setErrors({ general: 'Došlo k chybě při odesílání. Zkuste to znovu.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Aplikace odeslána!
            </h2>
            <p className="text-gray-600 mb-6">
              Děkujeme za váš zájem o spolupráci. Vaše aplikace byla úspěšně odeslána a budeme vás kontaktovat do 48 hodin.
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Zpět na hlavní stránku
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pro AI firmy a vývojáře
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chcete získat kontrolu nad prezentací vašich AI produktů? Zaregistrujte se jako firemní partner a získejte přístup k prémiové prezentaci.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium prezentace</h3>
            <p className="text-gray-600">Zvýrazněná pozice, kvalitní screenshots a detailní popis vašich produktů.</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics & insights</h3>
            <p className="text-gray-600">Přístup k detailním statistikám návštěvnosti a engagement vašich produktů.</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Přímé řízení</h3>
            <p className="text-gray-600">Sami můžete upravovat informace, přidávat nové produkty a spravovat obsah.</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Firemní registrace</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{errors.general}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Název firmy *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                    errors.companyName ? 'border-red-500' : ''
                  }`}
                  placeholder="Název vaší firmy"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                  Kontaktní osoba *
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                    errors.contactPerson ? 'border-red-500' : ''
                  }`}
                  placeholder="Jméno a příjmení"
                />
                {errors.contactPerson && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Firemní email *
                </label>
                <input
                  type="email"
                  id="businessEmail"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                    errors.businessEmail ? 'border-red-500' : ''
                  }`}
                  placeholder="kontakt@firma.cz"
                />
                {errors.businessEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Webové stránky
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="https://www.vasefirma.cz"
                />
              </div>
            </div>

            <div>
              <label htmlFor="productUrls" className="block text-sm font-medium text-gray-700 mb-2">
                URL vašich AI produktů
              </label>
              <textarea
                id="productUrls"
                name="productUrls"
                value={formData.productUrls}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Zadejte URL vaších produktů (každé na nový řádek)&#10;https://vasprodukt1.cz&#10;https://vasprodukt2.cz"
              />
              <p className="mt-1 text-sm text-gray-500">
                Zadejte URL produktů, které chcete spravovat - každé na nový řádek
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Popis firmy a produktů
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Krátký popis vaší firmy a AI produktů, které vyvíjíte..."
              />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Odesílám...
                  </div>
                ) : (
                  'Odeslat žádost o registraci'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Process Section */}
        <div className="mt-12 bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Jak to funguje?</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-purple-600">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Registrace</h4>
              <p className="text-sm text-gray-600">Vyplníte formulář s informacemi o firmě</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-purple-600">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Schválení</h4>
              <p className="text-sm text-gray-600">Prověříme vaše údaje a schválíme žádost</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-purple-600">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Párování</h4>
              <p className="text-sm text-gray-600">Připojíme vaše produkty k firemnímu účtu</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-purple-600">4</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Správa</h4>
              <p className="text-sm text-gray-600">Získáte přístup k admin rozhraní</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 