// @ts-nocheck
// Server Component - Landing Page Detail Page
import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { isStrongContent } from '@/lib/seo/config'
import dynamic from 'next/dynamic';
import { autoLinkHtml, suggestAutolinkTags } from '@/lib/autolink'
import { getPublicBaseUrl, PRIMARY_LANG, PRIMARY_LOCALE, assertPrimaryLanguage } from '@/lib/env'

const AiAdvisor = dynamic(() => import('@/components/AiAdvisor'), {
  ssr: false,
  loading: () => <div className="bg-gray-100 rounded-lg h-32 animate-pulse"></div>
});

const ProductCarousel = dynamic(() => import('@/components/ProductCarousel'), {
  ssr: false,
  loading: () => <div className="bg-gray-100 rounded-2xl h-96 animate-pulse"></div>
});

const AdaptiveContentRenderer = dynamic(() => import('@/components/AdaptiveContentRenderer'), {
  ssr: false,
  loading: () => <div className="bg-gray-100 rounded-lg h-96 animate-pulse flex items-center justify-center">
    <span className="text-gray-500">Loading content...</span>
  </div>
});


interface Props {
  params: {
    slug: string;
  };
}

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  
  try {
    const landingPage = await prisma.landing_pages.findFirst({
      where: { 
        slug: slug,
        language: PRIMARY_LANG,
      },
      select: {
        title: true,
        meta_description: true,
        meta_keywords: true,
        language: true,
        slug: true,
        image_url: true,
        visuals: true,
        content_html: true,
      },
    });

    if (!landingPage) {
      return {
        title: 'Page Not Found',
        description: 'The requested page was not found.',
      };
    }
    
    const canonicalUrl = `${getPublicBaseUrl()}/landing/${slug}`

    const strong = isStrongContent((landingPage as any).content_html, slug)

    const ogImageUrl = (landingPage as any).image_url || undefined

    if (!strong) {
      return {
        alternates: { canonical: canonicalUrl },
        robots: { index: false, follow: true },
      } as Metadata
    }

    const descriptionFromDb = landingPage.meta_description && String(landingPage.meta_description).trim().length > 0
      ? landingPage.meta_description
      : undefined

    return {
      title: `${landingPage.title} | Comparee.ai`,
      ...(descriptionFromDb ? { description: descriptionFromDb } : {}),
      keywords: typeof landingPage.meta_keywords === 'string' ? landingPage.meta_keywords : (landingPage.meta_keywords as any)?.join?.(', ') || '',
      alternates: { canonical: canonicalUrl },
      openGraph: ogImageUrl ? { url: canonicalUrl, images: [{ url: ogImageUrl }] } : undefined,
      twitter: ogImageUrl ? { card: 'summary_large_image', images: [ogImageUrl] } : undefined,
    } as Metadata;
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
      description: 'An error occurred while loading the page.',
    };
  }
}

