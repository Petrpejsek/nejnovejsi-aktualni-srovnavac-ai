// Server Component - Landing Page Detail Page
import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';

interface Props {
  params: {
    slug: string;
  };
}

interface LandingPageData {
  id: string;
  slug: string;
  title: string;
  language: string;
  contentHtml: string;
  metaDescription: string;
  metaKeywords: string[];
  schemaOrg?: string;
  visuals?: any[];
  faq?: any[];
  format: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Visual {
  position: string;
  image_prompt: string;
  description: string;
  image_url?: string;
  alt_text?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const landingPage = await getLandingPage(params.slug);
    
    return {
      title: `${landingPage.title} | Comparee.ai`,
      description: landingPage.metaDescription,
      keywords: landingPage.metaKeywords.join(', '),
      alternates: {
        canonical: `https://comparee.ai/landing/${params.slug}`,
      },
      openGraph: {
        title: landingPage.title,
        description: landingPage.metaDescription,
        url: `https://comparee.ai/landing/${params.slug}`,
        siteName: 'Comparee.ai',
        locale: landingPage.language === 'cs' ? 'cs_CZ' : 'en_US',
        type: 'article',
        publishedTime: landingPage.publishedAt.toISOString(),
        modifiedTime: landingPage.updatedAt.toISOString(),
      },
      twitter: {
        card: 'summary_large_image',
        title: landingPage.title,
        description: landingPage.metaDescription,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
    };
  } catch (error) {
    return {
      title: 'Stránka nenalezena | Comparee.ai',
      description: 'Požadovaná stránka nebyla nalezena.',
    };
  }
}

// Function to get landing page from database
async function getLandingPage(slug: string): Promise<LandingPageData> {
  try {
    const landingPage = await prisma.landingPage.findUnique({
      where: { slug }
    });
    
    if (!landingPage) {
      notFound();
    }

    // Parse meta keywords from JSON string
    let metaKeywords: string[] = [];
    try {
      metaKeywords = JSON.parse(landingPage.metaKeywords);
    } catch (e) {
      metaKeywords = [];
    }

    return {
      id: landingPage.id,
      slug: landingPage.slug,
      title: landingPage.title,
      language: landingPage.language,
      contentHtml: landingPage.contentHtml,
      metaDescription: landingPage.metaDescription,
      metaKeywords,
      schemaOrg: landingPage.schemaOrg || undefined,
      visuals: landingPage.visuals ? (landingPage.visuals as any[]) : undefined,
      faq: landingPage.faq ? (landingPage.faq as any[]) : undefined,
      format: landingPage.format,
      publishedAt: landingPage.publishedAt,
      createdAt: landingPage.createdAt,
      updatedAt: landingPage.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching landing page:', error);
    notFound();
  }
}

// Main page component
export default async function LandingPage({ params }: Props) {
  const slug = params.slug;
  let landingPage: LandingPageData | null = null;
  
  try {
    landingPage = await getLandingPage(slug);
  } catch (error) {
    // Will be handled by error boundary or notFound()
    console.error('Error loading landing page:', error);
    notFound();
  }
  
  if (!landingPage) {
    notFound();
  }

  // Generate FAQ schema.org data
  const generateFAQSchema = () => {
    if (!landingPage.faq || landingPage.faq.length === 0) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": landingPage.faq.map((item: FAQ) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };
  };

  const faqSchema = generateFAQSchema();
  
  // Filter visuals by position
  const headerVisuals = landingPage.visuals?.filter((v: Visual) => v.position === 'header') || [];
  const galleryVisuals = landingPage.visuals?.filter((v: Visual) => v.position === 'gallery') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Keywords meta tag */}
      <meta name="keywords" content={landingPage.metaKeywords.join(', ')} />
      
      {/* Enhanced Article Schema.org structured data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": landingPage.title,
            "description": landingPage.metaDescription,
            "author": {
              "@type": "Organization",
              "name": "Comparee.ai"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Comparee.ai",
              "logo": {
                "@type": "ImageObject",
                "url": "https://comparee.ai/logo.png"
              }
            },
            "datePublished": landingPage.publishedAt.toISOString(),
            "dateModified": landingPage.updatedAt.toISOString(),
            "image": headerVisuals.length > 0 && headerVisuals[0].image_url 
              ? headerVisuals[0].image_url 
              : "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://comparee.ai/landing/${landingPage.slug}`
            },
            "keywords": landingPage.metaKeywords.join(", "),
            "wordCount": landingPage.contentHtml.replace(/<[^>]*>/g, "").split(/\s+/).length,
            "inLanguage": landingPage.language === "cs" ? "cs-CZ" : "en-US",
            "articleSection": "AI Tools",
            "about": {
              "@type": "Thing",
              "name": "AI tools for e-commerce",
              "description": "Artificial intelligence tools and solutions for online businesses"
            }
          })
        }}
      />
      
      {/* Original schema.org data from database if present */}
      {landingPage.schemaOrg && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: landingPage.schemaOrg
          }}
        />
      )}
      
      {/* BreadcrumbList Schema.org data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Domů",
                "item": "https://comparee.ai"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Landing",
                "item": "https://comparee.ai/landing"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": landingPage.title,
                "item": `https://comparee.ai/landing/${landingPage.slug}`
              }
            ]
          })
        }}
      />
      
      {/* FAQ Schema.org data */}
      {faqSchema && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema)
          }}
        />
      )}

      {/* Floating background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content container */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Modern Hero Section */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl mb-16">
          {/* Hero background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 opacity-95"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='27' cy='7' r='2'/%3E%3Ccircle cx='47' cy='7' r='2'/%3E%3Ccircle cx='7' cy='27' r='2'/%3E%3Ccircle cx='27' cy='27' r='2'/%3E%3Ccircle cx='47' cy='27' r='2'/%3E%3Ccircle cx='7' cy='47' r='2'/%3E%3Ccircle cx='27' cy='47' r='2'/%3E%3Ccircle cx='47' cy='47' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          <div className="relative px-8 py-20 sm:py-24 lg:py-32">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm border border-white/20">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Publikováno: {new Date(landingPage.publishedAt).toLocaleDateString('cs-CZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                  {landingPage.title}
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-6">
                {landingPage.metaDescription}
              </p>
              
              <p className="text-lg text-blue-200 max-w-2xl mx-auto leading-relaxed mb-12 opacity-90">
                Objevte nástroje, které změní váš e-shop v inteligentní prodejní stroj. 🔍
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Ověřeno experty
                </div>
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Aktuální pro 2024
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Summary Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Úvodní shrnutí
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Co se v článku dozvíte</h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Tento průvodce vám pomůže pochopit, jaké AI nástroje jsou dnes klíčové pro e-commerce. 
              Vysvětlíme, jak fungují, kolik stojí, jak je implementovat a kde začít.
            </p>
          </div>
        </div>

        {/* Hero Image(s) with modern card design */}
        {headerVisuals.length > 0 && (
          <div className="mb-20">
            {headerVisuals.map((visual: Visual, index: number) => (
              <div key={index} className="relative group">
                {visual.image_url ? (
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
                    <div className="aspect-video">
                      <img
                        src={visual.image_url}
                        alt={visual.alt_text || visual.description || `${landingPage.title} - hlavní ilustrační obrázek`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {visual.description && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                          <p className="text-white font-medium text-lg">{visual.description}</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
                    <div className="max-w-2xl mx-auto">
                      <div className="text-6xl mb-6">🎨</div>
                      <div className="text-2xl font-bold mb-4">{visual.image_prompt}</div>
                      <p className="text-purple-100 text-lg opacity-90">{visual.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main content with modern card layout */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-16">
          <main className="prose prose-lg prose-slate max-w-none mx-auto">
            <div 
              className="landing-page-content leading-relaxed text-gray-800"
              dangerouslySetInnerHTML={{ 
                __html: landingPage.contentHtml 
              }}
            />
          </main>
        </div>

        {/* Modern Image Gallery */}
        {galleryVisuals.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Galerie obrázků
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Vizuální přehled</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Podívejte se na klíčové momenty a ukázky v akci</p>
            </div>
            
            <div className={`grid gap-8 ${
              galleryVisuals.length === 1 ? 'grid-cols-1 max-w-3xl mx-auto' :
              galleryVisuals.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {galleryVisuals.map((visual: Visual, index: number) => (
                <div key={index} className="group">
                  {visual.image_url ? (
                    <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                      <div className="aspect-[4/3]">
                        <a 
                          href={visual.image_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full h-full block"
                          aria-label="Otevřít obrázek v plné velikosti"
                        >
                          <img
                            src={visual.image_url}
                            alt={visual.alt_text || visual.description || `${landingPage.title} - ukázka ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                            loading="lazy"
                          />
                        </a>
                      </div>
                      {visual.description && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-white font-medium">{visual.description}</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/20 group-hover:to-purple-600/20 transition-all duration-500"></div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 aspect-[4/3] flex flex-col justify-center">
                      <div className="text-5xl mb-4">🎨</div>
                      <div className="font-bold text-lg mb-2">{visual.image_prompt}</div>
                      <p className="text-purple-100 text-sm opacity-90">{visual.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modern FAQ Section */}
        {landingPage.faq && landingPage.faq.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Často kladené otázky
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Máte otázky?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Zde najdete odpovědi na nejčastější dotazy</p>
            </div>
            
            <div className="max-w-4xl mx-auto" itemScope itemType="https://schema.org/FAQPage">
              <div className="grid gap-6">
                {landingPage.faq.map((item: FAQ, index: number) => (
                  <details key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden" itemScope itemType="https://schema.org/Question" itemProp="mainEntity">
                    <summary className="flex justify-between items-center p-8 font-semibold cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                      <span className="text-gray-900 pr-4 text-lg" itemProp="name">{item.question}</span>
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <svg 
                            className="w-4 h-4 text-white transition-transform group-open:rotate-180 duration-300" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </summary>
                    <div className="px-8 pb-8">
                      <div className="border-t border-gray-100 pt-6">
                        <div 
                          className="text-gray-700 leading-relaxed prose prose-lg max-w-none"
                          itemScope 
                          itemType="https://schema.org/Answer" 
                          itemProp="acceptedAnswer"
                        >
                          <div 
                            itemProp="text"
                            dangerouslySetInnerHTML={{ __html: item.answer }}
                          />
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modern Keywords Section */}
        {landingPage.metaKeywords && landingPage.metaKeywords.length > 0 && (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 lg:p-12 mb-16">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium mb-6">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Klíčové pojmy
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Tagy a kategorie</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {landingPage.metaKeywords.map((keyword, index) => (
                  <a 
                    key={index}
                    href={`/search?q=${encodeURIComponent(keyword)}`}
                    className="group inline-flex items-center px-6 py-3 text-sm font-medium bg-white text-gray-700 rounded-2xl border border-gray-200 hover:border-slate-300 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
                    itemProp="keywords"
                    aria-label={`Hledat ${keyword}`}
                  >
                    <span className="w-2 h-2 bg-gradient-to-r from-slate-400 to-gray-500 rounded-full mr-3 group-hover:animate-pulse"></span>
                    {keyword}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related Articles Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-4">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Další články
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pokračujte ve čtení</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Prozkoumejte další články o AI nástrojích a technologiích</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Article 1 */}
            <article className="group cursor-pointer w-full">
              <a href="/landing/nejlepsi-ai-nastroje-pro-marketing-2024" className="block bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:-translate-y-3 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight min-h-[3.5rem] flex items-center">Nejlepší AI nástroje pro marketing 2024</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">Kompletní přehled AI nástrojů pro automatizaci marketingu, tvorbu obsahu a analýzu dat.</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>5 min čtení</span>
                  <span className="mx-2">•</span>
                  <span>Marketing</span>
                </div>
              </a>
            </article>
            
            {/* Article 2 */}
            <article className="group cursor-pointer w-full">
              <a href="/landing/ai-chatboty-pro-zakaznickou-podporu" className="block bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:-translate-y-3 hover:bg-gradient-to-br hover:from-green-50 hover:to-blue-50">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors leading-tight min-h-[3.5rem] flex items-center">AI chatboty pro zákaznickou podporu</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">Jak implementovat a optimalizovat AI chatboty pro lepší zákaznickou zkušenost.</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>7 min čtení</span>
                  <span className="mx-2">•</span>
                  <span>Zákazníci</span>
                </div>
              </a>
            </article>
            
            {/* Article 3 */}
            <article className="group cursor-pointer w-full">
              <a href="/landing/automatizace-obchodu-s-ai" className="block bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:-translate-y-3 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors leading-tight min-h-[3.5rem] flex items-center">Automatizace obchodu s AI</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">Praktické postupy pro automatizaci e-commerce procesů pomocí umělé inteligence.</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>8 min čtení</span>
                  <span className="mx-2">•</span>
                  <span>Automatizace</span>
                </div>
              </a>
            </article>
          </div>
        </div>

        {/* Modern CTA Section - Softened colors */}
        <div className="bg-gradient-to-br from-slate-700 via-blue-700 to-indigo-700 rounded-3xl p-8 lg:p-16 text-center text-white shadow-xl">
          <div className="max-w-3xl mx-auto">
            <div className="text-5xl mb-6">🚀</div>
            <h3 className="text-3xl font-bold mb-4">Prozkoumejte další AI nástroje</h3>
            <p className="text-xl text-slate-200 mb-12 opacity-90">
              Objevte stovky dalších AI nástrojů v naší databázi a najděte ty nejlepší pro váš projekt
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/" 
                className="inline-flex items-center px-8 py-4 bg-white text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Zpět na Comparee.ai
              </a>
              <a 
                href="/categories" 
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium rounded-2xl hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Všechny kategorie
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
