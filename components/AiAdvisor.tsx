'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Typed from 'typed.js'

export default function AiAdvisor() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [userStartedTyping, setUserStartedTyping] = useState(false)
  const router = useRouter()
  const typedRef = useRef<HTMLInputElement>(null)
  const typedInstance = useRef<Typed | null>(null)

  // Loading messages rotation
  const loadingMessages = [
    'Searching AI tools...',
    'Analyzing your needs...',
    'Finding perfect matches...',
    'Comparing solutions...',
    'Almost ready...'
  ]

  // Typing animation messages
  const typingMessages = [
    'I need an AI that helps me edit my videos faster...',
    'Looking for a tool to generate blog posts automatically...',
    'Which AI can help me boost my sales with smarter emails?'
  ]

  // Initialize typing animation
  useEffect(() => {
    if (typedRef.current && !userStartedTyping && !loading) {
      // Destroy previous instance if it exists
      if (typedInstance.current) {
        typedInstance.current.destroy()
        typedInstance.current = null
      }
      
      // Create new instance
      typedInstance.current = new Typed(typedRef.current, {
        strings: typingMessages,
        typeSpeed: 35,
        backSpeed: 25,
        backDelay: 2000,
        startDelay: 500,
        loop: true,
        showCursor: true,
        cursorChar: '|',
        attr: 'placeholder'
      })
      
      console.log('🎯 Typing animation started!')
    }

    return () => {
      if (typedInstance.current) {
        typedInstance.current.destroy()
        typedInstance.current = null
        console.log('🎯 Typing animation stopped!')
      }
    }
  }, [userStartedTyping, loading, typingMessages])

  // Rotate messages every 4 seconds during loading
  useEffect(() => {
    if (!loading) return

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [loading, loadingMessages.length])

  // Fixed number of products - simple
  const totalProducts = 196

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // Stop animation when user starts typing
    if (!userStartedTyping && value.length > 0) {
      console.log('🎯 User started typing, stopping animation')
      setUserStartedTyping(true)
      if (typedInstance.current) {
        typedInstance.current.destroy()
        typedInstance.current = null
      }
    }
    
    // Resume animation when user clears everything
    if (userStartedTyping && value.length === 0) {
      console.log('🎯 Input is empty, resuming animation')
      setUserStartedTyping(false)
    }
  }

  const handleInputFocus = () => {
    // Stop animation on click/focus on input
    if (!userStartedTyping) {
      console.log('🎯 User clicked on input, stopping animation')
      setUserStartedTyping(true)
      if (typedInstance.current) {
        typedInstance.current.destroy()
        typedInstance.current = null
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) return
    
    try {
      // Reset error state
      setError('')
      setLoadingMessageIndex(0) // Reset to first message
      setLoading(true)
      
      console.log('Sending query to API:', query)
      
      // Use new endpoint for recommendations with Assistants API
      const response = await fetch('/api/assistant-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get recommendations')
      }
      
      // After successful processing, redirect to recommendations page
      router.push(`/recommendations?query=${encodeURIComponent(query)}`)
    } catch (error) {
      console.error('Error getting recommendations:', error)
      setError(error instanceof Error ? error.message : 'Unknown error getting recommendations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-[58px] mt-[50px]">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-semibold mb-4 text-gradient-primary">
          Find the Perfect AI Tool
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Choose from our{' '}
          <span className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent font-semibold animate-pulse">
            {totalProducts} AI solutions
          </span>
          {' '}and find the best one for your needs. Just describe your project or problem and we'll help you choose.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center px-4">
        <div className="flex w-full max-w-3xl gap-3 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-pink-500/30 rounded-[50px] blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative flex w-full flex-col sm:flex-row gap-3 bg-white rounded-[42px] p-1.5 shadow-lg">
            <input
              ref={typedRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder=""
              className="flex-1 px-7 py-5 text-base rounded-[38px] border border-gray-200/80 focus:border-transparent focus:ring-2 focus:ring-purple-400/40 outline-none transition-all text-gray-600 placeholder:text-gray-600 font-light bg-white/90 backdrop-blur-sm hover:border-gray-300/80"
              disabled={loading}
            />
            <button
              type="submit"
              className={`px-10 py-5 text-white rounded-[38px] transition-all font-medium bg-gradient-primary hover-gradient-primary shadow-sm text-base w-full sm:w-auto ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="transition-all duration-500 ease-in-out">
                    {loadingMessages[loadingMessageIndex]}
                  </span>
                </span>
              ) : 'Advise'}
            </button>
          </div>
        </div>
        
        {/* Chybová zpráva */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200 max-w-2xl text-center">
            <p className="font-medium">An error occurred</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-1">Try entering a shorter query or try again later.</p>
          </div>
        )}

        {/* Quick suggestions disabled - removed PopularCategories */}
      </form>
    </div>
  )
} 