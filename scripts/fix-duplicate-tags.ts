import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// BEZPEČNOSTNÍ NASTAVENÍ - změňte na true pro skutečnou opravu
const DRY_RUN = false  // Při true pouze zobrazí změny, ale nic neupraví!

// Funkce pro normalizaci tagů (stejná jako v scrape/route.ts)
function normalizeTag(tag: string): string {
  const normalizedTag = tag.trim().toLowerCase()
  
  // Sjednotíme podobné tagy
  const tagMap: { [key: string]: string } = {
    'text na řeč': 'Text to Speech',
    'text to speech': 'Text to Speech',
    'úprava fotek': 'Image Editing',
    'úprava obrázků': 'Image Editing',
    'generování obrázků': 'Image Generation',
    'generování obrázkú': 'Image Generation',
    'zákaznický servis': 'Customer Support',
    'zákaznická podpora': 'Customer Support',
    'projektové řízení': 'Project Management',
    'projektový management': 'Project Management',
    'avatary': 'Digital Avatars',
    'digitální avatary': 'Digital Avatars',
    'video': 'Video Creation',
    'video tvorba': 'Video Creation',
    'voiceover': 'Text to Speech',
    'writing assistants': 'Writing Assistants',
    'ai writing': 'AI Writing',
    'content generation': 'Content Generation',
    'writing assistant': 'Writing Assistant'
  }

  return tagMap[normalizedTag] || tag.trim()
}

// Funkce pro odstranění duplicitních tagů
function removeDuplicateTags(tags: string[]): string[] {
  const normalizedTags = new Set<string>()
  const uniqueTags: string[] = []
  
  tags.forEach(tag => {
    const normalized = normalizeTag(tag).toLowerCase()
    if (!normalizedTags.has(normalized)) {
      normalizedTags.add(normalized)
      uniqueTags.push(normalizeTag(tag)) // Přidáme normalizovaný tag
    }
  })
  
  return uniqueTags
}

async function fixDuplicateTags() {
  try {
    console.log('🔍 Načítám všechny produkty s tagy...')
    
    if (DRY_RUN) {
      console.log('🛡️  BEZPEČNÝ REŽIM: Pouze zobrazuji změny, nic neupravuji!')
    } else {
      console.log('⚠️  AKTIVNÍ REŽIM: Bude upravovat databázi!')
    }
    
    const products = await prisma.product.findMany({
      where: {
        tags: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        tags: true
      }
    })

    console.log(`📊 Nalezeno ${products.length} produktů s tagy`)

    let wouldFixCount = 0
    let errorCount = 0

    for (const product of products) {
      try {
        // Pokusíme se parsovat tagy
        let tags: string[] = []
        if (product.tags) {
          if (typeof product.tags === 'string') {
            tags = JSON.parse(product.tags)
          } else if (Array.isArray(product.tags)) {
            tags = product.tags
          }
        }

        if (!Array.isArray(tags) || tags.length === 0) {
          continue
        }

        // Odstraníme duplikáty
        const originalCount = tags.length
        const uniqueTags = removeDuplicateTags(tags)
        const newCount = uniqueTags.length

        // Pokud se počet změnil, ukážeme/aktualizujeme produkt
        if (originalCount !== newCount) {
          console.log(`\n🔧 ${DRY_RUN ? 'Našel jsem duplikáty u' : 'Opravuji tagy pro'} ${product.name}:`)
          console.log(`   📝 ID produktu: ${product.id}`)
          console.log(`   📦 Před: ${originalCount} tagů: [${tags.join(', ')}]`)
          console.log(`   ✨ Po: ${newCount} tagů: [${uniqueTags.join(', ')}]`)
          console.log(`   🔢 Odstraněno duplikátů: ${originalCount - newCount}`)

          if (!DRY_RUN) {
            // POUZE pokud není DRY_RUN, provádíme skutečnou změnu
            await prisma.product.update({
              where: { id: product.id },
              data: {
                tags: JSON.stringify(uniqueTags)
              }
            })
            console.log(`   ✅ Uloženo do databáze`)
          } else {
            console.log(`   🛡️  Pouze simulace - nic se nezměnilo`)
          }

          wouldFixCount++
        }
      } catch (error) {
        console.error(`❌ Chyba při zpracování produktu ${product.name}:`, error)
        errorCount++
      }
    }

    console.log('\n🎯 Výsledky analýzy tagů:')
    console.log(`📊 Produktů s duplikáty: ${wouldFixCount}`)
    console.log(`❌ Chyby: ${errorCount}`)
    console.log(`🔍 Celkem zkontrolováno: ${products.length}`)
    
    if (DRY_RUN && wouldFixCount > 0) {
      console.log('\n💡 Pro skutečnou opravu změňte DRY_RUN na false v kódu')
    } else if (!DRY_RUN && wouldFixCount > 0) {
      console.log('\n✅ Všechny duplikátní tagy byly opraveny!')
    } else {
      console.log('\n🎉 Žádné duplikátní tagy nebyly nalezeny!')
    }

  } catch (error) {
    console.error('❌ Kritická chyba při analýze tagů:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Spustit skript
fixDuplicateTags()
  .then(() => {
    console.log('✅ Skript dokončen')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Skript selhal:', error)
    process.exit(1)
  }) 