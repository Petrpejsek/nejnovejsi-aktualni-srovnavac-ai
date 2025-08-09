import { Metadata } from 'next'

// Structured Data for SEO and LLM optimization
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "How Comparee.ai Works - AI Tools Comparison Process",
    "description": "Learn how Comparee.ai's intelligent comparison engine works to help you find the perfect AI tools. Step-by-step process from discovery to recommendation.",
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/how-it-works`,
    "mainEntity": {
      "@type": "HowTo",
      "name": "How to Find the Perfect AI Tool with Comparee.ai",
      "description": "Complete guide to using Comparee.ai's AI tools comparison platform for intelligent recommendations",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Define Your Requirements",
          "text": "Tell us about your specific needs, use case, budget, and technical requirements through our intelligent questionnaire."
        },
        {
          "@type": "HowToStep", 
          "name": "AI Analysis & Matching",
          "text": "Our AI engine analyzes your requirements against our database of 1000+ AI tools, considering features, pricing, reviews, and compatibility."
        },
        {
          "@type": "HowToStep",
          "name": "Personalized Recommendations",
          "text": "Receive a curated list of AI tools ranked by compatibility with your specific needs, including detailed comparisons and user reviews."
        },
        {
          "@type": "HowToStep",
          "name": "Make Informed Decision",
          "text": "Compare features, pricing, pros and cons side-by-side. Access free trials, demos, and exclusive deals through our platform."
        }
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "Comparee LLC",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US",
        "addressRegion": "FL"
      }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does Comparee.ai's recommendation engine work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI-powered recommendation engine analyzes your specific requirements (use case, budget, technical needs) and matches them against our comprehensive database of 1000+ AI tools. We use machine learning algorithms to understand feature compatibility, user satisfaction scores, and real-world performance data."
        }
      },
      {
        "@type": "Question",
        "name": "Is Comparee.ai free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our core comparison and recommendation service is completely free for users. We earn revenue through affiliate partnerships with AI tool providers, which allows us to keep our platform free while maintaining unbiased recommendations."
        }
      },
      {
        "@type": "Question",
        "name": "How often is your AI tools database updated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We update our database daily with new AI tools, pricing changes, feature updates, and fresh user reviews. Our team continuously monitors the AI landscape to ensure you have access to the latest and most accurate information."
        }
      },
      {
        "@type": "Question",
        "name": "Can I trust the recommendations from Comparee.ai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Our recommendations are based on objective data analysis, verified user reviews, and transparent scoring criteria. We maintain editorial independence and clearly disclose any affiliate relationships. Our goal is to help you find the best AI tool for your needs, not to push specific products."
        }
      }
    ]
  }
];

export const metadata: Metadata = {
  title: 'How Comparee.ai Works - AI Tools Comparison Process | Step-by-Step Guide',
  description: 'Discover how Comparee.ai\'s intelligent comparison engine works to match you with perfect AI tools. Learn our 4-step process from requirements to recommendations.',
  keywords: 'how comparee.ai works, AI tools comparison process, AI recommendation engine, find AI tools, AI tools selection guide, machine learning recommendations',
  openGraph: {
    title: 'How Comparee.ai Works - AI Tools Comparison Process',
    description: 'Learn our intelligent 4-step process for finding the perfect AI tools tailored to your specific needs and requirements.',
    type: 'website',
    locale: 'en_US',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/how-it-works`,
  },
  other: {
    'geo.region': 'US-FL',
    'geo.placename': 'Florida, United States',
  }
}

export default function HowItWorksPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      ></script>
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-500 text-white">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                How <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Comparee.ai</span> Works
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 mb-8 leading-relaxed">
                Discover how our intelligent AI-powered platform matches you with the perfect tools in just 4 simple steps.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-300 mb-2">1000+</div>
                  <div className="text-purple-100">AI Tools Analyzed</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                  <div className="text-3xl font-bold text-yellow-300 mb-2">4 Steps</div>
                  <div className="text-purple-100">To Perfect Match</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Process */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Our 4-Step Process</h2>
              <p className="text-xl text-gray-600 mb-16 text-center max-w-3xl mx-auto">
                From understanding your needs to delivering personalized recommendations, here's how we help you find the perfect AI tools.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Step 1 */}
                <div className="relative text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Define Requirements</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Tell us about your specific use case, budget, technical requirements, and team size through our smart questionnaire.
                  </p>
                  <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-300 to-pink-300"></div>
                </div>

                {/* Step 2 */}
                <div className="relative text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">AI Analysis</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our machine learning algorithms analyze 1000+ AI tools, comparing features, pricing, reviews, and compatibility with your needs.
                  </p>
                  <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-300 to-pink-300"></div>
                </div>

                {/* Step 3 */}
                <div className="relative text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Get Recommendations</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Receive a curated list of AI tools ranked by compatibility, with detailed comparisons, pros & cons, and user reviews.
                  </p>
                  <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-300 to-pink-300"></div>
                </div>

                {/* Step 4 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white font-bold text-xl">4</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Make Decision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Compare options side-by-side, access free trials, and get exclusive deals through our platform partnerships.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features That Make Us Different */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">What Makes Our Process Unique</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Matching</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our proprietary algorithms understand context, not just keywords. We analyze feature compatibility, user satisfaction, and real-world performance data.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Reviews</h3>
                  <p className="text-gray-600 leading-relaxed">
                    All reviews are verified from real users. We filter out fake reviews and provide authentic feedback from actual AI tool users.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Real-Time Updates</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our database updates daily with new tools, pricing changes, and feature updates. You always get the most current information.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Unbiased Recommendations</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We maintain editorial independence and transparency. Our recommendations are based on your needs, not our partnerships.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Expert Curation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our team of AI experts manually reviews and tests tools to ensure quality. We combine AI efficiency with human expertise.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Personalized Experience</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every recommendation is tailored to your specific industry, use case, budget, and technical requirements. No generic lists.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                Everything you need to know about how our platform works
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* FAQ 1 */}
                <div className="bg-white rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">How does the recommendation engine work?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our AI analyzes your requirements and matches them against 1000+ tools using machine learning algorithms that consider features, pricing, reviews, and compatibility scores.
                  </p>
                </div>

                {/* FAQ 2 */}
                <div className="bg-white rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Is Comparee.ai free to use?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Yes, our core comparison and recommendation service is completely free. We earn through affiliate partnerships, keeping our platform free while maintaining unbiased recommendations.
                  </p>
                </div>

                {/* FAQ 3 */}
                <div className="bg-white rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">How often is your database updated?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We update our database daily with new AI tools, pricing changes, feature updates, and fresh user reviews to ensure you have the most current information.
                  </p>
                </div>

                {/* FAQ 4 */}
                <div className="bg-white rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Can I trust your recommendations?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Absolutely. Our recommendations are based on objective data analysis, verified user reviews, and transparent scoring. We maintain editorial independence and disclose affiliate relationships.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-500 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-8">Ready to Find Your Perfect AI Tools?</h2>
              <p className="text-xl text-purple-100 mb-12 leading-relaxed">
                Join 50,000+ users who trust Comparee.ai to help them discover and choose the best AI solutions for their needs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/"
                  className="bg-white text-purple-600 font-semibold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  Start Comparing Tools
                </a>
                <a 
                  href="/company"
                  className="border-2 border-white text-white font-semibold py-4 px-8 rounded-xl hover:bg-white hover:text-purple-600 transition-colors duration-200"
                >
                  For Businesses
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}