/**
 * Skript pro opravu problematických produktů v databázi
 * 
 * Tento skript:
 * 1. Najde produkt s ID "8b1ad8a1-5afb-40d4-b11d-48c33b606723", který způsobuje problémy
 * 2. Opraví JSON struktury v tomto produktu
 * 3. Zkontroluje další produkty na problémy s JSON formátem
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixProblematicProducts() {
  console.log('=== OPRAVA PRODUKTŮ: ZAČÁTEK ===');
  
  try {
    // Najdeme problematický produkt
    console.log('Hledám problematický produkt s ID "8b1ad8a1-5afb-40d4-b11d-48c33b606723"...');
    const problematicProduct = await prisma.product.findUnique({
      where: {
        id: '8b1ad8a1-5afb-40d4-b11d-48c33b606723'
      }
    });
    
    if (problematicProduct) {
      console.log('Problematický produkt nalezen:', problematicProduct.name);
      
      // Opravíme JSON pole
      console.log('Opravuji JSON pole produktu...');
      
      // Bezpečné stringifikování JSON - pokud pole již je řetězec, vrátí ho, jinak ho převede na řetězec
      const safeStringify = (field) => {
        if (typeof field === 'string') {
          try {
            // Zkusíme parsovat, zda je to validní JSON
            JSON.parse(field);
            // Pokud ano, vrátíme původní řetězec
            return field;
          } catch (e) {
            // Pokud ne, považujeme to za řetězec, který obalíme do JSON array
            return JSON.stringify([field]);
          }
        } else if (Array.isArray(field)) {
          // Pokud je to pole, převedeme ho na řetězec
          return JSON.stringify(field);
        } else if (field === null || field === undefined) {
          // Pokud je to null/undefined, vrátíme prázdné pole
          return JSON.stringify([]);
        } else {
          // Jiné typy - zkusíme stringifikovat jako je
          return JSON.stringify(field);
        }
      };
      
      // Opravíme produkt
      await prisma.product.update({
        where: {
          id: '8b1ad8a1-5afb-40d4-b11d-48c33b606723'
        },
        data: {
          tags: safeStringify(problematicProduct.tags || []),
          advantages: safeStringify(problematicProduct.advantages || []),
          disadvantages: safeStringify(problematicProduct.disadvantages || []),
          pricingInfo: typeof problematicProduct.pricingInfo === 'string' ? 
                      problematicProduct.pricingInfo : 
                      JSON.stringify(problematicProduct.pricingInfo || {}),
          videoUrls: safeStringify(problematicProduct.videoUrls || [])
        }
      });
      
      console.log('Problematický produkt opraven');
    } else {
      console.log('Problematický produkt nebyl nalezen');
    }
    
    // Zkontrolujeme další produkty na problémy s JSON
    console.log('Kontroluji další produkty na problémy s JSON formátem...');
    const allProducts = await prisma.product.findMany();
    
    let fixedProductsCount = 0;
    
    for (const product of allProducts) {
      let needsUpdate = false;
      const updates = {};
      
      // Funkce pro kontrolu a opravu JSON pole
      const checkAndFixJsonField = (fieldName, defaultValue = []) => {
        if (product[fieldName]) {
          try {
            if (typeof product[fieldName] === 'string') {
              // Zkusíme parsovat JSON
              JSON.parse(product[fieldName]);
              // Pokud se podařilo parsovat, je vše v pořádku
            } else {
              // Pokud to není řetězec, převedeme na JSON řetězec
              updates[fieldName] = JSON.stringify(product[fieldName]);
              needsUpdate = true;
            }
          } catch (e) {
            // Pokud parsování selže, opravíme pole
            console.log(`Problém s polem ${fieldName} u produktu ${product.id} (${product.name})`);
            updates[fieldName] = JSON.stringify(defaultValue);
            needsUpdate = true;
          }
        } else if (product[fieldName] === null) {
          // Pokud je pole null, nastavíme výchozí hodnotu
          updates[fieldName] = JSON.stringify(defaultValue);
          needsUpdate = true;
        }
      };
      
      // Zkontrolujeme všechna JSON pole
      checkAndFixJsonField('tags', []);
      checkAndFixJsonField('advantages', []);
      checkAndFixJsonField('disadvantages', []);
      checkAndFixJsonField('pricingInfo', {});
      checkAndFixJsonField('videoUrls', []);
      
      // Pokud je potřeba aktualizace, provedeme ji
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: updates
        });
        fixedProductsCount++;
      }
    }
    
    console.log(`Celkem opraveno ${fixedProductsCount} dalších produktů`);
    console.log('=== OPRAVA PRODUKTŮ: DOKONČENO ===');
  } catch (error) {
    console.error('Chyba při opravě produktů:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Spustíme opravu
fixProblematicProducts(); 