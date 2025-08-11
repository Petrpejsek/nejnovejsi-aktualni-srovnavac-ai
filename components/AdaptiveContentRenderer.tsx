'use client'

import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import ProductCarousel from './ProductCarousel'
import ComparisonTable, { ComparisonRow } from './ComparisonTable'

interface ContentSection {
  content: string
  isMainSection: boolean
  index: number
}

interface TableData {
  type: 'comparison' | 'pricing' | 'features' | 'specs'
  title: string
  subtitle?: string
  headers: string[]
  rows: ComparisonRow[]
  highlightColumns?: number[]
  style?: 'modern' | 'classic' | 'minimal'
}

interface PrimaryVisual {
  url: string
  alt_text: string
  description?: string
  layout?: 'full-width' | 'side-float' | 'inline' | 'hero'
  position?: 'top' | 'center' | 'bottom'
}

interface AdaptiveContentRendererProps {
  contentHtml: string
  comparisonTables?: TableData[]
  pricingTables?: TableData[]
  featureTables?: TableData[]
  dataTables?: TableData[]
  primaryVisuals?: PrimaryVisual[]
}

// Komponenta pro inline banner
const InlineBanner = ({ index }: { index: number }) => {
  const banners = [
    {
      title: "Explore AI Tools",
      bgGradient: "from-blue-500 to-purple-500",
      cta: "Browse Collection"
    },
    {
      title: "Find Your Tool", 
      bgGradient: "from-emerald-500 to-blue-500",
      cta: "Discover More"
    },
    {
      title: "Popular AI Solutions",
      bgGradient: "from-orange-500 to-pink-500", 
      cta: "View All"
    },
    {
      title: "Trending Tools",
      bgGradient: "from-violet-500 to-purple-500", 
      cta: "Explore Now"
    }
  ]
  
  const banner = banners[index % banners.length]
  
  return (
    <div className="my-8">
      <div className={`bg-gradient-to-r ${banner.bgGradient} rounded-xl p-6 text-white text-center shadow-lg`}>
        <h3 className="text-lg font-semibold mb-4">{banner.title}</h3>
        <a 
          href="/" 
          className="inline-flex items-center px-4 py-2 bg-white/90 text-gray-900 rounded-lg text-sm font-medium hover:bg-white transition-colors duration-200"
        >
          {banner.cta}
          <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  )
}

// Komponenta pro vložení srovnávací tabulky
const InlineComparisonTable = ({ index, tables }: { index: number, tables?: TableData[] }) => {
  if (!tables || tables.length === 0) return null
  
  // Mapuj index sekce na konkrétní typ tabulky
  let tableIndex: number
  let tableType: string
  
  if (index === 0 || index === 6) {
    tableIndex = 0 // Comparison table
    tableType = "COMPARISON"
  } else if (index === 2 || index === 8) {
    tableIndex = 1 % tables.length // Pricing table
    tableType = "PRICING" 
  } else {
    tableIndex = 2 % tables.length // Features table
    tableType = "FEATURES"
  }
  
  const table = tables[tableIndex]
  

  
  return (
    <div className="my-12">
      <ComparisonTable
        title={table.title}
        subtitle={table.subtitle}
        headers={table.headers}
        rows={table.rows}
        highlightColumns={table.highlightColumns}
        style={table.style || 'modern'}
        className="shadow-lg"
      />
    </div>
  )
}

// Komponenta pro kompaktní produktový grid
const InlineProductGrid = ({ index }: { index: number }) => {
  const gridConfigs = [
    {
      title: "🎯 Recommended for You",
      maxProducts: 3,
      className: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
    },
    {
      title: "⭐ Editor's Choice",
      maxProducts: 3,
      className: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
    },
    {
      title: "🔥 Hot Right Now",
      maxProducts: 3,
      className: "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
    },
    {
      title: "💎 Premium Selection",
      maxProducts: 3,
      className: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
    }
  ]
  
  const config = gridConfigs[index % gridConfigs.length]
  
  return (
    <div className="my-12">
      <div className={`rounded-2xl border ${config.className} p-1`}>
        <ProductCarousel 
          title={config.title}
          subtitle=""
          maxProducts={config.maxProducts}
          className="bg-transparent shadow-none border-none"
        />
      </div>
    </div>
  )
}

