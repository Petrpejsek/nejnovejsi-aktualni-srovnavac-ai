// Shared category mapping for category landing pages
// Goal: Always include both primary category name and synonyms so products
// linked via additional categories (ProductCategory join) appear reliably.

export function slugToCategoryName(slug: string): string {
  if (!slug || typeof slug !== 'string') return ''
  return slug
    .split('-')
    .map(word => (word[0] ? word[0].toUpperCase() + word.slice(1) : ''))
    .join(' ')
}

// Mapping of URL slug => array of human category names (synonyms)
// Keep labels aligned with values used in DB Category.name and admin UI.
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  'ai-writing': ['AI Writing', 'Content & Writing', 'AI Content Creation', 'Content', 'Writing'],
  'image-generation': ['AI Image', 'Image Generation', 'AI Design & Creative Tools', 'Design & Visual', 'Design Tools', 'Visual'],
  'automation': ['Automation', 'Workflow Automation', 'Marketing Automation', 'Business Automation'],
  'website-builder': ['Website Builder', 'AI Website Builder', 'Web Development'],
  'social-media': ['Marketing & Social Media', 'Social Media', 'Marketing'],
  'data-analysis': ['AI Analytics', 'AI & Data Analysis', 'Analytics', 'Data Analytics'],
  'ai-music': ['AI Audio', 'Audio & Music', 'Music', 'Audio'],
  // Video-related slugs
  'ai-and-video': ['AI & Video', 'AI Video', 'Video Generation', 'AI Video Generation', 'AI Video Editing', 'Video Editing'],
  'video-generation': ['AI Video', 'AI & Video', 'Video Generation', 'AI Video Generation', 'AI Video Editing', 'Video Editing'],
  'video-editing': ['Video Editing', 'AI Video Editing', 'AI Video', 'AI & Video', 'Video Generation', 'AI Video Generation'],
  'ai-learning': ['Education', 'Learning', 'Training'],
  'ai-chatbots': ['Conversational AI', 'Chatbots', 'AI Assistant'],
  'email-marketing': ['Email Marketing', 'Marketing Automation', 'Marketing'],
  'seo-tools': ['SEO', 'Marketing Tools', 'SEO Tools'],
  'ai-design': ['AI Design', 'AI Image', 'Design & Visual', 'Design Tools'],
  'ai-voice': ['AI Audio', 'Audio', 'Voice', 'Speech'],
  'productivity': ['Productivity', 'Productivity & Organization', 'Business'],
  'business-intelligence': ['AI Business', 'Business Intelligence', 'Analytics', 'Business & Enterprise'],
  // Accounting-related slugs
  'ai-accounting': ['AI Accounting', 'Accounting', 'Accounting & Finance', 'Finance & Accounting', 'Bookkeeping'],
  'ai-accounting-assistant': ['AI Accounting', 'Accounting', 'Accounting & Finance', 'Finance & Accounting', 'Bookkeeping']
}

/**
 * Returns a stable, de-duplicated list of human category names for a slug.
 * The first item is typically the canonical name derived from the slug.
 */
export function getCategoryNamesForSlug(slug: string): string[] {
  const canonical = slugToCategoryName(slug)
  const synonyms = CATEGORY_SYNONYMS[slug] || []
  const set = new Set<string>()

  // Always include canonical
  if (canonical) set.add(canonical)
  // Include synonyms configured for the slug
  synonyms.forEach(name => {
    const trimmed = (name || '').trim()
    if (trimmed) set.add(trimmed)
  })

  // For labels with ampersand, also include the "and" variant (and vice versa)
  // to cover DB labels that might use one or the other.
  const expanded: string[] = []
  for (const name of set) {
    expanded.push(name)
    if (name.includes('&')) {
      expanded.push(name.replace(/&/g, 'and').replace(/\s{2,}/g, ' ').trim())
    } else if (/\band\b/i.test(name)) {
      expanded.push(name.replace(/\band\b/gi, '&').replace(/\s{2,}/g, ' ').trim())
    }
  }

  // Final de-duplication preserving order
  const finalSet = new Set<string>()
  const finalList: string[] = []
  for (const n of expanded) {
    const key = n.toLowerCase().trim()
    if (n && !finalSet.has(key)) {
      finalSet.add(key)
      finalList.push(n)
    }
  }

  return finalList
}


