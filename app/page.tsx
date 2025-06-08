import React from 'react'
import AiAdvisor from '../components/AiAdvisor'
import ProductGridWrapper from '../components/ProductGridWrapper'
import ReelsCarousel from '../components/ReelsCarousel'
import TopListsSection from '../components/TopListsSection'
import NewsletterSignup from '../components/NewsletterSignup'
import AiCoursesCarousel from '../components/AiCoursesCarousel'
import SponsoredAds from '../components/SponsoredAds'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <AiAdvisor />
        <div className="mt-2">
          <SponsoredAds pageType="homepage" maxAds={2} />
        </div>
        <div className="mt-2">
          <ProductGridWrapper />
        </div>
        <div className="mt-2">
          <ReelsCarousel />
        </div>
        <div className="mt-2">
          <TopListsSection />
        </div>
        <div className="mt-2">
          <AiCoursesCarousel />
        </div>
        <div className="mt-2">
          <NewsletterSignup />
        </div>
      </div>
    </main>
  )
} 