'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Modal from './Modal'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  const handleLoginSuccess = () => {
    setIsLoginOpen(false)
    // TODO: Implementovat přihlášení
  }

  const handleRegisterSuccess = () => {
    setIsRegisterOpen(false)
    // TODO: Implementovat registraci
  }

  const switchToRegister = () => {
    setIsLoginOpen(false)
    setIsRegisterOpen(true)
  }

  const switchToLogin = () => {
    setIsRegisterOpen(false)
    setIsLoginOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-semibold text-gradient-primary">
              comparee.ai
            </Link>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="px-4 py-2 text-sm font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="text-sm text-gradient-primary font-medium hover:opacity-80 transition-opacity"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modální okna mimo header */}
      <Modal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        title="Sign In"
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