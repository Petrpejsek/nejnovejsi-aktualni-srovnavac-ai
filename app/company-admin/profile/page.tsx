'use client'

import React, { useState, useEffect } from 'react'
import {
  BuildingOfficeIcon,
  PhotoIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  MapPinIcon,
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface CompanyProfile {
  id: string
  name: string
  email: string
  contactPerson: string
  website?: string
  description?: string
  logoUrl?: string
  taxId?: string
  billingAddress?: string
  billingCountry?: string
  status: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export default function CompanyProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null) // 'basic', 'billing', 'logo', or null for all
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [editedProfile, setEditedProfile] = useState<Partial<CompanyProfile>>({})
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Načtení profilu při načtení komponenty
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/advertiser/profile')
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
        setEditedProfile(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch profile')
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    if (profile) {
      setEditedProfile(profile)
      setIsEditing(true)
      setEditingSection(null) // Edit all sections
    }
  }

  const handleSectionEdit = (section: string) => {
    if (profile) {
      setEditedProfile(profile)
      setIsEditing(true)
      setEditingSection(section) // Edit only this section
    }
  }

  const handleSave = async () => {
    if (!profile || !editedProfile) return
    
    try {
      setIsSaving(true)
      setError(null)

      // Handle logo upload if there's a file
      let logoUrl = editedProfile.logoUrl
      if (logoFile) {
        // Create FormData for file upload
        const formData = new FormData()
        formData.append('logo', logoFile)
        
        // Upload logo first
        const uploadResponse = await fetch('/api/advertiser/upload-logo', {
          method: 'POST',
          body: formData
        })
        
        const uploadData = await uploadResponse.json()
        if (uploadData.success) {
          logoUrl = uploadData.logoUrl
        } else {
          throw new Error('Failed to upload logo')
        }
      }

      const response = await fetch('/api/advertiser/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editedProfile,
          logoUrl
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setProfile(data.data)
        setIsEditing(false)
        setEditingSection(null)
        setLogoFile(null)
        setLogoPreview(null)
        console.log('Profile updated successfully')
      } else {
        throw new Error(data.error || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditedProfile(profile)
      setIsEditing(false)
      setEditingSection(null)
      setLogoFile(null)
      setLogoPreview(null)
    }
  }

  const handleInputChange = (field: keyof CompanyProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoFileChange = (file: File) => {
    setLogoFile(file)
    
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        handleLogoFileChange(file)
      }
    }
  }

  const isEditingSection = (section: string) => {
    return isEditing && (editingSection === null || editingSection === section)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-96"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !profile) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BuildingOfficeIcon className="w-8 h-8 text-purple-600" />
            Company Profile
          </h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Profile</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={fetchProfile}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const currentData = isEditing ? editedProfile : profile
  const foundedYear = profile.createdAt ? new Date(profile.createdAt).getFullYear().toString() : ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BuildingOfficeIcon className="w-8 h-8 text-purple-600" />
              Company Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your company information
            </p>
            {profile.isVerified && (
              <div className="flex items-center gap-2 mt-2">
                <CheckIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Verified Company</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-medium"
              >
                <PencilIcon className="w-5 h-5" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hlavní informace */}
        <div className="lg:col-span-2 space-y-6">
          {/* Základní údaje */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                Basic Information
              </h2>
              {!isEditingSection('basic') && (
                <button
                  onClick={() => handleSectionEdit('basic')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                  title="Edit basic information"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {/* Název firmy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                {isEditingSection('basic') ? (
                  <input
                    type="text"
                    value={currentData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{currentData.name}</p>
                )}
              </div>

              {/* Email (jen pro čtení) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <p className="text-gray-900">{currentData.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Kontaktní osoba */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person *
                </label>
                {isEditingSection('basic') ? (
                  <input
                    type="text"
                    value={currentData.contactPerson || ''}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                ) : (
                  <p className="text-gray-900">{currentData.contactPerson}</p>
                )}
              </div>

              {/* Popis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description
                </label>
                {isEditingSection('basic') ? (
                  <textarea
                    value={currentData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe your company and main activities..."
                  />
                ) : (
                  <p className="text-gray-700">{currentData.description || 'No description provided'}</p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                {isEditingSection('basic') ? (
                  <input
                    type="url"
                    value={currentData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                ) : (
                  <div>
                    {currentData.website ? (
                      <a 
                        href={currentData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 underline"
                      >
                        {currentData.website}
                      </a>
                    ) : (
                      <p className="text-gray-500">No website provided</p>
                    )}
                  </div>
                )}
              </div>

              {/* Company info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Founded Year
                  </label>
                  <p className="text-gray-900">{foundedYear}</p>
                  <p className="text-xs text-gray-500 mt-1">Based on registration date</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    profile.status === 'active' ? 'bg-green-100 text-green-800' : 
                    profile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing informace */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-purple-600" />
                Billing Information
              </h2>
              {!isEditingSection('billing') && (
                <button
                  onClick={() => handleSectionEdit('billing')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                  title="Edit billing information"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {/* Tax ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax ID / VAT Number
                </label>
                {isEditingSection('billing') ? (
                  <input
                    type="text"
                    value={currentData.taxId || ''}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="CZ12345678"
                  />
                ) : (
                  <p className="text-gray-900">{currentData.taxId || 'Not provided'}</p>
                )}
              </div>

              {/* Billing Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Address
                </label>
                {isEditingSection('billing') ? (
                  <textarea
                    value={currentData.billingAddress || ''}
                    onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Street, City, Postal Code"
                  />
                ) : (
                  <p className="text-gray-900">{currentData.billingAddress || 'Not provided'}</p>
                )}
              </div>

              {/* Billing Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Country
                </label>
                {isEditingSection('billing') ? (
                  <select
                    value={currentData.billingCountry || ''}
                    onChange={(e) => handleInputChange('billingCountry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select country</option>
                    <option value="Czech Republic">Czech Republic</option>
                    <option value="Slovakia">Slovakia</option>
                    <option value="Germany">Germany</option>
                    <option value="Austria">Austria</option>
                    <option value="Poland">Poland</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{currentData.billingCountry || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PhotoIcon className="w-5 h-5 text-purple-600" />
                Company Logo
              </h3>
              {!isEditingSection('logo') && (
                <button
                  onClick={() => handleSectionEdit('logo')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                  title="Edit company logo"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 relative">
                {logoPreview || currentData.logoUrl ? (
                  <img 
                    src={logoPreview || currentData.logoUrl} 
                    alt="Company logo" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <PhotoIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              {isEditingSection('logo') && (
                <div className="space-y-4">
                  {/* Drag & Drop Area */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-purple-300 rounded-lg p-6 hover:border-purple-400 hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleLogoFileChange(file)
                      }}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer block">
                      <PhotoIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 text-center">
                        <span className="font-medium text-purple-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 text-center mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </label>
                  </div>
                  
                  {logoFile && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      ✓ Selected: {logoFile.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member since:</span>
                <span className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Last login:</span>
                <span className="font-medium">
                  {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : 'Never'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Profile updated:</span>
                <span className="font-medium">{new Date(profile.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}