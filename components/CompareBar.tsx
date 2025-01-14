'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface CompareBarProps {
  selectedCount: number
  onCompare: () => void
  onClear: () => void
}

export default function CompareBar({ selectedCount, onCompare, onClear }: CompareBarProps) {
  const router = useRouter()

  if (selectedCount === 0) return null

  const handleCompare = () => {
    onCompare()
    router.push('/porovnani')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-50/95 border-t border-gray-100 shadow-sm transform transition-transform backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Zrušit výběr"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button
            onClick={handleCompare}
            className="px-6 py-2 text-white rounded-[14px] text-sm font-medium transition-all bg-gradient-primary hover-gradient-primary flex items-center gap-3"
          >
            <span>Porovnat</span>
            <span className="flex items-center justify-center bg-white/20 w-6 h-6 rounded-full">
              {selectedCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
} 