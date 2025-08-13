import React from 'react'
import AiAdvisor from '../components/AiAdvisor'
import ProductGridWrapper from '../components/ProductGridWrapper'
// import ReelsCarousel from '../components/ReelsCarousel' // Dočasně skryto - pro budoucí použití
import TopListsSection from '../components/TopListsSection'
import NewsletterSignup from '../components/NewsletterSignup'
// import PromptsSection from '../components/PromptsSection' // Temporarily hidden
// import AiCoursesCarousel from '../components/AiCoursesCarousel' // Dočasně skryto - pro budoucí použití

export default async function Home() {
  // SSR: načti první várku produktů přes interní API, aby se sjednotil zdroj dat s klientem
  let initialProducts: any[] = []
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const res = await fetch(
      `${baseUrl}/api/products?forHomepage=true&page=1&pageSize=12`,
      { cache: 'no-store', headers: { 'Content-Type': 'application/json' } }
    )
    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.products)) {
        initialProducts = data.products.map((p: any) => {
          let tags: string[] = []
          try {
            if (typeof p.tags === 'string') tags = JSON.parse(p.tags)
            else if (Array.isArray(p.tags)) tags = p.tags
          } catch {}
          return {
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: Number(p.price) || 0,
            category: p.category || '',
            imageUrl: p.imageUrl,
            tags,
            externalUrl: p.externalUrl,
            hasTrial: Boolean(p.hasTrial)
          }
        })
      }
    }
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