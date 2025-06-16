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
        
        # 🍪 COOKIES & PRIVACY nastavení pro potlačení bannerů
        self.chrome_options.add_argument('--disable-features=VizDisplayCompositor')
        self.chrome_options.add_argument('--disable-background-timer-throttling')
        self.chrome_options.add_argument('--disable-renderer-backgrounding')
        self.chrome_options.add_argument('--disable-backgrounding-occluded-windows')
        
        # Přednastavené cookies preference
        prefs = {
            "profile.default_content_setting_values": {
                "cookies": 1,
                "notifications": 2,
                "geolocation": 2,
                "media_stream": 2,
            },
            "profile.managed_default_content_settings": {
                "images": 1
            },
            "profile.cookie_controls_mode": 0  # Allow all cookies
        }
        self.chrome_options.add_experimental_option("prefs", prefs)
        
        # User agent pro lepší kompatibilitu
        self.chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Vytvořit screenshots složku
        self.screenshots_dir = os.path.join(os.getcwd(), 'public', 'screenshots')
        os.makedirs(self.screenshots_dir, exist_ok=True)
        
        logger.info(f"✅ ScreenshotService inicializován. Screenshots dir: {self.screenshots_dir}")

    def handle_cookies(self, driver):
        """Pokusí se odkliknout cookies banner s pokročilými strategiemi"""
        
        # 1. FÁZE: Základní selektory pro Accept tlačítka
        basic_selectors = [
            # Nejčastější accept tlačítka
            'button[data-testid="accept-all"]',
            'button[data-testid="cookie-banner-accept"]',
            'button[data-cy="accept-all"]',
            'button[id*="accept"]',
            'button[class*="accept"]',
            'button[class*="consent"]',
            '#cookie-accept',
            '#accept-cookies',
            '.cookie-accept',
            '.consent-accept',
            '.cookies-accept-all',
            
            # Attribute based
            '[data-testid*="accept"]',
            '[data-cy*="accept"]',
            '[aria-label*="accept"]',
            '[title*="accept"]',
            '[data-role="accept"]',
            
            # Text based (musíme použít XPath)
        ]
        
        # 2. FÁZE: Text-based selektory (XPath)
        text_selectors = [
            "//button[contains(text(), 'Accept')]",
            "//button[contains(text(), 'Accept all')]",
            "//button[contains(text(), 'Accept All')]",
            "//button[contains(text(), 'I agree')]",
            "//button[contains(text(), 'Agree')]",
            "//button[contains(text(), 'OK')]",
            "//button[contains(text(), 'Souhlasím')]",
            "//button[contains(text(), 'Přijmout')]",
            "//button[contains(text(), 'Akzeptieren')]",
            "//button[contains(text(), 'Accepter')]",
            "//button[contains(text(), 'Aceptar')]",
            "//a[contains(text(), 'Accept')]",
            "//span[contains(text(), 'Accept')]/parent::button",
            "//div[contains(text(), 'Accept') and contains(@class, 'button')]",
        ]
        
        # 3. FÁZE: Dismiss/Close tlačítka jako fallback
        dismiss_selectors = [
            'button[aria-label*="close"]',
            'button[aria-label*="dismiss"]',
            '.cookie-close',
            '.cookie-dismiss',
            '[data-testid*="close"]',
            '[data-testid*="dismiss"]',
            "//button[contains(text(), 'Close')]",
            "//button[contains(text(), '×')]",
            "//span[contains(text(), '×')]/parent::button",
        ]
        
        logger.info("   🍪 Hledám cookies banner...")
        
        # Strategické čekání - nechme cookies banner se načíst
        time.sleep(2)
        
        # FÁZE 1: Základní CSS selektory
        for selector in basic_selectors:
            try:
                element = driver.find_element(By.CSS_SELECTOR, selector)
                if element.is_displayed() and element.is_enabled():
                    driver.execute_script("arguments[0].click();", element)
                    logger.info(f"   ✅ Cookies přijaty (CSS): {selector}")
                    time.sleep(3)  # Delší čekání na zmizení banneru
                    return True
            except:
                continue
        
        # FÁZE 2: Text-based selektory (XPath)
        for xpath in text_selectors:
            try:
                element = driver.find_element(By.XPATH, xpath)
                if element.is_displayed() and element.is_enabled():
                    driver.execute_script("arguments[0].click();", element)
                    logger.info(f"   ✅ Cookies přijaty (XPath): {xpath}")
                    time.sleep(3)
                    return True
            except:
                continue
        
        # FÁZE 3: Dismiss/Close jako poslední možnost
        for selector in dismiss_selectors:
            try:
                if selector.startswith('//'):
                    element = driver.find_element(By.XPATH, selector)
                else:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    
                if element.is_displayed() and element.is_enabled():
                    driver.execute_script("arguments[0].click();", element)
                    logger.info(f"   ⚠️ Cookies zavřeny (dismiss): {selector}")
                    time.sleep(3)
                    return True
            except:
                continue
        
        # FÁZE 4: Pokročilá detekce - hledej jakékoliv tlačítko v cookies kontejneru
        try:
            # Najdi cookies kontejner
            cookie_containers = [
                '[id*="cookie"]',
                '[class*="cookie"]',
                '[id*="consent"]', 
                '[class*="consent"]',
                '[data-testid*="cookie"]',
                '[data-cy*="cookie"]'
            ]
            
            for container_selector in cookie_containers:
                try:
                    container = driver.find_element(By.CSS_SELECTOR, container_selector)
                    if container.is_displayed():
                        # Najdi první klikatelné tlačítko v kontejneru
                        buttons = container.find_elements(By.TAG_NAME, 'button')
                        for button in buttons:
                            if button.is_displayed() and button.is_enabled():
                                button_text = button.text.lower()
                                # Preferuj accept nad reject
                                if any(word in button_text for word in ['accept', 'agree', 'ok', 'souhlasím']):
                                    driver.execute_script("arguments[0].click();", button)
                                    logger.info(f"   ✅ Cookies přijaty (kontejner): {button_text}")
                                    time.sleep(3)
                                    return True
                except:
                    continue
        except:
            pass
        
        logger.info("   ℹ️ Cookies banner nenalezen nebo neodkliknutelný")
        return False

    def hide_remaining_cookies(self, driver):
        """Agresivní schování všech zbývajících cookies bannerů pomocí CSS"""
        try:
            # CSS selektory pro nejčastější cookies bannery
            hide_selectors = [
                '[id*="cookie"]',
                '[class*="cookie"]',
                '[id*="consent"]',
                '[class*="consent"]',
                '[data-testid*="cookie"]',
                '[data-cy*="cookie"]',
                '[id*="banner"]',
                '[class*="banner"]',
                '[id*="notice"]',
                '[class*="notice"]',
                '[class*="gdpr"]',
                '[id*="gdpr"]',
                '[class*="privacy"]',
                '[id*="privacy"]',
                '.CookieConsent',
                '.cookie-consent',
                '.cookieConsent',
                '.cc-window',
                '.cc-banner',
                '.onetrust-banner-sdk',
                '.ot-sdk-container',
                '.cookiescript_injected',
                '[data-cookiebanner]',
                '[data-cookie-banner]'
            ]
            
            # JavaScript pro schování elementů
            js_hide_code = """
            // Najdi a schovej všechny potenciální cookies bannery
            const selectors = arguments[0];
            let hiddenCount = 0;
            
            selectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        if (element && element.style) {
                            element.style.display = 'none';
                            element.style.visibility = 'hidden';
                            element.style.opacity = '0';
                            element.style.height = '0';
                            element.style.overflow = 'hidden';
                            hiddenCount++;
                        }
                    });
                } catch (e) {}
            });
            
            // Také zkus najít overlay/modal pozadí
            const overlays = document.querySelectorAll('[class*="overlay"], [class*="backdrop"], [class*="modal-backdrop"]');
            overlays.forEach(overlay => {
                if (overlay && overlay.style) {
                    overlay.style.display = 'none';
                    hiddenCount++;
                }
            });
            
            return hiddenCount;
            """
            
            hidden_count = driver.execute_script(js_hide_code, hide_selectors)
            if hidden_count > 0:
                logger.info(f"   🧹 Skryto {hidden_count} potenciálních cookies bannerů")
                time.sleep(1)  # Krátké čekání na aplikování CSS
            
        except Exception as e:
            logger.warning(f"   ⚠️ Chyba při skrývání cookies: {e}")

    def create_screenshot(self, url, filename=None):
        """Vytvoří screenshot webové stránky s optimalizovaným cookies handling"""
        driver = None
        
        try:
            logger.info(f"📸 Vytvářím screenshot: {url}")
            
            # Automatické pojmenování souboru pokud není zadáno
            if not filename:
                domain = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
                timestamp = int(time.time() * 1000)  # Milisekundy pro unique timestamp
                filename = f"{domain}-{timestamp}.png"
            
            # Spustit Chrome driver
            driver = webdriver.Chrome(options=self.chrome_options)
            
            # Nastavit stránku timeout
            driver.set_page_load_timeout(30)
            
            logger.info(f"   🌐 Načítám stránku...")
            driver.get(url)
            
            # Počkat na základní načtení stránky
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Strategické čekání na kompletní načtení
            logger.info(f"   ⏳ Čekám na kompletní načtení (5s)...")
            time.sleep(5)
            
            # PRVNÍ pokus o cookies handling
            logger.info(f"   🍪 Pokus 1/2 o cookies handling...")
            cookies_handled = self.handle_cookies(driver)
            
            # Pokud se cookies nepovedlo odkliknout napoprvé, zkus to znovu po chvíli
            if not cookies_handled:
                logger.info(f"   🍪 Pokus 2/2 o cookies handling (po 3s)...")
                time.sleep(3)
                cookies_handled = self.handle_cookies(driver)
            
            # Finální čekání pro ustálení stránky
            if cookies_handled:
                logger.info(f"   ⏳ Čekám na ustálení po cookies (4s)...")
                time.sleep(4)
            else:
                logger.info(f"   ⏳ Finální čekání (2s)...")
                time.sleep(2)
            
            # AGRESIVNÍ CLEANUP - schovat všechny zbytkové cookies bannery
            logger.info(f"   🧹 Finální cleanup cookies bannerů...")
            self.hide_remaining_cookies(driver)
            
            # Scroll nahoru pro jistotu (někdy se stránka posune)
            driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(1)
            
            # Udělat screenshot
            logger.info(f"   📷 Vytváím screenshot...")
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
                    'cookies_handled': cookies_handled,
                    'url': url,
                    'timestamp': int(time.time())
                }
            else:
                logger.error(f"   ❌ Screenshot se nepodařilo uložit")
                return {'success': False, 'error': 'Screenshot save failed'}
                
        except Exception as e:
            logger.error(f"   ❌ Chyba při screenshot: {e}")
            return {'success': False, 'error': str(e)}
            
        finally:
            if driver:
                try:
                    driver.quit()
                except:
                    pass

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