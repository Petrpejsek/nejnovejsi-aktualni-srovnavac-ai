#!/usr/bin/env node
/**
 * 🔄 BULK SCREENSHOT GENERATOR
 * 
 * Automaticky přidá screenshots ke všem produktům v review queue, které je nemají
 */

const fetch = globalThis.fetch;

class BulkScreenshotService {
  constructor() {
    this.apiBase = 'http://localhost:3000/api';
    this.results = {
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
  }

  async loadReviewQueue() {
    console.log('📋 Načítám produkty z review queue...');
    
    try {
      const response = await fetch(`${this.apiBase}/review-queue`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`API chyba: ${data.error}`);
      }
      
      console.log(`✅ Načteno ${data.products.length} produktů z review queue`);
      return data.products;
      
    } catch (error) {
      console.error('❌ Chyba při načítání review queue:', error.message);
      throw error;
    }
  }

  async regenerateScreenshot(product) {
    try {
      console.log(`   🔄 Generuji screenshot pro: ${product.name}`);
      
      const response = await fetch(`${this.apiBase}/screenshot/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: product.externalUrl,
          productName: product.name
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`   ✅ Screenshot úspěšně vytvořen: ${data.screenshotUrl}`);
        return { success: true, screenshotUrl: data.screenshotUrl };
      } else {
        console.log(`   ❌ Chyba: ${data.error}`);
        return { success: false, error: data.error };
      }
      
    } catch (error) {
      console.log(`   ❌ Network chyba: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async updateProductInQueue(reviewId, screenshotUrl) {
    try {
      const response = await fetch(`${this.apiBase}/review-queue/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          updatedData: { screenshotUrl }
        })
      });

      const data = await response.json();
      return data.success;
      
    } catch (error) {
      console.error(`   ⚠️ Chyba při aktualizaci produktu ${reviewId}:`, error.message);
      return false;
    }
  }

  async processAllProducts() {
    console.log('\n🚀 BULK SCREENSHOT GENERATOR - START');
    console.log('=====================================\n');

    try {
      // 1. Načíst všechny produkty
      const products = await this.loadReviewQueue();
      
      if (products.length === 0) {
        console.log('📭 Review queue je prázdná. Není co zpracovat.');
        return;
      }

      // 2. Filtrovat produkty bez screenshotů
      const productsWithoutScreenshots = products.filter(p => !p.screenshotUrl);
      const productsWithScreenshots = products.filter(p => p.screenshotUrl);

      this.results.total = products.length;
      
      console.log('📊 ANALÝZA REVIEW QUEUE:');
      console.log(`   📦 Celkem produktů: ${products.length}`);
      console.log(`   🖼️  Se screenshoty: ${productsWithScreenshots.length}`);
      console.log(`   🚫 Bez screenshotů: ${productsWithoutScreenshots.length}\n`);

      if (productsWithoutScreenshots.length === 0) {
        console.log('🎉 Všechny produkty už mají screenshots! Není potřeba nic dělat.');
        return;
      }

      // 3. Zpracovat produkty bez screenshotů
      console.log(`🔄 GENEROVÁNÍ SCREENSHOTŮ PRO ${productsWithoutScreenshots.length} PRODUKTŮ:`);
      console.log('='.repeat(60));

      for (let i = 0; i < productsWithoutScreenshots.length; i++) {
        const product = productsWithoutScreenshots[i];
        
        console.log(`\n${i + 1}/${productsWithoutScreenshots.length}. ${product.name}`);
        console.log(`   🔗 URL: ${product.externalUrl}`);
        
        // Generovat screenshot
        const screenshotResult = await this.regenerateScreenshot(product);
        
        this.results.processed++;
        
        if (screenshotResult.success) {
          // Aktualizovat produkt v queue
          const updateSuccess = await this.updateProductInQueue(
            product.reviewId, 
            screenshotResult.screenshotUrl
          );
          
          if (updateSuccess) {
            console.log(`   💾 Produkt aktualizován v review queue`);
            this.results.success++;
          } else {
            console.log(`   ⚠️ Screenshot vytvořen, ale nepodařilo se aktualizovat produkt`);
            this.results.failed++;
            this.results.errors.push({
              product: product.name,
              error: 'Update failed'
            });
          }
        } else {
          this.results.failed++;
          this.results.errors.push({
            product: product.name,
            error: screenshotResult.error
          });
        }

        // Pauza mezi requesty
        if (i < productsWithoutScreenshots.length - 1) {
          console.log('   ⏳ Čekám 2 sekundy...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // 4. Výsledky
      this.printResults();

    } catch (error) {
      console.error('\n❌ KRITICKÁ CHYBA:', error.message);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VÝSLEDKY BULK SCREENSHOT GENEROVÁNÍ');
    console.log('='.repeat(60));
    
    console.log(`📦 Celkem produktů v queue: ${this.results.total}`);
    console.log(`🔄 Zpracováno: ${this.results.processed}`);
    console.log(`✅ Úspěšných: ${this.results.success}`);
    console.log(`❌ Neúspěšných: ${this.results.failed}`);
    
    if (this.results.success > 0) {
      const successRate = Math.round((this.results.success / this.results.processed) * 100);
      console.log(`📈 Úspěšnost: ${successRate}%`);
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n⚠️ CHYBY:');
      this.results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.product}: ${error.error}`);
      });
    }
    
    console.log('\n🎯 Hotovo! Můžete nyní zkontrolovat review queue na:');
    console.log('   http://localhost:3000/admin/url-upload');
  }
}

// Spustit službu
async function main() {
  const service = new BulkScreenshotService();
  await service.processAllProducts();
}

// Kontrola, že screenshot server běží
async function checkScreenshotServer() {
  try {
    const response = await fetch('http://localhost:5000/health');
    if (response.ok) {
      console.log('✅ Screenshot server běží na portu 5000');
      return true;
    }
  } catch (error) {
    console.error('❌ Screenshot server neběží! Spusťte jej příkazem:');
    console.error('   python screenshot-server.py');
    return false;
  }
}

// Kontrola před spuštěním
async function runWithChecks() {
  console.log('🔍 Kontroluji prerekvizity...\n');
  
  const serverRunning = await checkScreenshotServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  console.log('✅ Všechny služby jsou dostupné\n');
  await main();
}

runWithChecks(); 