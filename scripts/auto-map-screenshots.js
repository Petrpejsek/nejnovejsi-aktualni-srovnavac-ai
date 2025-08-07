import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Načte všechny screenshoty
const screenshotsDir = path.join(__dirname, '../public/screenshots');
const screenshots = fs.readdirSync(screenshotsDir)
  .filter(file => file.endsWith('.png'))
  .map(file => file.replace('.png', ''));

console.log(`Nalezeno ${screenshots.length} screenshotů`);

// Funkce pro normalizaci názvu produktu
function normalizeProductName(name) {
  return name.toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/[^a-z0-9\s&]/g, '')
    .trim();
}

// Funkce pro normalizaci názvu screenshotu
function normalizeScreenshotName(name) {
  return name.toLowerCase()
    .replace(/_homepage$/, '')
    .replace(/-\d{13}$/, '') // odstraní timestamp
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Funkce pro výpočet podobnosti dvou stringů (Levenshtein distance)
function similarity(a, b) {
  const matrix = [];
  const aLen = a.length;
  const bLen = b.length;

  for (let i = 0; i <= bLen; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= aLen; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLen = Math.max(aLen, bLen);
  return maxLen === 0 ? 1 : (maxLen - matrix[bLen][aLen]) / maxLen;
}

// Funkce pro nalezení nejlepšího screenshotu
function findBestScreenshot(productName) {
  const normalizedProduct = normalizeProductName(productName);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const screenshot of screenshots) {
    const normalizedScreenshot = normalizeScreenshotName(screenshot);
    const score = similarity(normalizedProduct, normalizedScreenshot);
    
    if (score > bestScore && score > 0.6) { // threshold 60% podobnosti
      bestScore = score;
      bestMatch = screenshot + '.png';
    }
  }
  
  return { screenshot: bestMatch, score: bestScore };
}

// Test s několika produkty
const testProducts = [
  'Simplified',
  'Buffer', 
  'Rytr',
  'Harvey',
  'Fellow',
  'Taplio',
  'blender.org - Home of the Blender project - Free and Open 3D Creation Software',
  'Builder.io: Visual Development Platform'
];

console.log('\n=== TEST MAPOVÁNÍ ===');
testProducts.forEach(product => {
  const result = findBestScreenshot(product);
  console.log(`${product} → ${result.screenshot || 'NENALEZEN'} (${Math.round(result.score * 100)}%)`);
});

// Funkce pro export mapování
function generateMapping(productNames) {
  const mapping = {};
  
  productNames.forEach(name => {
    const result = findBestScreenshot(name);
    if (result.screenshot) {
      mapping[name] = result.screenshot;
    }
  });
  
  return mapping;
}

export { findBestScreenshot, generateMapping, screenshots };
