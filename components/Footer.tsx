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
              © 2024 AI Srovnávač. Všechna práva vyhrazena.
            </div>
            <SocialIcons />
          </div>
          
          <div className="flex flex-wrap gap-6">
            <Link 
              href="/o-nas" 
              className="text-sm text-gray-600 hover:text-purple-600/90 transition-colors"
            >
              O nás
            </Link>
            <Link 
              href="/kontakty" 
              className="text-sm text-gray-600 hover:text-purple-600/90 transition-colors"
            >
              Kontakty
            </Link>
            <Link 
              href="/podminky-pouziti" 
              className="text-sm text-gray-600 hover:text-purple-600/90 transition-colors"
            >
              Podmínky použití
            </Link>
            <Link 
              href="/ochrana-osobnich-udaju" 
              className="text-sm text-gray-600 hover:text-purple-600/90 transition-colors"
            >
              Ochrana osobních údajů
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 