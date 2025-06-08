'use client'

import { useState, useEffect } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  GiftIcon,
  FireIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface PromotionalPackage {
  id: string
  title: string
  description: string
  amount: number
  bonus: number
  savings: number
  popular?: boolean
  firstTime?: boolean
  minimumSpend?: number
  active: boolean
  order: number
  targetStatus: string
  createdAt: string
  updatedAt: string
}

interface PackageFormData {
  title: string
  description: string
  amount: number
  bonus: number
  popular: boolean
  firstTime: boolean
  minimumSpend: number
  active: boolean
  order: number
  targetStatus: string
}

interface CustomPaymentSettings {
  enabled: boolean
  title: string
  minAmount: number
  defaultAmount: number
  couponsEnabled: boolean
  targetGroups: string[]
  availableCoupons: Array<{
    code: string
    type: 'percent' | 'amount'
    value: number
    description: string
    active: boolean
  }>
}

export default function PromotionalPackagesAdmin() {
  const [packages, setPackages] = useState<PromotionalPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PromotionalPackage | null>(null)
  const [formData, setFormData] = useState<PackageFormData>({
    title: '',
    description: '',
    amount: 0,
    bonus: 0,
    popular: false,
    firstTime: false,
    minimumSpend: 0,
    active: true,
    order: 1,
    targetStatus: 'all'
  })

  // Custom Payment Settings
  const [showCustomPaymentModal, setShowCustomPaymentModal] = useState(false)
  const [customPaymentSettings, setCustomPaymentSettings] = useState<CustomPaymentSettings>({
    enabled: true,
    title: 'Vlastní částka',
    minAmount: 10,
    defaultAmount: 100,
    couponsEnabled: true,
    targetGroups: ['all'],
    availableCoupons: [
      { code: 'WELCOME20', type: 'percent', value: 20, description: '20% sleva', active: true },
      { code: 'SAVE50', type: 'amount', value: 50, description: '$50 sleva', active: true },
      { code: 'PREMIUM30', type: 'percent', value: 30, description: '30% sleva', active: true },
      { code: 'FIRST100', type: 'amount', value: 100, description: '$100 sleva', active: true }
    ]
  })

  useEffect(() => {
    fetchPackages()
    fetchCustomPaymentSettings()
  }, [])

  const fetchCustomPaymentSettings = async () => {
    try {
      const response = await fetch('/api/admin/custom-payment-settings')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.settings) {
          setCustomPaymentSettings(data.settings)
        }
      }
    } catch (error) {
      console.error('Error fetching custom payment settings:', error)
    }
  }

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/promotional-packages')
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages || [])
      } else {
        console.error('Failed to fetch packages')
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingPackage 
        ? `/api/admin/promotional-packages/${editingPackage.id}`
        : '/api/admin/promotional-packages'
      
      const method = editingPackage ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          savings: formData.bonus // Auto-calculate savings as bonus amount
        })
      })

      if (response.ok) {
        await fetchPackages()
        handleCloseModal()
        alert(editingPackage ? 'Balíček byl úspěšně upraven!' : 'Balíček byl úspěšně vytvořen!')
      } else {
        const error = await response.json()
        alert(`Chyba: ${error.error || 'Neočekávaná chyba'}`)
      }
    } catch (error) {
      console.error('Error saving package:', error)
      alert('Chyba při ukládání balíčku')
    }
  }

  const handleEdit = (pkg: PromotionalPackage) => {
    setEditingPackage(pkg)
          setFormData({
        title: pkg.title,
        description: pkg.description,
        amount: pkg.amount,
        bonus: pkg.bonus,
        popular: pkg.popular || false,
        firstTime: pkg.firstTime || false,
        minimumSpend: pkg.minimumSpend || 0,
        active: pkg.active,
        order: pkg.order,
        targetStatus: pkg.targetStatus || 'all'
      })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento balíček?')) return

    try {
      const response = await fetch(`/api/admin/promotional-packages/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchPackages()
        alert('Balíček byl úspěšně smazán!')
      } else {
        alert('Chyba při mazání balíčku')
      }
    } catch (error) {
      console.error('Error deleting package:', error)
      alert('Chyba při mazání balíčku')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPackage(null)
    setFormData({
      title: '',
      description: '',
      amount: 0,
      bonus: 0,
      popular: false,
      firstTime: false,
      minimumSpend: 0,
      active: true,
      order: 1,
      targetStatus: 'all'
    })
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

  // Custom Payment Functions
  const handleCustomPaymentSave = async () => {
    try {
      const response = await fetch('/api/admin/custom-payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customPaymentSettings)
      })

      if (response.ok) {
        setShowCustomPaymentModal(false)
        alert('Nastavení vlastní částky bylo úspěšně uloženo!')
      } else {
        alert('Chyba při ukládání nastavení')
      }
    } catch (error) {
      console.error('Error saving custom payment settings:', error)
      alert('Chyba při ukládání nastavení')
    }
  }

  const addCoupon = () => {
    setCustomPaymentSettings(prev => ({
      ...prev,
      availableCoupons: [
        ...prev.availableCoupons,
        { code: '', type: 'percent', value: 0, description: '', active: true }
      ]
    }))
  }

  const removeCoupon = (index: number) => {
    setCustomPaymentSettings(prev => ({
      ...prev,
      availableCoupons: prev.availableCoupons.filter((_, i) => i !== index)
    }))
  }

  const updateCoupon = (index: number, field: string, value: any) => {
    setCustomPaymentSettings(prev => ({
      ...prev,
      availableCoupons: prev.availableCoupons.map((coupon, i) => 
        i === index ? { ...coupon, [field]: value } : coupon
      )
    }))
  }

  // Target Groups Management
  const addTargetGroup = (groupValue: string) => {
    if (!customPaymentSettings.targetGroups.includes(groupValue)) {
      setCustomPaymentSettings(prev => ({
        ...prev,
        targetGroups: [...prev.targetGroups, groupValue]
      }))
    }
  }

  const removeTargetGroup = (groupValue: string) => {
    setCustomPaymentSettings(prev => ({
      ...prev,
      targetGroups: prev.targetGroups.filter(group => group !== groupValue)
    }))
  }

  const getGroupLabel = (groupValue: string) => {
    const labels: { [key: string]: string } = {
      'all': 'Všichni uživatelé',
      'new': 'Noví uživatelé',
      'active': 'Aktivní uživatelé',
      'low_balance': 'Nízký zůstatek',
      'high_spender': 'Vysoké výdaje',
      'trial': 'Trial uživatelé',
      'enterprise': 'Enterprise'
    }
    return labels[groupValue] || groupValue
  }

  const getAvailableGroups = () => {
    const allGroups = [
      { value: 'all', label: 'Všichni uživatelé' },
      { value: 'new', label: 'Noví uživatelé (méně než 7 dní)' },
      { value: 'active', label: 'Aktivní uživatelé (s běžícími kampaněmi)' },
      { value: 'low_balance', label: 'Uživatelé s nízkým zůstatkem (< $20)' },
      { value: 'high_spender', label: 'Uživatelé s vysokými výdaji (> $500/měsíc)' },
      { value: 'trial', label: 'Trial uživatelé' },
      { value: 'enterprise', label: 'Enterprise klienti' }
    ]
    return allGroups.filter(group => !customPaymentSettings.targetGroups.includes(group.value))
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <GiftIcon className="h-8 w-8 text-purple-600 mr-3" />
            Promocní balíčky
          </h1>
          <p className="text-gray-600 mt-1">
            Správa akčních nabídek pro billing stránky
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCustomPaymentModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Vlastní částka
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nový balíček
          </button>
        </div>
      </div>

      {/* Packages List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Aktivní balíčky ({packages.filter(p => p.active).length})
          </h3>
        </div>
        
        {packages.length === 0 ? (
          <div className="text-center py-12">
            <GiftIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Zatím nejsou vytvořeny žádné promocní balíčky</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-purple-600 hover:text-purple-800"
            >
              Vytvořit první balíček →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {packages
              .sort((a, b) => a.order - b.order)
              .map((pkg) => (
              <div key={pkg.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{pkg.title}</h4>
                      
                      {pkg.popular && (
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                          <FireIcon className="h-3 w-3 mr-1" />
                          Most Popular
                        </span>
                      )}
                      
                      {pkg.firstTime && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                          <GiftIcon className="h-3 w-3 mr-1" />
                          Welcome Bonus
                        </span>
                      )}
                      
                      {!pkg.active && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          Neaktivní
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{pkg.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Základní částka:</span>
                        <p className="font-semibold">${pkg.amount}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Bonus:</span>
                        <p className="font-semibold text-green-600">+${pkg.bonus}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Celkem:</span>
                        <p className="font-semibold">${pkg.amount + pkg.bonus}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Pořadí:</span>
                        <p className="font-semibold">#{pkg.order}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Cílová skupina:</span>
                      <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {pkg.targetStatus === 'all' && 'Všichni uživatelé'}
                        {pkg.targetStatus === 'new' && 'Noví uživatelé'}
                        {pkg.targetStatus === 'active' && 'Aktivní uživatelé'}
                        {pkg.targetStatus === 'low_balance' && 'Nízký zůstatek'}
                        {pkg.targetStatus === 'high_spender' && 'Vysoké výdaje'}
                        {pkg.targetStatus === 'trial' && 'Trial uživatelé'}
                        {pkg.targetStatus === 'enterprise' && 'Enterprise'}
                      </span>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Vytvořeno: {formatDate(pkg.createdAt)} | 
                      Upraveno: {formatDate(pkg.updatedAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                      title="Upravit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                      title="Smazat"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingPackage ? 'Upravit balíček' : 'Nový promocní balíček'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Název balíčku *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="např. Welcome Bonus"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Popis *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                      placeholder="např. Perfect to get started! Double your first deposit."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Základní částka ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bonus ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.bonus}
                      onChange={(e) => setFormData({...formData, bonus: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimální výdaj ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minimumSpend}
                      onChange={(e) => setFormData({...formData, minimumSpend: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pořadí zobrazení
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cílová skupina *
                    </label>
                    <select
                      value={formData.targetStatus}
                      onChange={(e) => setFormData({...formData, targetStatus: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="all">Všichni uživatelé</option>
                      <option value="new">Noví uživatelé (méně než 7 dní)</option>
                      <option value="active">Aktivní uživatelé (s běžícími kampaněmi)</option>
                      <option value="low_balance">Uživatelé s nízkým zůstatkem (&lt; $20)</option>
                      <option value="high_spender">Uživatelé s vysokými výdaji (&gt; $500/měsíc)</option>
                      <option value="trial">Trial uživatelé</option>
                      <option value="enterprise">Enterprise klienti</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Balíček se zobrazí pouze uživatelům odpovídajícím vybrané skupině
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="popular"
                          checked={formData.popular}
                          onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor="popular" className="ml-2 text-sm text-gray-700">
                          Most Popular (zobrazí purple badge)
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="firstTime"
                          checked={formData.firstTime}
                          onChange={(e) => setFormData({...formData, firstTime: e.target.checked})}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor="firstTime" className="ml-2 text-sm text-gray-700">
                          Welcome Bonus (zobrazí green badge)
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="active"
                          checked={formData.active}
                          onChange={(e) => setFormData({...formData, active: e.target.checked})}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                          Aktivní (zobrazit na billing stránce)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {formData.title && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Náhled:</h4>
                    <div className={`p-4 rounded-lg border-2 ${
                      formData.popular ? 'border-purple-500 bg-purple-50' :
                      formData.firstTime ? 'border-green-500 bg-green-50' :
                      'border-gray-200 bg-white'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold">{formData.title}</h5>
                        <div className="text-right">
                          <p className="text-xl font-bold">${formData.amount}</p>
                          <p className="text-sm text-green-600">+${formData.bonus} bonus</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{formData.description}</p>
                      <p className="text-xs text-green-600">
                        Total: ${formData.amount + formData.bonus} (Save ${formData.bonus})
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    {editingPackage ? 'Uložit změny' : 'Vytvořit balíček'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom Payment Settings Modal */}
      {showCustomPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Nastavení vlastní částky
                </h3>
                <button
                  onClick={() => setShowCustomPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nadpis sekce
                    </label>
                    <input
                      type="text"
                      value={customPaymentSettings.title}
                      onChange={(e) => setCustomPaymentSettings(prev => ({
                        ...prev,
                        title: e.target.value
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Vlastní částka"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Výchozí částka ($)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={customPaymentSettings.defaultAmount}
                      onChange={(e) => setCustomPaymentSettings(prev => ({
                        ...prev,
                        defaultAmount: Number(e.target.value)
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimální částka ($)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={customPaymentSettings.minAmount}
                      onChange={(e) => setCustomPaymentSettings(prev => ({
                        ...prev,
                        minAmount: Number(e.target.value)
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableCustomPayment"
                        checked={customPaymentSettings.enabled}
                        onChange={(e) => setCustomPaymentSettings(prev => ({
                          ...prev,
                          enabled: e.target.checked
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableCustomPayment" className="ml-2 text-sm text-gray-700">
                        Aktivní
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableCoupons"
                        checked={customPaymentSettings.couponsEnabled}
                        onChange={(e) => setCustomPaymentSettings(prev => ({
                          ...prev,
                          couponsEnabled: e.target.checked
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableCoupons" className="ml-2 text-sm text-gray-700">
                        Povolit slevové kódy
                      </label>
                    </div>
                  </div>
                </div>

                {/* Target Groups Management */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Cílové skupiny</h4>
                  
                  {/* Selected Groups Display */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vybrané skupiny:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {customPaymentSettings.targetGroups.map((group, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {getGroupLabel(group)}
                          <button
                            onClick={() => removeTargetGroup(group)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                            title="Odstranit skupinu"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Add Group Dropdown */}
                  {getAvailableGroups().length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Přidat skupinu:
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addTargetGroup(e.target.value)
                            e.target.value = '' // Reset dropdown
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                      >
                        <option value="">Vyberte skupinu...</option>
                        {getAvailableGroups().map((group) => (
                          <option key={group.value} value={group.value}>
                            {group.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Vlastní částka se zobrazí pouze vybraným skupinám uživatelů
                      </p>
                    </div>
                  )}
                </div>

                {/* Coupon Codes Management */}
                {customPaymentSettings.couponsEnabled && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Slevové kódy</h4>
                      <button
                        onClick={addCoupon}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm flex items-center hover:bg-green-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Přidat kód
                      </button>
                    </div>

                    <div className="space-y-4">
                      {customPaymentSettings.availableCoupons.map((coupon, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kód
                              </label>
                              <input
                                type="text"
                                value={coupon.code}
                                onChange={(e) => updateCoupon(index, 'code', e.target.value.toUpperCase())}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono"
                                placeholder="WELCOME20"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Typ
                              </label>
                              <select
                                value={coupon.type}
                                onChange={(e) => updateCoupon(index, 'type', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              >
                                <option value="percent">Procenta (%)</option>
                                <option value="amount">Částka ($)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hodnota
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={coupon.value}
                                onChange={(e) => updateCoupon(index, 'value', Number(e.target.value))}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                placeholder={coupon.type === 'percent' ? '20' : '50'}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Popis
                              </label>
                              <input
                                type="text"
                                value={coupon.description}
                                onChange={(e) => updateCoupon(index, 'description', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                placeholder="20% sleva"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={coupon.active}
                                  onChange={(e) => updateCoupon(index, 'active', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-1 text-xs text-gray-700">Aktivní</label>
                              </div>
                              <button
                                onClick={() => removeCoupon(index)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Smazat"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Náhled sekce vlastní částky:</h4>
                  
                  <div className="bg-white shadow rounded-lg max-w-md">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                          <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900">{customPaymentSettings.title}</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Částka ($)
                        </label>
                        <input
                          type="number"
                          value={customPaymentSettings.defaultAmount}
                          disabled
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimální částka je ${customPaymentSettings.minAmount}</p>
                      </div>

                      {customPaymentSettings.couponsEnabled && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Slevový kód (volitelné)
                          </label>
                          <input
                            type="text"
                            disabled
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                            placeholder="např. WELCOME20"
                          />
                          
                          <div className="text-xs text-gray-500 mt-2">
                            <p className="font-medium mb-1">Dostupné kódy:</p>
                            <div className="space-y-1">
                              {customPaymentSettings.availableCoupons
                                .filter(c => c.active && c.code)
                                .map((coupon, index) => (
                                <p key={index}>
                                  <span className="bg-gray-100 px-2 py-1 rounded font-mono">{coupon.code}</span> - {coupon.description}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        disabled
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg opacity-75 flex items-center justify-center"
                      >
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                          <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                        Zaplatit ${customPaymentSettings.defaultAmount}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    onClick={() => setShowCustomPaymentModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Zrušit
                  </button>
                  <button
                    onClick={handleCustomPaymentSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Uložit nastavení
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 