from sqlalchemy.orm import Session
from ..models.database_models import Base, Product, Tag, AffiliateLink
from . import engine, get_db
import uuid

def init_db():
    """Inicializuje databázi a vytvoří tabulky."""
    Base.metadata.create_all(bind=engine)

def add_initial_data(db: Session):
    """Přidá počáteční data do databáze."""
    
    # Kontrola, zda už existují nějaké produkty
    if db.query(Product).first():
        return
    
    # Vytvoření základních tagů
    tags = {
        "chatbot": Tag(name="Chatbot"),
        "ai": Tag(name="AI"),
        "automation": Tag(name="Automatizace"),
        "image": Tag(name="Obrázky"),
        "text": Tag(name="Text"),
        "code": Tag(name="Kód"),
        "free": Tag(name="Zdarma"),
        "paid": Tag(name="Placené")
    }
    
    for tag in tags.values():
        db.add(tag)
    
    # Přidání produktů
    products = [
        {
            "id": str(uuid.uuid4()),
            "title": "ChatGPT",
            "description": "Pokročilý konverzační AI model od OpenAI pro psaní, analýzu a odpovídání na otázky",
            "category": "Chatboti",
            "price": "$20/měsíc",
            "imageUrl": "https://example.com/chatgpt.jpg",
            "externalUrl": "https://chat.openai.com",
            "company": "OpenAI",
            "features": ["Konverzace", "Generování textu", "Analýza"],
            "pros": ["Vysoká kvalita odpovědí", "Široké využití", "Snadné použití"],
            "cons": ["Placená verze", "Občasné výpadky", "Může generovat nepřesnosti"],
            "rating": 4.8,
            "tags": ["chatbot", "ai", "paid"],
            "affiliate": {
                "url": "https://chat.openai.com?ref=findai",
                "provider": "OpenAI",
                "commission": 10.0
            }
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Midjourney",
            "description": "Umělá inteligence pro generování uměleckých obrazů a vizuálů",
            "category": "Obrázky",
            "price": "$25/měsíc",
            "imageUrl": "https://example.com/midjourney.jpg",
            "externalUrl": "https://midjourney.com",
            "company": "Midjourney",
            "features": ["Generování obrazů", "Umělecké styly", "Vysoké rozlišení"],
            "pros": ["Umělecká kvalita", "Unikátní styl", "Aktivní komunita"],
            "cons": ["Pouze placená verze", "Vyžaduje Discord", "Delší čekací doby"],
            "rating": 4.7,
            "tags": ["image", "ai", "paid"],
            "affiliate": {
                "url": "https://midjourney.com?ref=findai",
                "provider": "Midjourney",
                "commission": 15.0
            }
        },
        {
            "id": str(uuid.uuid4()),
            "title": "GitHub Copilot",
            "description": "AI asistent pro programování a psaní kódu",
            "category": "Vývoj",
            "price": "$10/měsíc",
            "imageUrl": "https://example.com/copilot.jpg",
            "externalUrl": "https://github.com/features/copilot",
            "company": "GitHub",
            "features": ["Dokončování kódu", "Generování funkcí", "Multijazyková podpora"],
            "pros": ["Zvýšení produktivity", "Integrace s IDE", "Učí se z kontextu"],
            "cons": ["Měsíční předplatné", "Občas nepřesné návrhy", "Závislost na připojení"],
            "rating": 4.9,
            "tags": ["code", "ai", "paid"],
            "affiliate": {
                "url": "https://github.com/features/copilot?ref=findai",
                "provider": "GitHub",
                "commission": 12.0
            }
        }
    ]
    
    for product_data in products:
        # Vytvoření produktu
        product = Product(
            id=product_data["id"],
            title=product_data["title"],
            description=product_data["description"],
            category=product_data["category"],
            price=product_data["price"],
            imageUrl=product_data["imageUrl"],
            externalUrl=product_data["externalUrl"],
            company=product_data["company"],
            features=product_data["features"],
            pros=product_data["pros"],
            cons=product_data["cons"],
            rating=product_data["rating"],
            tags=product_data["tags"]
        )
        
        # Přidání affiliate odkazu
        affiliate_link = AffiliateLink(
            original_url=product_data["externalUrl"],
            affiliate_url=product_data["affiliate"]["url"],
            provider=product_data["affiliate"]["provider"],
            commission_rate=product_data["affiliate"]["commission"]
        )
        product.affiliate_links = [affiliate_link]
        
        db.add(product)
    
    db.commit()

def init_database():
    """Hlavní funkce pro inicializaci databáze a přidání počátečních dat."""
    init_db()
    db = next(get_db())
    add_initial_data(db)
    db.close() 