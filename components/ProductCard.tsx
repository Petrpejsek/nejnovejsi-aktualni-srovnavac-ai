import React from 'react'
import Image from 'next/image'

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  tags?: string[]
  externalUrl?: string
}

export default function ProductCard({ id, name, description, price, imageUrl, tags, externalUrl }: ProductCardProps) {
  // Omezíme počet zobrazených tagů na 3
  const displayedTags = tags?.slice(0, 3) || []
  const hasMoreTags = tags && tags.length > 3

  const handleVisit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!externalUrl) {
      console.log('Chybí URL!')
      return
    }

    try {
      window.open(externalUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Chyba při otevírání URL:', error)
    }
  }

  return (
    <a 
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg shadow-sm border border-gray-100 transition-transform hover:scale-[1.02] cursor-pointer"
      onClick={handleVisit}
    >
      <div className="relative w-full aspect-video">
        <Image
          src={imageUrl || 'https://placehold.co/800x450/f3f4f6/94a3b8?text=No+Image'}
          alt={name}
          fill
          className="object-cover rounded-t-lg"
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{name}</h2>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        {displayedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {displayedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600"
              >
                {tag}
              </span>
            ))}
            {hasMoreTags && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600">
                +{tags.length - 3} další
              </span>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-purple-600">{price} Kč</div>
          <div className="px-4 py-2 bg-gradient-primary text-white text-sm font-medium rounded-[14px] hover:opacity-90 transition-opacity">
            Vyzkoušet
          </div>
        </div>
      </div>
    </a>
  )
} 