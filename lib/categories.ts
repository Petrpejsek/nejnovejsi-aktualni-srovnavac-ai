// Fixed 20 categories for TOP 20 lists
// Centrally defined for consistency across the application

export const FIXED_CATEGORIES = [
  { slug: 'writing-tools', name: 'Writing Tools' },
  { slug: 'chatbots', name: 'Chatbots & Virtual Assistants' },
  { slug: 'image-generation', name: 'Image Generation' },
  { slug: 'speech-to-text', name: 'Speech to Text' },
  { slug: 'text-to-speech', name: 'Text to Speech' },
  { slug: 'video-editing', name: 'Video Editing' },
  { slug: 'automation', name: 'Process Automation' },
  { slug: 'developer-tools', name: 'Developer Tools' },
  { slug: 'marketing', name: 'Marketing Tools' },
  { slug: 'customer-support', name: 'Customer Support' },
  { slug: 'design-tools', name: 'Design Tools' },
  { slug: 'education', name: 'Education & Learning' },
  { slug: 'hr-recruiting', name: 'HR & Recruiting' },
  { slug: 'legal', name: 'Legal Tools' },
  { slug: 'healthcare', name: 'Healthcare' },
  { slug: 'finance', name: 'Finance & Accounting' },
  { slug: 'ecommerce', name: 'E-commerce' },
  { slug: 'code-generation', name: 'Code Generation' },
  { slug: 'productivity', name: 'Productivity' },
  { slug: 'website-builders', name: 'Website Builders' }
] as const

export type CategorySlug = typeof FIXED_CATEGORIES[number]['slug']

// Helper function to get category name by slug
export function getCategoryName(slug: string): string {
  const category = FIXED_CATEGORIES.find(cat => cat.slug === slug)
  return category?.name || slug
}

// Helper function to validate if slug is a valid category
export function isValidCategorySlug(slug: string): slug is CategorySlug {
  return FIXED_CATEGORIES.some(cat => cat.slug === slug)
}
