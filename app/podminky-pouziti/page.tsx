export default function TermsPage() {
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
            Terms of Use
          </h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-gray-600 mb-8">
              Welcome to comparee.ai. By using our service, you agree to these terms of use. Please read them carefully.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Definitions
                </h2>
                <p className="text-gray-600">
                  "Service" refers to the comparee.ai website and all its features. "User" means any person accessing or using the Service. "Content" includes all information, data, and materials available through the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Service Usage
                </h2>
                <p className="text-gray-600">
                  The Service is provided for informational purposes only. We strive to maintain accurate and up-to-date information, but we cannot guarantee its completeness or accuracy. Users are responsible for verifying any information before making decisions based on it.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Intellectual Property
                </h2>
                <p className="text-gray-600">
                  All content on the Service is protected by intellectual property rights. Users may not copy, modify, distribute, or use the content without explicit permission from comparee.ai.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-gray-600">
                  The Service is provided "as is" without any warranties. We are not liable for any damages arising from the use of the Service or the information it provides.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Changes to Terms
                </h2>
                <p className="text-gray-600">
                  We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Contact
                </h2>
                <p className="text-gray-600">
                  If you have any questions about these terms, please contact us at{' '}
                  <a href="mailto:info@comparee.ai" className="text-purple-600 hover:text-purple-700">info@comparee.ai</a>.
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