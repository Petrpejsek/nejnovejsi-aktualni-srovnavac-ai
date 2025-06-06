import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapování produktů na vhodné tagy
const productTagMap: { [key: string]: string[] } = {
  'n8n': ['Automation', 'Workflow', 'API Integration', 'No Code', 'Open Source'],
  'Shortwave': ['Email', 'Productivity', 'AI Assistant', 'Gmail', 'Communication'],
  'Workato': ['Automation', 'Integration', 'Enterprise', 'API', 'Workflow'],
  'Huxe AI': ['Music', 'AI', 'Audio', 'Creative', 'Personal Assistant'],
  'LALAL.AI': ['Music', 'Audio Editing', 'AI', 'Stem Separation', 'Creative Tools'],
  'Fireflies.ai': ['Meeting Notes & Transcription', 'AI', 'Voice Recognition', 'Productivity'],
  'Jasper': ['Content Creation', 'AI Writing', 'Marketing', 'Copywriting'],
  'Grammarly': ['Writing', 'Grammar Check', 'Productivity', 'Text Editor'],
  'Any.do': ['Task Management', 'Productivity', 'Calendar', 'Reminders'],
  'Clay': ['Data Analysis', 'AI', 'Business Growth', 'Automation'],
  'Murf AI Voice Generator': ['Voice Synthesis', 'AI Voice Generator', 'Text to Speech'],
  'Notion': ['Productivity', 'Note Taking', 'Database', 'Collaboration'],
  'Zapier': ['Automation', 'Integration', 'Workflow', 'No Code', 'API'],
  'Calendly': ['Scheduling', 'Calendar', 'Productivity', 'Business Tools'],
  'Slack': ['Communication', 'Team Collaboration', 'Messaging', 'Productivity'],
  'Trello': ['Project Management', 'Task Management', 'Collaboration', 'Productivity'],
  'Asana': ['Project Management', 'Task Management', 'Team Collaboration', 'Productivity'],
  'Monday.com': ['Project Management', 'Team Collaboration', 'Workflow', 'Productivity'],
  'Airtable': ['Database', 'Project Management', 'Collaboration', 'No Code'],
  'Canva': ['Design', 'Graphics', 'Creative Tools', 'Templates', 'Visual Content'],
  'Figma': ['Design', 'UI/UX', 'Collaboration', 'Prototyping', 'Graphics'],
  'Adobe': ['Creative Tools', 'Design', 'Video Editing', 'Graphics', 'Photography'],
  'Photoshop': ['Image Editing', 'Graphics', 'Design', 'Photography', 'Creative Tools']
}

async function addMissingTags() {
  try {
    console.log('🔍 Hledám produkty bez tagů...')
    
    // Najdeme všechny produkty a pak je vyfiltrujeme v JavaScriptu
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        tags: true
      }
    })
    
    // Filtrujeme produkty s prázdnými tagy
    const productsWithoutTags = allProducts.filter(product => {
      if (!product.tags) return true // null nebo undefined
      
      try {
        const tagsArray = Array.isArray(product.tags) ? product.tags : JSON.parse(product.tags as string)
        return !Array.isArray(tagsArray) || tagsArray.length === 0
      } catch {
        return true // pokud se nepodaří parsovat, považujeme za prázdné
      }
    })
    
    console.log(`📊 Nalezeno ${productsWithoutTags.length} produktů bez tagů`)
    
    let updatedCount = 0
    
    for (const product of productsWithoutTags) {
      // Zkusíme najít vhodné tagy
      let suggestedTags: string[] = []
      
      // Hledáme přesnou shodu nebo částečnou shodu v názvu
      const productName = product.name.toLowerCase()
      
      for (const [name, tags] of Object.entries(productTagMap)) {
        if (productName.includes(name.toLowerCase()) || name.toLowerCase().includes(productName)) {
          suggestedTags = tags
          break
        }
      }
      
      // Pokud nenajdeme specifické tagy, přidáme obecné na základě názvu
      if (suggestedTags.length === 0) {
        suggestedTags = ['AI', 'Productivity', 'Software']
        
        // Inteligentní přiřazení tagů na základě klíčových slov
        if (productName.includes('ai') || productName.includes('artificial')) {
          suggestedTags = ['AI', 'Machine Learning', 'Automation']
        } else if (productName.includes('write') || productName.includes('content')) {
          suggestedTags = ['Content Creation', 'Writing', 'AI']
        } else if (productName.includes('voice') || productName.includes('speech')) {
          suggestedTags = ['Voice', 'AI', 'Audio']
        } else if (productName.includes('video') || productName.includes('media')) {
          suggestedTags = ['Video', 'Media', 'Creative Tools']
        } else if (productName.includes('data') || productName.includes('analytics')) {
          suggestedTags = ['Data Analysis', 'Analytics', 'Business Intelligence']
        } else if (productName.includes('design') || productName.includes('creative')) {
          suggestedTags = ['Design', 'Creative Tools', 'Graphics']
        } else if (productName.includes('automation') || productName.includes('workflow')) {
          suggestedTags = ['Automation', 'Workflow', 'Productivity']
        }
      }
      
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { tags: JSON.stringify(suggestedTags) }
        })
        
        console.log(`✅ ${product.name}: přidány tagy ${JSON.stringify(suggestedTags)}`)
        updatedCount++
      } catch (error) {
        console.error(`❌ Chyba při aktualizaci ${product.name}:`, error)
      }
    }
    
    console.log(`\n🎯 Hotovo! Aktualizováno ${updatedCount} z ${productsWithoutTags.length} produktů`)
    
  } catch (error) {
    console.error('❌ Chyba při přidávání tagů:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMissingTags() 