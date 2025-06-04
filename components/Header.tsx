'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Modal from './Modal'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Check if we're in company admin environment
  const isCompanyAdmin = pathname?.startsWith('/company-admin')

  const handleLoginSuccess = () => {
    setIsLoginOpen(false)
    // TODO: Implement login
  }

  const handleRegisterSuccess = () => {
    setIsRegisterOpen(false)
    // TODO: Implement registration
  }

  const switchToRegister = () => {
    setIsLoginOpen(false)
    setIsRegisterOpen(true)
  }

  const switchToLogin = () => {
    setIsRegisterOpen(false)
    setIsLoginOpen(true)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Company Admin Header Layout
  if (isCompanyAdmin) {
    return (
      <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 h-12">
        <div className="h-full flex items-center justify-center px-4">
          <Link href="/company-admin" className="flex items-center">
            <span 
              className="font-bold text-gradient-primary"
              style={{ fontSize: '1.4rem' }}
            >
              comparee
            </span>
          </Link>
        </div>
      </header>
    )
  }

  // Default Header Layout
  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-semibold text-gradient-primary">
              comparee.ai
            </Link>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-8">
              {/* Main navigation menu */}
              <nav className="flex items-center space-x-8">
                <Link 
                  href="/top-lists" 
                  className="text-gray-700 hover:text-gradient-primary font-medium transition-colors duration-200"
                >
                  TOP Lists
                </Link>
                <Link 
                  href="/ai-kurzy" 
                  className="text-gray-700 hover:text-gradient-primary font-medium transition-colors duration-200"
                >
                  AI Courses
                </Link>
                <Link 
                  href="/reels" 
                  className="text-gray-700 hover:text-gradient-primary font-medium transition-colors duration-200"
                >
                  AI Reels
                </Link>
              </nav>
              
              {/* Login buttons */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="px-4 py-2 text-sm font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all"
                >
                  Log In
                </button>
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="text-sm text-gradient-primary font-medium hover:opacity-80 transition-opacity"
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Mobile hamburger menu */}
            <div className="md:hidden flex items-center gap-4">
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-primary text-white hover-gradient-primary transition-all"
              >
                Log In
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                <Link 
                  href="/top-lists"
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:text-gradient-primary font-medium transition-colors duration-200 py-2"
                >
                  TOP Lists
                </Link>
                <Link 
                  href="/ai-kurzy"
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:text-gradient-primary font-medium transition-colors duration-200 py-2"
                >
                  AI Courses
                </Link>
                <Link 
                  href="/reels"
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:text-gradient-primary font-medium transition-colors duration-200 py-2"
                >
                  AI Reels
                </Link>
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setIsRegisterOpen(true)
                      closeMobileMenu()
                    }}
                    className="text-gradient-primary font-medium hover:opacity-80 transition-opacity py-2"
                  >
                    Sign Up
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Modal windows */}
      <Modal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        title="Log In"
      >
        <LoginForm
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={switchToRegister}
        />
      </Modal>

      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Sign Up"
      >
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={switchToLogin}
        />
      </Modal>
    </>
  )
} 