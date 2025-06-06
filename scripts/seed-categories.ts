import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  // 📝 CONTENT & WRITING
  {
    name: "Content & Writing",
    slug: "content-writing", 
    icon: "📝",
    children: [
      { name: "AI Copywriting", slug: "ai-copywriting" },
      { name: "Writing Assistants", slug: "writing-assistants" },
      { name: "Creative Writing", slug: "creative-writing" },
      { name: "Blog & SEO Content", slug: "blog-seo-content" },
    ]
  },

  // 🎤 MEETINGS & COMMUNICATION
  {
    name: "Meetings & Communication",
    slug: "meetings-communication",
    icon: "🎤", 
    children: [
      { name: "Meeting Notes & Transcription", slug: "meeting-notes-transcription" },
      { name: "Voice & Speech", slug: "voice-speech" },
      { name: "Video Conferencing Tools", slug: "video-conferencing" },
    ]
  },

  // 📊 PRODUCTIVITY & ORGANIZATION
  {
    name: "Productivity & Organization", 
    slug: "productivity-organization",
    icon: "📊",
    children: [
      { name: "Task Management", slug: "task-management" },
      { name: "Note-taking & Knowledge", slug: "note-taking-knowledge" },
      { name: "Email & Communication", slug: "email-communication" },
      { name: "Calendar & Scheduling", slug: "calendar-scheduling" },
    ]
  },

  // 🎨 DESIGN & VISUAL
  {
    name: "Design & Visual",
    slug: "design-visual", 
    icon: "🎨",
    children: [
      { name: "Presentations", slug: "presentations" },
      { name: "Graphic Design", slug: "graphic-design" },
      { name: "Image Generation", slug: "image-generation" },
      { name: "Video Editing", slug: "video-editing" },
    ]
  },

  // 📱 MARKETING & SOCIAL MEDIA
  {
    name: "Marketing & Social Media",
    slug: "marketing-social-media",
    icon: "📱", 
    children: [
      { name: "Social Media Management", slug: "social-media-management" },
      { name: "Content Scheduling", slug: "content-scheduling" },
      { name: "Analytics & Insights", slug: "analytics-insights" },
      { name: "Ad Creation", slug: "ad-creation" },
    ]
  },

  // 🎵 AUDIO & MUSIC
  {
    name: "Audio & Music",
    slug: "audio-music",
    icon: "🎵",
    children: [
      { name: "Music Generation", slug: "music-generation" },
      { name: "Voice Synthesis", slug: "voice-synthesis" },
      { name: "Audio Editing", slug: "audio-editing" },
      { name: "Podcast Tools", slug: "podcast-tools" },
    ]
  },

  // 💼 BUSINESS & ENTERPRISE
  {
    name: "Business & Enterprise",
    slug: "business-enterprise", 
    icon: "💼",
    children: [
      { name: "HR & People Management", slug: "hr-people-management" },
      { name: "Sales & CRM", slug: "sales-crm" },
      { name: "Data Analysis", slug: "data-analysis" },
      { name: "Automation", slug: "automation" },
    ]
  },

  // 🔧 DEVELOPER & TECHNICAL
  {
    name: "Developer & Technical",
    slug: "developer-technical",
    icon: "🔧", 
    children: [
      { name: "Code Assistants", slug: "code-assistants" },
      { name: "API & Integration", slug: "api-integration" },
      { name: "Infrastructure", slug: "infrastructure" },
    ]
  },

  // 🌐 BROWSING & UTILITIES
  {
    name: "Browsing & Utilities",
    slug: "browsing-utilities",
    icon: "🌐",
    children: [
      { name: "Browsers & Extensions", slug: "browsers-extensions" },
      { name: "Search & Research", slug: "search-research" },
      { name: "General Utilities", slug: "general-utilities" },
    ]
  },
]

async function seedCategories() {
  console.log('🌱 Seeding categories...')

  for (const categoryData of categories) {
    const { children, ...parentData } = categoryData

    // Vytvořit hlavní kategorii
    const parentCategory = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: {},
      create: {
        name: parentData.name,
        slug: parentData.slug,
        icon: parentData.icon,
      },
    })

    console.log(`✅ Created main category: ${parentCategory.name}`)

    // Vytvořit podkategorie
    if (children) {
      for (const childData of children) {
        const childCategory = await prisma.category.upsert({
          where: { slug: childData.slug },
          update: {},
          create: {
            name: childData.name,
            slug: childData.slug,
            parent_id: parentCategory.id,
          },
        })

        console.log(`  ↳ Created subcategory: ${childCategory.name}`)
      }
    }
  }

  console.log('✅ Categories seeded successfully!')
}

async function main() {
  try {
    await seedCategories()
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 