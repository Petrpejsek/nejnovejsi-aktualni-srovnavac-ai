// i18n Landing Page Component - Support for multiple languages
import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { isValidLocale, Locale, getLanguageMetadata, locales } from '@/lib/i18n';
import { PUBLIC_BASE_URL } from '@/lib/env'
import { autoLinkHtml, suggestAutolinkTags } from '@/lib/autolink'

interface Props {
  params: {
    lang: string;
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
  meta_keywords: string[];
  schemaOrg?: string;
  visuals?: any;
  faq?: any[];
  format: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  image_url?: string;
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

// Generate metadata for SEO with i18n support
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Validate language
    if (!isValidLocale(params.lang)) {
      notFound();
    }

    const landingPage = await getLandingPage(params.slug, params.lang as Locale);
    const langMeta = getLanguageMetadata(params.lang as Locale);
    
    // Generate alternate language URLs
    const alternateLanguages: Record<string, string> = {};
    for (const locale of locales) {
      alternateLanguages[locale] = `${PUBLIC_BASE_URL}/${locale}/landing/${params.slug}`;
    }
    
    const ogImageUrl = (landingPage as any).image_url || (landingPage as any).visuals?.heroImage?.imageUrl

    return {
      title: `${landingPage.title} | Comparee.ai`,
      description: landingPage.metaDescription,
      keywords: landingPage.meta_keywords.join(', '),
      alternates: {
        canonical: `${PUBLIC_BASE_URL}/${params.lang}/landing/${params.slug}`,
        languages: alternateLanguages,
      },
      openGraph: {
        title: landingPage.title,
        description: landingPage.metaDescription,
        url: `${PUBLIC_BASE_URL}/${params.lang}/landing/${params.slug}`,
        siteName: 'Comparee.ai',
        locale: langMeta.locale,
        type: 'article',
        publishedTime: landingPage.publishedAt.toISOString(),
        modifiedTime: landingPage.updatedAt.toISOString(),
        images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: landingPage.title,
        description: landingPage.metaDescription,
        images: ogImageUrl ? [ogImageUrl] : undefined,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
      other: {
        'language': params.lang,
      },
    };
  } catch (error) {
    return {
      title: 'Page Not Found | Comparee.ai',
      description: 'The requested page was not found.',
    };
  }
}

// Function to get landing page from database with language support
async function getLandingPage(slug: string, language: Locale): Promise<LandingPageData> {
  try {
    const landingPage = await prisma.landing_pages.findUnique({
      where: { 
        slug_language: {
          slug,
          language
        }
      }
    });
    
    if (!landingPage) {
      notFound();
    }

    // Parse meta keywords from JSON string
    let meta_keywords: string[] = [];
    try {
      meta_keywords = JSON.parse(landingPage.meta_keywords);
    } catch (e) {
      meta_keywords = [];
    }

    return {
      id: landingPage.id,
      slug: landingPage.slug,
      title: landingPage.title,
      language: landingPage.language,
      contentHtml: landingPage.content_html,
      metaDescription: landingPage.meta_description,
      meta_keywords,
      schemaOrg: landingPage.schema_org || undefined,
      visuals: landingPage.visuals ? (landingPage.visuals as any) : undefined,
      faq: landingPage.faq ? (landingPage.faq as any[]) : undefined,
      format: landingPage.format,
      publishedAt: landingPage.published_at,
      createdAt: landingPage.created_at,
      updatedAt: landingPage.updated_at,
      image_url: (landingPage as any).image_url || undefined,
    };
  } catch (error) {
    console.error('Error fetching i18n landing page:', error);
    notFound();
  }
}

// Generate static params for all language/slug combinations
export async function generateStaticParams() {
  try {
    const landingPages = await prisma.landing_pages.findMany({
      select: {
        slug: true,
        language: true,
      }
    });

    return landingPages.map((page) => ({
      lang: page.language,
      slug: page.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Main i18n landing page component
export default async function I18nLandingPage({ params }: Props) {
  if (!isValidLocale(params.lang)) {
    notFound();
  }

  const lang = params.lang as Locale;
  const slug = params.slug;
  const langMeta = getLanguageMetadata(lang);

  let landingPage: LandingPageData | null = null;

  try {
    landingPage = await getLandingPage(slug, lang);
  } catch (error) {
    console.error('Error loading i18n landing page:', error);
    notFound();
  }

  if (!landingPage) {
    notFound();
  }

  const faqSchema = (() => {
    if (!landingPage!.faq || landingPage!.faq.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": landingPage!.faq.map((item: FAQ) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": { "@type": "Answer", "text": item.answer }
      }))
    };
  })();

  const baseHtml = landingPage.language === 'en' ? autoLinkHtml(landingPage.contentHtml, 'en') : landingPage.contentHtml
  const heroTags = landingPage.language === 'en' ? suggestAutolinkTags(baseHtml, 'en', 3) : []

  const visualsArray: Visual[] = Array.isArray(landingPage.visuals) ? (landingPage.visuals as Visual[]) : []
  const galleryVisuals = visualsArray.filter((v: Visual) => v.position === 'gallery')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Structured data scripts inside body */}
      {landingPage.schemaOrg ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: landingPage.schemaOrg }} />
      ) : null}
      {faqSchema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      ) : null}

      {/* Header Section */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href={`/${lang}`} className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Comparee.ai
              </a>
              <span className="text-sm px-2 py-1 bg-slate-100 text-slate-600 rounded-full uppercase">
                {langMeta.code}
              </span>
            </div>
            
            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              {locales.map((locale) => (
                <a
                  key={locale}
                  href={`/${locale}/landing/${slug}`}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    locale === lang
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {locale.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Hero image – canonical source is image_url from DB */}
          {landingPage.image_url && (
            <figure className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={landingPage.image_url}
                alt=""
                className="w-full h-auto object-cover"
              />
            </figure>
          )}

          {/* Article Content */}
          <div className="p-8">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
                {landingPage.title}
              </h1>
              
              <div className="flex items-center text-sm text-slate-500 space-x-4">
                <time dateTime={landingPage.publishedAt.toISOString()}>
                  {landingPage.publishedAt.toLocaleDateString(langMeta.locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                <span className="uppercase text-xs font-medium">
                  {langMeta.nativeName}
                </span>
              </div>
            </header>

            {/* Hero tags */}
            {heroTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-4" data-autolink-origin="hero-tags">
                {heroTags.map(tag => (
                  <a key={tag.id} href={tag.url} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs hover:bg-blue-100 transition-colors">
                    {tag.label}
                  </a>
                ))}
              </div>
            )}

            {/* Main Content (autolinked for EN) */}
            <div 
              className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900"
              dangerouslySetInnerHTML={{ __html: baseHtml }}
            />

            {/* Gallery Images */}
            {galleryVisuals.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {galleryVisuals.map((visual, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 text-center">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Visual {visual.position}
                      </h4>
                      <p className="text-slate-600 text-sm">
                        {visual.description || visual.image_prompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            {landingPage.faq && landingPage.faq.length > 0 && (
              <div className="mt-12 border-t border-slate-200 pt-12">
                <h3 className="text-2xl font-bold text-slate-900 mb-8">
                  {lang === 'cs' ? 'Často kladené otázky' : 
                   lang === 'en' ? 'Frequently Asked Questions' :
                   lang === 'de' ? 'Häufig gestellte Fragen' :
                   lang === 'fr' ? 'Questions fréquemment posées' :
                   lang === 'es' ? 'Preguntas frecuentes' : 'FAQ'}
                </h3>
                <div className="space-y-6">
                  {landingPage.faq.map((item: FAQ, index: number) => (
                    <details key={index} className="group">
                      <summary className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <h4 className="font-semibold text-slate-900 pr-4">
                          {item.question}
                        </h4>
                        <svg className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="p-4 pt-2">
                        <p className="text-slate-700 leading-relaxed">{item.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400">© 2024 Comparee.ai - {langMeta.nativeName}</p>
        </div>
      </footer>
    </div>
  );
}