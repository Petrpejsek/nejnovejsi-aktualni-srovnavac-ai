#!/usr/bin/env node

/**
 * 📊 KONTROLA STAVU SCREENSHOTŮ
 * 
 * Rychlá analýza kolik produktů má/nemá screenshoty
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function checkScreenshotStatus() {
  console.log('📊 Kontroluji stav screenshotů v databázi...\n')

  try {
    // Načteme všechny aktivní produkty
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        externalUrl: true
      }
    })

    console.log(`📋 Celkem aktivních produktů: ${allProducts.length}`)

    // Kategorizace produktů podle stavu screenshotů
    const stats = {
      total: allProducts.length,
      hasImageUrl: 0,
      noImageUrl: 0,
      existingFiles: 0,
      missingFiles: 0,
      externalUrls: 0,
      noExternalUrl: 0
    }

    const categories = {
      ready: [],        // Má imageUrl a soubor existuje
      missingFile: [],  // Má imageUrl ale soubor neexistuje  
      noImage: [],      // Nemá imageUrl vůbec
      noUrl: []         // Nemá externí URL
    }

    allProducts.forEach(product => {
      // Kontrola externí URL
      if (!product.externalUrl) {
        stats.noExternalUrl++
        categories.noUrl.push(product)
        return
      }
      stats.noExternalUrl = allProducts.length - stats.noExternalUrl

      // Kontrola imageUrl
      if (!product.imageUrl) {
        stats.noImageUrl++
        categories.noImage.push(product)
        return
      }
      
      stats.hasImageUrl++

      // Kontrola existence souboru (pouze pro lokální cesty)
      if (product.imageUrl.startsWith('http')) {
        stats.externalUrls++
        categories.ready.push(product)
      } else {
        const fullPath = path.join(process.cwd(), 'public', product.imageUrl)
        if (fs.existsSync(fullPath)) {
          stats.existingFiles++
          categories.ready.push(product)
        } else {
          stats.missingFiles++
          categories.missingFile.push(product)
        }
      }
    })

    // Výsledky
    console.log('\n' + '='.repeat(60))
    console.log('📊 STATISTIKY SCREENSHOTŮ')
    console.log('='.repeat(60))
    
    console.log(`📋 Celkem produktů: ${stats.total}`)
    console.log(`🔗 S externí URL: ${allProducts.length - stats.noExternalUrl}`)
    console.log(`❌ Bez externí URL: ${stats.noExternalUrl}`)
    
    console.log('\n📸 STAV OBRÁZKŮ:')
    console.log(`✅ Hotové (mají obrázek): ${categories.ready.length}`)
    console.log(`❌ Chybí soubor: ${categories.missingFile.length}`)
    console.log(`🚫 Bez imageUrl: ${categories.noImage.length}`)
    console.log(`⚠️  Bez externí URL: ${categories.noUrl.length}`)

    const needsScreenshots = categories.missingFile.length + categories.noImage.length
    console.log(`\n🎯 POTŘEBUJE SCREENSHOTY: ${needsScreenshots} produktů`)

    // Detaily problematických produktů
    if (categories.missingFile.length > 0) {
      console.log('\n❌ PRODUKTY S CHYBĚJÍCÍMI SOUBORY:')
      categories.missingFile.slice(0, 10).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} → ${product.imageUrl}`)
      })
      if (categories.missingFile.length > 10) {
        console.log(`   ... a dalších ${categories.missingFile.length - 10} produktů`)
      }
    }

    if (categories.noImage.length > 0) {
      console.log('\n🚫 PRODUKTY BEZ IMAGEURL:')
      categories.noImage.slice(0, 10).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`)
      })
      if (categories.noImage.length > 10) {
        console.log(`   ... a dalších ${categories.noImage.length - 10} produktů`)
      }
    }

    if (categories.noUrl.length > 0) {
      console.log('\n⚠️  PRODUKTY BEZ EXTERNÍ URL:')
      categories.noUrl.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`)
      })
      if (categories.noUrl.length > 5) {
        console.log(`   ... a dalších ${categories.noUrl.length - 5} produktů`)
      }
    }

    console.log('\n💡 DOPORUČENÍ:')
    if (needsScreenshots > 0) {
      console.log('   1. Spusťte screenshot server: ./start-screenshot-server.sh')
      console.log('   2. Spusťte opravu: node scripts/fix-missing-screenshots.js')
    } else {
      console.log('   🎉 Všechny produkty mají screenshoty!')
    }

  } catch (error) {
    console.error('❌ Chyba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkScreenshotStatus() 