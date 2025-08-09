'use client'

import React from 'react'
import AiAdvisor from '../components/AiAdvisor'
import ProductGridWrapper from '../components/ProductGridWrapper'
// import ReelsCarousel from '../components/ReelsCarousel' // Dočasně skryto - pro budoucí použití
import TopListsSection from '../components/TopListsSection'
import NewsletterSignup from '../components/NewsletterSignup'
// import PromptsSection from '../components/PromptsSection' // Temporarily hidden
// import AiCoursesCarousel from '../components/AiCoursesCarousel' // Dočasně skryto - pro budoucí použití

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 bg-white">
      <div className="max-w-7xl mx-auto bg-white">
        <AiAdvisor />
        <div className="mt-2">
          <ProductGridWrapper />
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