export default async function LandingPageDetail({ params }: Props) {
  const { slug } = params;

  try {
    // Assert language discipline in production
    assertPrimaryLanguage(PRIMARY_LANG)

    // Fetch the landing page from database
    const landingPage = await prisma.landing_pages.findFirst({
      where: { 
        slug: slug,
        language: PRIMARY_LANG,
      },
    });
    
    if (!landingPage) {
      notFound();
    }

    // Diagnostics: check for multi-lang duplicates of the same slug
    try {
      const otherLangs = await prisma.landing_pages.findMany({
        where: { slug, NOT: { language: PRIMARY_LANG } },
        select: { language: true },
      })
      if (otherLangs && otherLangs.length > 0) {
        const langs = Array.from(new Set(otherLangs.map(l => (l as any).language))).join(', ')
        console.warn(`[i18n-frozen] Duplicate slug detected for languages != ${PRIMARY_LANG}: slug="${slug}", languages=[${langs}], count=${otherLangs.length}`)
      }
    } catch {
      // ignore diagnostics errors
    }

    // Render canonical non-i18n landing at /landing/[slug]

    const wordCount = landingPage.content_html.replace(/<[^>]*>/g, "").split(/\s+/).length;

    // Připrav inline hero obrázek po prvním H2 (bez fallbacků)
    const heroImage = ((landingPage as any).visuals as any)?.heroImage
    const insertAfterFirstH2 = (html: string, snippet: string): string => {
      // HTML H2
      const htmlH2Pattern = /(<h2[\s\S]*?<\/h2>)/i
      if (htmlH2Pattern.test(html)) {
        return html.replace(htmlH2Pattern, `$1${snippet}`)
      }
      // Markdown H2 na začátku řádku
      const mdH2Pattern = /(^##[^\n]*\n)/m
      if (mdH2Pattern.test(html)) {
        return html.replace(mdH2Pattern, `$1${snippet}`)
      }
      // Bez fallbacku – pokud není H2, ponecháme beze změny
      return html
    }
    const hasTopHeroImage = Boolean((landingPage as any).image_url || heroImage?.imageUrl)
    const figureSnippet = !hasTopHeroImage && heroImage?.imageUrl
      ? `\n<figure class=\"my-8\">\n  <img src=\"${heroImage.imageUrl}\" alt=\"${heroImage.imageAlt || ''}\" ${heroImage.imageWidth ? `width=\\\"${heroImage.imageWidth}\\\"` : ''} ${heroImage.imageHeight ? `height=\\\"${heroImage.imageHeight}\\\"` : ''} class=\"w-full h-auto rounded-xl\"/>\n  ${(heroImage.imageSourceName || heroImage.imageLicense) ? `<figcaption class=\\\"mt-2 text-sm text-slate-500\\\">${heroImage.imageSourceUrl && heroImage.imageSourceName ? `<a href=\\\"${heroImage.imageSourceUrl}\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\" class=\\\"underline\\\">${heroImage.imageSourceName}</a>` : (heroImage.imageSourceName || '')}${heroImage.imageLicense ? ` <span>· ${heroImage.imageLicense}</span>` : ''}</figcaption>` : ''}\n</figure>\n`
      : ''
    const baseHtml = landingPage.language === 'en' ? autoLinkHtml(landingPage.content_html, 'en') : landingPage.content_html
    const stripLeadingH1 = (html: string, title: string): string => {
      try {
        const m = html.match(/^\s*<h1[^>]*>([\s\S]*?)<\/h1>/i)
        if (!m) return html
        const inner = m[1].replace(/<[^>]*>/g, '').trim()
        const n1 = inner.replace(/\s+/g, ' ').toLowerCase()
        const n2 = (title || '').replace(/\s+/g, ' ').toLowerCase()
        if (n1 === n2) {
          return html.replace(m[0], '').trim()
        }
        return html
      } catch { return html }
    }
    const isStrong = isStrongContent(baseHtml, slug)
    const contentNoDupH1 = stripLeadingH1(baseHtml, (landingPage as any).title)
    const composedContentHtml = figureSnippet ? insertAfterFirstH2(contentNoDupH1, figureSnippet) : contentNoDupH1
    const suggestedTags = landingPage.language === 'en' ? suggestAutolinkTags(composedContentHtml, 'en', 3) : []

    // JSON-LD structured data
    const canonicalUrl = `${getPublicBaseUrl()}/landing/${slug}`
    const base = getPublicBaseUrl()
    const ldArticle = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: landingPage.title,
      description: landingPage.meta_description,
      inLanguage: landingPage.language,
      mainEntityOfPage: canonicalUrl,
      image: (landingPage as any).image_url || undefined,
      datePublished: landingPage.published_at || new Date().toISOString(),
      dateModified: landingPage.updated_at || new Date().toISOString(),
      author: { '@type': 'Organization', name: 'Comparee.ai' },
      publisher: { '@type': 'Organization', name: 'Comparee.ai' }
    }
    const ldBreadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: base },
        { '@type': 'ListItem', position: 2, name: 'Landing', item: `${base}/landing` },
        { '@type': 'ListItem', position: 3, name: landingPage.title, item: canonicalUrl }
      ]
    }
    const ldFAQ = Array.isArray(landingPage.faq) && landingPage.faq.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: (landingPage.faq as any[]).map((f: any) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer }
      }))
    } : null

    // Generuj dynamické tagy z obsahu
    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Structured data only for strong content */}
        {isStrong ? (
          <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldArticle) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumb) }} />
            {ldFAQ ? (
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFAQ) }} />
            ) : null}
          </>
        ) : null}
        
        {/* Hero Section (restored original gradient) */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl mx-4 mt-8 mb-16">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 opacity-95"></div>
          <div className="relative px-8 py-20 sm:py-24 lg:py-32">
            <div className="text-center max-w-6xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                  {landingPage.title}
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed mb-8">
                {landingPage.meta_description}
              </p>
              
              {suggestedTags.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {suggestedTags.map(tag => (
                    <a
                      key={tag.id}
                      href={tag.url}
                      className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
                      data-autolink-origin="hero-tags"
                    >
                      {tag.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 mb-16">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 lg:p-12">
              {(landingPage as any).image_url ? (
                <figure className="mb-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={(landingPage as any).image_url} alt="" className="w-full h-auto rounded-xl" />
                </figure>
              ) : null}
              <AdaptiveContentRenderer 
                contentHtml={composedContentHtml}
                comparisonTables={(landingPage.visuals as any)?.comparisonTables || []}
                pricingTables={(landingPage.visuals as any)?.pricingTables || []}
                featureTables={(landingPage.visuals as any)?.featureTables || []}
                dataTables={(landingPage.visuals as any)?.dataTables || []}
                primaryVisuals={landingPage.visuals as any}
              />
            </div>
          </div>
        </div>

        {/* AI Advisor - After Main Content */}
        <div className="max-w-7xl mx-auto px-4 mb-16">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6">
              <AiAdvisor />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        {landingPage.faq && Array.isArray(landingPage.faq) && landingPage.faq.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 mb-16">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {landingPage.faq.map((item: any, index: number) => (
                  <details key={index} className="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200/50">
                    <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-xl font-semibold text-gray-900 leading-relaxed pr-4">{item.question}</h3>
                        <div className="flex-shrink-0 mt-1">
                          <svg className="w-6 h-6 text-gray-500 transform group-open:rotate-180 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </summary>
                    <div className="mt-6 pt-4 border-t border-gray-200 text-gray-700 leading-relaxed text-lg">{item.answer}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Carousel #2 - Popular Tools */}
        <div className="max-w-7xl mx-auto px-4 mb-16">
          <ProductCarousel 
            title="Most Popular AI Tools"
            subtitle=""
            maxProducts={6}
          />
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 mb-16">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 rounded-3xl shadow-2xl">
            <div className="relative p-8 lg:p-16 text-center text-white">
              <div className="text-5xl mb-6">🚀</div>
              <h2 className="text-4xl font-black mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                    Ready to transform your business?
                  </span>
              </h2>
              <p className="text-2xl text-blue-100 mb-12 font-medium">
                Discover hundreds of AI tools in our database
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a 
                  href="/" 
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-slate-800 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  🔍 Explore AI Tools
                </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error loading landing page:', error);
    notFound();
  }
}