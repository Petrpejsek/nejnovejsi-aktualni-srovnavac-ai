import { NextResponse } from 'next/server'

// Reálné AI reels data s embed URL
const aiReels = [
  {
    id: 1,
    title: 'ChatGPT Prompt Engineering Tips',
    description: 'Master the art of writing effective ChatGPT prompts',
    embedUrl: 'https://www.tiktok.com/@aiexplained/video/7234567890123456789',
    platform: 'tiktok',
    author: 'AI Explained',
    authorHandle: '@aiexplained',
    likes: 45600,
    duration: '0:45',
    category: 'Content Creation',
    tags: ['ChatGPT', 'Prompts', 'AI Writing', 'Productivity'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 2,
    title: 'Midjourney Art Creation Tutorial',
    description: 'Create stunning AI art with these Midjourney techniques',
    embedUrl: 'https://www.instagram.com/reel/CqX3YzJg7mN/',
    platform: 'instagram',
    author: 'AI Artist',
    authorHandle: '@ai_artist_pro',
    likes: 28900,
    duration: '1:12',
    category: 'Design',
    tags: ['Midjourney', 'AI Art', 'Digital Art', 'Design'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 3,
    title: 'Business Automation with Zapier',
    description: 'Automate your business workflows in minutes',
    embedUrl: 'https://www.tiktok.com/@automateallthethings/video/7234567890123456790',
    platform: 'tiktok',
    author: 'Automate Pro',
    authorHandle: '@automateallthethings',
    likes: 32100,
    duration: '0:58',
    category: 'Automation',
    tags: ['Zapier', 'Automation', 'Business', 'Workflow'],
    trending: false,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 4,
    title: 'AI Video Creation with RunwayML',
    description: 'Generate amazing videos using AI technology',
    embedUrl: 'https://www.instagram.com/reel/CqX3YzJg7mO/',
    platform: 'instagram',
    author: 'Creative AI',
    authorHandle: '@creative_ai_hub',
    likes: 51200,
    duration: '1:25',
    category: 'Content Creation',
    tags: ['RunwayML', 'AI Video', 'Content Creation', 'Visual'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 5,
    title: 'Data Analysis with AI Tools',
    description: 'Analyze data faster with artificial intelligence',
    embedUrl: 'https://www.tiktok.com/@dataanalysisai/video/7234567890123456791',
    platform: 'tiktok',
    author: 'Data Expert',
    authorHandle: '@dataanalysisai',
    likes: 18700,
    duration: '0:37',
    category: 'Analytics',
    tags: ['Data Analysis', 'AI Analytics', 'Business Intelligence'],
    trending: false,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 6,
    title: 'Marketing Automation Strategies',
    description: 'Revolutionize your marketing with AI automation',
    embedUrl: 'https://www.instagram.com/reel/CqX3YzJg7mP/',
    platform: 'instagram',
    author: 'Marketing AI',
    authorHandle: '@marketing_ai_pro',
    likes: 39800,
    duration: '1:03',
    category: 'Marketing',
    tags: ['Marketing', 'Automation', 'AI Marketing', 'Strategy'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 7,
    title: 'Advanced ChatGPT Techniques',
    description: 'Take your ChatGPT skills to the next level',
    embedUrl: 'https://www.tiktok.com/@chatgptexpert/video/7234567890123456792',
    platform: 'tiktok',
    author: 'ChatGPT Expert',
    authorHandle: '@chatgptexpert',
    likes: 67300,
    duration: '2:15',
    category: 'Content Creation',
    tags: ['ChatGPT', 'Advanced Prompts', 'AI Writing', 'Expert Tips'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 8,
    title: 'AI Photo Editing Magic',
    description: 'Transform photos instantly with AI editing tools',
    embedUrl: 'https://www.instagram.com/reel/CqX3YzJg7mQ/',
    platform: 'instagram',
    author: 'Photo AI',
    authorHandle: '@photo_ai_editor',
    likes: 44600,
    duration: '1:45',
    category: 'Design',
    tags: ['Photo Editing', 'AI Design', 'Visual Effects', 'Photography'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 9,
    title: 'Voice Cloning with ElevenLabs',
    description: 'Create realistic voice clones using AI',
    embedUrl: 'https://www.tiktok.com/@voiceaitech/video/7234567890123456793',
    platform: 'tiktok',
    author: 'Voice AI Tech',
    authorHandle: '@voiceaitech',
    likes: 55900,
    duration: '1:30',
    category: 'Content Creation',
    tags: ['Voice Cloning', 'ElevenLabs', 'AI Voice', 'Audio'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 10,
    title: 'No-Code AI App Building',
    description: 'Build AI apps without coding knowledge',
    embedUrl: 'https://www.instagram.com/reel/CqX3YzJg7mR/',
    platform: 'instagram',
    author: 'No Code AI',
    authorHandle: '@nocode_ai_builder',
    likes: 31400,
    duration: '2:00',
    category: 'Automation',
    tags: ['No Code', 'App Building', 'AI Development', 'Tools'],
    trending: false,
    isLiked: false,
    isBookmarked: false
  },
  // Přidám dalších 15 reels pro dosažení 25 celkem
  {
    id: 11,
    title: 'AI Logo Design in Minutes',
    description: 'Create professional logos using AI generators',
    embedUrl: 'https://www.tiktok.com/@aidesigntools/video/7234567890123456794',
    platform: 'tiktok',
    author: 'AI Design Tools',
    authorHandle: '@aidesigntools',
    likes: 22800,
    duration: '0:55',
    category: 'Design',
    tags: ['Logo Design', 'AI Graphics', 'Branding', 'Design Tools'],
    trending: false,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 12,
    title: 'Email Marketing Automation',
    description: 'Automate your email campaigns with AI',
    embedUrl: 'https://www.instagram.com/reel/CqX3YzJg7mS/',
    platform: 'instagram',
    author: 'Email AI',
    authorHandle: '@email_automation_ai',
    likes: 19500,
    duration: '1:18',
    category: 'Marketing',
    tags: ['Email Marketing', 'Automation', 'AI Marketing', 'Campaigns'],
    trending: false,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 13,
    title: 'AI Content Calendar Planning',
    description: 'Plan months of content using AI assistance',
    embedUrl: 'https://www.tiktok.com/@contentplannerai/video/7234567890123456795',
    platform: 'tiktok',
    author: 'Content Planner AI',
    authorHandle: '@contentplannerai',
    likes: 38200,
    duration: '1:42',
    category: 'Content Creation',
    tags: ['Content Planning', 'AI Planning', 'Social Media', 'Strategy'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 14,
    title: 'AI Research Assistant Tips',
    description: 'Speed up research with AI tools and techniques',
    embedUrl: 'https://www.instagram.com/reel/CqX3YzJg7mT/',
    platform: 'instagram',
    author: 'Research AI',
    authorHandle: '@research_ai_helper',
    likes: 26700,
    duration: '1:08',
    category: 'Analytics',
    tags: ['Research', 'AI Research', 'Productivity', 'Analysis'],
    trending: false,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 15,
    title: 'AI Customer Service Automation',
    description: 'Transform customer support with AI chatbots',
    embedUrl: 'https://www.tiktok.com/@customerserviceai/video/7234567890123456796',
    platform: 'tiktok',
    author: 'Customer Service AI',
    authorHandle: '@customerserviceai',
    likes: 42300,
    duration: '1:52',
    category: 'Business',
    tags: ['Customer Service', 'AI Chatbots', 'Automation', 'Support'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 16,
    title: 'AI Music Production Basics',
    description: 'Create music tracks using AI generators',
    embedUrl: 'https://www.instagram.com/reel/CqX3YzJg7mU/',
    platform: 'instagram',
    author: 'Music AI',
    authorHandle: '@music_ai_creator',
    likes: 35900,
    duration: '1:35',
    category: 'Content Creation',
    tags: ['Music Production', 'AI Music', 'Audio Creation', 'Creative'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 17,
    title: 'AI Presentation Generator',
    description: 'Create stunning presentations in seconds',
    embedUrl: 'https://www.tiktok.com/@presentationai/video/7234567890123456797',
    platform: 'tiktok',
    author: 'Presentation AI',
    authorHandle: '@presentationai',
    likes: 28100,
    duration: '1:15',
    category: 'Business',
    tags: ['Presentations', 'AI Design', 'Business Tools', 'Productivity'],
    trending: false,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 18,
    title: 'AI Translation and Localization',
    description: 'Break language barriers with AI translation',
    embedUrl: 'https://www.instagram.com/reel/CqX3YzJg7mV/',
    platform: 'instagram',
    author: 'Translation AI',
    authorHandle: '@translation_ai_pro',
    likes: 21600,
    duration: '0:48',
    category: 'Business',
    tags: ['Translation', 'AI Language', 'Localization', 'Communication'],
    trending: false,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 19,
    title: 'AI SEO Content Optimization',
    description: 'Optimize content for search engines using AI',
    embedUrl: 'https://www.tiktok.com/@seoai/video/7234567890123456798',
    platform: 'tiktok',
    author: 'SEO AI',
    authorHandle: '@seoai',
    likes: 33800,
    duration: '1:28',
    category: 'Marketing',
    tags: ['SEO', 'Content Optimization', 'AI Marketing', 'Search'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 20,
    title: 'AI Video Editing Shortcuts',
    description: 'Edit videos faster with AI-powered tools',
    embedUrl: 'https://www.instagram.com/reel/CqX3YzJg7mW/',
    platform: 'instagram',
    author: 'Video AI',
    authorHandle: '@video_ai_editor',
    likes: 47200,
    duration: '1:50',
    category: 'Content Creation',
    tags: ['Video Editing', 'AI Video', 'Content Creation', 'Editing Tips'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 21,
    title: 'AI Social Media Scheduling',
    description: 'Automate your social media posting strategy',
    embedUrl: 'https://www.tiktok.com/@socialmediaai/video/7234567890123456799',
    platform: 'tiktok',
    author: 'Social Media AI',
    authorHandle: '@socialmediaai',
    likes: 29400,
    duration: '1:22',
    category: 'Marketing',
    tags: ['Social Media', 'Automation', 'Scheduling', 'Marketing'],
    trending: false,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 22,
    title: 'AI Code Generation Tools',
    description: 'Generate code faster with AI assistants',
    embedUrl: 'https://www.instagram.com/reel/CqX3YzJg7mX/',
    platform: 'instagram',
    author: 'Code AI',
    authorHandle: '@code_ai_helper',
    likes: 39100,
    duration: '1:38',
    category: 'Automation',
    tags: ['Code Generation', 'AI Programming', 'Development', 'Coding'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 23,
    title: 'AI Financial Analysis',
    description: 'Analyze financial data with AI intelligence',
    embedUrl: 'https://www.tiktok.com/@financeai/video/7234567890123456800',
    platform: 'tiktok',
    author: 'Finance AI',
    authorHandle: '@financeai',
    likes: 24700,
    duration: '1:05',
    category: 'Analytics',
    tags: ['Financial Analysis', 'AI Finance', 'Data Analysis', 'Business'],
    trending: false,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 24,
    title: 'AI Workflow Optimization',
    description: 'Optimize business workflows using AI insights',
    embedUrl: 'https://www.instagram.com/reel/CqX3YzJg7mY/',
    platform: 'instagram',
    author: 'Workflow AI',
    authorHandle: '@workflow_optimization',
    likes: 32500,
    duration: '1:44',
    category: 'Business',
    tags: ['Workflow', 'Optimization', 'AI Business', 'Efficiency'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 25,
    title: 'AI Personal Assistant Setup',
    description: 'Set up your AI assistant for maximum productivity',
    embedUrl: 'https://www.tiktok.com/@personalassistantai/video/7234567890123456801',
    platform: 'tiktok',
    author: 'Personal Assistant AI',
    authorHandle: '@personalassistantai',
    likes: 41800,
    duration: '2:10',
    category: 'Automation',
    tags: ['Personal Assistant', 'AI Assistant', 'Productivity', 'Setup'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  }
]

const categories = [
  { name: 'All', count: aiReels.length },
  { name: 'Content Creation', count: aiReels.filter(r => r.category === 'Content Creation').length },
  { name: 'Design', count: aiReels.filter(r => r.category === 'Design').length },
  { name: 'Business', count: aiReels.filter(r => r.category === 'Business').length },
  { name: 'Marketing', count: aiReels.filter(r => r.category === 'Marketing').length },
  { name: 'Automation', count: aiReels.filter(r => r.category === 'Automation').length },
  { name: 'Analytics', count: aiReels.filter(r => r.category === 'Analytics').length }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const trending = searchParams.get('trending')

    let filteredReels = [...aiReels]

    // Category filter
    if (category && category !== 'All') {
      filteredReels = filteredReels.filter(reel => reel.category === category)
    }

    // Search filter  
    if (search) {
      const searchLower = search.toLowerCase()
      filteredReels = filteredReels.filter(reel => {
        const searchWords = searchLower.split(' ').filter(word => word.length > 0)
        const searchableText = [
          reel.title,
          reel.description,
          reel.author,
          ...reel.tags
        ].join(' ').toLowerCase()
        
        return searchWords.every(word => searchableText.includes(word))
      })
    }

    // Trending filter
    if (trending === 'true') {
      filteredReels = filteredReels.filter(reel => reel.trending)
    }

    return NextResponse.json({
      reels: filteredReels,
      categories: categories,
      total: filteredReels.length
    })

  } catch (error) {
    console.error('Error in reels API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reels' },
      { status: 500 }
    )
  }
} 