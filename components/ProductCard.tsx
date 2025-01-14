import React from 'react'
import Image from 'next/image'

interface ProductCardProps {
  title: string
  description: string
  imageUrl: string
  isSelected: boolean
  onCompareToggle: () => void
  externalUrl: string
  rating?: number
  price: string
  tags: string[]
  isCompact?: boolean
}

export default function ProductCard({
  title,
  description,
  imageUrl,
  isSelected,
  onCompareToggle,
  externalUrl,
  rating = 4.8,
  price,
  tags,
  isCompact = false
}: ProductCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Pokud uživatel klikl na checkbox nebo jeho label, nechceme přesměrovat
    if ((e.target as HTMLElement).closest('label')) {
      return
    }
    window.open(externalUrl, '_blank')
  }

  return (
    <div 
      className={`bg-white rounded-[14px] shadow-sm border border-gray-100/80 hover:shadow-md transition-shadow cursor-pointer ${
        isCompact ? 'p-2' : 'p-3 md:p-4'
      }`}
      onClick={handleCardClick}
    >
      <div className={`relative w-full aspect-video mb-3 bg-gray-100 rounded-[14px] overflow-hidden ${
        isCompact ? 'mb-2' : 'mb-3'
      }`}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover rounded-[14px]"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `https://placehold.co/800x450/f3f4f6/94a3b8?text=${encodeURIComponent(title)}`
          }}
        />
      </div>
      
      <div className={`flex items-start justify-between ${isCompact ? 'mb-1.5' : 'mb-2'}`}>
        <div>
          <h3 className={`font-medium text-gray-800 ${isCompact ? 'text-sm' : 'text-base'}`}>{title}</h3>
          <div className="flex items-center gap-1 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-600">{rating}</span>
          </div>
        </div>
        <label className="flex items-center touch-manipulation" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onCompareToggle}
            className={`text-purple-600/90 rounded-[6px] border-gray-200 ${
              isCompact ? 'w-4 h-4' : 'w-5 h-5 md:w-4 md:h-4'
            }`}
          />
          {!isCompact && <span className="ml-2 text-sm text-gray-600">Porovnat</span>}
        </label>
      </div>
      
      <p className={`text-gray-600 line-clamp-2 ${
        isCompact ? 'text-xs mb-2' : 'text-sm mb-3'
      }`}>{description}</p>
      
      {!isCompact && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className={`font-medium text-purple-600/90 ${
        isCompact ? 'text-xs' : 'text-sm'
      }`}>
        {price}
      </div>
    </div>
  )
} 