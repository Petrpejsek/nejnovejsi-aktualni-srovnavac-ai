import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Idempotent seed for demo data (safe for local dev). Not for production.
export async function POST() {
  try {
    // Categories
    const cats = [
      { name: 'Photo', slug: 'photo', order: 1 },
      { name: 'Video', slug: 'video', order: 2 },
      { name: 'Marketing', slug: 'marketing', order: 3 },
    ]
    for (const c of cats) {
      await prisma.promptCategory.upsert({
        where: { slug: c.slug },
        create: c,
        update: { name: c.name, order: c.order },
      })
    }

    const photo = await prisma.promptCategory.findUnique({ where: { slug: 'photo' } })
    const video = await prisma.promptCategory.findUnique({ where: { slug: 'video' } })
    const marketing = await prisma.promptCategory.findUnique({ where: { slug: 'marketing' } })

    const samples = [
      {
        title: 'Midjourney Lifestyle Ads Pack (40 prompts)',
        slug: 'midjourney-lifestyle-ads',
        summary: 'High‑converting creative directions for lifestyle ads',
        modelTarget: 'Midjourney',
        categoryId: photo!.id,
        priceUsd: '19.00',
        coverImage: '/images/placeholders/prompt-2.jpg',
        previewVideoUrl: null,
        isFeatured: true,
      },
      {
        title: 'Stable Diffusion Product Shots Kit',
        slug: 'sd-product-shots-kit',
        summary: 'Studio‑quality product images with SD',
        modelTarget: 'Stable Diffusion',
        categoryId: photo!.id,
        priceUsd: '14.00',
        coverImage: '/images/placeholders/prompt-4.jpg',
        previewVideoUrl: null,
      },
      {
        title: 'YouTube Shorts Hooks (100 prompts)',
        slug: 'yt-shorts-hooks',
        summary: 'Hooks and outlines for viral Shorts',
        modelTarget: 'GPT-4',
        categoryId: video!.id,
        priceUsd: '12.00',
        coverImage: null,
        previewVideoUrl: 'https://cdn.jsdelivr.net/gh/streamich/memfs/demo/loop.mp4',
        isFeatured: true,
      },
      {
        title: 'Ad Script Generator',
        slug: 'ad-script-generator',
        summary: 'Ad scripts for FB/IG/TikTok based on your product',
        modelTarget: 'GPT-4 / Claude',
        categoryId: marketing!.id,
        priceUsd: '11.00',
        coverImage: null,
        previewVideoUrl: null,
      },
    ]

    for (const s of samples) {
      await prisma.prompt.upsert({
        where: { slug: s.slug },
        create: s as any,
        update: { summary: s.summary, coverImage: s.coverImage, previewVideoUrl: s.previewVideoUrl },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'seed failed' }, { status: 500 })
  }
}


