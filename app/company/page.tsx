'use client'

import { useState } from 'react'
import Link from 'next/link'
import CompanyAuth from '@/components/CompanyAuth'
import Modal from '@/components/Modal'

export default function CompanyPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register'>('register')

  const handleLoginClick = () => {
    setAuthDefaultTab('login')
    setIsAuthOpen(true)
  }

  const handleRegisterClick = () => {
    setAuthDefaultTab('register')
    setIsAuthOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Company Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl md:text-3xl font-semibold text-gradient-primary">
              comparee.ai
            </Link>
            
            {/* Desktop - Company Login buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={handleLoginClick}
                className="px-4 py-2 text-sm font-medium rounded-[14px] bg-gradient-primary text-white hover-gradient-primary transition-all"
              >
                Company Log In
              </button>
              <button
                onClick={handleRegisterClick}
                className="text-sm text-gradient-primary font-medium hover:opacity-80 transition-opacity"
              >
                Company Sign Up
              </button>
            </div>

            {/* Mobile - Company Login buttons */}
            <div className="md:hidden flex items-center gap-2">
              <button 
                onClick={handleLoginClick}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-primary text-white hover-gradient-primary transition-all"
              >
                Log In
              </button>
              <button
                onClick={handleRegisterClick}
                className="text-xs text-gradient-primary font-medium hover:opacity-80 transition-opacity"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">50,000+ monthly AI enthusiasts</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Reach the <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Right Audience</span> for Your AI Business
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with decision-makers, developers, and AI enthusiasts actively searching for cutting-edge tools and solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button 
                onClick={handleRegisterClick}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-8 py-4 rounded-xl text-lg hover:scale-105 transition-transform duration-200 shadow-2xl"
              >
                Start Advertising Today
              </button>
              <button className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white hover:text-black transition-all duration-200">
                View Success Stories
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">50K+</div>
                <div className="text-gray-300">Monthly Visitors</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">2.3%</div>
                <div className="text-gray-300">Average CTR</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">$0.50</div>
                <div className="text-gray-300">Avg. Cost Per Click</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">24hrs</div>
                <div className="text-gray-300">Campaign Approval</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Top AI Companies Choose Us
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We connect you with the most engaged AI community online. No wasted impressions, just quality traffic.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {/* Benefit 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Targeted AI Audience</h3>
                <p className="text-gray-600 leading-relaxed">
                  Reach developers, product managers, and decision-makers actively looking for AI solutions. Our audience is pre-qualified and engaged.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track impressions, clicks, CTR, and conversions in real-time. Get detailed insights into your campaign performance and ROI.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Cost-Effective CPC</h3>
                <p className="text-gray-600 leading-relaxed">
                  Pay only for quality clicks. Our average CPC of $0.50 delivers exceptional value compared to Google Ads or Facebook.
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Setup</h3>
                <p className="text-gray-600 leading-relaxed">
                  Launch your campaign in minutes. Simple approval process, usually completed within 24 hours. No complex requirements.
                </p>
              </div>

              {/* Benefit 5 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality Control</h3>
                <p className="text-gray-600 leading-relaxed">
                  All campaigns are manually reviewed. We maintain high standards to ensure quality ads that provide value to our community.
                </p>
              </div>

              {/* Benefit 6 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">24/7 Support</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get dedicated support for campaign optimization, troubleshooting, and strategy. Our team helps maximize your ROI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              No hidden fees, no long-term contracts. Pay only for quality clicks.
            </p>
            
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white mb-12">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold mb-4">Cost Per Click (CPC) Model</h3>
                <div className="text-6xl font-bold mb-4">$0.50</div>
                <p className="text-xl mb-8">Average cost per click</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Only pay for actual clicks</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>$50 minimum budget</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Set your own daily budget</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Pause anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sign Up Section */}
      <section id="signup" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Ready to Start Advertising?
              </h2>
              <p className="text-xl text-gray-600">
                Join innovative AI companies already growing their business with us.
              </p>
            </div>
            
            {/* Registration Forms */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden px-3 py-12">
              <div className="max-w-2xl mx-auto">
                <CompanyAuth onClose={() => {}} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Questions? We're Here to Help
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Talk to our advertising specialists about your campaign goals.
          </p>
          <button className="bg-white text-purple-900 font-bold px-8 py-4 rounded-xl text-lg hover:scale-105 transition-transform duration-200">
            Contact Our Team
          </button>
        </div>
      </section>

      {/* Company Auth Modal */}
      <Modal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      >
        <CompanyAuth
          onClose={() => setIsAuthOpen(false)}
          defaultTab={authDefaultTab}
        />
      </Modal>
    </div>
  )
}