import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GDPR Compliance - Comparee.ai | Data Protection & Privacy Rights',
  description: 'Learn about Comparee.ai\'s GDPR compliance, data protection measures, and your privacy rights under European Union regulations.',
  keywords: 'GDPR compliance, data protection, privacy rights, EU regulations, personal data, Comparee.ai privacy',
  openGraph: {
    title: 'GDPR Compliance - Comparee.ai',
    description: 'Our commitment to GDPR compliance and protecting your personal data under EU regulations.',
    type: 'website',
    locale: 'en_US',
  },
  other: {
    'geo.region': 'US-FL',
    'geo.placename': 'Florida, United States',
  }
}

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              GDPR <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Compliance</span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 leading-relaxed">
              Your privacy and data protection rights are important to us. Learn how we comply with GDPR regulations.
            </p>
          </div>
        </div>
      </section>

      {/* GDPR Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Introduction */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Commitment to GDPR Compliance</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                The General Data Protection Regulation (GDPR) is a regulation in EU law on data protection and privacy in the European Union and the European Economic Area. At Comparee LLC, we are committed to protecting your personal data and respecting your privacy rights under GDPR.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                This page explains how we comply with GDPR requirements and what rights you have regarding your personal data.
              </p>
            </div>

            {/* Data We Collect */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What Data We Collect</h2>
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information:</h3>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li>• Email address (when you subscribe to our newsletter)</li>
                  <li>• Name (when provided voluntarily)</li>
                  <li>• Company information (for business accounts)</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Information:</h3>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li>• IP address and location data</li>
                  <li>• Browser type and version</li>
                  <li>• Device information</li>
                  <li>• Usage analytics and cookies</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">Usage Data:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Pages visited and time spent</li>
                  <li>• Search queries and preferences</li>
                  <li>• Tool comparisons and recommendations viewed</li>
                </ul>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Your GDPR Rights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Right of Access</h3>
                  <p className="text-blue-800">You have the right to request copies of your personal data we hold.</p>
                </div>
                
                <div className="bg-green-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-green-900 mb-3">Right to Rectification</h3>
                  <p className="text-green-800">You have the right to request correction of inaccurate personal data.</p>
                </div>
                
                <div className="bg-purple-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-purple-900 mb-3">Right to Erasure</h3>
                  <p className="text-purple-800">You have the right to request deletion of your personal data.</p>
                </div>
                
                <div className="bg-orange-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-orange-900 mb-3">Right to Portability</h3>
                  <p className="text-orange-800">You have the right to receive your data in a portable format.</p>
                </div>
                
                <div className="bg-red-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-red-900 mb-3">Right to Object</h3>
                  <p className="text-red-800">You have the right to object to processing of your personal data.</p>
                </div>
                
                <div className="bg-indigo-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-indigo-900 mb-3">Right to Restrict</h3>
                  <p className="text-indigo-800">You have the right to request restriction of processing.</p>
                </div>
              </div>
            </div>

            {/* How We Protect Data */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How We Protect Your Data</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Measures</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• SSL encryption for all data transmission</li>
                    <li>• Secure cloud storage with access controls</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Limited access to personal data on a need-to-know basis</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Retention</h3>
                  <p className="text-gray-600">
                    We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, 
                    or as required by law. Analytics data is typically retained for 24 months.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact & Requests */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Exercise Your Rights</h2>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
                <p className="text-lg text-gray-700 mb-6">
                  To exercise any of your GDPR rights or if you have questions about our data protection practices, 
                  please contact us:
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.256a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">Email: privacy@comparee.ai</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">Comparee LLC, Florida, USA</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white rounded-xl">
                  <p className="text-sm text-gray-600">
                    <strong>Response Time:</strong> We will respond to your request within 30 days as required by GDPR. 
                    For complex requests, we may extend this period by an additional two months.
                  </p>
                </div>
              </div>
            </div>

            {/* Updates */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Updates to This Policy</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We may update this GDPR compliance information from time to time. Any changes will be posted on this page 
                with an updated revision date. We encourage you to review this page periodically for the latest information.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Last updated: January 2025
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}