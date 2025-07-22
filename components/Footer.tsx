import React from 'react'
import Link from 'next/link'
import SocialIcons from './SocialIcons'

// Slugify function for converting category names to URL-friendly slugs
const slugify = (name: string) =>
  name.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-');

export default function Footer() {

  // Popular categories for footer - expandované pro SEO
  const popularCategories = [
    { name: 'AI Writing', slug: 'AI Writing' },
    { name: 'Video Generation', slug: 'Video Generation' },
    { name: 'Image Generation', slug: 'Image Generation' },
    { name: 'AI Chatbots', slug: 'AI Chatbots' },
    { name: 'Automation', slug: 'Automation' },
    { name: 'Email Marketing', slug: 'Email Marketing' },
    { name: 'Website Builder', slug: 'Website Builder' },
    { name: 'SEO Tools', slug: 'SEO Tools' },
    { name: 'Social Media', slug: 'Social Media' },
    { name: 'AI Design', slug: 'AI Design' },
    { name: 'Data Analysis', slug: 'AI & Data Analysis' },
    { name: 'AI Voice', slug: 'AI Voice' },
    { name: 'AI Music', slug: 'Music' },
    { name: 'Productivity', slug: 'Productivity' },
    { name: 'AI Learning', slug: 'Learning' },
    { name: 'Business Intelligence', slug: 'Business Intelligence' }
  ]

  const usefulLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'AI Tool Directory', href: '/directory' },
    { name: 'Submit Your Tool', href: '/submit' },
    { name: 'For Companies', href: '/advertise' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Contact Support', href: '/contact' }
  ]

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 mb-8">
          
          {/* Column 1: About */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Link href="/" className="text-2xl font-bold text-gradient-primary">
                comparee.ai
              </Link>
            </div>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Your ultimate destination for discovering and comparing AI tools. 
              Find the perfect solution for your business needs from our curated collection.
            </p>


          </div>

          {/* Column 2-3: Popular Categories - dvojitá šířka pro SEO */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Popular AI Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {popularCategories.map((category) => (
                <div key={category.slug}>
                  <Link
                    href={`/categories/${slugify(category.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center group"
                  >
                    <svg className="w-3 h-3 mr-2 text-purple-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {category.name}
                  </Link>
                </div>
              ))}
            </div>
            <Link 
              href="/categories" 
              className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium mt-4 group"
            >
              View all categories
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Column 3: Useful Links */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Useful Links
            </h3>
            <ul className="space-y-2">
              {usefulLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connect With Us
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@comparee.ai" className="hover:text-purple-600 transition-colors">
                  info@comparee.ai
                </a>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Follow us for AI news & updates:</p>
              <SocialIcons className="text-lg" />
            </div>

            {/* Newsletter signup */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 w-full">
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                Stay Updated
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                Get weekly AI tool recommendations
              </p>
              <div className="flex flex-col gap-2 w-full">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
                <button className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="text-center">
            <div className="text-sm text-gray-600">
              © 2025 comparee.ai. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 