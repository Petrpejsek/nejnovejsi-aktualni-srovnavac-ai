'use client'

import { useState } from 'react'
import CompanyRegisterForm from './CompanyRegisterForm'
import CompanyLoginForm from './CompanyLoginForm'

interface CompanyAuthProps {
  onClose: () => void
}

export default function CompanyAuth({ onClose }: CompanyAuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register')

  const handleLoginSuccess = () => {
    onClose()
    window.location.href = '/company-admin'
  }

  const handleRegisterSuccess = () => {
    onClose()
    window.location.href = '/company-registration-success'
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Join as AI Company
        </h2>
        <p className="text-gray-600 text-lg">
          Partner with us to promote your AI products
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-8 bg-gray-100 rounded-lg p-1 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 text-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'register'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sign Up
        </button>
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 text-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'login'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Log In
        </button>
      </div>

      {/* Content */}
      {activeTab === 'register' ? (
        <CompanyRegisterForm
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setActiveTab('login')}
        />
      ) : (
        <CompanyLoginForm
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setActiveTab('register')}
        />
      )}


    </div>
  )
} 