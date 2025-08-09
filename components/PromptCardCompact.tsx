'use client'

import Link from 'next/link'

export type PromptCardData = {
  id: string
  title: string
  slug: string
  modelTarget: string
  priceUsd: string
  coverImage?: string | null
  previewVideoUrl?: string | null
  bestSeller?: boolean
}

type Props = {
  prompt: PromptCardData
  href?: string
  onMouseEnter?: (e: React.MouseEvent) => void
  onMouseLeave?: () => void
  mediaHeightClass?: string // e.g., 'h-[100px]' (default) or 'h-[120px]'
}

export default function PromptCardCompact({ prompt: p, href, onMouseEnter, onMouseLeave, mediaHeightClass }: Props) {
  const linkHref = href ?? `/prompts/${p.slug}`
  const mediaH = mediaHeightClass ?? 'h-[100px]'
  return (
    <Link
      href={linkHref}
      className="w-[160px] shrink-0 group rounded-2xl border border-gray-200 overflow-hidden bg-white hover:shadow-xl transition-all duration-200 flex flex-col hover:scale-[1.02]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`relative w-full ${mediaH} bg-gray-100`}>
        {p.previewVideoUrl ? (
          <video className="absolute inset-0 block w-full h-full object-cover" src={p.previewVideoUrl} muted playsInline autoPlay loop />
        ) : p.coverImage ? (
          <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${p.coverImage})` }} />
        ) : null}
      </div>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-gray-600">{p.modelTarget}</div>
          {p.bestSeller && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-600 text-white shadow-sm leading-none whitespace-nowrap">Best Seller</span>
          )}
        </div>
        <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-gray-700 min-h-[36px]">{p.title}</h4>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-gray-900 font-bold">{`$${p.priceUsd}`}</span>
          <span className="text-xs text-gray-500">Details</span>
        </div>
      </div>
    </Link>
  )
}


