// Server Component - Landing Page Detail Page
import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import dynamic from 'next/dynamic';

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
    <span className="text-gray-500">Načítám obsah...</span>
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
        format: 'landing_page'
      },
      select: {
        title: true,
        meta_description: true,
        meta_keywords: true,
        language: true,
        slug: true,
      },
    });

    if (!landingPage) {
      return {
        title: 'Stránka nenalezena',
        description: 'Požadovaná stránka nebyla nalezena.',
      };
    }
    
    return {
      title: `${landingPage.title} | Comparee.ai`,
      description: landingPage.meta_description,
      keywords: typeof landingPage.meta_keywords === 'string' ? landingPage.meta_keywords : (landingPage.meta_keywords as any)?.join?.(', ') || '',
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Chyba',
      description: 'Došlo k chybě při načítání stránky.',
    };
  }
}

export default async function LandingPageDetail({ params }: Props) {
  const { slug } = params;

  try {
    // Fetch the landing page from database
    const landingPage = await prisma.landing_pages.findFirst({
      where: { 
        slug: slug
      },
    });
    
    if (!landingPage) {
      notFound();
    }

    const wordCount = landingPage.content_html.replace(/<[^>]*>/g, "").split(/\s+/).length;



    // Generuj dynamické tagy z obsahu
    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        
        {/* Hero Section */}
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
              
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
                  <span className="mr-2">⚡</span>
                  Premium Content
                </div>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
                  <span className="mr-2">📈</span>
                  Expert Analysis
                </div>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
                  <span className="mr-2">🔥</span>
                  Latest Trends
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 mb-16">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 lg:p-12">
              <AdaptiveContentRenderer 
                contentHtml={landingPage.content_html}
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Často kladené otázky</h2>
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
                  Připraveni transformovat váš business?
                </span>
              </h2>
              <p className="text-2xl text-blue-100 mb-12 font-medium">
                Objevte stovky AI nástrojů v naší databázi
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a 
                  href="/" 
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-slate-800 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  🔍 Prozkoumat AI nástroje
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