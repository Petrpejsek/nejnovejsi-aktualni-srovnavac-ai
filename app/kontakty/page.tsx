import SocialIcons from '@/components/SocialIcons'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            Contact Us
          </h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-gray-600 mb-8">
              Have a question or feedback? Don't hesitate to contact us. We're happy to help you choose the right AI tool or answer any questions you may have.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-[14px] shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Email Contact
                </h2>
                <p className="text-gray-600 mb-2">For general inquiries:</p>
                <a href="mailto:info@comparee.ai" className="text-purple-600 hover:text-purple-700">
                  info@comparee.ai
                </a>
                <p className="text-gray-600 mt-4 mb-2">For business cooperation:</p>
                <a href="mailto:info@comparee.ai" className="text-purple-600 hover:text-purple-700">
                  info@comparee.ai
                </a>
              </div>

              <div className="bg-white p-6 rounded-[14px] shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Company Address
                </h2>
                <p className="text-gray-600">
                  comparee.ai s.r.o.<br />
                  Technology Street 123<br />
                  160 00 Prague 6<br />
                  Czech Republic
                </p>
                <p className="text-gray-600 mt-4">
                  ID: 12345678<br />
                  VAT: CZ12345678
                </p>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Social Media
              </h2>
              <p className="text-gray-600 mb-4">
                Follow us on social media for the latest news and updates:
              </p>
              <SocialIcons className="mb-8" />
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">How long does it take to get a response?</h3>
                  <p className="text-gray-600">We strive to respond to all inquiries within 24 hours on business days.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Do you provide technical support?</h3>
                  <p className="text-gray-600">Yes, we are ready to help you with any issues related to using our website.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}