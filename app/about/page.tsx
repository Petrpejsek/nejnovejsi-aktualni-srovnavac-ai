import React from 'react'
import Link from 'next/link'
import Script from 'next/script'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About comparee.ai | Your Trusted Guide to AI Tools',
  description:
    'comparee.ai helps teams choose the right AI tools with unbiased comparisons, expert recommendations, and actionable insights across categories like writing, image generation, chatbots, automation and more.',
  keywords: [
    'AI tools comparison',
    'best AI tools 2025',
    'AI recommendations',
    'AI writing tools',
    'AI image generation',
    'AI chatbots',
    'automation software',
    'compare AI software',
  ],
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://23.88.98.49'}/about` },
  openGraph: {
    title: 'About comparee.ai | Your Trusted Guide to AI Tools',
    description:
      'We analyze and compare AI tools across categories and help you make fast, confident choices with clear rankings and expert insights.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://23.88.98.49'}/about`,
    siteName: 'comparee.ai',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            About comparee.ai
          </h1>
          <p className="text-gray-600 text-lg mb-10">
            We help companies and creators choose the right AI tools fast — with clear comparisons,
            trusted rankings, and expert recommendations.
          </p>
          
          <div className="prose prose-purple max-w-none">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">In one sentence</h2>
              <p className="text-gray-700">
                comparee.ai is an independent destination for discovering, comparing, and selecting the best AI tools for your needs, budget, and region.
              </p>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Our Mission</h2>
                <p className="text-gray-600">
                  We simplify AI tool selection with unbiased comparisons, transparent scoring, and
                  actionable guidance. Everyone deserves access to the right AI tools that match specific
                  use cases, workflows, and budgets.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">What We Do</h2>
                <p className="text-gray-600">
                  We research and compare AI tools across categories such as{' '}
                  <Link className="text-purple-700 hover:text-purple-800 underline" href="/categories">
                    AI Writing, Image Generation, Chatbots, Automation
                  </Link>{' '}
                  and more. Our comparisons highlight features, pricing, strengths, limitations, and ideal
                  use cases — helping you make confident decisions quickly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Our Values</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[14px] shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-2">Transparency</h3>
                    <p className="text-gray-600">We provide honest, unbiased information about all tools we review.</p>
                  </div>
                  <div className="bg-white p-6 rounded-[14px] shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-2">Quality</h3>
                    <p className="text-gray-600">We maintain high standards in our research and recommendations.</p>
                  </div>
                  <div className="bg-white p-6 rounded-[14px] shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-2">User Focus</h3>
                    <p className="text-gray-600">Your needs and requirements are at the center of our service.</p>
                  </div>
                  <div className="bg-white p-6 rounded-[14px] shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-2">Innovation</h3>
                    <p className="text-gray-600">We stay up-to-date with the latest developments in AI technology.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Our Team</h2>
                <p className="text-gray-600">
                  We are a team of AI enthusiasts, technology experts, and industry professionals dedicated to helping you navigate the world of artificial intelligence. Our diverse backgrounds and expertise enable us to provide comprehensive insights into various AI tools and their applications.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Global coverage</h2>
                <p className="text-gray-600">
                  We support decision-making for teams in the US, UK, EU, Canada and Australia. Pricing
                  notes, compliance considerations and availability can differ by region — we surface
                  those differences wherever they matter.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Contact Us</h2>
                <p className="text-gray-600">
                  Have questions or suggestions? We'd love to hear from you! Reach out at{' '}
                  <a className="text-purple-700 hover:text-purple-800 underline" href="mailto:info@comparee.ai">info@comparee.ai</a>
                  {' '}or visit our{' '}
                  <Link className="text-purple-700 hover:text-purple-800 underline" href="/kontakty">
                    contact page
                  </Link>
                  . For vendors, see{' '}
                  <Link className="text-purple-700 hover:text-purple-800 underline" href="/advertise">
                    For Companies
                  </Link>{' '}to get listed or update your product profile.
                </p>
              </section>

              <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Key facts</h2>
                <ul className="grid sm:grid-cols-2 gap-3 m-0">
                  <li className="text-gray-700">Independent, unbiased comparisons</li>
                  <li className="text-gray-700">Expert-curated categories and rankings</li>
                  <li className="text-gray-700">Coverage across US, UK, EU, CA, AU</li>
                  <li className="text-gray-700">Actionable recommendations tailored to use cases</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Script id="ld-organization" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'comparee.ai',
          url: 'http://23.88.98.49',
          logo: 'http://23.88.98.49/favicon.ico',
          sameAs: [],
          contactPoint: [{ '@type': 'ContactPoint', email: 'info@comparee.ai', contactType: 'customer support' }],
          areaServed: ['US', 'UK', 'EU', 'CA', 'AU'],
        })}
      </Script>
      <Script id="ld-website" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'comparee.ai',
          url: 'http://23.88.98.49',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'http://23.88.98.49/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        })}
      </Script>
      <Script id="ld-breadcrumb" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'http://23.88.98.49/' },
            { '@type': 'ListItem', position: 2, name: 'About', item: 'http://23.88.98.49/about' },
          ],
        })}
      </Script>
      <Script id="ld-faq" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'How do you compare AI tools?',
              acceptedAnswer: { '@type': 'Answer', text: 'We research features, pricing, performance and real-world adoption, then present transparent, category-specific comparisons with clear pros and cons.' },
            },
            {
              '@type': 'Question',
              name: 'Which regions do you cover?',
              acceptedAnswer: { '@type': 'Answer', text: 'We cover US, UK, EU, Canada and Australia and highlight regional differences where relevant (pricing, availability, compliance).' },
            },
          ],
        })}
      </Script>
    </div>
  )
} 