import React from 'react'

export default function PrivacyPage() {
  const lastUpdate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-gray-600 mb-8">
              At comparee.ai, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Information We Collect
                </h2>
                <p className="text-gray-600">
                  We collect information that you provide directly to us, such as your name and email address when you register or contact us. We also automatically collect certain information about your device and how you interact with our website.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  How We Use Your Information
                </h2>
                <p className="text-gray-600">
                  We use the information we collect to provide and improve our services, communicate with you, and ensure the security of our website. We do not sell your personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Data Security
                </h2>
                <p className="text-gray-600">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Cookies
                </h2>
                <p className="text-gray-600">
                  We use cookies and similar technologies to enhance your experience on our website. You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Your Rights
                </h2>
                <p className="text-gray-600">
                  You have the right to access, correct, or delete your personal information. You can also object to or restrict certain processing of your data. Contact us to exercise these rights.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Changes to Privacy Policy
                </h2>
                <p className="text-gray-600">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-600">
                  If you have any questions about this Privacy Policy, please contact us at privacy@example.com.
                </p>
              </section>

              <p className="text-sm text-gray-500 mt-8">
                Last updated: {lastUpdate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 