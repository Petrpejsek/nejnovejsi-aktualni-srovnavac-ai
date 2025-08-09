'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Bars3Icon, XMarkIcon, UserIcon, BookmarkIcon, ClockIcon, StarIcon, CogIcon } from '@heroicons/react/24/outline'
import Modal from './Modal'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import CompanyLoginForm from './CompanyLoginForm'
import CompanyRegisterForm from './CompanyRegisterForm'


export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Context flags
  const currentPath = pathname || ''
  // Company admin/dashboard header = minimalist header
  const isCompanyAdminHeader = currentPath.startsWith('/company/dashboard') || currentPath.startsWith('/company-admin')
  // Company marketing/signup context = show company auth actions in header
  const isCompanyContext = currentPath === '/company' || currentPath === '/company-registration-success'

  // Fetch user avatar when user is authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      const avatarCacheKey = `avatar_${session.user.email}`
      const cachedAvatar = localStorage.getItem(avatarCacheKey)
      
      if (cachedAvatar) {
        // Máme cache - použijeme ji a NEVOLÁME API!
        setAvatarUrl(cachedAvatar)
        setIsLoadingAvatar(false)
        console.log('✅ Header: Loaded avatar from cache, skipping API')
      } else {
        // Nemáme cache - načteme z API
        console.log('🔄 Header: No cache found, loading from API...')
        const fetchUserProfile = async () => {
          setIsLoadingAvatar(true)
          try {
            const response = await fetch('/api/users/profile')
            if (response.ok) {
              const profile = await response.json()
              if (profile.avatar) {
                setAvatarUrl(profile.avatar)
                
                // Uložíme do cache
                localStorage.setItem(avatarCacheKey, profile.avatar)
                console.log('💾 Header: Avatar cached from API')
              } else {
                // Žádný avatar v databázi
                setAvatarUrl(null)
              }
            }
          } catch (error) {
            console.error('Error fetching user profile:', error)
          } finally {
            setIsLoadingAvatar(false)
          }
        }

        fetchUserProfile()
      }
    } else {
      setAvatarUrl(null)
      setIsLoadingAvatar(false)
    }
  }, [session, status])

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

  // Show loading skeleton while session is loading
  const isLoading = status === 'loading'

  // Company Admin Header Layout
  if (isCompanyAdminHeader) {
    return (
      <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 h-12">
        <div className="h-full flex items-center justify-center px-4">
          <Link href="/company/dashboard" className="flex items-center">
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
                {/* Dočasně skryto - AI Reels odkaz pro budoucí použití */}
                {/* <Link 
                  href="/reels" 
                  className="text-gray-700 hover:text-gradient-primary font-medium transition-colors duration-200"
                >
                  AI Reels
                </Link> */}
                <Link 
                  href="/company"
                  className="text-gray-700 hover:text-gradient-primary font-medium transition-colors duration-200"
                >
                  For AI Companies
                </Link>
              </nav>
              
              {/* Authentication (user vs company context) */}
              <div className="flex items-center gap-4">
                {isLoading ? (
                  /* Loading skeleton */
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : session ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-3"
                    >
                      {isLoadingAvatar ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                      ) : avatarUrl ? (
                      <img
                          src={avatarUrl}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div 
                          className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        >
                          {session.user?.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {session.user?.email}
                      </span>
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <Link
                          href="/user-area"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <UserIcon className="w-4 h-4 mr-2" />
                          My Account
                        </Link>
                        <Link
                          href="/user-area?tab=saved"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Saved Products
                        </Link>
                        <Link
                          href="/user-area?tab=history"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          History
                        </Link>
                        <Link
                          href="/user-area?tab=email-preferences"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email Preferences
                        </Link>
                        <Link
                          href="/user-area?tab=settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => {
                            signOut({ callbackUrl: '/' })
                            setIsUserMenuOpen(false)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  isCompanyContext ? (
                    <>
                      <button
                        onClick={() => setIsLoginOpen(true)}
                        className="px-4 py-2 text-sm font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all"
                      >
                        Company Log In
                      </button>
                      <button
                        onClick={() => setIsRegisterOpen(true)}
                        className="text-sm text-gradient-primary font-medium hover:opacity-80 transition-opacity"
                      >
                        Company Sign Up
                      </button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )
                )}
              </div>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden flex items-center gap-4">
              {isLoading ? (
                /* Mobile loading skeleton */
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : session ? (
                <Link href="/user-area" className="flex items-center">
                  {isLoadingAvatar ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      data-avatar-target="true"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      data-avatar-target="true"
                    >
                      {session.user?.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
              ) : (
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-primary text-white hover-gradient-primary transition-all"
                >
                  {isCompanyContext ? 'Company Log In' : 'Log In'}
                </button>
              )}
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
                {/* Dočasně skryto - AI Reels odkaz pro budoucí použití */}
                {/* <Link 
                  href="/reels"
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:text-gradient-primary font-medium transition-colors duration-200 py-2"
                >
                  AI Reels
                </Link> */}
                <Link 
                  href="/company"
                  onClick={closeMobileMenu}
                  className="text-gray-700 hover:text-gradient-primary font-medium transition-colors duration-200 py-2"
                >
                  For AI Companies
                </Link>
                <div className="pt-4 border-t border-gray-100">
                  {isLoading ? (
                    /* Mobile menu loading skeleton */
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  ) : session ? (
                    <>
                      <Link
                        href="/user-area"
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-2 text-gradient-primary font-medium hover:opacity-80 transition-opacity py-2"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>My Account</span>
                      </Link>
                      <Link
                        href="/user-area?tab=history"
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-2 text-gray-700 font-medium hover:text-gradient-primary transition-colors py-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>History</span>
                      </Link>
                      <Link
                        href="/user-area?tab=email-preferences"
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-2 text-gray-700 font-medium hover:text-gradient-primary transition-colors py-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Email Preferences</span>
                      </Link>
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/' })
                          closeMobileMenu()
                        }}
                        className="text-gray-600 font-medium hover:opacity-80 transition-opacity py-2"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsRegisterOpen(true)
                        closeMobileMenu()
                      }}
                      className="text-gradient-primary font-medium hover:opacity-80 transition-opacity py-2"
                    >
                      {isCompanyContext ? 'Company Sign Up' : 'Sign Up'}
                    </button>
                  )}
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
        title={isCompanyContext ? 'Company Log In' : 'Log In'}
      >
        {isCompanyContext ? (
          <CompanyLoginForm
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={switchToRegister}
          />
        )}
      </Modal>

      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title={isCompanyContext ? 'Company Sign Up' : 'Sign Up'}
      >
        {isCompanyContext ? (
          <CompanyRegisterForm
            onSuccess={handleRegisterSuccess}
            onSwitchToLogin={switchToLogin}
          />
        ) : (
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </Modal>
    </>
  )
} 