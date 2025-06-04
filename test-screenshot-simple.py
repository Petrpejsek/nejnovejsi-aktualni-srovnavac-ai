#!/usr/bin/env python3
"""
📸 TESTOVACÍ SCRIPT PRO SCREENSHOTS

Testuje screenshot funkcionalitu s cookies handling.
Použije na 5 produktech nejdříve.
"""

import requests
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os

class ScreenshotTester:
    def __init__(self):
        # Chrome options pro headless browser
        self.chrome_options = Options()
        self.chrome_options.add_argument('--headless')
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        self.chrome_options.add_argument('--window-size=1280,720')
        self.chrome_options.add_argument('--disable-gpu')
        
        # Vytvořit screenshots složku
        os.makedirs('screenshots', exist_ok=True)
        
    def get_test_products(self):
        """Získá 5 testovacích produktů z databáze"""
        try:
            response = requests.get('http://localhost:3000/api/products?page=1&pageSize=5')
            response.raise_for_status()
            data = response.json()
            
            products = data.get('products', [])
            # Filtruj produkty s validním externalUrl
            test_products = [
                p for p in products 
                if p.get('externalUrl') and p['externalUrl'].startswith('http')
            ][:5]
            
            print(f"✅ Nalezeno {len(test_products)} testovacích produktů")
            for product in test_products:
                print(f"   - {product['name']}: {product['externalUrl']}")
                
            return test_products
            
        except Exception as e:
            print(f"❌ Chyba při získávání produktů: {e}")
            return []
    
    def handle_cookies(self, driver):
        """Pokusí se odkliknout cookies banner"""
        cookies_selectors = [
            'button[data-testid="accept-all"]',
            'button[id*="accept"]',
            'button[class*="accept"]',
            'button[class*="consent"]',
            'button:contains("Accept")',
            'button:contains("Accept all")',
            'button:contains("I agree")',
            'button:contains("OK")',
            'button:contains("Agree")',
            '[data-cy="accept-all"]',
            '[data-testid="cookie-banner-accept"]',
            '.cookie-accept',
            '.consent-accept',
            '#cookie-accept',
            '#accept-cookies',
            '.cookies-accept-all',
            '[aria-label*="accept"]',
            '[title*="accept"]'
        ]
        
        for selector in cookies_selectors:
            try:
                element = driver.find_element(By.CSS_SELECTOR, selector)
                if element.is_displayed():
                    element.click()
                    print(f"   🍪 Cookies banner kliknuto: {selector}")
                    time.sleep(2)  # Počkat na zmizení banneru
                    return True
            except:
                continue
                
        print("   ℹ️ Cookies banner nenalezen")
        return False
    
    def take_screenshot(self, product):
        """Udělá screenshot produktové stránky"""
        driver = None
        try:
            print(f"\n📸 Screenshot: {product['name']}")
            print(f"   URL: {product['externalUrl']}")
            
            # Spustit Chrome driver
            driver = webdriver.Chrome(options=self.chrome_options)
            driver.get(product['externalUrl'])
            
            # Počkat na načtení stránky
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            time.sleep(3)
            
            # Pokusit se odkliknout cookies
            cookies_handled = self.handle_cookies(driver)
            
            # Udělat screenshot
            filename = f"{product['name'].replace(' ', '_').lower()}_homepage.png"
            filepath = os.path.join('screenshots', filename)
            
            success = driver.save_screenshot(filepath)
            
            if success:
                print(f"   ✅ Screenshot uložen: {filepath}")
                return {
                    'success': True,
                    'filename': filename,
                    'filepath': filepath,
                    'cookies_handled': cookies_handled
                }
            else:
                print(f"   ❌ Screenshot se nepodařilo uložit")
                return {'success': False, 'error': 'Screenshot failed'}
                
        except Exception as e:
            print(f"   ❌ Chyba při screenshot: {e}")
            return {'success': False, 'error': str(e)}
            
        finally:
            if driver:
                driver.quit()
    
    def update_product_screenshot(self, product_id, screenshot_url):
        """Aktualizuje produkt se screenshot URL"""
        try:
            # Poznámka: možná budete muset přidat PUT endpoint do API
            data = {'screenshotUrl': screenshot_url}
            response = requests.put(f'http://localhost:3000/api/products/{product_id}', json=data)
            
            if response.status_code == 200:
                print(f"   ✅ Screenshot URL uloženo do databáze")
                return True
            else:
                print(f"   ⚠️ API update failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   ❌ Chyba při aktualizaci databáze: {e}")
            return False
    
    def run_test(self):
        """Spustí kompletní test screenshots"""
        print("🚀 SCREENSHOT TEST - START")
        print("=" * 50)
        
        # Získat testovací produkty
        products = self.get_test_products()
        if not products:
            print("❌ Žádné produkty k testování")
            return
        
        results = []
        
        # Udělat screenshot pro každý produkt
        for i, product in enumerate(products, 1):
            print(f"\n[{i}/{len(products)}] Zpracovávám: {product['name']}")
            
            screenshot_result = self.take_screenshot(product)
            
            if screenshot_result['success']:
                # Aktualizovat databázi (volitelné)
                screenshot_url = f"/screenshots/{screenshot_result['filename']}"
                db_updated = self.update_product_screenshot(product['id'], screenshot_url)
                
                results.append({
                    'product': product['name'],
                    'success': True,
                    'screenshot': screenshot_result['filename'],
                    'cookies_handled': screenshot_result['cookies_handled'],
                    'db_updated': db_updated
                })
            else:
                results.append({
                    'product': product['name'],
                    'success': False,
                    'error': screenshot_result.get('error', 'Unknown error')
                })
        
        # Finální report
        print("\n" + "=" * 50)
        print("📊 FINÁLNÍ REPORT")
        print("=" * 50)
        
        successful = len([r for r in results if r['success']])
        print(f"✅ Úspěšné: {successful}/{len(results)}")
        print(f"❌ Chybné: {len(results) - successful}/{len(results)}")
        
        print("\n📸 Výsledky:")
        for result in results:
            if result['success']:
                cookies_info = "🍪" if result['cookies_handled'] else "🚫"
                db_info = "💾" if result.get('db_updated') else "⚠️"
                print(f"   ✅ {result['product']} {cookies_info} {db_info}")
                print(f"      Screenshot: {result['screenshot']}")
            else:
                print(f"   ❌ {result['product']}: {result['error']}")
        
        print(f"\n📁 Screenshots uloženy v: ./screenshots/")
        print("🎯 Test dokončen!")

if __name__ == "__main__":
    # Zkontrolovat Chrome driver
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        print("✅ Selenium nainstalován")
    except ImportError:
        print("❌ Selenium není nainstalován. Spusťte: pip install selenium")
        exit(1)
    
    # Spustit test
    tester = ScreenshotTester()
    tester.run_test() 