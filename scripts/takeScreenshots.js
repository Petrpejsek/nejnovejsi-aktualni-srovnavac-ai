const puppeteer = require('puppeteer');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function createProductFolder(productName) {
  const folderName = productName.toLowerCase().replace(/\s+/g, '-');
  const productPath = path.join('admin', 'products', folderName);
  
  try {
    await fs.mkdir(productPath, { recursive: true });
    await fs.mkdir(path.join(productPath, 'images'), { recursive: true });
    await fs.mkdir(path.join(productPath, 'content'), { recursive: true });
    return productPath;
  } catch (error) {
    console.error(`Chyba při vytváření složky pro produkt: ${error.message}`);
    throw error;
  }
}

async function saveProductContent(productPath, productData) {
  try {
    // Uložení informací o produktu do JSON souboru
    await fs.writeFile(
      path.join(productPath, 'product-info.json'),
      JSON.stringify(productData, null, 2),
      'utf8'
    );

    // Vytvoření README.md s popisem produktu
    const readmeContent = `# ${productData.name}

## Popis
${productData.description}

## Kategorie
${productData.category}

## Výhody
${productData.advantages.map(adv => `- ${adv}`).join('\n')}

## Nevýhody
${productData.disadvantages.map(dis => `- ${dis}`).join('\n')}

## Detailní informace
${productData.detailInfo}

## Cenové plány
- Basic: ${productData.pricingInfo.basic}
- Pro: ${productData.pricingInfo.pro}
- Enterprise: ${productData.pricingInfo.enterprise}

## Externí odkaz
${productData.externalUrl}
`;

    await fs.writeFile(
      path.join(productPath, 'README.md'),
      readmeContent,
      'utf8'
    );

  } catch (error) {
    console.error(`Chyba při ukládání obsahu produktu: ${error.message}`);
    throw error;
  }
}

async function takeScreenshot(url, productName) {
  console.log(`Pořizuji screenshot webu: ${url}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-notifications',
      '--disable-geolocation'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Nastavení User-Agent pro lepší kompatibilitu
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Blokování různých pop-upů a reklam
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        request.continue();
      } else {
        const url = request.url().toLowerCase();
        if (url.includes('google-analytics') || 
            url.includes('analytics') || 
            url.includes('tracking') ||
            url.includes('advertisement') ||
            url.includes('cookie') ||
            url.includes('gdpr')) {
          request.abort();
        } else {
          request.continue();
        }
      }
    });

    // Načtení stránky a čekání na její vykreslení
    await page.goto(url, { 
      waitUntil: 'networkidle0', 
      timeout: 60000 
    });
    
    // Skrytí případných cookie lišt a pop-upů pomocí CSS
    await page.evaluate(() => {
      const selectors = [
        '[class*="cookie"]',
        '[id*="cookie"]',
        '[class*="gdpr"]',
        '[id*="gdpr"]',
        '[class*="consent"]',
        '[id*="consent"]',
        '[class*="popup"]',
        '[id*="popup"]',
        '[class*="modal"]',
        '[id*="modal"]'
      ];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if (el) el.style.display = 'none';
        });
      });
    });

    // Počkáme na vykreslení
    await new Promise(resolve => setTimeout(resolve, 3000));

    const folderName = productName.toLowerCase().replace(/\s+/g, '-');
    const screenshotPath = path.join('admin', 'products', folderName, 'images', 'screenshot.png');

    // Pořízení screenshotu
    await page.screenshot({
      path: screenshotPath,
      fullPage: false
    });

    console.log(`Screenshot uložen do: ${screenshotPath}`);

  } catch (error) {
    console.error(`Chyba při pořizování screenshotu: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Seznam produktů s jejich daty
const products = [
  {
    name: "Adobe Firefly",
    description: "Pokročilý AI nástroj pro generování a úpravu obrázků od společnosti Adobe",
    price: 20,
    category: "Generování obrázků",
    tags: ["AI", "Generování obrázků", "Úprava fotek", "Adobe"],
    advantages: [
      "Vysoká kvalita výstupů",
      "Integrace s Adobe produkty",
      "Jednoduchý na použití",
      "Komerční licence"
    ],
    disadvantages: [
      "Některé funkce pouze v placené verzi",
      "Vyžaduje Adobe účet",
      "Omezený počet generování zdarma"
    ],
    detailInfo: "Adobe Firefly je revoluční AI nástroj pro generování a úpravu obrázků. Nabízí pokročilé funkce jako generování obrázků z textu, úpravu existujících fotek, změnu stylů a mnoho dalšího. Je plně integrován do Adobe Creative Cloud a nabízí komerční licenci pro vytvořený obsah.",
    pricingInfo: {
      basic: "0",
      pro: "20",
      enterprise: "Custom"
    },
    externalUrl: "https://www.adobe.com/sensei/generative-ai/firefly.html"
  },
  {
    name: "CapCut",
    description: "Všestranný editor videa s pokročilými AI funkcemi",
    price: 0,
    category: "Video editace",
    tags: ["AI", "Video editace", "Sociální sítě"],
    advantages: [
      "Zdarma základní verze",
      "Snadné použití",
      "Pokročilé AI funkce",
      "Mobilní i desktop verze"
    ],
    disadvantages: [
      "Vodoznak ve free verzi",
      "Omezené rozlišení exportu zdarma",
      "Některé pokročilé funkce jen v PRO verzi"
    ],
    detailInfo: "CapCut je moderní video editor s integrovanými AI funkcemi. Nabízí jednoduché rozhraní pro začátečníky i pokročilé funkce pro profesionály. Automatické úpravy, efekty a přechody dělají z CapCutu skvělý nástroj pro tvorbu videí na sociální sítě.",
    pricingInfo: {
      basic: "0",
      pro: "12",
      enterprise: "Custom"
    },
    externalUrl: "https://www.capcut.com"
  },
  {
    name: "InVideo",
    description: "Online platforma pro tvorbu profesionálních videí s pomocí AI",
    price: 15,
    category: "Video tvorba",
    tags: ["AI", "Video tvorba", "Online nástroj"],
    advantages: [
      "Rozsáhlá knihovna šablon",
      "Automatické překlady",
      "Text na video",
      "Cloudové úložiště"
    ],
    disadvantages: [
      "Vyžaduje internetové připojení",
      "Omezení ve free verzi",
      "Složitější pokročilé funkce"
    ],
    detailInfo: "InVideo je webová platforma pro tvorbu profesionálních videí. Využívá AI pro automatické generování videí z textu, nabízí tisíce šablon a umožňuje snadnou spolupráci v týmu. Vhodné pro marketéry, podnikatele i tvůrce obsahu.",
    pricingInfo: {
      basic: "0",
      pro: "15",
      enterprise: "30"
    },
    externalUrl: "https://invideo.io"
  }
];

// Spuštění pořízení screenshotů a uložení obsahu
async function processAllProducts() {
  for (const product of products) {
    try {
      console.log(`Zpracovávám produkt: ${product.name}`);
      
      // Vytvoření složky pro produkt
      const productPath = await createProductFolder(product.name);
      
      // Uložení obsahu produktu
      await saveProductContent(productPath, product);
      
      // Pořízení screenshotu
      await takeScreenshot(product.externalUrl, product.name);
      
      console.log(`Produkt ${product.name} byl úspěšně zpracován`);
    } catch (error) {
      console.error(`Chyba při zpracování produktu ${product.name}: ${error.message}`);
    }
  }
}

processAllProducts().catch(console.error); 