'use client'

import React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and name */}
          <Link href="/" className="flex items-center space-x-3">
            <span className="font-bold text-xl md:text-2xl text-gradient-primary">Comparee.ai</span>
          </Link>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Link
              href="/compare"
              className="mr-4 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Navigation links - desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/'
                  ? 'text-purple-600'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Home
            </Link>
            <Link
              href="/recommendations"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/recommendations'
                  ? 'text-purple-600'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Recommendations
            </Link>
            <Link
              href="/compare"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/compare'
                  ? 'text-purple-600'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Compare
            </Link>
            <Link
              href="/ai-tools-test"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/ai-tools-test'
                  ? 'text-purple-600'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              AI Tools Search
            </Link>
          </div>

          {/* Compare button - desktop */}
          <Link
            href="/compare"
            className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Compare
          </Link>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-2">
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/'
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/recommendations"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/recommendations'
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Recommendations
              </Link>
              <Link
                href="/compare"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/compare'
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Compare
              </Link>
              <Link
                href="/ai-tools-test"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/ai-tools-test'
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                AI Tools Search
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 