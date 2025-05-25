'use client'

import React, { useState } from 'react'

interface PopularCategoriesProps {
  onCategorySelect: (category: string) => void;
}

export default function PopularCategories({ onCategorySelect }: PopularCategoriesProps) {
  const [showAllCategories, setShowAllCategories] = useState(false)

  // Real categories from database (196 products, 84 categories)
  const popularCategories = [
    // Most popular categories (by number of products)
    'automation',
    'Healthcare',
    'Website Builder',
    'video-generation',
    'E-commerce',
    'video-editing',
    'Accounting Software',
    'AI & Video',
    'Financial Technology',
    'AI Website Builder',
    'Robo-Advisor',
    'Accounting Services',
    'music',
    'content-creation',
    'advertising',
    'AI Accounting Assistant',
    'E-commerce Marketing',
    'audio',
    'image-generation',
    'sales',
    'AI Hedge Fund',
    'Finance',
    'AI Consulting',
    'AI Lending',
    'Fundraising Intelligence',
    'chatbots',
    'AI Content Creation',
    'Accounts Payable Automation',
    'marketing',
    'Spend Management',
    'seo',
    'AI & Data Analysis',
    'No-Code Development Platform',
    'Document Intelligence',
    'Fraud Prevention',
    'Investment Management',
    'Email Marketing Platform',
    'Wealth Management',
    'Conversational AI',
    'Credit Monitoring',
    'Visual AI Search',
    'Customer Service AI',
    'Growth Marketing',
    'Visual Search',
    'AI Accounting Software',
    'marketing-automation',
    'social-media',
    'E-commerce Personalization',
    'Credit Underwriting',
    'Web Automation',
    'Offline Website Builder',
    'Low-Code Website Builder',
    'e-commerce',
    'Document Processing',
    'Business AI Assistant',
    'Product Intelligence',
    'Personal Finance',
    'Automated Bookkeeping',
    'Crypto Tax Software',
    'Accounting Digitization',
    'analytics',
    'Workflow Automation',
    'AI Accounting',
    'Marketing Personalization',
    'Cash Flow Management',
    'Financial Automation',
    'Customer Service',
    'Design System Platform',
    'Cloud Financial Management',
    'Logistics',
    'Recommendation Systems',
    'Expense Management',
    'Startup Accounting',
    'Financial Reporting',
    'Financial Data Analytics',
    'Mortgage Lending',
    'Inventory Optimization',
    'Accounting Automation',
    'SMB Financial Software'
  ]

  const buttonClass = `
    px-3 
    py-1.5 
    text-xs 
    font-medium 
    rounded-md 
    transition-all 
    bg-purple-50 
    text-purple-600 
    hover:bg-purple-100 
    hover:text-purple-700
    border-none
  `

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className={`flex flex-wrap justify-center gap-2 relative ${!showAllCategories ? 'max-h-[60px] overflow-hidden' : ''}`}>
          {popularCategories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={buttonClass}
            >
              {category}
            </button>
          ))}
          {!showAllCategories && popularCategories.length > 15 && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>
        
        {popularCategories.length > 15 && (
          <div className="flex justify-center mt-3">
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full transition-all"
            >
              {showAllCategories ? (
                <>
                  <span>Show Less</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Show {popularCategories.length - 15} More Categories</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 