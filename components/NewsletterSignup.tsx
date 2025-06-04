'use client'

import React, { useState } from 'react'
import { CheckIcon, EnvelopeIcon, SparklesIcon, RocketLaunchIcon, BoltIcon } from '@heroicons/react/24/outline'

interface NewsletterCategory {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  popular?: boolean
}

const newsletterCategories: NewsletterCategory[] = [
  {
    id: 'news',
    label: 'AI News & Updates',
    description: 'Latest AI industry news and breakthrough technologies',
    icon: <SparklesIcon className="w-4 h-4" />,
    popular: true
  },
  {
    id: 'reviews',
    label: 'Tool Reviews & Comparisons',
    description: 'In-depth reviews and side-by-side tool comparisons',
    icon: <BoltIcon className="w-4 h-4" />
  },
  {
    id: 'rankings',
    label: 'Weekly TOP 20 Rankings',
    description: 'Fresh rankings of trending AI tools by category',
    icon: <RocketLaunchIcon className="w-4 h-4" />,
    popular: true
  },
  {
    id: 'tutorials',
    label: 'Tutorials & How-To Guides',
    description: 'Step-by-step guides for mastering AI tools',
    icon: <SparklesIcon className="w-4 h-4" />
  },
  {
    id: 'launches',
    label: 'New Tool Launches',
    description: 'Be first to know about exciting new AI releases',
    icon: <RocketLaunchIcon className="w-4 h-4" />
  },
  {
    id: 'deals',
    label: 'Exclusive Deals & Discounts',
    description: 'Special offers and pricing alerts for premium tools',
    icon: <BoltIcon className="w-4 h-4" />,
    popular: true
  },
  {
    id: 'courses',
    label: 'Course Announcements',
    description: 'New AI learning opportunities and skill development',
    icon: <SparklesIcon className="w-4 h-4" />
  },
  {
    id: 'digest',
    label: 'Weekly AI Digest',
    description: 'Curated weekly summary of everything important',
    icon: <RocketLaunchIcon className="w-4 h-4" />
  }
]

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['news', 'rankings', 'deals'])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false)

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasTriedSubmit(true)
    
    if (!email.trim() || selectedCategories.length === 0 || !agreedToTerms) return

    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setEmail('')
        setSelectedCategories(['news', 'rankings', 'deals'])
        setAgreedToTerms(false)
        setHasTriedSubmit(false)
      }, 3000)
    }, 2000)
  }

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl p-8 border border-purple-100/50 shadow-xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            You're In! Welcome Aboard!
          </h3>
          <p className="text-gray-600 text-lg">
            Thank you for joining our AI community. Check your email for confirmation and get ready for amazing content!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl p-8 border border-purple-100/50 shadow-xl relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-200/40 to-yellow-200/40 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <EnvelopeIcon className="w-7 h-7 text-white" />
            </div>
            <SparklesIcon className="w-7 h-7 text-purple-500 animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-4">
            Join 50,000+ AI Enthusiasts
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
            Get exclusive access to the latest AI tools, insider reviews, and expert insights delivered directly to your inbox
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {/* Email Input */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all bg-white/90 backdrop-blur-sm placeholder:text-gray-500 shadow-sm hover:shadow-md"
                required
                disabled={isSubmitting}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <EnvelopeIcon className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              What AI content interests you most?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newsletterCategories.map((category) => (
                <label
                  key={category.id}
                  className={`relative cursor-pointer group ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                  <div className={`h-24 p-4 rounded-2xl border-2 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:shadow-md relative ${
                    selectedCategories.includes(category.id)
                      ? 'border-purple-400 bg-purple-50/90 shadow-lg ring-2 ring-purple-100'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    {/* Popular badge */}
                    {category.popular && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-pink-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                        POPULAR
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3 h-full">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 transition-all ${
                        selectedCategories.includes(category.id)
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-gray-300 group-hover:border-purple-400'
                      }`}>
                        {selectedCategories.includes(category.id) && (
                          <CheckIcon className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`${selectedCategories.includes(category.id) ? 'text-purple-600' : 'text-gray-500'}`}>
                            {category.icon}
                          </div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {category.label}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {category.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="relative overflow-hidden px-12 py-5 text-xl font-bold rounded-2xl transition-all duration-300 shadow-xl transform hover:scale-105 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 hover:shadow-2xl"
            >
              {/* Animated background */}
              {!isSubmitting && email.trim() && selectedCategories.length > 0 && agreedToTerms && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              )}
              
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe & Get Instant Access
                    <SparklesIcon className="w-6 h-6" />
                  </>
                )}
              </span>
            </button>
            
            {/* Terms agreement */}
            <div className="mt-4">
              <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer max-w-md mx-auto">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  disabled={isSubmitting}
                />
                <span className="leading-relaxed">
                  By subscribing, I agree to receive emails and confirm that I have read and accepted the{' '}
                  <a href="/privacy-policy" className="text-purple-600 hover:text-purple-700 underline">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="/terms-of-service" className="text-purple-600 hover:text-purple-700 underline">
                    Terms of Service
                  </a>.
                </span>
              </label>
            </div>
            
            {/* Error messages */}
            {hasTriedSubmit && selectedCategories.length === 0 && (
              <p className="text-red-500 text-sm mt-3 font-medium">
                Please select at least one category to continue
              </p>
            )}
            {hasTriedSubmit && !agreedToTerms && (
              <p className="text-red-500 text-sm mt-3 font-medium">
                Please agree to the terms and conditions to continue
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 