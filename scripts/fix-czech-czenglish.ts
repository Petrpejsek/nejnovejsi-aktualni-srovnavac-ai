import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This script will fix "Czenglish" products - Czech text without diacritics
async function fixCzenglishProducts() {
  console.log('Starting Czenglish text cleanup...')

  try {
    // Get all products from the database
    const allProducts = await prisma.product.findMany()
    console.log(`Found total of ${allProducts.length} products in database`)

    let updatedCount = 0
    
    // Process each product
    for (const product of allProducts) {
      let needsUpdate = false
      const updatedData: Record<string, string> = {}
      
      // Check all text fields for Czenglish text patterns
      const textFields = ['description', 'tags', 'advantages', 'disadvantages', 'detailInfo', 'pricingInfo']
      
      for (const field of textFields) {
        const text = product[field as keyof typeof product] as string | null
        
        if (text && containsCzenglishText(text)) {
          updatedData[field] = translateCzenglishText(text)
          needsUpdate = true
        }
      }
      
      // Update product if Czenglish text was found
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: updatedData
        })
        updatedCount++
        console.log(`✅ Updated Czenglish to English: ${product.name} (ID: ${product.id})`)
      }
    }
    
    console.log(`✨ Czenglish cleanup complete! Updated ${updatedCount} products to proper English.`)
  } catch (error) {
    console.error('❌ Error updating products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Check if text contains Czenglish patterns (Czech words without diacritics)
function containsCzenglishText(text: string): boolean {
  // Common Czenglish words and patterns
  const czenglishPatterns = [
    'kter[ay]', 'moznost', 'pouziv[aa]', 'nabiz[ei]', 'umoznuj', 'uzivatel', 
    'poskytuj', 'pomoc[ií]', 'pomaha', 'zjednodusuj', 'pristup', 'jednoduch', 
    'intuitivn', 'snadn', 'omezen', 'vyssi', 'zdarma', 'mesicn', 'rocn', 
    'aplikac', 'nastroj', 'funkc', 'sluzb', 'cen[ay]', 'platform', 
    'vytvor[ei]n', 'generovan', 'analyz', 'vcetne', 'behem', 'umel', 
    'inteligenc', 'zpracovan', 'automatick', 'rozhran', 'nabidka', 'kazd',
    'kvalitni', 'dostupn', 'vyuziv[aa]', 'potreb', 'vhodn', 'podle', 'mezi',
    'jako', 'take', 'verze', 'presn', 'diagnostik', 'patolog', 'digitalni',
    'klinicke', 'studie'
  ]
  
  // Check for Czenglish patterns (case insensitive)
  const lowerText = text.toLowerCase()
  for (const pattern of czenglishPatterns) {
    const regex = new RegExp(`\\b${pattern}\\w*\\b`, 'i')
    if (regex.test(lowerText)) {
      return true
    }
  }
  
  return false
}

// Translate Czenglish text to proper English
function translateCzenglishText(text: string): string {
  if (!text) return text
  
  // Extensive dictionary of Czenglish to English translations
  const translations: Record<string, string> = {
    // Common Czenglish words
    'digitalni': 'digital',
    'patologie': 'pathology',
    'patologii': 'pathology',
    'ktera': 'which',
    'ktery': 'which',
    'ktere': 'which',
    'kteri': 'who',
    'pomaha': 'helps',
    'pomahaji': 'help',
    'presnejsi': 'more precise',
    'diagnostikou': 'diagnostics',
    'diagnostiky': 'diagnostics',
    'diagnostika': 'diagnostics',
    'kvantifikaci': 'quantification',
    'biomarkeru': 'biomarkers',
    'podporou': 'support',
    'klinickych': 'clinical',
    'studii': 'studies',
    'studie': 'studies',
    'biomarkery': 'biomarkers',
    'klinicke': 'clinical',
    'onkologie': 'oncology',
    'zvyseni': 'increasing',
    'konzistence': 'consistency',
    'patologicke': 'pathological',
    'using': 'using',
    'automatizace': 'automation',
    'rutinnich': 'routine',
    'casove': 'time',
    'narocnych': 'demanding',
    'ukolu': 'tasks',
    'kvantitativni': 'quantitative',
    'analysis': 'analysis',
    'higher': 'higher',
    'nez': 'than',
    'manualni': 'manual',
    'hodnoceni': 'evaluation',
    'redukce': 'reduction',
    'variability': 'variability',
    'between': 'between',
    'ruznymi': 'different',
    'patology': 'pathologists',
    'vyzkumu': 'research',
    'vyvoje': 'development',
    'leciv': 'medications',
    'prostrednictvim': 'through',
    'stratifikace': 'stratification',
    'pacientu': 'patients',
    'vyzaduje': 'requires',
    'digitalizaci': 'digitization',
    'patologickych': 'pathological',
    'vzorku': 'samples',
    'whole': 'whole',
    'slide': 'slide',
    'imaging': 'imaging',
    'pocatecni': 'initial',
    'investice': 'investment',
    'infrastruktury': 'infrastructure',
    'digitalizace': 'digitization',
    'zavislost': 'dependency',
    'kvalite': 'quality',
    'digitalizovanych': 'digitized',
    'snimku': 'images',
    'regulacni': 'regulatory',
    'omezeni': 'limitations',
    'newhichch': 'some',
    'regionech': 'regions',
    'plne': 'fully',
    'automatizovanou': 'automated',
    'predni': 'leading',
    'oblasti': 'field',
    'vyuziva': 'utilizes',
    'umelou': 'artificial',
    'inteligenci': 'intelligence',
    'transformaci': 'transformation',
    'diagnostickych': 'diagnostic',
    'procesu': 'processes',
    'system': 'system',
    'uses': 'uses',
    'pokrocile': 'advanced',
    'algoritmy': 'algorithms',
    'strojoveho': 'machine',
    'uceni': 'learning',
    'analyze': 'analysis',
    'bunecnych': 'cellular',
    'struktur': 'structures',
    'detekci': 'detection',
    'diagnosticky': 'diagnostically',
    'vyznamnych': 'significant',
    'vzorcu': 'patterns',
    'zameruje': 'focuses',
    'nekolik': 'several',
    'klicovych': 'key',
    'klinickou': 'clinical',
    'asistuje': 'assists',
    'interpretaci': 'interpretation',
    'farmaceuticky': 'pharmaceutical',
    'studiemi': 'studies',
    'akademicky': 'academic',
    'podporuje': 'supports',
    'vedecke': 'scientific',
    'badani': 'research',
    'offers': 'offers',
    'konzistentni': 'consistent',
    'reprodukovatelne': 'reproducible',
    'vysledky': 'results',
    'prekonavaji': 'overcome',
    'limity': 'limits',
    'subjektivniho': 'subjective',
    'manualniho': 'manual',
    'aktivne': 'actively',
    'spolupracuje': 'collaborates',
    'farmaceutickymi': 'pharmaceutical',
    'spolecnostmi': 'companies',
    'companion': 'companion',
    'diagnostics': 'diagnostics',
    'stratifikaci': 'stratification',
    'navrzen': 'designed',
    'as': 'as',
    'asistent': 'assistant',
    'patologa': 'pathologist',
    'zvysuje': 'increases',
    'efektivitu': 'efficiency',
    'nikoliv': 'not',
    'nahrada': 'replacement',
    'lidskeho': 'human',
    'odbornika': 'expert',
    'tiers': 'tiers',
    'name': 'name',
    'clinical': 'clinical',
    'diagnostic': 'diagnostic',
    'solution': 'solution',
    'price': 'price',
    'individualni': 'individual',
    'naceneni': 'pricing',
    'zdravotnicka': 'healthcare',
    'zarizeni': 'facilities',
    'features': 'features',
    'beznou': 'routine',
    'integrace': 'integration',
    'existujicimi': 'existing',
    'laboratornimi': 'laboratory',
    'systemy': 'systems',
    'workflow': 'workflow',
    'druhe': 'second',
    'nazory': 'opinions',
    'konzultace': 'consultations',
    'skoleni': 'training',
    'implementacni': 'implementation',
    'research': 'research',
    'yearly': 'yearly',
    'zavisi': 'depends',
    'rozsahu': 'scope',
    'access': 'access',
    'toolum': 'tools',
    'vyzkumne': 'research',
    'ucely': 'purposes',
    'interpretace': 'interpretation',
    'publikaci': 'publications',
    'prezentaci': 'presentations',
    'customizovane': 'customized',
    'kolaborativni': 'collaborative',
    'vyzkumna': 'research',
    'pharma': 'pharma',
    'partnership': 'partnership',
    'komplexni': 'comprehensive',
    'partnerske': 'partnership',
    'smlouvy': 'contracts',
    'vyvoj': 'development',
    'selekce': 'selection',
    'regulacnimi': 'regulatory',
    'procesy': 'processes',
    'spolecny': 'joint',
    'novych': 'new',
    'reseni': 'solutions',
    'isFree': 'isFree',
    'false': 'false',
    'pro': 'for'
  }
  
  let translatedText = text;
  
  // Replace Czenglish words with English equivalents
  Object.entries(translations).forEach(([czenglish, english]) => {
    // Case insensitive replacement of whole words
    const regex = new RegExp(`\\b${czenglish}\\b`, 'gi');
    translatedText = translatedText.replace(regex, english);
  });
  
  return translatedText;
}

fixCzenglishProducts() 