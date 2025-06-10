'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiUser, FiStar, FiSettings, FiHeart, FiZap, FiCalendar, FiMail, FiClock, FiBookmark } from 'react-icons/fi'
import Modal from '@/components/Modal'
import LoginForm from '@/components/LoginForm'
import RegisterForm from '@/components/RegisterForm'

interface UserData {
  id: string
  name: string
  email: string
  premium: boolean
  points: number
  level: string
  joinDate: string
  savedProducts: number
  rewards: number
}

interface SavedProduct {
  id: string
  productId: string
  productName: string
  category: string
  savedAt: string
  imageUrl?: string
  price?: number
  tags?: any[]
  externalUrl?: string
  description?: string
}

interface RecommendedProduct {
  id: string
  productName: string
  category: string
  imageUrl?: string
  price?: number
  tags?: string[]
  externalUrl?: string
  description?: string
  recommendationReason: string
  confidenceScore: number
}

interface Reward {
  id: string
  title: string
  description: string
  type: 'access' | 'discount' | 'feature'
  value: string
  expiresAt?: string
  claimed: boolean
}

interface ClickHistoryItem {
  id: string
  productId: string
  productName: string
  category: string | null
  imageUrl: string | null
  price: number | null
  externalUrl: string | null
  clickedAt: string
}

declare global {
  interface Window {
    addToSavedProducts?: (product: {
      id: string
      name: string
      category?: string
      imageUrl?: string
      price?: number
      tags?: string[]
      externalUrl?: string
      description?: string
    }) => void;
    addToClickHistory?: (product: {
      id: string
      name: string
      category?: string
      imageUrl?: string
      price?: number
      externalUrl?: string
    }) => void;
  }
}