export default function AdaptiveContentRenderer({ 
  contentHtml, 
  comparisonTables,
  pricingTables,
  featureTables,
  dataTables,
  primaryVisuals
}: AdaptiveContentRendererProps) {


  // Parse obsah a rozdělí podle H2 nadpisů
  const contentSections = useMemo(() => {
    // Validace contentHtml
    if (!contentHtml || typeof contentHtml !== 'string') {
      console.error('❌ contentHtml is missing or invalid')
      return []
    }
    
    // Kontrola zda obsahuje základní strukturu
    if (!contentHtml.trim()) {
      console.error('❌ contentHtml is empty')
      return []
    }
    // Odstranění article tagů
    const cleanContent = contentHtml.replace(/<\/?article>/g, '').trim()
    
    // Rozděl podle H2 nadpisů - HTML <h2> formát nebo markdown ## formát
    let sections: string[]
    
    if (cleanContent.includes('<h2>')) {
      // HTML formát - rozdělí podle <h2> tagů
      sections = cleanContent.split(/(?=<h2>)/gi).filter(section => section.trim())
    } else {
      // Markdown formát - rozdělí podle ## 
      sections = cleanContent.split(/(?=^## )/gm).filter(section => section.trim())
    }
    
    const processedSections: ContentSection[] = []
    
    sections.forEach((section, index) => {
      processedSections.push({
        content: section.trim(),
        isMainSection: true,
        index: index
      })
      
      // Po každé sekci (kromě první a poslední) přidaj akvizicní prvek
      if (index > 0 && index < sections.length - 1) {
        processedSections.push({
          content: '',
          isMainSection: false, 
          index: index
        })
      }
    })
    
    return processedSections
  }, [contentHtml])



  // Pokud je prázdný obsah, vrať chybu
  if (contentSections.length === 0) {
    return <div>Chyba: Prázdný obsah</div>
  }

  // Pokud není možné rozdělit (málo H2), vrať původní obsah
  if (contentSections.length <= 1) {
    const cleanContent = contentHtml.replace(/<\/?article>/g, '').trim()
    
    // Detekce zda je obsah HTML nebo Markdown – konzervativní: HTML jen podle blokových značek
    if (
      cleanContent.includes('<h1>') ||
      cleanContent.includes('<h2>') ||
      cleanContent.includes('<p>')
    ) {
      // HTML obsah - použij dangerouslySetInnerHTML
      return (
        <div 
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-strong:text-gray-900 [&_img]:rounded-lg [&_img]:shadow-md [&_img]:my-8 [&_img]:max-w-full [&_img]:h-auto [&_figure]:my-8 [&_figure]:text-center"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />
      )
    }
    
    return (
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({children}) => (
              <h1 className="text-5xl font-black text-gray-900 mb-8 mt-12 leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {children}
              </h1>
            ),
            h2: ({children}) => (
              <div className="mt-16 mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  {children}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
            ),
            h3: ({children}) => (
              <h3 className="text-2xl font-bold text-gray-800 mb-6 mt-10 leading-tight relative pl-4">
                <div className="absolute left-0 top-1 w-2 h-6 bg-blue-500 rounded-full"></div>
                {children}
              </h3>
            ),
            p: ({children}) => <p className="text-gray-700 leading-8 text-lg mb-6">{children}</p>,
            ul: ({children}) => <ul className="space-y-3 mb-8 pl-6">{children}</ul>,
            ol: ({children}) => <ol className="space-y-3 mb-8 pl-6">{children}</ol>,
            li: ({children}) => (
              <li className="text-gray-700 leading-relaxed text-lg flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-3 mr-3 flex-shrink-0"></span>
                <span>{children}</span>
              </li>
            ),
            table: ({children}) => (
              <div className="overflow-x-auto my-8 rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  {children}
                </table>
              </div>
            ),
            thead: ({children}) => <thead className="bg-gray-50">{children}</thead>,
            tbody: ({children}) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>,
            th: ({children}) => <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">{children}</th>,
            td: ({children}) => <td className="px-6 py-4 text-gray-900 text-base leading-6">{children}</td>,
            strong: ({children}) => <strong className="font-bold text-gray-900 bg-yellow-100 px-1 rounded">{children}</strong>,
            em: ({children}) => <em className="italic text-gray-800 font-medium">{children}</em>,
            code: ({children}) => <code className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm font-mono border">{children}</code>,
            pre: ({children}) => <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto my-8 shadow-lg">{children}</pre>,
            a: ({children, href}) => (
              <a 
                href={href} 
                className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-all duration-200 font-medium"
                target={href?.startsWith('http') ? '_blank' : undefined}
              >
                {children}
              </a>
            ),
            img: ({src, alt, title}) => {
              if (!src) return null
              
              // Kontrola zda má alt atribut
              const altText = alt || title || 'Obrázek článku'
              
              // Detekce layout stylu z title nebo alt
              const layoutClass = (() => {
                const titleLower = (title || '').toLowerCase()
                const altLower = (alt || '').toLowerCase()
                
                if (titleLower.includes('full-width') || altLower.includes('full-width')) {
                  return 'w-full -mx-4 lg:-mx-12 rounded-xl shadow-lg'
                }
                if (titleLower.includes('side-float') || altLower.includes('side-float')) {
                  return 'float-right ml-6 mb-4 w-1/2 lg:w-1/3 rounded-lg shadow-md'
                }
                return 'w-full max-w-2xl mx-auto rounded-lg shadow-md'
              })()
              
              const figureClass = (() => {
                if (layoutClass.includes('float-right')) {
                  return 'inline-block mb-6'
                }
                return 'my-8 text-center'
              })()
              
              return (
                <figure className={figureClass}>
                  <img
                    src={src}
                    alt={altText}
                    loading="lazy"
                    className={`${layoutClass} transition-transform duration-300 hover:scale-105`}
                    style={{ aspectRatio: 'auto' }}
                  />
                  {title && title !== alt && (
                    <figcaption className="mt-3 text-sm text-gray-600 italic px-4">
                      {title}
                    </figcaption>
                  )}
                </figure>
              )
            }
          }}
        >
          {cleanContent}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div>
      {contentSections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {section.isMainSection ? (
            // Obsahová sekce
            (() => {
              const sectionContent = section.content.replace(/<\/?article>/g, '').trim()
              
              // Detekce HTML v sekcích – konzervativní (jen hlavní bloky). Jinak render Markdown s rehype-raw
              if (
                sectionContent.includes('<h1>') ||
                sectionContent.includes('<h2>') ||
                sectionContent.includes('<p>')
              ) {
                // HTML obsah
                return (
                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-strong:text-gray-900 [&_img]:rounded-lg [&_img]:shadow-md [&_img]:my-8 [&_img]:max-w-full [&_img]:h-auto [&_figure]:my-8 [&_figure]:text-center"
                    dangerouslySetInnerHTML={{ __html: sectionContent }}
                  />
                )
              }
              
              // Markdown obsah
              return (
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({children}) => (
                    <h1 className="text-5xl font-black text-gray-900 mb-8 mt-12 leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {children}
                    </h1>
                  ),
                  h2: ({children}) => (
                    <div className="mt-16 mb-8">
                      <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight relative">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                        {children}
                      </h2>
                      <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    </div>
                  ),
                  h3: ({children}) => (
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 mt-10 leading-tight relative pl-4">
                      <div className="absolute left-0 top-1 w-2 h-6 bg-blue-500 rounded-full"></div>
                      {children}
                    </h3>
                  ),
                  p: ({children}) => <p className="text-gray-700 leading-8 text-lg mb-6">{children}</p>,
                  ul: ({children}) => <ul className="space-y-3 mb-8 pl-6">{children}</ul>,
                  ol: ({children}) => <ol className="space-y-3 mb-8 pl-6">{children}</ol>,
                  li: ({children}) => (
                    <li className="text-gray-700 leading-relaxed text-lg flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-3 mr-3 flex-shrink-0"></span>
                      <span>{children}</span>
                    </li>
                  ),
                  table: ({children}) => (
                    <div className="overflow-x-auto my-8 rounded-xl border border-gray-200 shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({children}) => <thead className="bg-gray-50">{children}</thead>,
                  tbody: ({children}) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>,
                  th: ({children}) => <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">{children}</th>,
                  td: ({children}) => <td className="px-6 py-4 text-gray-900 text-base leading-6">{children}</td>,
                  strong: ({children}) => <strong className="font-bold text-gray-900 bg-yellow-100 px-1 rounded">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-800 font-medium">{children}</em>,
                  code: ({children}) => <code className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm font-mono border">{children}</code>,
                  pre: ({children}) => <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto my-8 shadow-lg">{children}</pre>,
                  a: ({children, href}) => (
                    <a 
                      href={href} 
                      className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-all duration-200 font-medium"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                    >
                      {children}
                    </a>
                  ),
                  img: ({src, alt, title}) => {
                    if (!src) return null
                    
                    // Kontrola zda má alt atribut
                    const altText = alt || title || 'Obrázek článku'
                    
                    // Detekce layout stylu z title nebo alt
                    const layoutClass = (() => {
                      const titleLower = (title || '').toLowerCase()
                      const altLower = (alt || '').toLowerCase()
                      
                      if (titleLower.includes('full-width') || altLower.includes('full-width')) {
                        return 'w-full -mx-4 lg:-mx-12 rounded-xl shadow-lg'
                      }
                      if (titleLower.includes('side-float') || altLower.includes('side-float')) {
                        return 'float-right ml-6 mb-4 w-1/2 lg:w-1/3 rounded-lg shadow-md'
                      }
                      return 'w-full max-w-2xl mx-auto rounded-lg shadow-md'
                    })()
                    
                    const figureClass = (() => {
                      if (layoutClass.includes('float-right')) {
                        return 'inline-block mb-6'
                      }
                      return 'my-8 text-center'
                    })()
                    
                    return (
                      <figure className={figureClass}>
                        <img
                          src={src}
                          alt={altText}
                          loading="lazy"
                          className={`${layoutClass} transition-transform duration-300 hover:scale-105`}
                          style={{ aspectRatio: 'auto' }}
                        />
                        {title && title !== alt && (
                          <figcaption className="mt-3 text-sm text-gray-600 italic px-4">
                            {title}
                          </figcaption>
                        )}
                      </figure>
                    )
                  }
                }}
              >
                {sectionContent}
              </ReactMarkdown>
            </div>
              )
            })()
          ) : (
            // Akvizičníhodnotný prvek - rotace tabulek, bannerů a product gridů
            <div>
              {(() => {
                const elementType = section.index % 6
                const allTables = [
                  ...(comparisonTables || []),
                  ...(pricingTables || []),
                  ...(featureTables || []),
                  ...(dataTables || [])
                ]
                

                
                // Explicitní mapování pro zobrazení všech 3 tabulek
                if (allTables.length > 0) {
                  if (section.index === 0) {
                    return <InlineComparisonTable index={0} tables={allTables} />
                  } else if (section.index === 2) {
                    return <InlineComparisonTable index={2} tables={allTables} />
                  } else if (section.index === 4) {
                    return <InlineComparisonTable index={4} tables={allTables} />
                  }
                }
                
                if (elementType === 1 || elementType === 5) {
                  return <InlineBanner index={section.index} />
                } else {
                  return <InlineProductGrid index={section.index} />
                }
              })()}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}