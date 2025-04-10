import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  tags?: string[]
  externalUrl?: string
  hasTrial?: boolean
}

declare global {
  interface Window {
    open(url?: string, target?: string, features?: string): Window | null;
  }
}

export default function ProductCard({ id, name, description, price, imageUrl, tags, externalUrl, hasTrial }: ProductCardProps) {
  const [visibleTags, setVisibleTags] = useState<string[]>(tags || [])
  const [hiddenTagsCount, setHiddenTagsCount] = useState(0)
  const tagsContainerRef = useRef<HTMLDivElement>(null)
  const measurementDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tags || !tagsContainerRef.current || !measurementDivRef.current) return

    // Počkáme na vykreslení DOM
    setTimeout(() => {
      if (!tagsContainerRef.current || !measurementDivRef.current) return

      const containerWidth = tagsContainerRef.current.offsetWidth
      const tagElements = Array.from(measurementDivRef.current.children) as HTMLElement[]
      let currentWidth = 0
      let currentRow = 1
      let visibleCount = 0
      let rowStartIndex = 0

      // Procházíme všechny tagy a počítáme jejich šířky
      for (let i = 0; i < tagElements.length; i++) {
        const tagWidth = tagElements[i].getBoundingClientRect().width + 8 // 8px pro margin
        
        // Pokud se tag nevejde do aktuálního řádku
        if (currentWidth + tagWidth > containerWidth) {
          currentRow++
          currentWidth = tagWidth
          rowStartIndex = i
        } else {
          currentWidth += tagWidth
        }

        // Pokud jsme stále v rámci dvou řádků, přidáme tag
        if (currentRow <= 2) {
          visibleCount = i + 1
        } else {
          // Pokud začínáme třetí řádek, vrátíme se na začátek řádku
          visibleCount = rowStartIndex
          break
        }
      }

      setVisibleTags(tags.slice(0, visibleCount))
      setHiddenTagsCount(Math.max(0, tags.length - visibleCount))
    }, 0)
  }, [tags])

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

  const handleClick = async (productId: string) => {
    try {
      // Odešleme klik na server
      await fetch('/api/clicks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })
    } catch (error) {
      console.error('Error tracking click:', error)
    }
  }

  return (
    <a 
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-lg hover:shadow-2xl border border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:border-purple-300 cursor-pointer h-full flex flex-col relative overflow-hidden"
      onClick={(e) => {
        handleVisit(e)
        handleClick(id)
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative w-full aspect-[1.91/1]">
        <Image
          src={imageUrl || 'https://placehold.co/800x450/f3f4f6/94a3b8?text=No+Image'}
          alt={name}
          fill
          className="object-cover rounded-t-lg"
        />
        {hasTrial && (
          <div className="absolute top-2 right-2 bg-purple-100 text-purple-600 text-xs font-medium px-2 py-1 rounded-full">
            Free Trial
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{name}</h2>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
          
          {tags && tags.length > 0 && (
            <>
              {/* Skrytý div pro měření šířky tagů */}
              <div 
                ref={measurementDivRef} 
                className="absolute opacity-0 pointer-events-none"
                style={{ display: 'flex', gap: '0.5rem', maxWidth: '100%' }}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600 whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Viditelné tagy */}
              <div ref={tagsContainerRef} className="flex flex-wrap gap-2 mb-4 max-h-[4.5rem] overflow-hidden">
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600 whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
                {hiddenTagsCount > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600">
                    +{hiddenTagsCount} more
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
          {hasTrial ? (
            <div className="text-lg font-bold text-purple-600">$0</div>
          ) : (
            <div className="text-lg font-bold text-purple-600">${price}</div>
          )}
          <div className="px-2 py-1.5 bg-gradient-primary text-white text-sm font-medium rounded-[14px] hover:opacity-90 transition-opacity">
            {hasTrial ? 'Try for Free' : 'Try it'}
          </div>
        </div>
      </div>
    </a>
  )
} 