'use client'

import React, { useState } from 'react'
import { EyeIcon, EyeSlashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface CompanyRegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export default function CompanyRegisterForm({ onSuccess, onSwitchToLogin }: CompanyRegisterFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    website: '',
    country: '',
    companySize: '',
    productTypes: [] as string[],
    otherProductType: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Company and contact details' },
    { number: 2, title: 'Business Details', description: 'Your role and business info' },
    { number: 3, title: 'Products', description: 'Your product types' }
  ]

  const roles = [
    'Owner',
    'CEO',
    'CTO',
    'CMO',
    'Marketing Manager',
    'Product Manager',
    'Other'
  ]

  const countries = [
    'United States',
    'Argentina',
    'Australia',
    'Austria',
    'Belgium',
    'Brazil',
    'Canada',
    'Chile',
    'China',
    'Colombia',
    'Czech Republic',
    'Denmark',
    'Egypt',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Hungary',
    'India',
    'Indonesia',
    'Ireland',
    'Israel',
    'Italy',
    'Japan',
    'Mexico',
    'Netherlands',
    'New Zealand',
    'Norway',
    'Poland',
    'Portugal',
    'Romania',
    'Russia',
    'Singapore',
    'Slovakia',
    'South Africa',
    'South Korea',
    'Spain',
    'Sweden',
    'Switzerland',
    'Thailand',
    'Turkey',
    'Ukraine',
    'United Kingdom',
    'Vietnam',
    'Other'
  ]

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '200+ employees'
  ]

  const productTypes = [
    'AI Tools',
    'SaaS Platform',
    'Software/Plugin',
    'API Service',
    'Mobile App',
    'Web App',
    'Other'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleProductTypeChange = (productType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      productTypes: checked
        ? [...prev.productTypes, productType]
        : prev.productTypes.filter(type => type !== productType)
    }))

    // Clear "Other" text when unchecking "Other"
    if (productType === 'Other' && !checked) {
      setFormData(prev => ({
        ...prev,
        otherProductType: ''
      }))
    }
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required'
      }
      if (!formData.contactName.trim()) {
        newErrors.contactName = 'Contact name is required'
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid'
      }
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    if (step === 2) {
      if (!formData.role) {
        newErrors.role = 'Please select your role'
      }
      if (!formData.website.trim()) {
        newErrors.website = 'Website URL is required'
      } else {
        // More flexible URL validation - accepts www.domain.com or domain.com
        const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/
        if (!urlPattern.test(formData.website)) {
          newErrors.website = 'Please enter a valid website URL (e.g., www.yourcompany.com)'
        }
      }
    }

    // Step 3 has no required fields - all optional

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) {
      return
    }

    setIsLoading(true)

    try {
      // TODO: API call to register company
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      console.log('Company registration data:', formData)
      onSuccess()
    } catch (error) {
      console.error('Registration failed:', error)
      setErrors({ general: 'Registration failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const renderProgressBar = () => (
    <div className="mb-6">
      {/* Desktop progress bar */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center relative z-10" style={{ width: '33.33%' }}>
              {/* Step Circle - simple, no animations */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 ${
                currentStep > step.number 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : currentStep === step.number
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.number ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>

              {/* Step Content */}
              <div className="mt-2 text-center">
                <p className={`text-xs font-medium ${
                  currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
              </div>
            </div>
          ))}

          {/* Connecting Lines */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
          <div 
            className="absolute top-4 left-0 h-0.5 bg-purple-600 -z-10"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Mobile progress bar */}
      <div className="sm:hidden">
        <div className="text-center mb-4">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 border-2 ${
            'bg-purple-600 border-purple-600 text-white'
          }`}>
            <span className="text-sm font-semibold">{currentStep}</span>
          </div>
          
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {steps[currentStep - 1].title}
          </h3>
          
          <div className="text-xs text-purple-600 font-medium">
            Step {currentStep} of {steps.length}
          </div>
        </div>
        
        {/* Mobile Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Join as AI Company</h2>
        <p className="text-gray-600 text-sm">
          Let's start with your basic company information
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Company Name */}
        <div className="col-span-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.companyName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Your company name"
          />
          {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
        </div>

        {/* Contact Name */}
        <div className="col-span-2">
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Person *
          </label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.contactName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Your full name"
          />
          {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>}
        </div>

        {/* Email */}
        <div className="col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Business Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="your@company.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 pr-8 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-2 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <EyeIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 pr-8 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Confirm"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-2 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <EyeIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Business Details</h2>
        <p className="text-gray-600 text-sm">
          Tell us about your role and business
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Your Role *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.role ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select role</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select country</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Website */}
        <div className="col-span-2">
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
            Website URL *
          </label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.website ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="www.yourcompany.com"
          />
          {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
        </div>

        {/* Company Size */}
        <div className="col-span-2">
          <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1">
            Company Size
          </label>
          <select
            id="companySize"
            name="companySize"
            value={formData.companySize}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select size</option>
            {companySizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Products</h2>
        <p className="text-gray-600 text-sm">
          Select your product types
        </p>
      </div>

      {/* Product Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Product Types (Optional)
        </label>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {productTypes.slice(0, -1).map(type => ( // All except "Other"
              <label key={type} className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={formData.productTypes.includes(type)}
                  onChange={(e) => handleProductTypeChange(type, e.target.checked)}
                  className="mr-2 h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                {type}
              </label>
            ))}
          </div>
          
          {/* "Other" with inline text input */}
          <div className="flex items-center gap-2">
            <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={formData.productTypes.includes('Other')}
                onChange={(e) => handleProductTypeChange('Other', e.target.checked)}
                className="mr-2 h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              Other
            </label>
            
            {formData.productTypes.includes('Other') && (
              <input
                type="text"
                value={formData.otherProductType}
                onChange={(e) => setFormData(prev => ({ ...prev, otherProductType: e.target.value }))}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                placeholder="Specify product type"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderNavigation = () => (
    <div className="flex items-center justify-between pt-4 border-t">
      <button
        type="button"
        onClick={currentStep === 1 ? onSwitchToLogin : handlePrevious}
        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
      >
        <ChevronLeftIcon className="w-4 h-4 mr-1" />
        {currentStep === 1 ? 'Log In' : 'Previous'}
      </button>

      {currentStep < 3 ? (
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium"
        >
          Continue
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </button>
      ) : (
        <button
          type="button"
          disabled={isLoading}
          onClick={handleSubmit}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      )}
    </div>
  )

  return (
    <div className="w-full max-w-lg mx-auto">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm mb-4">
          {errors.general}
        </div>
      )}

      {renderProgressBar()}

      <form onSubmit={handleSubmit} className="space-y-4">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {renderNavigation()}
      </form>
    </div>
  )
} 