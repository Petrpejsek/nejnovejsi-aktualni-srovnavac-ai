const puppeteer = require('puppeteer');
const path = require('path');

async function takeCapCutScreenshot() {
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
      '--disable-geolocation',
      '--disable-web-security'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Nastavení User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Vypnutí JavaScript pro rychlejší načítání
    await page.setJavaScriptEnabled(false);

    // Načtení stránky
    await page.goto('https://www.capcut.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Počkáme na vykreslení
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Pořízení screenshotu
    await page.screenshot({
      path: path.join('admin', 'products', 'capcut', 'images', 'screenshot.png'),
      fullPage: false
    });

    console.log('CapCut screenshot uložen');

  } catch (error) {
    console.error(`Chyba při pořizování screenshotu CapCut: ${error.message}`);
  } finally {
    await browser.close();
  }
}

takeCapCutScreenshot().catch(console.error); 