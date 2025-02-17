import React from 'react'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            About Us
          </h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-gray-600 mb-8">
              Welcome to comparee.ai - your trusted guide in the world of AI tools and solutions. We help you make informed decisions by providing comprehensive comparisons and expert recommendations.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-600">
                  Our mission is to simplify the process of choosing AI tools by providing clear, unbiased comparisons and personalized recommendations. We believe that everyone should have access to the right AI tools that match their specific needs and budget.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  What We Do
                </h2>
                <p className="text-gray-600">
                  We analyze and compare various AI tools across different categories, from content generation to image processing. Our detailed comparisons help you understand the features, pricing, and capabilities of each tool, making your decision-making process easier.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Our Values
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[14px] shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-2">Transparency</h3>
                    <p className="text-gray-600">We provide honest, unbiased information about all tools we review.</p>
                  </div>
                  <div className="bg-white p-6 rounded-[14px] shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-2">Quality</h3>
                    <p className="text-gray-600">We maintain high standards in our research and recommendations.</p>
                  </div>
                  <div className="bg-white p-6 rounded-[14px] shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-2">User Focus</h3>
                    <p className="text-gray-600">Your needs and requirements are at the center of our service.</p>
                  </div>
                  <div className="bg-white p-6 rounded-[14px] shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-2">Innovation</h3>
                    <p className="text-gray-600">We stay up-to-date with the latest developments in AI technology.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Our Team
                </h2>
                <p className="text-gray-600">
                  We are a team of AI enthusiasts, technology experts, and industry professionals dedicated to helping you navigate the world of artificial intelligence. Our diverse backgrounds and expertise enable us to provide comprehensive insights into various AI tools and their applications.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-600">
                  Have questions or suggestions? We'd love to hear from you! Reach out to us at info@example.com or visit our contact page for more ways to get in touch.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 