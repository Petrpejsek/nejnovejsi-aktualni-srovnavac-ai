'use client'

import React, { useState } from 'react'
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
  XMarkIcon
} from '@heroicons/react/24/outline'

interface CompanyProfile {
  id: string
  name: string
  description: string
  logoUrl: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  country: string
  contactPerson: string
  contactRole: string
  foundedYear: string
  employeeCount: string
  socialMedia: {
    linkedin: string
    twitter: string
    facebook: string
    youtube: string
  }
  categories: string[]
  verified: boolean
}

export default function CompanyProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set())
  
  // Mock data - později z API/databáze
  const [profile, setProfile] = useState<CompanyProfile>({
    id: '1',
    name: 'TechFlow Solutions',
    description: 'Poskytujeme pokročilé AI řešení pro automatizaci obchodních procesů. Naše produkty pomáhají firmám zefektivnit jejich workflow a zvýšit produktivitu pomocí umělé inteligence.',
    logoUrl: 'https://placehold.co/128x128/3B82F6/FFFFFF?text=TF',
    email: 'info@techflowsolutions.com',
    phone: '+420 123 456 789',
    website: 'https://techflowsolutions.com',
    address: 'Náměstí Míru 15',
    city: 'Praha',
    country: 'Czech Republic',
    contactPerson: 'John Smith',
    contactRole: 'CEO',
    foundedYear: '2020',
    employeeCount: '11-50',
    socialMedia: {
      linkedin: 'https://linkedin.com/company/techflowsolutions',
      twitter: 'https://twitter.com/techflowsolutions',
      facebook: '',
      youtube: 'https://youtube.com/@techflowsolutions'
    },
    categories: ['AI Automation', 'Business Intelligence', 'Workflow Management'],
    verified: true
  })

  const [editedProfile, setEditedProfile] = useState<CompanyProfile>(profile)

  const handleEdit = () => {
    setEditedProfile(profile)
    setIsEditing(true)
  }

  const handleSectionEdit = (section: string) => {
    const newEditingSections = new Set(editingSections)
    if (newEditingSections.has(section)) {
      newEditingSections.delete(section)
    } else {
      newEditingSections.add(section)
    }
    setEditingSections(newEditingSections)
    if (!isEditing) {
      setEditedProfile(profile)
    }
  }

  const isSectionEditing = (section: string) => {
    return isEditing || editingSections.has(section)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // TODO: API call to save profile
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulace
      setProfile(editedProfile)
      setIsEditing(false)
      setEditingSections(new Set())
      console.log('Profile saved successfully')
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
    setEditingSections(new Set())
  }

  const handleInputChange = (field: keyof CompanyProfile | string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setEditedProfile(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CompanyProfile] as any),
          [child]: value
        }
      }))
    } else {
      setEditedProfile(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create preview using FileReader
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string
        handleInputChange('logoUrl', logoUrl)
        
        // If not in global edit mode, enable section editing
        if (!isEditing) {
          setEditingSections(new Set(['logo']))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const currentData = isEditing ? editedProfile : profile

  const employeeCountOptions = [
    '1-10',
    '11-50', 
    '51-200',
    '201-500',
    '500+'
  ]

  const countryOptions = [
    'Czech Republic',
    'Slovakia',
    'Germany',
    'Austria',
    'Poland',
    'United States',
    'United Kingdom',
    'Other'
  ]

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
            Manage your company information that visitors will see
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Mode: {isEditing ? 'EDITING' : 'VIEWING'} | Status: {isLoading ? 'Saving...' : 'Ready'}
          </p>
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
                 disabled={isLoading}
                 className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
               >
                 <CheckIcon className="w-4 h-4" />
                 {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Alert pro workflow schvalování */}
        {isEditing && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                                 <h3 className="text-sm font-medium text-yellow-800">
                   Change Approval Required
                 </h3>
                 <div className="mt-2 text-sm text-yellow-700">
                   <p>
                     All company profile changes must be approved by comparee administrators before being published on the website. 
                     After saving, your changes will be submitted for review.
                   </p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hlavní informace */}
        <div className="lg:col-span-2 space-y-6">
                     {/* Základní údaje */}
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                 Basic Information
               </div>
               <button
                 onClick={() => handleSectionEdit('basic')}
                 className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                 title="Edit basic information"
               >
                 <PencilIcon className="w-4 h-4" />
               </button>
             </h2>
            
            <div className="space-y-4">
              {/* Název firmy */}
              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Company Name *
                 </label>
                                 {isSectionEditing('basic') ? (
                   <input
                     type="text"
                     value={currentData.name}
                     onChange={(e) => handleInputChange('name', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   />
                 ) : (
                   <p className="text-gray-900 font-medium">{currentData.name}</p>
                 )}
              </div>

              {/* Popis */}
              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Company Description *
                 </label>
                                 {isSectionEditing('basic') ? (
                   <textarea
                     value={currentData.description}
                     onChange={(e) => handleInputChange('description', e.target.value)}
                     rows={4}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     placeholder="Describe your company and main activities..."
                   />
                 ) : (
                   <p className="text-gray-700">{currentData.description}</p>
                 )}
              </div>

              {/* Rok založení a velikost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">
                     Founded Year
                   </label>
                                     {isSectionEditing('basic') ? (
                     <input
                       type="number"
                       value={currentData.foundedYear}
                       onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                       min="1900"
                       max={new Date().getFullYear()}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     />
                   ) : (
                     <p className="text-gray-900">{currentData.foundedYear}</p>
                   )}
                </div>
                
                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">
                     Number of Employees
                   </label>
                                     {isSectionEditing('basic') ? (
                     <select
                       value={currentData.employeeCount}
                       onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     >
                       {employeeCountOptions.map(option => (
                         <option key={option} value={option}>{option}</option>
                       ))}
                     </select>
                   ) : (
                     <p className="text-gray-900">{currentData.employeeCount}</p>
                   )}
                                </div>
              </div>
              
              {/* Save/Cancel buttons for basic section editing */}
              {!isEditing && editingSections.has('basic') && (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setEditedProfile(profile)
                      setEditingSections(new Set())
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Kontaktní informace */}
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <EnvelopeIcon className="w-5 h-5 text-purple-600" />
                 Contact Information
               </div>
               <button
                 onClick={() => handleSectionEdit('contact')}
                 className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                 title="Edit contact information"
               >
                 <PencilIcon className="w-4 h-4" />
               </button>
             </h2>
            
            <div className="space-y-4">
              {/* Email a telefon */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                                     {isSectionEditing('contact') ? (
                     <input
                       type="email"
                       value={currentData.email}
                       onChange={(e) => handleInputChange('email', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     />
                   ) : (
                     <p className="text-gray-900">{currentData.email}</p>
                   )}
                </div>
                
                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">
                     Phone
                   </label>
                                     {isSectionEditing('contact') ? (
                     <input
                       type="tel"
                       value={currentData.phone}
                       onChange={(e) => handleInputChange('phone', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     />
                   ) : (
                     <p className="text-gray-900">{currentData.phone}</p>
                   )}
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                                 {isSectionEditing('contact') ? (
                   <input
                     type="url"
                     value={currentData.website}
                     onChange={(e) => handleInputChange('website', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     placeholder="https://..."
                   />
                 ) : (
                   <a href={currentData.website} target="_blank" className="text-purple-600 hover:text-purple-700">
                     {currentData.website}
                   </a>
                 )}
              </div>

              {/* Adresa */}
              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Address
                 </label>
                {isSectionEditing('contact') ? (
                  <input
                    type="text"
                    value={currentData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{currentData.address}</p>
                )}
              </div>

              {/* Město a země */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">
                     City
                   </label>
                  {isSectionEditing('contact') ? (
                    <input
                      type="text"
                      value={currentData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{currentData.city}</p>
                  )}
                </div>
                
                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">
                     Country
                   </label>
                  {isSectionEditing('contact') ? (
                    <select
                      value={currentData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {countryOptions.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{currentData.country}</p>
                  )}
                </div>
              </div>

              {/* Kontaktní osoba */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">
                     Contact Person
                   </label>
                  {isSectionEditing('contact') ? (
                    <input
                      type="text"
                      value={currentData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{currentData.contactPerson}</p>
                  )}
                </div>
                
                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">
                     Position
                   </label>
                  {isSectionEditing('contact') ? (
                    <input
                      type="text"
                      value={currentData.contactRole}
                      onChange={(e) => handleInputChange('contactRole', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{currentData.contactRole}</p>
                  )}
                                </div>
              </div>
              
              {/* Save/Cancel buttons for contact section editing */}
              {!isEditing && editingSections.has('contact') && (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setEditedProfile(profile)
                      setEditingSections(new Set())
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sociální sítě */}
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <GlobeAltIcon className="w-5 h-5 text-purple-600" />
                 Social Media
               </div>
               <button
                 onClick={() => handleSectionEdit('social')}
                 className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                 title="Edit social media"
               >
                 <PencilIcon className="w-4 h-4" />
               </button>
             </h2>
            
            <div className="space-y-4">
              {Object.entries(currentData.socialMedia).map(([platform, url]) => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {platform}
                  </label>
                                     {isSectionEditing('social') ? (
                     <input
                       type="url"
                       value={url}
                       onChange={(e) => handleInputChange(`socialMedia.${platform}`, e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       placeholder={`https://${platform}.com/...`}
                     />
                   ) : (
                    url ? (
                      <a href={url} target="_blank" className="text-purple-600 hover:text-purple-700">
                        {url}
                      </a>
                    ) : (
                                             <p className="text-gray-500">Not set</p>
                    )
                  )}
                </div>
              ))}
              
              {/* Save/Cancel buttons for social section editing */}
              {!isEditing && editingSections.has('social') && (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setEditedProfile(profile)
                      setEditingSections(new Set())
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
                     {/* Logo */}
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <PhotoIcon className="w-5 h-5 text-purple-600" />
                 Company Logo
               </div>
               <button
                 onClick={() => handleSectionEdit('logo')}
                 className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                 title="Edit logo"
               >
                 <PencilIcon className="w-4 h-4" />
               </button>
             </h3>
            
            <div className="space-y-4">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {currentData.logoUrl ? (
                  <img 
                    src={currentData.logoUrl} 
                    alt="Company logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
                                           {isSectionEditing('logo') && (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 2MB
                  </p>
                  
                  {/* Save/Cancel buttons for section editing */}
                  {!isEditing && editingSections.has('logo') && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditedProfile(profile)
                          setEditingSections(new Set())
                        }}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                         <h3 className="text-lg font-semibold text-gray-900 mb-4">
               Account Status
             </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                                 <span className="text-sm text-gray-600">Verification</span>
                 {currentData.verified ? (
                   <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                     <CheckIcon className="w-3 h-3 mr-1" />
                     Verified
                   </span>
                 ) : (
                   <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                     Pending Verification
                   </span>
                 )}
              </div>
              
              <div className="flex items-center justify-between">
                                 <span className="text-sm text-gray-600">Visibility</span>
                 <span className="text-sm font-medium text-green-600">Active</span>
               </div>
               
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-600">Products</span>
                 <span className="text-sm font-medium text-gray-900">2 active, 1 pending</span>
              </div>
            </div>
          </div>

          {/* Kategorie */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                         <h3 className="text-lg font-semibold text-gray-900 mb-4">
               Categories
             </h3>
            
            <div className="space-y-2">
              {currentData.categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full mr-2 mb-2"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}