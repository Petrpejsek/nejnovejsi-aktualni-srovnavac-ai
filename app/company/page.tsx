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
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">50,000+ monthly AI enthusiasts</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Grow Your AI Business with <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">Two Proven Models</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Choose your preferred way to monetize: revenue sharing through our affiliate program or pay for targeted advertising. Both deliver results.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-pink-300 mb-2">Affiliate</div>
                <div className="text-sm text-gray-300">Performance-based revenue</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-300 mb-2">CPC Ads</div>
                <div className="text-sm text-gray-300">Pay per click results</div>
              </div>
            </div>
            
            <div className="flex justify-center mb-16">
              <button 
                onClick={handleRegisterClick}
                className="bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold px-8 py-4 rounded-xl text-lg hover:scale-105 transition-transform duration-200 shadow-2xl"
              >
                Start Growing Your Revenue Today
              </button>
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
                Why Both Models Work for AI Companies
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Whether you choose affiliate revenue sharing or targeted advertising, you're tapping into our highly engaged AI community. Both approaches deliver proven results.
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
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Engaged AI Community</h3>
                <p className="text-gray-600 leading-relaxed">
                  50,000+ monthly AI enthusiasts who actively search for and purchase AI tools. Both affiliate and CPC campaigns see higher conversion rates here.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Flexible Business Models</h3>
                <p className="text-gray-600 leading-relaxed">
                  Choose what works for your business: revenue sharing without upfront costs, or invest in targeted traffic with full budget control. Switch models anytime.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality Over Quantity</h3>
                <p className="text-gray-600 leading-relaxed">
                  We focus on relevant, high-intent traffic rather than volume. Every visitor is genuinely interested in AI solutions, leading to better ROI for both models.
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Fast Onboarding</h3>
                <p className="text-gray-600 leading-relaxed">
                  Start generating revenue in 24 hours. Simple affiliate setup with instant approval for qualified AI companies. No waiting, no complex requirements.
                </p>
              </div>

              {/* Benefit 5 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Proven Track Record</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our partners report 40% higher conversion rates compared to traditional ad networks. Join successful AI companies already partnering with us.
                </p>
              </div>

              {/* Benefit 6 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Dedicated Success Manager</h3>
                <p className="text-gray-600 leading-relaxed">
                  Premium partners get a dedicated success manager for optimization, strategy, and growth planning. We're invested in your success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Two Simple Ways to Grow Together
            </h2>
            <p className="text-xl text-gray-600 mb-16">
              Choose the model that fits your business goals. Both options deliver real results with our engaged AI community.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto items-stretch">
              {/* CPC Advertising - MOST POPULAR */}
              <div className="bg-gradient-to-b from-blue-600 to-cyan-500 rounded-3xl p-10 shadow-xl text-white relative flex flex-col h-full">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold">MOST POPULAR</span>
                </div>
                <div className="text-center mb-8 min-h-[220px] md:min-h-[240px] flex flex-col items-center justify-start">
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold mb-3">CPC Advertising</h3>
                  <div className="text-5xl font-bold mb-3">Custom</div>
                  <p className="text-blue-50 text-lg">Pay only for actual clicks</p>
                </div>

                <div className="space-y-5 text-left mb-8">
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-green-300 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <div className="font-semibold text-lg">Top placement across the website</div>
                      <div className="text-blue-50">Featured positions on Comparee.ai for maximum visibility and higher conversions</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-green-300 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <div className="font-semibold text-lg">Guaranteed immediate visibility</div>
                      <div className="text-blue-50">Start getting traffic within 24 hours of campaign approval</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-green-300 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <div className="font-semibold text-lg">Full budget control</div>
                      <div className="text-blue-50">Set daily/monthly limits, pause anytime, scale what works</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-green-300 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <div className="font-semibold text-lg">Detailed performance metrics</div>
                      <div className="text-blue-50">Track clicks, conversions, ROI with real-time reporting</div>
                    </div>
                  </div>
                </div>

                <button onClick={handleRegisterClick} className="mt-auto w-full bg-white text-blue-700 font-bold py-4 px-6 rounded-xl text-lg hover:bg-blue-50 transition-colors">
                  Start CPC Campaign
                </button>
              </div>

              {/* Affiliate Program */}
              <div className="bg-white rounded-3xl p-10 shadow-lg border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 flex flex-col h-full">
                <div className="text-center mb-8 min-h-[220px] md:min-h-[240px] flex flex-col items-center justify-start">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Affiliate Partnership</h3>
                  <div className="text-5xl font-bold text-purple-600 mb-3">Revenue</div>
                  <p className="text-gray-600 text-lg">Share</p>
                </div>

                <div className="space-y-5 text-left mb-8">
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <div className="font-semibold text-lg text-gray-900">Performance-based income</div>
                      <div className="text-gray-600">No upfront costs - revenue sharing when we both succeed</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <div className="font-semibold text-lg text-gray-900">Premium placement included</div>
                      <div className="text-gray-600">Featured positioning for better visibility and higher conversions</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <div className="font-semibold text-lg text-gray-900">Real-time tracking & support</div>
                      <div className="text-gray-600">Dashboard analytics plus dedicated success manager</div>
                    </div>
                  </div>
                </div>

                <button onClick={handleRegisterClick} className="mt-auto w-full bg-purple-600 text-white font-bold py-4 px-6 rounded-xl text-lg hover:bg-purple-700 transition-colors">
                  Start Affiliate Partnership
                </button>
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
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Questions? We're Here to Help
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Talk to our advertising specialists about your campaign goals.
          </p>
          <a
            href="mailto:info@comparee.ai?subject=Advertising%20Inquiry&body=Hi%20Comparee%20team,%0D%0A%0D%0AI%27d%20like%20to%20discuss%20advertising%20options.%20Here%20are%20the%20details:%0D%0A-%20Company%20name:%0D%0A-%20Website:%0D%0A-%20Budget%20range:%0D%0A-%20Target%20category:%0D%0A%0D%0AThanks!"
            className="bg-white text-purple-600 font-bold px-8 py-4 rounded-xl text-lg hover:scale-105 transition-transform duration-200"
          >
            Contact Our Team
          </a>
        </div>
      </section>

      {/* SEO & GEO content for search engines and LLMs */}
      <section id="seo-llm" className="relative py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="relative max-w-6xl mx-auto rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-500/10 blur-3xl" aria-hidden="true" />
            <div className="px-8 md:px-12 py-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Advertise Your AI Tool on Comparee.ai — CPC Advertising & Affiliate Program</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-4xl">
                Comparee.ai is an AI tools discovery platform visited by 50,000+ monthly users. We help AI companies and B2B SaaS products
                acquire high‑intent traffic with two options: <span className="font-semibold text-gray-900">CPC advertising</span> for immediate visibility and
                <span className="font-semibold text-gray-900"> affiliate partnership</span> for performance‑based growth. Your product appears in top lists,
                category hubs, product detail pages, comparison views and curated content.
              </p>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left column */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-3">Geographic coverage</h3>
                  <div className="rounded-2xl border border-gray-200 p-5">
                    <p className="text-gray-700">
                      Global English‑speaking audience with strong reach in the United States, United Kingdom and the EU (Germany, Czech Republic,
                      Slovakia, Poland, Austria). Popular cities include San Francisco, New York, London, Berlin and Prague.
                    </p>
                  </div>

                  <h3 className="mt-8 text-sm font-semibold text-gray-500 tracking-wide uppercase mb-3">Search queries this page targets</h3>
                  <ul className="space-y-3">
                    {[
                      'advertise AI tool',
                      'AI tools directory advertising',
                      'sponsored listing for AI software',
                      'pay‑per‑click (CPC) advertising for SaaS/AI',
                      'promote AI startup / list your AI product',
                      'AI marketplace advertising',
                      'affiliate program for AI tools'
                    ].map((q) => (
                      <li key={q} className="flex items-start gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span>“{q}”</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4 text-blue-900">
                    <p className="text-sm">
                      These advertiser‑intent queries ensure we attract companies looking to promote their AI tools, boosting qualified leads for CPC and affiliate partnerships.
                    </p>
                  </div>
                </div>

                {/* Right column */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-3">Where your ads appear on Comparee.ai</h3>
                  <ul className="space-y-3">
                    {[ 
                      'Top lists and rankings (e.g., Best AI Tools for Marketing, Video, Productivity)',
                      'Category pages (Copywriting, Image & Video, Automation, Agents, Analytics)',
                      'Product detail pages and alternatives/comparison pages',
                      'Search results and curated recommendations'
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="mt-8 text-sm font-semibold text-gray-500 tracking-wide uppercase mb-3">Why campaigns perform here</h3>
                  <div className="rounded-2xl border border-gray-200 p-5">
                    <p className="text-gray-700">
                      High‑intent audience actively comparing AI tools, strong category and top‑list coverage, and fast Next.js pages with structured data.
                      Real‑time click and conversion tracking plus precise budget control drive measurable ROI for CPC campaigns.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> JSON‑LD included
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Canonicals
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Fast CWV
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* JSON‑LD for LLMs and search engines */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: [
                      {
                        '@type': 'Question',
                        name: 'What is CPC advertising on Comparee.ai?',
                        acceptedAnswer: {
                          '@type': 'Answer',
                          text: 'A pay-per-click model with top placement across the website, fast approval, full budget control and real-time metrics.'
                        }
                      },
                      {
                        '@type': 'Question',
                        name: 'Do you accept companies worldwide?',
                        acceptedAnswer: {
                          '@type': 'Answer',
                          text: 'Yes. We serve a global English-speaking audience with strong presence in the US, UK and EU (Germany, Czech Republic, Slovakia, Poland, Austria).'
                        }
                      },
                      {
                        '@type': 'Question',
                        name: 'Where will my product be shown?',
                        acceptedAnswer: {
                          '@type': 'Answer',
                          text: 'In top lists, category pages, product detail pages, comparison pages and search results across Comparee.ai.'
                        }
                      },
                      {
                        '@type': 'Question',
                        name: 'How do I start a campaign?',
                        acceptedAnswer: {
                          '@type': 'Answer',
                          text: 'Create a company account, add your product, deposit credits and launch a CPC campaign or join our affiliate partnership.'
                        }
                      }
                    ]
                  })
                }}
              />
            </div>
          </div>
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