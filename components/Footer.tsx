import React from 'react'
import Link from 'next/link'
import SocialIcons from './SocialIcons'

export default function Footer() {
  return (
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
  )
} 