// Komponenta s useSearchParams
function UserAreaContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [userData, setUserData] = useState<UserData>({
    id: '',
    name: '',
    email: '',
    premium: false,
    points: 0,
    level: 'Beginner',
    joinDate: '',
    savedProducts: 0,
    rewards: 0
  })
  const [loading, setLoading] = useState(true)
  const [showRewards, setShowRewards] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [emailSettings, setEmailSettings] = useState({
    weeklyNewTools: true,
    aiRecommendations: true,
    productUpdates: true,
    specialOffers: false,
    communityUpdates: false,
    securityAlerts: true
  })
  
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([])
  const [showClearAllModal, setShowClearAllModal] = useState(false)
  const [clearAllStep, setClearAllStep] = useState(1)
  const [clearingAll, setClearingAll] = useState(false)
  const [removingProducts, setRemovingProducts] = useState<Set<string>>(new Set()) // Loading state pro jednotlivé produkty
  
  const [rewards, setRewards] = useState<Reward[]>([])

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Profile edit states
  const [displayName, setDisplayName] = useState('')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileUpdateMessage, setProfileUpdateMessage] = useState('')

  // Mock data pro AI doporučení
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([
    {
      id: '1',
      productName: 'ChatGPT Plus',
      category: 'Language Model',
      imageUrl: 'https://placehold.co/48x48/10b981/ffffff?text=GPT',
      price: 20,
      tags: ['AI Assistant', 'Writing', 'Coding'],
      externalUrl: 'https://openai.com/chatgpt',
      description: 'Advanced AI language model with enhanced capabilities and faster response times.',
      recommendationReason: 'Based on your interest in AI writing tools',
      confidenceScore: 95
    },
    {
      id: '2',
      productName: 'Midjourney',
      category: 'Image Generation',
      imageUrl: 'https://placehold.co/48x48/8b5cf6/ffffff?text=MJ',
      price: 10,
      tags: ['AI Art', 'Images', 'Creative'],
      externalUrl: 'https://midjourney.com',
      description: 'Create stunning AI-generated artwork and images from text descriptions.',
      recommendationReason: 'Popular among users who like creative AI tools',
      confidenceScore: 87
    },
    {
      id: '3',
      productName: 'Notion AI',
      category: 'Productivity',
      imageUrl: 'https://placehold.co/48x48/f59e0b/ffffff?text=NA',
      price: 8,
      tags: ['Productivity', 'Writing', 'Organization'],
      externalUrl: 'https://notion.so/ai',
      description: 'AI-powered writing assistant integrated into your Notion workspace.',
      recommendationReason: 'Matches your productivity tool preferences',
      confidenceScore: 78
    }
  ])

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Click history states
  const [clickHistory, setClickHistory] = useState<ClickHistoryItem[]>([])
  const [isClearingHistory, setIsClearingHistory] = useState(false)
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false)
  // Loading states pro lepší UX
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // Nastavení aktivní záložky podle URL parametru
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'saved', 'recommendations', 'history', 'email-preferences', 'settings'].includes(tab)) {
      setActiveTab(tab)
    } else if (!tab) {
      // Pokud není žádný tab parametr, explicitně nastavíme overview jako výchozí
      setActiveTab('overview')
    }
  }, [searchParams])

  // Načtení dat z local storage při mount (rychlé zobrazení před API voláním)
  useEffect(() => {
    if (typeof window !== 'undefined' && session?.user?.email) {
      // Cache pro saved products
      const savedProductsCacheKey = `savedProducts_${session.user.email}`
      const cachedProducts = localStorage.getItem(savedProductsCacheKey)
      
      // NOVÉ: Načti temporary cache z hlavní stránky
      const tempSavedProducts = localStorage.getItem('tempSavedProducts')
      let tempSaved = []
      if (tempSavedProducts) {
        try {
          tempSaved = JSON.parse(tempSavedProducts)
          // Vymaž temporary cache po načtení
          localStorage.removeItem('tempSavedProducts')
          console.log('🔄 Loaded temp saved products from home page:', tempSaved.length)
        } catch (error) {
          console.error('Error parsing temp saved products:', error)
        }
      }
      
      if (cachedProducts) {
        try {
          const parsedProducts = JSON.parse(cachedProducts)
          // Slož regular cache + temporary cache
          const combinedProducts = [...tempSaved, ...parsedProducts]
          setSavedProducts(combinedProducts)
          setIsLoadingProducts(false) // Cache data are ready immediately
          console.log('🔄 Loaded saved products from cache:', combinedProducts.length)
        } catch (error) {
          console.error('Error parsing cached products:', error)
        }
      } else if (tempSaved.length > 0) {
        // Jen temporary cache
        setSavedProducts(tempSaved)
        setIsLoadingProducts(false)
      }

      // Cache pro click history
      const clickHistoryCacheKey = `clickHistory_${session.user.email}`
      const cachedHistory = localStorage.getItem(clickHistoryCacheKey)
      
      // NOVÉ: Načti temporary click history z hlavní stránky
      const tempClickHistory = localStorage.getItem('tempClickHistory')
      let tempClicks = []
      if (tempClickHistory) {
        try {
          tempClicks = JSON.parse(tempClickHistory)
          // Vymaž temporary cache po načtení
          localStorage.removeItem('tempClickHistory')
          console.log('🔄 Loaded temp click history from home page:', tempClicks.length)
        } catch (error) {
          console.error('Error parsing temp click history:', error)
        }
      }
      
      if (cachedHistory) {
        try {
          const parsedHistory = JSON.parse(cachedHistory)
          // Slož regular cache + temporary cache
          const combinedHistory = [...tempClicks, ...parsedHistory]
          setClickHistory(combinedHistory)
          setIsLoadingHistory(false) // Cache data are ready immediately
          console.log('🔄 Loaded click history from cache:', combinedHistory.length)
        } catch (error) {
          console.error('Error parsing cached click history:', error)
        }
      } else if (tempClicks.length > 0) {
        // Jen temporary cache
        setClickHistory(tempClicks)
        setIsLoadingHistory(false)
      }
    }
  }, [session?.user?.email])

  // Funkce pro načítání dat z API
  const fetchUserProfile = async () => {
    try {
      // Načteme profil uživatele
      const profileResponse = await fetch('/api/users/profile')
      if (profileResponse.ok) {
        const profile = await profileResponse.json()
        setUserData({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          premium: profile.premium,
          points: profile.points,
          level: profile.level,
          joinDate: profile.joinDate,
          savedProducts: profile.savedProductsCount,
          rewards: 0
        })
        
        // Nastavíme avatar URL pokud existuje
        if (profile.avatar) {
          setAvatarUrl(profile.avatar)
        }

        // Nastavíme display name do local state
        setDisplayName(profile.name || '')
      }

      // Načteme uložené produkty z dedikovaného endpointu (má správné ceny)
      const savedProductsResponse = await fetch('/api/users/saved-products')
      if (savedProductsResponse.ok) {
        const savedProductsData = await savedProductsResponse.json()
        
        // NOVÉ: Zachovej optimistické aktualizace z cache 
        // Pokud máme v state nějaké temporary items (začínající "temp-"), zachovejme je
        const tempItems = savedProducts.filter(item => item.id.startsWith('temp-'))
        if (tempItems.length > 0) {
          console.log('🔄 Preserving optimistic saved products items:', tempItems.length)
          // Kombinuj temporary items + data z databáze (bez duplicit)
          const dbProductIds = (savedProductsData || []).map((item: SavedProduct) => item.productId)
          const uniqueTempItems = tempItems.filter(temp => !dbProductIds.includes(temp.productId))
          const mergedSaved = [...uniqueTempItems, ...(savedProductsData || [])]
          setSavedProducts(mergedSaved)
          
          // Uložíme sloučené data do cache
          if (typeof window !== 'undefined' && session?.user?.email) {
            const cacheKey = `savedProducts_${session.user.email}`
            localStorage.setItem(cacheKey, JSON.stringify(mergedSaved))
            console.log('💾 Merged saved products cached for user:', session.user.email)
          }
        } else {
          // Žádné temporary items, použij jen data z databáze
          setSavedProducts(savedProductsData || [])
          
          // Uložení do local storage pro rychlé načtení při příští návštěvě
          if (typeof window !== 'undefined' && session?.user?.email) {
            const cacheKey = `savedProducts_${session.user.email}`
            localStorage.setItem(cacheKey, JSON.stringify(savedProductsData || []))
            console.log('💾 Saved products cached for user:', session.user.email)
          }
        }
        
        setIsLoadingProducts(false)
      }

      // Načteme historii kliků
      const clickHistoryResponse = await fetch('/api/users/click-history')
      if (clickHistoryResponse.ok) {
        const clickHistoryData = await clickHistoryResponse.json()
        
        // NOVÉ: Zachovej optimistické aktualizace z cache 
        // Pokud máme v state nějaké temporary items (začínající "temp-"), zachovejme je
        const tempItems = clickHistory.filter(item => item.id.startsWith('temp-'))
        if (tempItems.length > 0) {
          console.log('🔄 Preserving optimistic click history items:', tempItems.length)
          // Kombinuj temporary items + data z databáze (bez duplicit)
          const dbProductIds = (clickHistoryData || []).map((item: ClickHistoryItem) => item.productId)
          const uniqueTempItems = tempItems.filter(temp => !dbProductIds.includes(temp.productId))
          const mergedHistory = [...uniqueTempItems, ...(clickHistoryData || [])]
          setClickHistory(mergedHistory)
          
          // Uložíme sloučené data do cache
          if (typeof window !== 'undefined' && session?.user?.email) {
            const clickHistoryCacheKey = `clickHistory_${session.user.email}`
            localStorage.setItem(clickHistoryCacheKey, JSON.stringify(mergedHistory))
            console.log('💾 Merged click history cached for user:', session.user.email)
          }
        } else {
          // Žádné temporary items, použij jen data z databáze
          setClickHistory(clickHistoryData || [])
          
          // Uložení do local storage pro rychlé načtení při příští návštěvě
          if (typeof window !== 'undefined' && session?.user?.email) {
            const clickHistoryCacheKey = `clickHistory_${session.user.email}`
            localStorage.setItem(clickHistoryCacheKey, JSON.stringify(clickHistoryData || []))
            console.log('💾 Click history cached for user:', session.user.email)
          }
        }
        
        setIsLoadingHistory(false)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setIsLoadingProducts(false)
      setIsLoadingHistory(false)
    }
  }

  // Funkce pro odstranění produktu
  const handleRemoveProduct = async (productId: string) => {
    // Přidáme loading state pro tento produkt
    setRemovingProducts(prev => new Set(prev).add(productId))
    
    // OPTIMISTIC UPDATE - okamžitě odstraníme z UI
    const productToRemove = savedProducts.find(p => p.productId === productId)
    
    if (!productToRemove) {
      setRemovingProducts(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
      return
    }
    
    // Uložíme backup pro případ chyby
    const backupProducts = [...savedProducts]
    const backupUserData = { ...userData }
    
    // Okamžitě aktualizujeme UI
    setSavedProducts(prev => prev.filter(p => p.productId !== productId))
    setUserData(prev => ({
      ...prev,
      savedProducts: prev.savedProducts - 1
    }))
    
    // API volání v pozadí - bez await
    try {
      fetch(`/api/users/saved-products?productId=${productId}`, {
        method: 'DELETE',
      }).then(response => {
        setRemovingProducts(prev => {
          const newSet = new Set(prev)
          newSet.delete(productId)
          return newSet
        })
        
        if (!response.ok) {
          // Chyba - vrátíme původní stav
          console.error('Error removing product, reverting UI')
          setSavedProducts(backupProducts)
          setUserData(backupUserData)
          
          // Vrátíme cache do původního stavu
          if (typeof window !== 'undefined' && session?.user?.email) {
            const cacheKey = `savedProducts_${session.user.email}`
            localStorage.setItem(cacheKey, JSON.stringify(backupProducts))
            console.log('💾 Reverted saved products cache after error')
          }
          
          // Zobrazíme chybovou zprávu
          alert('Error removing product. Please try again.')
        } else {
          // Úspěch - aktualizujeme cache s novým stavem
          const currentProducts = savedProducts.filter(p => p.productId !== productId)
          if (typeof window !== 'undefined' && session?.user?.email) {
            const cacheKey = `savedProducts_${session.user.email}`
            localStorage.setItem(cacheKey, JSON.stringify(currentProducts))
            console.log('💾 Updated saved products cache after removal')
          }
        }
      }).catch(error => {
        // Síťová chyba - vrátíme původní stav
        setRemovingProducts(prev => {
          const newSet = new Set(prev)
          newSet.delete(productId)
          return newSet
        })
        console.error('Network error removing product, reverting UI:', error)
        setSavedProducts(backupProducts)
        setUserData(backupUserData)
        
        // Vrátíme cache do původního stavu
        if (typeof window !== 'undefined' && session?.user?.email) {
          const cacheKey = `savedProducts_${session.user.email}`
          localStorage.setItem(cacheKey, JSON.stringify(backupProducts))
          console.log('💾 Reverted saved products cache after network error')
        }
        
        alert('Network error. Please check your connection and try again.')
      })
    } catch (error) {
      setRemovingProducts(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
      console.error('Unexpected error with remove operation:', error)
    }
  }

  // Funkce pro vymazání všech produktů
  const handleClearAll = () => {
    setShowClearAllModal(true)
    setClearAllStep(1)
  }

  const confirmClearAll = async () => {
    setClearingAll(true)
    try {
      const response = await fetch('/api/users/saved-products/clear-all', {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedProducts([])
        setUserData(prev => ({
          ...prev,
          savedProducts: 0
        }))
        setShowClearAllModal(false)
        
        // Aktualizujeme cache
        if (typeof window !== 'undefined' && session?.user?.email) {
          const cacheKey = `savedProducts_${session.user.email}`
          localStorage.setItem(cacheKey, JSON.stringify([]))
          console.log('💾 Saved products cache cleared for user:', session.user.email)
        }
      }
    } catch (error) {
      console.error('Error clearing all products:', error)
    } finally {
      setClearingAll(false)
    }
  }

  const cancelClearAll = () => {
    setShowClearAllModal(false)
  }

  // Funkce pro vymazání celé historie kliků
  const handleClearHistory = () => {
    setShowClearHistoryModal(true)
  }

  const confirmClearHistory = async () => {
    setIsClearingHistory(true)
    try {
      const response = await fetch('/api/users/click-history/clear-all', {
        method: 'DELETE',
      })

      if (response.ok) {
        setClickHistory([])
        setShowClearHistoryModal(false)
        
        // Aktualizujeme cache
        if (typeof window !== 'undefined' && session?.user?.email) {
          const clickHistoryCacheKey = `clickHistory_${session.user.email}`
          localStorage.setItem(clickHistoryCacheKey, JSON.stringify([]))
          console.log('💾 Click history cache cleared for user:', session.user.email)
        }
      }
    } catch (error) {
      console.error('Error clearing history:', error)
    } finally {
      setIsClearingHistory(false)
    }
  }

  const cancelClearHistory = () => {
    setShowClearHistoryModal(false)
  }



  const handleLoginSuccess = () => {
    setIsLoginOpen(false)
    window.location.reload()
  }

  const handleRegisterSuccess = () => {
    setIsRegisterOpen(false)
    window.location.reload()
  }

  const switchToRegister = () => {
    setIsLoginOpen(false)
    setIsRegisterOpen(true)
  }

  const switchToLogin = () => {
    setIsRegisterOpen(false)
    setIsLoginOpen(true)
  }

  // Password change functions
  const validatePasswordForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters'
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password'
    }
    
    setPasswordError(Object.keys(errors).length === 0 ? '' : errors.general || '')
    return Object.keys(errors).length === 0
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) {
      return
    }
    
    setIsChangingPassword(true)
    setPasswordError('')
    setPasswordSuccess('')
    
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setPasswordSuccess('✓ Password changed successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        // Hide success message after 3 seconds
        setTimeout(() => setPasswordSuccess(''), 3000)
      } else {
        setPasswordError(result.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setPasswordError('An unexpected error occurred')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (passwordError) {
      setPasswordError('')
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchUserProfile()
      setLoading(false)
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [session, status])

  // Avatar upload functions
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await uploadAvatarFile(file)
  }

  const uploadAvatarFile = async (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('File size must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setAvatarUrl(data.avatarUrl)
        setShowAvatarModal(false) // Zavřeme modal
        
        // Refresh profil pro aktualizaci dat v databázi
        await fetchUserProfile()
        
        // Show success message with toast animation
        const toast = document.createElement('div')
        toast.innerHTML = `
          <div class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in-right">
            ✅ Profilový obrázek byl úspěšně aktualizován!
          </div>
        `
        document.body.appendChild(toast)
        setTimeout(() => document.body.removeChild(toast), 3000)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      alert('Failed to upload avatar. Please try again.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadAvatarFile(e.dataTransfer.files[0])
    }
  }

  const removeAvatar = async () => {
    try {
      const response = await fetch('/api/users/avatar', {
        method: 'DELETE',
      })

      if (response.ok) {
        setAvatarUrl(null)
        
        // Refresh profil pro aktualizaci dat v databázi
        await fetchUserProfile()
        
        // Show success message
        const toast = document.createElement('div')
        toast.innerHTML = `
          <div class="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in-right">
            🗑️ Profilový obrázek byl odstraněn
          </div>
        `
        document.body.appendChild(toast)
        setTimeout(() => document.body.removeChild(toast), 3000)
      }
    } catch (error) {
      console.error('Error removing avatar:', error)
      alert('Chyba při odstraňování obrázku')
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!displayName.trim()) {
      setProfileUpdateMessage('Jméno nemůže být prázdné')
      return
    }

    try {
      setIsUpdatingProfile(true)
      setProfileUpdateMessage('')

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: displayName.trim()
        }),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setUserData(prev => ({ ...prev, name: updatedProfile.name }))
        setProfileUpdateMessage('Profil byl úspěšně aktualizován')
        
        // Show success message
        const toast = document.createElement('div')
        toast.innerHTML = `
          <div class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in-right">
            ✅ Profil byl aktualizován
          </div>
        `
        document.body.appendChild(toast)
        setTimeout(() => document.body.removeChild(toast), 3000)
      } else {
        const errorData = await response.json()
        setProfileUpdateMessage(errorData.error || 'Chyba při aktualizaci profilu')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setProfileUpdateMessage('Chyba při aktualizaci profilu')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // OPTIMISTICKÁ FUNKCE PRO UKLÁDÁNÍ PRODUKTŮ
  const addToSavedProducts = (product: {
    id: string
    name: string
    category?: string
    imageUrl?: string
    price?: number
    tags?: string[]
    externalUrl?: string
    description?: string
  }): void => {
    // Rychlá kontrola zda už není uložený
    if (savedProducts.some(p => p.productId === product.id)) {
      console.log('Product already saved:', product.name)
      return
    }
    
    // OPTIMISTIC UPDATE - okamžitě přidáme do UI
    const newSavedProduct: SavedProduct = {
      id: `temp-${Date.now()}`, // Temporary ID
      productId: product.id,
      productName: product.name,
      category: product.category || 'Uncategorized',
      savedAt: new Date().toISOString(),
      imageUrl: product.imageUrl || '',
      price: product.price || 0,
      tags: product.tags || [],
      externalUrl: product.externalUrl || '',
      description: product.description || ''
    }
    
    // Okamžitě aktualizujeme UI
    const updatedProducts = [newSavedProduct, ...savedProducts]
    setSavedProducts(updatedProducts)
    setUserData(prev => ({
      ...prev,
      savedProducts: prev.savedProducts + 1
    }))
    
    // Okamžitě aktualizujeme cache pro rychlé zobrazení při příštím refresh
    if (typeof window !== 'undefined' && session?.user?.email) {
      const cacheKey = `savedProducts_${session.user.email}`
      localStorage.setItem(cacheKey, JSON.stringify(updatedProducts))
      console.log('💾 Cache updated optimistically')
    }
    
    console.log('🎯 Optimistic: Added product to saved products:', product.name)
    
    // API volání v pozadí - BEZ await aby neblokoval UI
    fetch('/api/users/saved-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: product.id,
        productName: product.name,
        category: product.category || 'AI Tool',
        imageUrl: product.imageUrl,
        price: product.price || 0
      }),
    }).then(response => {
      if (response.ok || response.status === 409) {
        // Úspěch nebo už existuje - oba stavy jsou OK
        console.log(response.status === 409 ? 'ℹ️  Product already exists in database' : '✅ Sync success: Product saved to database')
        // Zachováme optimistic update - nepřepisujeme UI
      } else {
        // Chyba - odstraníme temporary item a aktualizujeme cache
        console.error('❌ Sync failed: Removing optimistic item')
        const updatedProducts = savedProducts.filter(p => p.id !== newSavedProduct.id)
        setSavedProducts(updatedProducts)
        setUserData(prev => ({
          ...prev,
          savedProducts: Math.max(0, prev.savedProducts - 1)
        }))
        
        // Aktualizujeme cache s revertem
        if (typeof window !== 'undefined' && session?.user?.email) {
          const cacheKey = `savedProducts_${session.user.email}`
          localStorage.setItem(cacheKey, JSON.stringify(updatedProducts))
          console.log('💾 Reverted saved products cache after error')
        }
      }
    }).catch(error => {
      // Síťová chyba - odstraníme temporary item a aktualizujeme cache
      console.error('🌐 Network error: Removing optimistic item:', error)
      const updatedProducts = savedProducts.filter(p => p.id !== newSavedProduct.id)
      setSavedProducts(updatedProducts)
      setUserData(prev => ({
        ...prev,
        savedProducts: Math.max(0, prev.savedProducts - 1)
      }))
      
      // Aktualizujeme cache s revertem
      if (typeof window !== 'undefined' && session?.user?.email) {
        const cacheKey = `savedProducts_${session.user.email}`
        localStorage.setItem(cacheKey, JSON.stringify(updatedProducts))
        console.log('💾 Reverted saved products cache after network error')
      }
    })
  }

  // OPTIMISTICKÁ FUNKCE PRO CLICK HISTORY  
  const addToClickHistory = (product: {
    id: string
    name: string
    category?: string
    imageUrl?: string
    price?: number
    externalUrl?: string
  }): void => {
    // Rychlá kontrola zda už není v historii (posledních 10 položek pro výkon)
    const recentHistory = clickHistory.slice(0, 10)
    if (recentHistory.some(item => item.productId === product.id)) {
      console.log('Product recently clicked:', product.name)
      return
    }
    
    // OPTIMISTIC UPDATE - okamžitě přidáme do UI na začátek seznamu
    const newClickHistoryItem: ClickHistoryItem = {
      id: `temp-${Date.now()}`, // Temporary ID
      productId: product.id,
      productName: product.name,
      category: product.category || null,
      imageUrl: product.imageUrl || null,
      price: product.price || null,
      externalUrl: product.externalUrl || null,
      clickedAt: new Date().toISOString()
    }
    
    // Okamžitě aktualizujeme UI (přidáme na začátek)
    const updatedHistory = [newClickHistoryItem, ...clickHistory]
    setClickHistory(updatedHistory)
    
    // Okamžitě aktualizujeme cache pro rychlé zobrazení při příštím refresh
    if (typeof window !== 'undefined' && session?.user?.email) {
      const cacheKey = `clickHistory_${session.user.email}`
      localStorage.setItem(cacheKey, JSON.stringify(updatedHistory))
      console.log('💾 Click history cache updated optimistically')
    }
    
    console.log('🎯 Optimistic: Added product to click history:', product.name)
    
    // API volání v pozadí - /api/redirect se volá automaticky z ProductCard
    // Tady jen pro jistotu zalogujeme že se bude volat redirect
    console.log('🔗 API: /api/redirect will be called automatically for:', product.name)
  }

  // Nastavení globálních funkcí pro ProductCard komponenty
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.addToSavedProducts = addToSavedProducts
      // @ts-ignore
      window.addToClickHistory = addToClickHistory
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        delete window.addToSavedProducts
        // @ts-ignore
        delete window.addToClickHistory
      }
    }
  }, [addToSavedProducts, addToClickHistory]) // Používáme referenční dependency na funkce

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Přihlašovací obrazovka pro nepřihlášené uživatele
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <FiUser className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600 mb-8">Please log in or sign up to access your account.</p>
          
          <div className="space-y-4">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="w-full px-4 py-3 text-sm font-medium rounded-lg bg-gradient-primary text-white hover-gradient-primary transition-all"
            >
              Log In
            </button>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="w-full px-4 py-3 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>

        <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} title="Log In">
          <LoginForm onSuccess={handleLoginSuccess} onSwitchToRegister={switchToRegister} />
        </Modal>

        <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Sign Up">
          <RegisterForm onSuccess={handleRegisterSuccess} onSwitchToLogin={switchToLogin} />
        </Modal>
      </div>
    )
  }

  // Dashboard pro přihlášené uživatele
  if (userData) {
    const getLevelColor = (level: string) => {
      switch(level) {
        case 'Beginner': return 'text-green-600 bg-green-100'
        case 'Pro': return 'text-blue-600 bg-blue-100'
        case 'Expert': return 'text-purple-600 bg-purple-100'
        default: return 'text-gray-600 bg-gray-100'
      }
    }

    // Funkce pro vytvoření iniciál ze jména
    const getInitials = (name: string) => {
      console.log('🔍 getInitials called with name:', name)
      console.log('🔍 userData.email:', userData.email)
      
      if (!name || name.trim() === '') {
        const result = userData.email.charAt(0).toUpperCase()
        console.log('🔍 Using email initial:', result)
        return result
      }
      
      const parts = name.trim().split(' ')
      if (parts.length === 1) {
        const result = parts[0].charAt(0).toUpperCase()
        console.log('🔍 Using single name initial:', result)
        return result
      } else {
        const result = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
        console.log('🔍 Using full name initials:', result)
        return result
      }
    }

    console.log('🎨 Avatar rendering with userData:', { name: userData.name, email: userData.email })

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
                <p className="text-gray-600">Welcome back, {userData.name || 'User'}!</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(userData.level)}`}>
                  {userData.level}
                </div>
                {userData.premium && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <FiStar className="w-4 h-4" />
                    <span>Premium</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'saved'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Saved Products ({savedProducts.length})
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recommendations'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                AI Recommendations ({recommendedProducts.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                History ({clickHistory.length})
              </button>
              <button
                onClick={() => setActiveTab('email-preferences')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'email-preferences'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Email Preferences
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Points</p>
                        <p className="text-2xl font-bold text-gray-900">{userData.points}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiZap className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Saved Products</p>
                        <p className="text-2xl font-bold text-gray-900">{userData.savedProducts}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <FiHeart className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowRewards(true)}
                    className="bg-white rounded-lg shadow-sm p-6 w-full text-left hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Rewards</p>
                        <p className="text-2xl font-bold text-gray-900">{userData.rewards}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <FiStar className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Recent Saved Products */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Saved Products</h3>
                    {savedProducts.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {savedProducts.length > 0 ? (
                      savedProducts.slice(0, 3).map((product) => {
                        // Parsujeme tagy pokud jsou ve formátu string
                        let parsedTags = []
                        if (product.tags) {
                          if (typeof product.tags === 'string') {
                            try {
                              parsedTags = JSON.parse(product.tags)
                            } catch {
                              parsedTags = []
                            }
                          } else if (Array.isArray(product.tags)) {
                            parsedTags = product.tags
                          }
                        }

                        return (
                          <div 
                            key={product.id} 
                            className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                            onClick={() => product.externalUrl && window.open(product.externalUrl, '_blank')}
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={product.imageUrl || 'https://placehold.co/64x64/f3f4f6/94a3b8?text=No+Image'}
                                alt={product.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm truncate">{product.productName}</h4>
                              <p className="text-xs text-gray-500 mb-1">{product.category} • Saved {product.savedAt}</p>
                              
                              {/* Popis produktu */}
                              {product.description && product.description.trim() !== '' ? (
                                <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                                  {product.description.length > 65 
                                    ? `${product.description.substring(0, 65)}...` 
                                    : product.description
                                  }
                                </p>
                              ) : (
                                <p className="text-xs text-gray-500 italic mb-1">No description available</p>
                              )}
                              
                              {/* Tagy */}
                              {parsedTags.length > 0 && (
                                 <div className="flex flex-wrap gap-1 mb-1">
                                   {parsedTags.slice(0, 2).map((tag: any, index: number) => (
                                     <span
                                       key={index}
                                       className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100"
                                     >
                                       {typeof tag === 'string' ? tag : String(tag)}
                                     </span>
                                   ))}
                                   {parsedTags.length > 2 && (
                                     <span className="text-xs text-gray-500">+{parsedTags.length - 2} more</span>
                                   )}
                                 </div>
                               )}
                              
                              {/* Cena */}
                              <div>
                                {product.price && product.price > 0 ? (
                                  <p className="text-xs font-medium text-green-600">${product.price}/month</p>
                                ) : (
                                  <p className="text-xs font-bold text-purple-600">${product.price || 0}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {/* Tlačítko Try for Free / Try it - posunuto více doprava */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (product.externalUrl) {
                                    window.open(product.externalUrl, '_blank')
                                  }
                                }}
                                className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors mr-2"
                              >
                                {(!product.price || product.price === 0) ? 'Try for Free' : 'Try it'}
                              </button>
                              
                              {/* Tlačítko pro smazání s loading stavem */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveProduct(product.productId)
                                }}
                                disabled={removingProducts.has(product.productId)}
                                className={`p-1.5 transition-colors ${
                                  removingProducts.has(product.productId) 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-gray-400 hover:text-red-500'
                                }`}
                                title={removingProducts.has(product.productId) ? "Removing..." : "Remove from saved"}
                              >
                                {removingProducts.has(product.productId) ? (
                                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        )
                      })
                    ) : isLoadingProducts ? (
                      // Loading skeleton pro overview
                      <div className="space-y-3">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                              <div className="w-10 h-10 bg-gray-300 rounded flex-shrink-0"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiBookmark className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No saved products yet</p>
                        <p className="text-sm text-gray-400 mt-2">Start exploring AI tools</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Tlačítko pro zobrazení všech uložených produktů */}
                  {savedProducts.length > 3 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setActiveTab('saved')}
                        className="w-full px-4 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        View {savedProducts.length - 3} More
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* User Profile Card */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-center">
                    <div 
                      className="relative w-16 h-16 mx-auto mb-4 cursor-pointer group"
                      onClick={() => setShowAvatarModal(true)}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="w-16 h-16 rounded-full object-cover group-hover:opacity-75 transition-opacity"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl group-hover:opacity-75 transition-opacity">
                          {getInitials(userData.name)}
                        </div>
                      )}
                      
                      {/* Hover overlay with edit hint */}
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900">{userData.name || 'User'}</h3>
                    <p className="text-sm text-gray-600 mb-2">{userData.email}</p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>Joined {userData.joinDate}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Level: {userData.level}</span>
                    </div>
                  </div>
                </div>

                {/* Email Preferences */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Email Preferences</h3>
                    <button
                      onClick={() => setActiveTab('email-preferences')}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 transition-colors"
                    >
                      <span>View All</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Weekly AI Tools */}
                    <div className="border-b border-gray-100 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-2.5 h-2.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                            <h4 className="font-medium text-gray-900 text-xs truncate">Weekly New AI Tools</h4>
                          </div>
                          <p className="text-xs text-gray-500 mb-1.5">Weekly updates about the latest AI tools</p>
                          <span className="inline-block text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Popular</span>
                        </div>
                        <button
                          onClick={() => setEmailSettings(prev => ({ ...prev, weeklyNewTools: !prev.weeklyNewTools }))}
                          className={`flex-shrink-0 relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
                            emailSettings.weeklyNewTools ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                              emailSettings.weeklyNewTools ? 'translate-x-3.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="border-b border-gray-100 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-2.5 h-2.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                            <h4 className="font-medium text-gray-900 text-xs truncate">Personalized AI Recommendations</h4>
                          </div>
                          <p className="text-xs text-gray-500 mb-1.5">Custom AI tool suggestions based on your interests</p>
                          <span className="inline-block text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Recommended</span>
                        </div>
                        <button
                          onClick={() => setEmailSettings(prev => ({ ...prev, aiRecommendations: !prev.aiRecommendations }))}
                          className={`flex-shrink-0 relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
                            emailSettings.aiRecommendations ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                              emailSettings.aiRecommendations ? 'translate-x-3.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Product Updates */}
                    <div className="border-b border-gray-100 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-2.5 h-2.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                            <h4 className="font-medium text-gray-900 text-xs truncate">Product Updates & Features</h4>
                          </div>
                          <p className="text-xs text-gray-500 mb-1.5">Platform improvements and new features</p>
                          <div className="h-5"></div>
                        </div>
                        <button
                          onClick={() => setEmailSettings(prev => ({ ...prev, productUpdates: !prev.productUpdates }))}
                          className={`flex-shrink-0 relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
                            emailSettings.productUpdates ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                              emailSettings.productUpdates ? 'translate-x-3.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Special Offers */}
                    <div className="pb-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-2.5 h-2.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                            <h4 className="font-medium text-gray-900 text-xs truncate">Special Offers & Discounts</h4>
                          </div>
                          <p className="text-xs text-gray-500 mb-1.5">Exclusive deals and promotional offers</p>
                          <span className="inline-block text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Optional</span>
                        </div>
                        <button
                          onClick={() => setEmailSettings(prev => ({ ...prev, specialOffers: !prev.specialOffers }))}
                          className={`flex-shrink-0 relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
                            emailSettings.specialOffers ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                              emailSettings.specialOffers ? 'translate-x-3.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Saved Products Tab */}
          {activeTab === 'saved' && (
            <div className="max-w-4xl">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Saved Products ({savedProducts.length})</h2>
                  {savedProducts.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {savedProducts.length > 0 ? (
                    savedProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                        onClick={() => product.externalUrl && window.open(product.externalUrl, '_blank')}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.imageUrl || 'https://placehold.co/64x64/f3f4f6/94a3b8?text=No+Image'}
                            alt={product.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{product.productName}</h4>
                          <p className="text-xs text-gray-500 mb-1">{product.category} • Saved {product.savedAt}</p>
                          
                          {product.description && product.description.trim() !== '' && (
                            <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                              {product.description.length > 65 
                                ? `${product.description.substring(0, 65)}...` 
                                : product.description
                              }
                            </p>
                          )}
                          
                          {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {product.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100"
                                >
                                  {typeof tag === 'string' ? tag : String(tag)}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Cena */}
                          <div>
                            {product.price && product.price > 0 ? (
                              <p className="text-xs font-medium text-green-600">${product.price}/month</p>
                            ) : (
                              <p className="text-xs font-bold text-purple-600">${product.price || 0}</p>
                            )}
                          </div>
                          
                          {(!product.description || product.description.trim() === '') && (
                            <p className="text-xs text-gray-500 italic">No description available</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Tlačítko Try for Free / Try it - posunuto více doprava */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (product.externalUrl) {
                                window.open(product.externalUrl, '_blank')
                              }
                            }}
                            className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors mr-2"
                          >
                            {(!product.price || product.price === 0) ? 'Try for Free' : 'Try it'}
                          </button>
                          
                          {/* Tlačítko pro smazání s loading stavem */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveProduct(product.productId)
                            }}
                            disabled={removingProducts.has(product.productId)}
                            className={`p-1.5 transition-colors ${
                              removingProducts.has(product.productId) 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-400 hover:text-red-500'
                            }`}
                            title={removingProducts.has(product.productId) ? "Removing..." : "Remove from saved"}
                          >
                            {removingProducts.has(product.productId) ? (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : isLoadingProducts ? (
                    // Loading skeleton místo "0 produktů"
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                            <div className="w-12 h-12 bg-gray-300 rounded-lg flex-shrink-0"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                              <div className="flex space-x-2">
                                <div className="h-6 bg-gray-300 rounded w-16"></div>
                                <div className="h-6 bg-gray-300 rounded w-16"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FiBookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No saved products yet</h3>
                      <p className="text-gray-600 mb-6">Start exploring our AI tools collection and save your favorites.</p>
                      <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-gradient-primary text-white rounded-lg hover-gradient-primary transition-all"
                      >
                        Explore AI Tools
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="max-w-4xl">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Recommendations for You</h2>
                  <p className="text-gray-600">Personalized tool suggestions based on your interests and activity.</p>
                </div>
                
                <div className="space-y-4">
                  {recommendedProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer bg-gradient-to-r from-purple-50/50 to-blue-50/50"
                      onClick={() => product.externalUrl && window.open(product.externalUrl, '_blank')}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={product.imageUrl || 'https://placehold.co/40x40/8b5cf6/ffffff?text=AI'}
                          alt={product.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{product.productName}</h4>
                          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                            <div className="flex items-center space-x-1">
                              <FiStar className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium text-gray-700">{product.confidenceScore}%</span>
                            </div>
                            {product.price && (
                              <span className="text-sm font-medium text-green-600">${product.price}/mo</span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                        
                        {product.description && (
                          <p className="text-sm text-gray-700 mb-3">{product.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                              💡 {product.recommendationReason}
                            </span>
                          </div>
                          
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {product.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <FiZap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Get Better Recommendations</h3>
                      <p className="text-sm text-gray-600">Save more products and explore different categories to improve your AI recommendations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl">
              <div className="space-y-6">
                {/* User Profile Settings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  
                  {profileUpdateMessage && (
                    <div className={`mb-4 p-3 border rounded-lg ${
                      profileUpdateMessage.includes('úspěšně') 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      <p className="text-sm font-medium">{profileUpdateMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={userData.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        maxLength={100}
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile || displayName.trim() === userData.name}
                        className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isUpdatingProfile || displayName.trim() === userData.name
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-gradient-primary text-white hover-gradient-primary'
                        }`}
                      >
                        {isUpdatingProfile ? (
                          <span className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Updating...
                          </span>
                        ) : (
                          'Save Profile'
                        )}
                      </button>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Account Level: {userData.level}</span>
                        <span className="text-sm text-gray-600">Points: {userData.points}</span>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Password Change */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                  
                  {passwordSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 font-medium">{passwordSuccess}</p>
                    </div>
                  )}
                  
                  {passwordError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{passwordError}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter your current password"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter your new password (min. 6 characters)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Confirm your new password"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isChangingPassword
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-gradient-primary text-white hover-gradient-primary'
                        }`}
                      >
                        {isChangingPassword ? (
                          <span className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Changing Password...
                          </span>
                        ) : (
                          'Change Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Email Settings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Preferences</h3>
                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-3">More detailed email preferences are available in the</p>
                      <button
                        onClick={() => setActiveTab('email-preferences')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FiMail className="w-4 h-4 mr-2" />
                        Email Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Preferences Tab */}
          {activeTab === 'email-preferences' && (
            <div className="max-w-4xl">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Preferences</h2>
                  <p className="text-gray-600">Choose which emails you'd like to receive from us. You can update these preferences at any time.</p>
                </div>
                
                <div className="space-y-6">
                  {/* Weekly New Tools */}
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiStar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Weekly New AI Tools</h3>
                        <p className="text-xs text-gray-500 mt-1">Get notified about the latest AI tools added to our platform every week</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-2">
                          Popular
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailSettings(prev => ({ ...prev, weeklyNewTools: !prev.weeklyNewTools }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailSettings.weeklyNewTools ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        emailSettings.weeklyNewTools ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* AI Recommendations */}
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiZap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Personalized AI Recommendations</h3>
                        <p className="text-xs text-gray-500 mt-1">Receive personalized AI tool recommendations based on your interests and usage</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-2">
                          Recommended
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailSettings(prev => ({ ...prev, aiRecommendations: !prev.aiRecommendations }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailSettings.aiRecommendations ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        emailSettings.aiRecommendations ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Product Updates */}
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiSettings className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Product Updates & Features</h3>
                        <p className="text-xs text-gray-500 mt-1">Stay informed about new platform features, improvements, and updates</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailSettings(prev => ({ ...prev, productUpdates: !prev.productUpdates }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailSettings.productUpdates ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        emailSettings.productUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Special Offers */}
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiHeart className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Special Offers & Discounts</h3>
                        <p className="text-xs text-gray-500 mt-1">Get exclusive deals, promotions, and early access to premium AI tools</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-2">
                          Optional
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailSettings(prev => ({ ...prev, specialOffers: !prev.specialOffers }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailSettings.specialOffers ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        emailSettings.specialOffers ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Community Updates */}
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Community & Industry Updates</h3>
                        <p className="text-xs text-gray-500 mt-1">AI industry news, community highlights, and expert insights</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailSettings(prev => ({ ...prev, communityUpdates: !prev.communityUpdates }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailSettings.communityUpdates ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        emailSettings.communityUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Security Alerts */}
                  <div className="flex items-start justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Security Alerts</h3>
                        <p className="text-xs text-gray-500 mt-1">Important security notifications and account activity alerts</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                          Required
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailSettings(prev => ({ ...prev, securityAlerts: !prev.securityAlerts }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailSettings.securityAlerts ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      disabled={true}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        emailSettings.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Save Settings Button */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Settings are automatically saved as you change them.
                  </div>
                  <button
                    onClick={() => {
                      // Here you would normally save to backend
                      alert('Email preferences saved!')
                    }}
                    className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover-gradient-primary transition-all"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="max-w-4xl">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Click History</h2>
                    <p className="text-gray-600">All AI tools you've clicked on are automatically saved here. Click again to revisit or clear your history.</p>
                  </div>
                  {clickHistory.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors border border-red-200 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {clickHistory.length > 0 ? (
                    clickHistory.map((item) => {
                      const formatDate = (dateString: string) => {
                        const date = new Date(dateString)
                        return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                          Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                          'day'
                        )
                      }

                      return (
                        <div 
                          key={item.id} 
                          className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                          onClick={() => item.externalUrl && window.open(item.externalUrl, '_blank')}
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.imageUrl || 'https://placehold.co/64x64/f3f4f6/94a3b8?text=No+Image'}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{item.productName}</h4>
                            <p className="text-xs text-gray-500 mb-1">
                              {item.category} • Clicked {formatDate(item.clickedAt)}
                            </p>
                            
                            {/* Cena */}
                            <div>
                              {item.price && item.price > 0 ? (
                                <p className="text-xs font-medium text-green-600">${item.price}/month</p>
                              ) : (
                                <p className="text-xs font-bold text-purple-600">${item.price || 0}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Tlačítko Visit Again */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (item.externalUrl) {
                                  window.open(item.externalUrl, '_blank')
                                }
                              }}
                              className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                            >
                              Visit Again
                            </button>
                            
                            {/* Ikona odkazu */}
                            <div className="text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500 text-lg font-medium">No history yet</p>
                      <p className="text-sm text-gray-400 mt-2">Start exploring AI tools to build your click history</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Avatar Modal */}
        <Modal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          title="Edit Profile Picture"
        >
          <div className="space-y-6">
            {/* Current avatar preview */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {userData.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {avatarUrl ? 'Your current profile picture' : 'Default profile picture'}
              </p>
            </div>

            {/* Drag & Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-gray-400'
              } ${isUploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {isUploadingAvatar ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-gray-600">Uploading your picture...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {dragActive ? 'Drop your image here' : 'Drag and drop your image here, or'}
                    </p>
                    <label
                      htmlFor="avatar-upload-modal"
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium cursor-pointer"
                    >
                      browse to choose a file
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB)</p>
                </div>
              )}
              
              <input
                id="avatar-upload-modal"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </div>

            {/* Remove avatar button - only shown when there's a custom avatar */}
            {avatarUrl && (
              <button
                onClick={() => {
                  removeAvatar()
                  setShowAvatarModal(false)
                }}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                disabled={isUploadingAvatar}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove Picture
              </button>
            )}
          </div>
        </Modal>

        {/* Clear All Confirmation Modal */}
        <Modal
          isOpen={showClearAllModal}
          onClose={cancelClearAll}
          title={clearAllStep === 1 ? "Clear All Saved Products?" : "Are you absolutely sure?"}
        >
          <div className="space-y-4">
            {clearAllStep === 1 ? (
              <div>
                <p className="text-gray-600">
                  This will remove all {savedProducts.length} saved products from your account.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This action cannot be undone.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-600 font-medium">
                  This will permanently delete all your saved products!
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Type "DELETE" to confirm this destructive action.
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={cancelClearAll}
                className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={clearingAll}
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                disabled={clearingAll}
                className={`flex-1 px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                  clearAllStep === 1 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } ${clearingAll ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {clearingAll ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </span>
                ) : (
                  clearAllStep === 1 ? 'Yes, Clear All' : 'Delete Forever'
                )}
              </button>
            </div>
          </div>
        </Modal>

        {/* Clear History Confirmation Modal */}
        <Modal
          isOpen={showClearHistoryModal}
          onClose={cancelClearHistory}
          title="Clear Click History?"
        >
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">
                This will remove all {clickHistory.length} items from your click history.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone, but you can always build a new history by clicking on AI tools.
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={cancelClearHistory}
                className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isClearingHistory}
              >
                Cancel
              </button>
              <button
                onClick={confirmClearHistory}
                disabled={isClearingHistory}
                className={`flex-1 px-4 py-2 text-sm text-white rounded-lg transition-colors bg-red-600 hover:bg-red-700 ${
                  isClearingHistory ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isClearingHistory ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Clearing...
                  </span>
                ) : (
                  'Clear History'
                )}
              </button>
            </div>
          </div>
        </Modal>

        {/* Rewards Modal */}
        <Modal
          isOpen={showRewards}
          onClose={() => setShowRewards(false)}
          title="Your Rewards"
        >
          <div className="space-y-4">
            {rewards.length > 0 ? (
              rewards.map((reward) => (
                <div key={reward.id} className={`p-4 border rounded-lg ${
                  reward.claimed ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{reward.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          reward.type === 'access' ? 'bg-green-100 text-green-600' :
                          reward.type === 'discount' ? 'bg-orange-100 text-orange-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {reward.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Value: {reward.value}</span>
                        {reward.expiresAt && (
                          <span>Expires: {reward.expiresAt}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      {reward.claimed ? (
                        <span className="px-3 py-1 text-sm bg-gray-200 text-gray-600 rounded-lg">
                          Claimed
                        </span>
                      ) : (
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Claim
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No rewards available</p>
                <p className="text-sm text-gray-400 mt-2">Keep using AI tools to earn rewards</p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    )
  }

  return null
}

// Hlavní komponenta s Suspense boundary
export default function UserAreaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám uživatelskou oblast...</p>
        </div>
      </div>
    }>
      <UserAreaContent />
    </Suspense>
  )
} 