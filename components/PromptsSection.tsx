'use client'

import Link from 'next/link'
import PromptCardCompact, { type PromptCardData } from './PromptCardCompact'
import useSWR from 'swr'
import { useEffect, useRef, useState } from 'react'
import { 
  ChevronLeftIcon, ChevronRightIcon, PlusIcon,
  StarIcon, EyeIcon, ShoppingCartIcon, CheckCircleIcon, UserCircleIcon
} from '@heroicons/react/24/outline'
import { getImageUrl } from '@/lib/utils'

type Prompt = {
  id: string
  title: string
  slug: string
  summary: string
  modelTarget: string
  priceUsd: string
  coverImage?: string | null
  previewVideoUrl?: string | null
  category: { slug: string; name: string }
  bestSeller?: boolean
  rating?: number
  ratingCount?: number
  views?: number
  salesCount?: number
  tags?: string[]
  highlights?: string[]
  includes?: string[]
  author?: string
  description?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function Row({ title, categorySlug }: { title: string; categorySlug: string }) {
  // Initial load 10 items, then "Load 20 more" to 30
  const [limit, setLimit] = useState<number>(10)
  const { data, isLoading } = useSWR<{ items: Prompt[] }>(`/api/prompts-demo?category=${categorySlug}&limit=${limit}`, fetcher)
  const items = data?.items ?? []
  const canLoadMore = items.length >= limit && limit < 30
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  // Desktop hover preview state
  const [hovered, setHovered] = useState<{ prompt: Prompt; left: number; top: number } | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPointerFine = typeof window !== 'undefined' ? window.matchMedia('(pointer: fine)').matches : true

  const check = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanLeft(scrollLeft > 0)
    setCanRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => { check() }, [items.length])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 420
    scrollRef.current.scrollTo({
      left: scrollRef.current.scrollLeft + (dir === 'left' ? -amount : amount),
      behavior: 'smooth',
    })
    setTimeout(check, 350)
  }

  const showPreview = (prompt: Prompt, ev: React.MouseEvent) => {
    if (!isPointerFine) return
    const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
    // Responsive overlay size (~70% viewport) with sane bounds
    const vw = window.innerWidth
    const vh = window.innerHeight
    // 20% smaller than previous (70vw → 56vw, 72vh → 57.6vh, 900×820 → 720×656)
    const overlayWidth = Math.min(720, Math.max(640, Math.floor(vw * 0.56)))
    const overlayHeight = Math.min(656, Math.max(460, Math.floor(vh * 0.576)))
    // Center overlay relative to hovered card
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    let left = centerX - overlayWidth / 2
    let top = centerY - overlayHeight / 2
    // Clamp to viewport with small margin
    const margin = 12
    if (left < margin) left = margin
    if (top < margin) top = margin
    if (left + overlayWidth > window.innerWidth - margin) left = window.innerWidth - overlayWidth - margin
    if (top + overlayHeight > window.innerHeight - margin) top = window.innerHeight - overlayHeight - margin
    setHovered({ prompt, left, top })
  }

  const scheduleHide = () => {
    if (!isPointerFine) return
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setHovered(null), 120)
  }

  useEffect(() => {
    const onScroll = () => setHovered(null)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="mb-8">
      <div className="flex items-center mb-3">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <div className="relative">
        {/* Left */}
        <button
          onClick={() => scroll('left')}
          disabled={!canLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-xl bg-white/85 backdrop-blur-sm shadow border border-white/30 flex items-center justify-center ${canLeft ? 'hover:bg-white' : 'opacity-50 cursor-not-allowed'}`}
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
        </button>
        {/* Right */}
        <button
          onClick={() => scroll('right')}
          disabled={!canRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-xl bg-white/85 backdrop-blur-sm shadow border border-white/30 flex items-center justify-center ${canRight ? 'hover:bg-white' : 'opacity-50 cursor-not-allowed'}`}
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-700" />
        </button>

        <div ref={scrollRef} onScroll={check} className="overflow-x-auto">
          <div className="flex gap-4 pr-4">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/prompts/${p.slug}`}
              className="w-[160px] shrink-0 group rounded-2xl border border-gray-200 overflow-hidden bg-white hover:shadow-xl transition-all duration-200 flex flex-col hover:scale-[1.02]"
              onMouseEnter={(e) => showPreview(p, e)}
              onMouseLeave={scheduleHide}
            >
              {/* No badge overlay inside media */}
              <PromptCardCompact
                prompt={p as unknown as PromptCardData}
                href={`/prompts/${p.slug}`}
                onMouseEnter={(e) => showPreview(p, e)}
                onMouseLeave={scheduleHide}
                mediaHeightClass="h-[120px]"
              />
            </Link>
          ))}

          {/* Load more tile – same outer size as prompt card */}
          {canLoadMore && (
            <button
              onClick={() => setLimit((l) => Math.min(l + 20, 30))}
              className="w-[160px] shrink-0 self-stretch group rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:border-purple-400/60 hover:shadow-xl transition-all duration-200 flex flex-col hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              disabled={isLoading}
              aria-label={`Load 20 more ${title}`}
            >
              <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4 min-h-[190px]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <div className="text-center leading-tight">
                  <div className="text-sm font-semibold text-gray-900">{isLoading ? 'Loading…' : 'Load 20 more'}</div>
                  <div className="text-xs text-gray-600">{title}</div>
                </div>
              </div>
              <div className="p-3 pt-0">
                <span className="inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-700 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:text-white transition-colors">
                  Load more
                  <ChevronRightIcon className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </button>
          )}
          </div>
        </div>
        {/* Hover Preview Overlay (desktop only) */}
        {hovered && (
          <div
            className="fixed z-30 rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-150"
            style={{ left: hovered.left, top: hovered.top, width: 'min(720px, 56vw)', height: 'min(656px, 57.6vh)' }}
            onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current) }}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="grid grid-cols-2 h-full">
              {/* Left: vertical media column (images/videos stacked) */}
              <div className="h-full overflow-auto bg-gray-50 p-3 space-y-3">
                {hovered.prompt.previewVideoUrl && (
                  <div className="w-full rounded-lg bg-black overflow-hidden">
                    <video className="w-full h-auto max-h-[36vh] object-contain" src={hovered.prompt.previewVideoUrl} muted playsInline autoPlay loop />
                  </div>
                )}
                {hovered.prompt.coverImage && (
                  <div className="w-full rounded-lg overflow-hidden bg-gray-100">
                    <img src={getImageUrl(hovered.prompt.coverImage)} alt={hovered.prompt.title} className="w-full h-auto max-h-[36vh] object-contain" />
                  </div>
                )}
              </div>

              {/* Right: product details */}
              <div className="h-full p-5 flex flex-col">
                {/* Meta */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{hovered.prompt.modelTarget}</div>
                    <h4 className="text-xl font-semibold text-gray-900 leading-snug">{hovered.prompt.title}</h4>
                    {/* ratings + views + sales (icons, no emojis) */}
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                      {typeof hovered.prompt.rating === 'number' && (
                        <span className="inline-flex items-center gap-1"><StarIcon className="w-4 h-4 text-amber-500" />{hovered.prompt.rating.toFixed(1)} ({hovered.prompt.ratingCount ?? 0})</span>
                      )}
                      {typeof hovered.prompt.views === 'number' && (
                        <span className="inline-flex items-center gap-1"><EyeIcon className="w-4 h-4" />{hovered.prompt.views}</span>
                      )}
                      {typeof hovered.prompt.salesCount === 'number' && (
                        <span className="inline-flex items-center gap-1"><ShoppingCartIcon className="w-4 h-4" />{hovered.prompt.salesCount}</span>
                      )}
                    </div>
                    {/* author + model */}
                    {(hovered.prompt.author || hovered.prompt.modelTarget) && (
                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                        {hovered.prompt.author && (
                          <span className="inline-flex items-center gap-1"><UserCircleIcon className="w-4 h-4" />By {hovered.prompt.author}</span>
                        )}
                        {hovered.prompt.modelTarget && (
                          <span>Model: {hovered.prompt.modelTarget}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {hovered.prompt.bestSeller && (
                    <span className="px-2 py-1 text-[11px] font-bold rounded-md bg-purple-600 text-white shadow-sm self-start leading-none whitespace-nowrap">Best Seller</span>
                  )}
                </div>

                {/* Highlights */}
                {hovered.prompt.highlights && hovered.prompt.highlights.length > 0 && (
                  <ul className="mt-4 space-y-1 text-sm text-gray-800">
                    {hovered.prompt.highlights.slice(0, 4).map((h, i) => (
                      <li key={i} className="flex items-start gap-2"><CheckCircleIcon className="w-4 h-4 text-green-600" /><span>{h}</span></li>
                    ))}
                  </ul>
                )}

                {/* Tags */}
                {hovered.prompt.tags && hovered.prompt.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {hovered.prompt.tags.slice(0, 6).map(t => (
                      <span key={t} className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs">{t}</span>
                    ))}
                  </div>
                )}

                {/* Sticky CTA */}
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">${hovered.prompt.priceUsd}</div>
                  <Link href={`/prompts/${hovered.prompt.slug}`} className="inline-flex px-4 py-3 rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm font-semibold shadow">
                    Get prompt
                  </Link>
                </div>
                {hovered.prompt.includes && hovered.prompt.includes.length > 0 && (
                  <div className="mt-2 text-[11px] text-gray-500">Includes: {hovered.prompt.includes.join(', ')}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PromptsSection() {
  return (
    <section className="mt-20 mb-16">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">AI Prompt Marketplace</h2>
          <p className="text-gray-600 mt-1">
            Photo • Video • Marketing
            <Link href="/prompts" className="ml-3 text-gray-700 hover:text-black font-semibold underline-offset-2">View all</Link>
          </p>
        </div>
        <Link href="/prompts" className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg">Explore prompts</Link>
      </div>

      <Row title="Best Photo Prompts" categorySlug="photo" />
      <Row title="Video & Scripts" categorySlug="video" />
      <Row title="Marketing & SEO" categorySlug="marketing" />

      <div className="mt-4 flex justify-center">
        <Link href="/prompts" className="text-gray-700 hover:text-black font-semibold">Explore all prompts →</Link>
      </div>
    </section>
  )
}


