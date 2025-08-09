import { notFound } from 'next/navigation'

import Link from 'next/link'
import PromptCardCompact, { type PromptCardData } from '@/components/PromptCardCompact'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline'

const CATEGORIES = ['All', 'Photo', 'Video', 'Marketing']

type PromptItem = {
  id: string
  title: string
  slug: string
  modelTarget: string
  priceUsd: string
  category: { slug: string; name: string }
  coverImage?: string | null
  previewVideoUrl?: string | null
  bestSeller?: boolean
  rating?: number
  views?: number
  salesCount?: number
}

export default function PromptsIndexPage() {
  // Hard hide prompts page for now
  notFound()
}


