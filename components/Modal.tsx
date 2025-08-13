import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ isOpen, onClose, children, title, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity pointer-events-none"
        aria-hidden="true"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full ${sizeClasses[size]} transform rounded-[20px] bg-white p-8 shadow-xl transition-all max-h-[90vh] overflow-y-auto`}>
        {/* Zavírací tlačítko */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 z-10"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Nadpis - pouze pokud není prázdný */}
        {title && (
          <h2 className="text-2xl font-semibold mb-6 text-gradient-primary text-center">
            {title}
          </h2>
        )}

        {/* Obsah */}
        {children}
      </div>
    </div>
  )
} 