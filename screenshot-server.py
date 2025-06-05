#!/usr/bin/env python3
"""
📸 SCREENSHOT SERVER

Jednoduchý Flask server pro vytváření screenshotů webových stránek.
Běží na portu 5000 a komunikuje s Next.js API.

Autor: AI Assistant
"""

from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import time
import logging
from datetime import datetime

# Nastavení logování
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

class ScreenshotService:
    def __init__(self):
        # Chrome options pro headless browser
        self.chrome_options = Options()
        self.chrome_options.add_argument('--headless')
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        self.chrome_options.add_argument('--window-size=1280,720')
        self.chrome_options.add_argument('--disable-gpu')
        self.chrome_options.add_argument('--disable-extensions')
        self.chrome_options.add_argument('--disable-plugins')
        
        # Vytvořit screenshots složku
        self.screenshots_dir = os.path.join(os.getcwd(), 'public', 'screenshots')
        os.makedirs(self.screenshots_dir, exist_ok=True)
        
        logger.info(f"✅ ScreenshotService inicializován. Screenshots dir: {self.screenshots_dir}")

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
                    logger.info(f"   🍪 Cookies banner kliknuto: {selector}")
                    time.sleep(2)  # Počkat na zmizení banneru
                    return True
            except:
                continue
                
        logger.info("   ℹ️ Cookies banner nenalezen")
        return False

    def create_screenshot(self, url, filename=None):
        """Vytvoří screenshot webové stránky"""
        driver = None
        
        try:
            logger.info(f"📸 Vytvářím screenshot: {url}")
            
            # Automatické pojmenování souboru pokud není zadáno
            if not filename:
                domain = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{domain}_{timestamp}.png"
            
            # Spustit Chrome driver
            driver = webdriver.Chrome(options=self.chrome_options)
            driver.get(url)
            
            # Počkat na načtení stránky
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            time.sleep(3)
            
            # Pokusit se odkliknout cookies
            cookies_handled = self.handle_cookies(driver)
            
            # Počkat chvíli po kliknutí na cookies
            if cookies_handled:
                time.sleep(2)
            
            # Udělat screenshot
            filepath = os.path.join(self.screenshots_dir, filename)
            success = driver.save_screenshot(filepath)
            
            if success:
                logger.info(f"   ✅ Screenshot uložen: {filepath}")
                
                # Vrátit relativní URL pro web
                relative_url = f"/screenshots/{filename}"
                
                return {
                    'success': True,
                    'filename': filename,
                    'filepath': filepath,
                    'screenshotUrl': relative_url,
                    'cookies_handled': cookies_handled
                }
            else:
                logger.error(f"   ❌ Screenshot se nepodařilo uložit")
                return {'success': False, 'error': 'Screenshot failed'}
                
        except Exception as e:
            logger.error(f"   ❌ Chyba při screenshot: {e}")
            return {'success': False, 'error': str(e)}
            
        finally:
            if driver:
                driver.quit()

# Inicializace služby
screenshot_service = ScreenshotService()

@app.route('/screenshot', methods=['POST'])
def create_screenshot():
    """API endpoint pro vytvoření screenshotu"""
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({
                'success': False,
                'error': 'URL je povinná'
            }), 400
        
        url = data['url']
        filename = data.get('filename')
        
        logger.info(f"🚀 Požadavek na screenshot: {url}")
        
        result = screenshot_service.create_screenshot(url, filename)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"❌ Chyba v API: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'screenshot-server',
        'screenshots_dir': screenshot_service.screenshots_dir
    })

@app.route('/', methods=['GET'])
def index():
    """Základní info endpoint"""
    return jsonify({
        'service': 'Screenshot Server',
        'version': '1.0',
        'endpoints': {
            'screenshot': 'POST /screenshot',
            'health': 'GET /health'
        },
        'usage': {
            'screenshot': {
                'method': 'POST',
                'body': {
                    'url': 'https://example.com',
                    'filename': 'optional_filename.png'
                }
            }
        }
    })

if __name__ == '__main__':
    logger.info("🚀 Spouštím Screenshot Server na portu 5000...")
    app.run(host='0.0.0.0', port=5000, debug=False) 