'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import SocialIcons from './SocialIcons'
import Modal from './Modal'
import CompanyRegisterForm from './CompanyRegisterForm'
import CompanyLoginForm from './CompanyLoginForm'

export default function Footer() {
  const [isCompanyRegisterOpen, setIsCompanyRegisterOpen] = useState(false)
  const [isCompanyLoginOpen, setIsCompanyLoginOpen] = useState(false)

  const handleCompanyRegisterSuccess = () => {
    setIsCompanyRegisterOpen(false)
    // Redirect to success page
    window.location.href = '/company-registration-success'
  }

  const handleCompanyLoginSuccess = () => {
    setIsCompanyLoginOpen(false)
    // TODO: Redirect to company admin
    console.log('Company login successful')
  }

  const switchToCompanyLogin = () => {
    setIsCompanyRegisterOpen(false)
    setIsCompanyLoginOpen(true)
  }

  const switchToCompanyRegister = () => {
    setIsCompanyLoginOpen(false)
    setIsCompanyRegisterOpen(true)
  }

  return (
    <>
      <footer className="border-t border-gray-100 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                © 2024 comparee.ai. All rights reserved.
              </div>
              <SocialIcons />
            </div>
            
            <div className="flex flex-wrap gap-6">
              <Link 
                href="/about" 
                className="text-sm text-gray-600 hover:text-purple-600/90 transition-colors"
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                className="text-sm text-gray-600 hover:text-purple-600/90 transition-colors"
              >
                Contact
              </Link>
              <button 
                className="text-sm text-gray-600 hover:text-purple-600/90 transition-colors font-medium"
                onClick={() => setIsCompanyRegisterOpen(true)}
              >
                For AI Companies
              </button>
              <Link 
                href="/terms" 
                className="text-sm text-gray-600 hover:text-purple-600/90 transition-colors"
              >
                Terms of Use
              </Link>
              <Link 
                href="/privacy" 
                className="text-sm text-gray-600 hover:text-purple-600/90 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Company Registration Modal */}
      <Modal
        isOpen={isCompanyRegisterOpen}
        onClose={() => setIsCompanyRegisterOpen(false)}
        title=""
        size="lg"
      >
        <CompanyRegisterForm
          onSuccess={handleCompanyRegisterSuccess}
          onSwitchToLogin={switchToCompanyLogin}
        />
      </Modal>

      {/* Company Login Modal */}
      <Modal
        isOpen={isCompanyLoginOpen}
        onClose={() => setIsCompanyLoginOpen(false)}
        title=""
      >
        <CompanyLoginForm
          onSuccess={handleCompanyLoginSuccess}
          onSwitchToRegister={switchToCompanyRegister}
        />
      </Modal>
    </>
  )
} 