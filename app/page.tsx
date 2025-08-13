import React from 'react'
import AiAdvisor from '../components/AiAdvisor'
import ProductGridWrapper from '../components/ProductGridWrapper'
import { prisma } from '@/lib/prisma'
// import ReelsCarousel from '../components/ReelsCarousel' // Dočasně skryto - pro budoucí použití
import TopListsSection from '../components/TopListsSection'
import NewsletterSignup from '../components/NewsletterSignup'
// import PromptsSection from '../components/PromptsSection' // Temporarily hidden
// import AiCoursesCarousel from '../components/AiCoursesCarousel' // Dočasně skryto - pro budoucí použití

export default async function Home() {
  // SSR: načti první várku produktů pro rychlý render bez skeletonu
  let initialProducts: any[] = []
  try {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT "id", "name", COALESCE("description", '') as description, COALESCE("price", 0) as price,
             COALESCE("category", '') as category, "imageUrl", COALESCE("tags", '[]') as tags, "externalUrl",
             COALESCE("hasTrial", false) as "hasTrial"
      FROM "Product"
      WHERE "isActive" = true AND "name" IS NOT NULL AND "name" != ''
      ORDER BY RANDOM()
      LIMIT 12`
    initialProducts = Array.isArray(rows) ? rows.map(r => {
      let parsedTags: string[] = []
      try {
        if (typeof r.tags === 'string') {
          parsedTags = JSON.parse(r.tags)
        } else if (Array.isArray(r.tags)) {
          parsedTags = r.tags
        }
      } catch {}
      return {
        id: r.id,
        name: r.name,
        description: r.description ?? '',
        price: Number(r.price) || 0,
        category: r.category ?? '',
        imageUrl: r.imageUrl,
        tags: parsedTags,
        externalUrl: r.externalUrl,
        hasTrial: Boolean(r.hasTrial)
      }
    }) : []
  } catch {}

  return (
    <main className="container mx-auto px-4 py-8 bg-white">
      <div className="max-w-7xl mx-auto bg-white">
        <AiAdvisor />
        <div className="mt-2">
          <ProductGridWrapper initialProducts={initialProducts} />
        </div>
        {/* Dočasně skryto - ReelsCarousel pro budoucí použití */}
        {/* <div className="mt-2">
          <ReelsCarousel />
        </div> */}
        <div className="mt-2">
          <TopListsSection />
        </div>
        {/* Prompts marketplace temporarily hidden */}
        {/* Dočasně skryto - AI kurzy pro budoucí použití */}
        {/* <div className="mt-2">
          <AiCoursesCarousel />
        </div> */}
        <div className="mt-2">
          <NewsletterSignup />
        </div>
      </div>
    </main>
  )
} 