import { NextResponse } from 'next/server'

// Reálné AI reels data s embed URL
const aiReels = [
  {
    id: 1,
    title: 'AI Automation Tips',
    description: 'Praktické ukázky, jak automatizovat procesy pomocí AI',
    embedUrl: 'https://www.tiktok.com/@automatenation/video/7511848249511136543',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=600&fit=crop&auto=format',
    platform: 'tiktok',
    author: 'Automate Nation',
    authorHandle: '@automatenation',
    likes: 0,
    duration: '1:00',
    category: 'Automation',
    tags: ['Automation','AI','Productivity'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 2,
    title: 'NVIDIA ACE – realtime NPC demo',
    description: 'Umělá inteligence dává NPC realistický hlas a reakce',
    embedUrl: 'https://www.tiktok.com/@nvidia/video/7181377415311899950',
    thumbnailUrl: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=400&h=600&fit=crop&auto=format',
    platform: 'tiktok',
    author: 'NVIDIA',
    authorHandle: '@nvidia',
    likes: 84500,
    duration: '0:55',
    category: 'Technology',
    tags: ['NVIDIA', 'AI Gaming', 'Demo'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 3,
    title: 'Runway Gen-3 Alpha sample',
    description: 'Generativní video z textového promptu v RunwayML',
    embedUrl: 'https://www.instagram.com/reel/C6XMbn9rQ5_/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573496799515-eebbb63815b0?w=400&h=600&fit=crop&auto=format',
    platform: 'instagram',
    author: 'Runway',
    authorHandle: '@runwayml',
    likes: 62300,
    duration: '0:38',
    category: 'Design',
    tags: ['Runway', 'Gen-3', 'Video Generation'],
    trending: true,
    isLiked: false,
    isBookmarked: false
  }
]

const categories = [
  { name: 'All', count: aiReels.length },
  ...Array.from(new Set(aiReels.map(r => r.category))).map(cat => ({
    name: cat,
    count: aiReels.filter(r => r.category === cat).length
  }))
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