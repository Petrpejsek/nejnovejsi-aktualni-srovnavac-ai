#!/usr/bin/env node

/**
 * 🔧 SCRIPT PRO OPRAVU CHYBĚJÍCÍCH SCREENSHOTŮ
 * 
 * Najde všechny produkty bez screenshotů nebo s neexistujícími cestami
 * a automaticky vytvoří screenshoty pomocí lokálního screenshot serveru.
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

class ScreenshotFixer {
  constructor() {
    this.results = {
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    }
    this.screenshotServerUrl = 'http://localhost:5000'
  }

  /**
   * Kontrola zda screenshot server běží
   */
  async checkScreenshotServer() {
    try {
      console.log('🔧 Kontroluji screenshot server...')
      const response = await fetch(`${this.screenshotServerUrl}/health`)
      const data = await response.json()
      
      if (data.status === 'healthy') {
        console.log('✅ Screenshot server běží správně')
        return true
      } else {
        console.log('❌ Screenshot server není dostupný')
        return false
      }
    } catch (error) {
      console.log('❌ Screenshot server není spuštěný')
      console.log('💡 Spusťte ho pomocí: ./start-screenshot-server.sh')
      return false
    }
  }

  /**
   * Vytvoří screenshot pro produkt
   */
  async createScreenshot(product) {
    try {
      console.log(`   📸 Vytvářím screenshot pro: ${product.name}`)
      
      const response = await fetch(`${this.screenshotServerUrl}/screenshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: product.externalUrl,
          filename: `${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.png`
        })
      })

      const data = await response.json()
      
      if (data.success) {
        console.log(`   ✅ Screenshot vytvořen: ${data.screenshotUrl}`)
        return { success: true, screenshotUrl: data.screenshotUrl }
      } else {
        console.log(`   ❌ Chyba: ${data.error}`)
        return { success: false, error: data.error }
      }
      
    } catch (error) {
      console.log(`   ❌ Network chyba: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  /**
   * Aktualizuje produkt v databázi s novým screenshotem
   */
  async updateProductScreenshot(productId, screenshotUrl) {
    try {
      await prisma.product.update({
        where: { id: productId },
        data: { imageUrl: screenshotUrl }
      })
      return true
    } catch (error) {
      console.log(`   ❌ Chyba při aktualizaci databáze: ${error.message}`)
      return false
    }
  }

  /**
   * Kontrola zda soubor existuje
   */
  fileExists(imagePath) {
    if (!imagePath) return false
    
    // Pokud je to externí URL, považujeme za existující
    if (imagePath.startsWith('http')) return true
    
    // Pro lokální cesty zkontrolujeme fyzický soubor
    const fullPath = path.join(process.cwd(), 'public', imagePath)
    return fs.existsSync(fullPath)
  }

  /**
   * Najde produkty potřebující screenshoty
   */
  async findProductsNeedingScreenshots() {
    console.log('🔍 Hledám produkty potřebující screenshoty...')
    
    const allProducts = await prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },  // Pouze aktivní produkty
          { externalUrl: { not: null } }  // S externí URL
        ]
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        externalUrl: true
      }
    })

    const productsNeedingScreenshots = allProducts.filter(product => {
      // Pokud nemá imageUrl
      if (!product.imageUrl) return true
      
      // Pokud má imageUrl ale soubor neexistuje
      if (!this.fileExists(product.imageUrl)) return true
      
      return false
    })

    console.log(`📊 Celkem produktů: ${allProducts.length}`)
    console.log(`🎯 Potřebuje screenshoty: ${productsNeedingScreenshots.length}`)
    
    return productsNeedingScreenshots
  }

  /**
   * Zpracuje všechny produkty
   */
  async processAllProducts() {
    console.log('🚀 Spouštím opravu chybějících screenshotů...\n')

    try {
      // 1. Kontrola screenshot serveru
      const serverReady = await this.checkScreenshotServer()
      if (!serverReady) {
        console.log('❌ Nelze pokračovat bez screenshot serveru')
        return
      }

      // 2. Najít produkty potřebující screenshoty
      const products = await this.findProductsNeedingScreenshots()
      
      if (products.length === 0) {
        console.log('🎉 Všechny produkty již mají screenshoty!')
        return
      }

      this.results.total = products.length

      // 3. Zpracovat každý produkt
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        
        console.log(`\n${i + 1}/${products.length}. ${product.name}`)
        console.log(`   🔗 URL: ${product.externalUrl}`)
        
        // Kontrola URL
        if (!product.externalUrl) {
          console.log(`   ⚠️  Produkt nemá externí URL - přeskakuji`)
          this.results.skipped++
          continue
        }

        // Vytvoření screenshotu
        const screenshotResult = await this.createScreenshot(product)
        
        this.results.processed++
        
        if (screenshotResult.success) {
          // Aktualizace databáze
          const updateSuccess = await this.updateProductScreenshot(
            product.id, 
            screenshotResult.screenshotUrl
          )
          
          if (updateSuccess) {
            console.log(`   💾 Databáze aktualizována`)
            this.results.success++
          } else {
            console.log(`   ⚠️  Screenshot vytvořen, ale nepodařilo se aktualizovat databázi`)
            this.results.failed++
            this.results.errors.push({
              product: product.name,
              error: 'Database update failed'
            })
          }
        } else {
          this.results.failed++
          this.results.errors.push({
            product: product.name,
            error: screenshotResult.error
          })
        }

        // Pauza mezi requesty
        if (i < products.length - 1) {
          console.log('   ⏳ Čekám 3 sekundy...')
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      }

      // 4. Výsledky
      this.printResults()

    } catch (error) {
      console.error('\n❌ KRITICKÁ CHYBA:', error.message)
    } finally {
      await prisma.$disconnect()
    }
  }

  /**
   * Zobrazí výsledky
   */
  printResults() {
    console.log('\n' + '='.repeat(50))
    console.log('📊 VÝSLEDKY OPRAVY SCREENSHOTŮ')
    console.log('='.repeat(50))
    console.log(`📋 Celkem produktů: ${this.results.total}`)
    console.log(`⚡ Zpracováno: ${this.results.processed}`)
    console.log(`✅ Úspěšných: ${this.results.success}`)
    console.log(`❌ Neúspěšných: ${this.results.failed}`)
    console.log(`⏭️  Přeskočených: ${this.results.skipped}`)
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ CHYBY:')
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.product}: ${error.error}`)
      })
    }
    
    console.log('\n🎉 Oprava dokončena!')
    
    if (this.results.success > 0) {
      console.log('\n💡 DOPORUČENÍ:')
      console.log('   • Zkontrolujte složku public/screenshots/')
      console.log('   • Ověřte screenshoty na webu')
      console.log('   • Pro produkci zvažte nahrání na CDN')
    }
  }
}

// Spuštění scriptu
async function main() {
  const fixer = new ScreenshotFixer()
  await fixer.processAllProducts()
}

main().catch(console.error) 