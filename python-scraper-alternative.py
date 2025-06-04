#!/usr/bin/env python3
"""
🚀 ALTERNATIVNÍ PYTHON SCRAPER PRO PRODUKTY

Tento skript dělá to samé co N8N workflow, ale v Pythonu.
Použijte ho když chcete více kontroly nebo rychlejší zpracování.

Autor: AI Assistant
Datum: 2024
"""

import requests
import json
import time
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass
import asyncio
import aiohttp
from bs4 import BeautifulSoup
import openai
import os
from urllib.parse import urljoin

# Nastavení logování
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class Company:
    name: str
    website: str
    category: str
    product_page_pattern: str

@dataclass
class Product:
    name: str
    description: str
    category: str
    price: float
    advantages: List[str]
    disadvantages: List[str]
    has_trial: bool
    external_url: str
    image_url: str
    tags: List[str]
    detail_info: str
    pricing_info: Dict

class ProductScraper:
    """Hlavní třída pro scrapování produktů"""
    
    def __init__(self, openai_api_key: str, database_api_url: str = "http://localhost:3000/api/products"):
        """
        Inicializace scraperu
        
        Args:
            openai_api_key: API klíč pro OpenAI
            database_api_url: URL pro API databáze produktů
        """
        self.openai_client = openai.OpenAI(api_key=openai_api_key)
        self.database_api_url = database_api_url
        self.session = requests.Session()
        
        # Nastavení headers pro web requests
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        logger.info("✅ ProductScraper inicializován")

    def generate_companies(self, count: int = 50) -> List[Company]:
        """
        Vygeneruje seznam firem pomocí AI
        
        Args:
            count: Počet firem k vygenerování
            
        Returns:
            Seznam Company objektů
        """
        logger.info(f"🤖 Generuji {count} firem pomocí AI...")
        
        prompt = f"""
        You are an expert AI assistant that finds business websites with products/services. 
        Generate a comprehensive list of {count} company websites across various industries including:

        - SaaS tools
        - E-commerce platforms  
        - Digital marketing services
        - Financial technology
        - Healthcare solutions
        - Educational platforms
        - Productivity tools
        - Design & creative tools
        - Automation platforms
        - Analytics tools
        - Communication tools
        - Developer tools
        - Security solutions
        - AI/ML services
        - Consulting services

        For each company, provide:
        1. Company name
        2. Website URL (homepage)
        3. Brief category
        4. Expected product page URL patterns

        Generate exactly {count} companies. Focus on legitimate, active businesses with clear product offerings.
        Return the data in this exact JSON format:

        [
          {{
            "name": "Company Name",
            "website": "https://example.com",
            "category": "SaaS Tools",
            "productPagePattern": "/products OR /solutions OR /services"
          }}
        ]
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that generates business data in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            )
            
            # Extrakce a parsování JSON odpovědi
            content = response.choices[0].message.content
            
            # Odstranění markdown bloků pokud jsou přítomny
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            companies_data = json.loads(content.strip())
            
            companies = [
                Company(
                    name=comp.get('name', 'Unknown'),
                    website=comp.get('website', ''),
                    category=comp.get('category', 'Other'),
                    product_page_pattern=comp.get('productPagePattern', '/products')
                )
                for comp in companies_data
            ]
            
            logger.info(f"✅ Vygenerováno {len(companies)} firem")
            return companies
            
        except Exception as e:
            logger.error(f"❌ Chyba při generování firem: {e}")
            return []

    def fetch_website_content(self, url: str) -> str:
        """
        Stáhne obsah webové stránky
        
        Args:
            url: URL stránky
            
        Returns:
            HTML obsah stránky
        """
        try:
            logger.info(f"🌐 Stahuji: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return response.text[:10000]  # Pouze prvních 10KB pro AI
            
        except Exception as e:
            logger.warning(f"⚠️ Nepodařilo se stáhnout {url}: {e}")
            return ""

    def extract_products_from_content(self, company: Company, html_content: str) -> List[Product]:
        """
        Extrahuje produkty z HTML obsahu pomocí AI
        
        Args:
            company: Informace o firmě
            html_content: HTML obsah stránky
            
        Returns:
            Seznam Product objektů
        """
        if not html_content:
            return []
            
        logger.info(f"🧠 Extrahuji produkty z: {company.name}")
        
        prompt = f"""
        You are an expert web scraper and data extractor. Analyze the provided website HTML and extract detailed product/service information.

        For each product or service found, extract:
        - Product name
        - Description (comprehensive)
        - Category
        - Pricing information 
        - Key features/advantages
        - Disadvantages (if apparent)
        - Trial availability
        - Target URL for more info
        - Company logo/product image URL

        IMPORTANT RULES:
        1. Focus on MAIN products/services, not blog posts or news
        2. Extract 1-3 primary products maximum per website
        3. Write descriptions in English (translate if needed)
        4. Be comprehensive but accurate
        5. If no clear products found, return empty array

        Return data in this exact JSON format:
        [
          {{
            "name": "Product Name",
            "description": "Detailed description of the product/service",
            "category": "Category Name", 
            "price": 0,
            "advantages": ["advantage 1", "advantage 2"],
            "disadvantages": ["disadvantage 1"],
            "hasTrial": true,
            "externalUrl": "https://product-url.com",
            "imageUrl": "https://logo-url.com",
            "tags": ["tag1", "tag2"],
            "detailInfo": "Additional detailed information",
            "pricingInfo": {{
              "type": "subscription",
              "plans": ["free", "pro", "enterprise"]
            }}
          }}
        ]
        
        Company: {company.name}
        Website: {company.website}
        Category: {company.category}
        
        HTML Content:
        {html_content}
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert web scraper that extracts product information in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=3000
            )
            
            content = response.choices[0].message.content
            
            # Čištění JSON odpovědi
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            products_data = json.loads(content.strip())
            
            if not isinstance(products_data, list):
                return []
            
            products = []
            for prod_data in products_data:
                product = Product(
                    name=prod_data.get('name', 'Unknown Product'),
                    description=prod_data.get('description', ''),
                    category=prod_data.get('category', company.category),
                    price=float(prod_data.get('price', 0)),
                    advantages=prod_data.get('advantages', []),
                    disadvantages=prod_data.get('disadvantages', []),
                    has_trial=bool(prod_data.get('hasTrial', False)),
                    external_url=prod_data.get('externalUrl', company.website),
                    image_url=prod_data.get('imageUrl', ''),
                    tags=prod_data.get('tags', []),
                    detail_info=prod_data.get('detailInfo', ''),
                    pricing_info=prod_data.get('pricingInfo', {})
                )
                products.append(product)
            
            logger.info(f"✅ Extrahováno {len(products)} produktů z {company.name}")
            return products
            
        except Exception as e:
            logger.warning(f"⚠️ Chyba při extrakci produktů z {company.name}: {e}")
            return []

    def check_existing_products(self) -> List[str]:
        """
        Získá seznam existujících produktů z databáze
        
        Returns:
            Seznam názvů existujících produktů
        """
        try:
            response = self.session.get(f"{self.database_api_url}?page=1&pageSize=1000")
            response.raise_for_status()
            data = response.json()
            
            if 'products' in data:
                return [prod['name'].lower().strip() for prod in data['products']]
            return []
            
        except Exception as e:
            logger.warning(f"⚠️ Chyba při kontrole existujících produktů: {e}")
            return []

    def is_duplicate(self, product_name: str, existing_products: List[str]) -> bool:
        """
        Zkontroluje zda je produkt duplikát
        
        Args:
            product_name: Název produktu k ověření
            existing_products: Seznam existujících názvů produktů
            
        Returns:
            True pokud je duplikát
        """
        return product_name.lower().strip() in existing_products

    def save_product_to_database(self, product: Product) -> bool:
        """
        Uloží produkt do databáze
        
        Args:
            product: Product objekt k uložení
            
        Returns:
            True pokud úspěšně uloženo
        """
        try:
            data = {
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "category": product.category,
                "imageUrl": product.image_url,
                "externalUrl": product.external_url,
                "hasTrial": product.has_trial,
                "detailInfo": product.detail_info,
                "tags": json.dumps(product.tags),
                "advantages": json.dumps(product.advantages),
                "disadvantages": json.dumps(product.disadvantages),
                "pricingInfo": json.dumps(product.pricing_info),
                "videoUrls": json.dumps([])
            }
            
            response = self.session.post(self.database_api_url, json=data, timeout=30)
            response.raise_for_status()
            
            logger.info(f"✅ Uložen produkt: {product.name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Chyba při ukládání produktu {product.name}: {e}")
            return False

    def run_scraping_batch(self, num_companies: int = 50) -> Dict:
        """
        Spustí kompletní scrapování dávky firem
        
        Args:
            num_companies: Počet firem k zpracování
            
        Returns:
            Statistiky zpracování
        """
        logger.info(f"🚀 Spouštím scrapování {num_companies} firem...")
        
        start_time = time.time()
        stats = {
            "companies_processed": 0,
            "products_found": 0,
            "products_saved": 0,
            "duplicates_skipped": 0,
            "errors": 0,
            "duration": 0
        }
        
        # 1. Generování firem
        companies = self.generate_companies(num_companies)
        if not companies:
            logger.error("❌ Nepodařilo se vygenerovat firmy")
            return stats
        
        # 2. Získání existujících produktů
        existing_products = self.check_existing_products()
        logger.info(f"📊 Nalezeno {len(existing_products)} existujících produktů")
        
        # 3. Zpracování každé firmy
        for i, company in enumerate(companies, 1):
            logger.info(f"🏢 Zpracovávám firmu {i}/{len(companies)}: {company.name}")
            stats["companies_processed"] += 1
            
            try:
                # Stažení obsahu webu
                html_content = self.fetch_website_content(company.website)
                if not html_content:
                    continue
                
                # Extrakce produktů
                products = self.extract_products_from_content(company, html_content)
                stats["products_found"] += len(products)
                
                # Uložení produktů
                for product in products:
                    if self.is_duplicate(product.name, existing_products):
                        stats["duplicates_skipped"] += 1
                        logger.info(f"⏭️ Přeskakuji duplikát: {product.name}")
                        continue
                    
                    if self.save_product_to_database(product):
                        stats["products_saved"] += 1
                        existing_products.append(product.name.lower().strip())
                    else:
                        stats["errors"] += 1
                
                # Pauza mezi requesty
                time.sleep(2)
                
            except Exception as e:
                logger.error(f"❌ Chyba při zpracování {company.name}: {e}")
                stats["errors"] += 1
        
        stats["duration"] = time.time() - start_time
        
        # Finální report
        logger.info("🏁 SCRAPOVÁNÍ DOKONČENO!")
        logger.info(f"📊 Statistiky:")
        logger.info(f"   • Zpracováno firem: {stats['companies_processed']}")
        logger.info(f"   • Nalezeno produktů: {stats['products_found']}")
        logger.info(f"   • Uloženo produktů: {stats['products_saved']}")
        logger.info(f"   • Přeskočeno duplikátů: {stats['duplicates_skipped']}")
        logger.info(f"   • Chyby: {stats['errors']}")
        logger.info(f"   • Doba trvání: {stats['duration']:.1f}s")
        
        return stats

def main():
    """Hlavní funkce pro spuštění scraperu"""
    
    # Konfigurace
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    DATABASE_API_URL = "http://localhost:3000/api/products"
    COMPANIES_PER_BATCH = 50
    
    if not OPENAI_API_KEY:
        logger.error("❌ Nastavte OPENAI_API_KEY environment proměnnou")
        return
    
    # Vytvoření scraperu
    scraper = ProductScraper(
        openai_api_key=OPENAI_API_KEY,
        database_api_url=DATABASE_API_URL
    )
    
    # Spuštění scrapování
    try:
        stats = scraper.run_scraping_batch(COMPANIES_PER_BATCH)
        
        # Uložení statistik
        with open(f"scraping_stats_{int(time.time())}.json", "w") as f:
            json.dump(stats, f, indent=2)
            
    except KeyboardInterrupt:
        logger.info("⏹️ Scrapování přerušeno uživatelem")
    except Exception as e:
        logger.error(f"❌ Kritická chyba: {e}")

if __name__ == "__main__":
    main() 