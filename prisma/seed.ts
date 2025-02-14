import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Vymaže existující data
  await prisma.product.deleteMany();

  // Vytvoří nové produkty
  const products = [
    {
      name: 'ChatGPT',
      description: 'Pokročilý jazykový model pro konverzaci a generování textu',
      price: 20,
      category: 'Chatbot',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=ChatGPT',
      tags: JSON.stringify(['AI', 'Chatbot', 'Generování textu']),
      advantages: JSON.stringify(['Přirozená konverzace', 'Široké znalosti', 'Rychlé odpovědi']),
      disadvantages: JSON.stringify(['Občasné nepřesnosti', 'Omezení délky konverzace', 'Potřeba ověřování faktů']),
      detailInfo: 'ChatGPT je pokročilý jazykový model vyvinutý společností OpenAI. Dokáže vést přirozenou konverzaci, pomáhat s psaním, odpovídat na otázky a řešit různé úkoly.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '20', enterprise: '100' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://chat.openai.com',
      hasTrial: true
    },
    {
      name: 'Claude',
      description: 'Inteligentní AI asistent pro komplexní úkoly a analýzu',
      price: 25,
      category: 'Chatbot',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Claude',
      tags: JSON.stringify(['AI', 'Chatbot', 'Analýza']),
      advantages: JSON.stringify(['Dlouhé konverzace', 'Přesné odpovědi', 'Práce s dokumenty']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Méně kreativní', 'Omezená dostupnost']),
      detailInfo: 'Claude je AI asistent vyvinutý společností Anthropic. Vyniká v dlouhých konverzacích, analýze dokumentů a řešení komplexních úkolů.',
      pricingInfo: JSON.stringify({ basic: '10', pro: '25', enterprise: '150' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://claude.ai',
      hasTrial: false
    },
    {
      name: 'Adobe Firefly',
      description: 'Pokročilý AI nástroj pro generování a úpravu obrázků od společnosti Adobe',
      price: 20,
      category: 'Generování obrázků',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Adobe+Firefly',
      tags: JSON.stringify(['AI', 'Generování obrázků', 'Úprava fotek', 'Adobe']),
      advantages: JSON.stringify(['Vysoká kvalita výstupů', 'Integrace s Adobe produkty', 'Jednoduchý na použití', 'Komerční licence']),
      disadvantages: JSON.stringify(['Některé funkce pouze v placené verzi', 'Vyžaduje Adobe účet', 'Omezený počet generování zdarma']),
      detailInfo: 'Adobe Firefly je revoluční AI nástroj pro generování a úpravu obrázků. Nabízí pokročilé funkce jako generování obrázků z textu, úpravu existujících fotek, změnu stylů a mnoho dalšího. Je plně integrován do Adobe Creative Cloud a nabízí komerční licenci pro vytvořený obsah.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '20', enterprise: 'Custom' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.adobe.com/sensei/generative-ai/firefly.html',
      hasTrial: true
    },
    {
      name: 'Midjourney',
      description: 'Špičkový nástroj pro generování uměleckých obrázků pomocí AI',
      price: 30,
      category: 'Generování obrázků',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Midjourney',
      tags: JSON.stringify(['AI', 'Generování obrázků', 'Umění']),
      advantages: JSON.stringify(['Vysoká umělecká kvalita', 'Aktivní komunita', 'Unikátní styl']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Pouze v Discord prostředí', 'Složitější ovládání']),
      detailInfo: 'Midjourney je AI nástroj pro generování uměleckých obrázků. Vyniká v tvorbě unikátních a esteticky působivých vizuálů.',
      pricingInfo: JSON.stringify({ basic: '10', pro: '30', enterprise: '120' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.midjourney.com',
      hasTrial: true
    },
    {
      name: 'DALL-E',
      description: 'AI model od OpenAI pro generování a editaci obrázků',
      price: 20,
      category: 'Generování obrázků',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=DALL-E',
      tags: JSON.stringify(['AI', 'Generování obrázků', 'OpenAI']),
      advantages: JSON.stringify(['Přesné následování promptů', 'Editace obrázků', 'Intuitivní rozhraní']),
      disadvantages: JSON.stringify(['Omezený počet kreditů', 'Méně umělecký styl', 'Občas nepřesné detaily']),
      detailInfo: 'DALL-E je AI systém od OpenAI pro generování a úpravu obrázků na základě textového popisu.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '20', enterprise: '80' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://openai.com/dall-e-3',
      hasTrial: true
    },
    {
      name: 'Stable Diffusion',
      description: 'Open-source AI model pro generování obrázků',
      price: 0,
      category: 'Generování obrázků',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Stable+Diffusion',
      tags: JSON.stringify(['AI', 'Generování obrázků', 'Open Source']),
      advantages: JSON.stringify(['Zdarma', 'Možnost vlastního hostování', 'Velká komunita']),
      disadvantages: JSON.stringify(['Technicky náročnější', 'Vyžaduje výkonný hardware', 'Méně intuitivní']),
      detailInfo: 'Stable Diffusion je open-source AI model pro generování obrázků, který lze provozovat lokálně nebo využít skrze různé hostované služby.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '0', enterprise: 'Custom' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://stability.ai',
      hasTrial: true
    },
    {
      name: 'Jasper',
      description: 'AI copywriting asistent pro marketingový obsah',
      price: 40,
      category: 'Copywriting',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Jasper',
      tags: JSON.stringify(['AI', 'Copywriting', 'Marketing']),
      advantages: JSON.stringify(['Specializace na marketing', 'Mnoho šablon', 'SEO optimalizace']),
      disadvantages: JSON.stringify(['Vysoká cena', 'Občas opakující se obsah', 'Nutnost kontroly']),
      detailInfo: 'Jasper je AI nástroj specializovaný na tvorbu marketingového obsahu, včetně blogů, reklam a sociálních médií.',
      pricingInfo: JSON.stringify({ basic: '40', pro: '70', enterprise: '200' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.jasper.ai',
      hasTrial: true
    },
    {
      name: 'Copy.ai',
      description: 'AI nástroj pro generování marketingových textů',
      price: 35,
      category: 'Copywriting',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Copy.ai',
      tags: JSON.stringify(['AI', 'Copywriting', 'Marketing']),
      advantages: JSON.stringify(['Jednoduché použití', 'Kvalitní výstupy', 'Mnoho formátů']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Omezení v základní verzi', 'Pouze anglicky']),
      detailInfo: 'Copy.ai pomáhá vytvářet marketingové texty, emaily, produktové popisy a další obsah pomocí AI.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '35', enterprise: '150' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.copy.ai',
      hasTrial: true
    },
    {
      name: 'Grammarly',
      description: 'AI asistent pro kontrolu a vylepšení textu',
      price: 30,
      category: 'Psaní',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Grammarly',
      tags: JSON.stringify(['AI', 'Gramatika', 'Psaní']),
      advantages: JSON.stringify(['Přesná detekce chyb', 'Návrhy vylepšení', 'Multiplatformní']),
      disadvantages: JSON.stringify(['Měsíční předplatné', 'Občas falešné návrhy', 'Omezená podpora češtiny']),
      detailInfo: 'Grammarly je pokročilý AI nástroj pro kontrolu pravopisu, gramatiky a stylistiky textu.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '30', enterprise: '100' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.grammarly.com',
      hasTrial: true
    },
    {
      name: 'Notion AI',
      description: 'AI asistent integrovaný do Notion pro psaní a organizaci',
      price: 15,
      category: 'Produktivita',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Notion+AI',
      tags: JSON.stringify(['AI', 'Produktivita', 'Organizace']),
      advantages: JSON.stringify(['Integrace s Notion', 'Všestranné použití', 'Kontextové pochopení']),
      disadvantages: JSON.stringify(['Vyžaduje Notion', 'Omezený počet tokenů', 'Základní AI funkce']),
      detailInfo: 'Notion AI je integrovaný asistent v Notion, který pomáhá s psaním, sumarizací a organizací informací.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '15', enterprise: '50' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.notion.so',
      hasTrial: true
    },
    {
      name: 'CapCut',
      description: 'Všestranný editor videa s pokročilými AI funkcemi',
      price: 0,
      category: 'Video editace',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=CapCut',
      tags: JSON.stringify(['AI', 'Video editace', 'Sociální sítě']),
      advantages: JSON.stringify(['Zdarma základní verze', 'Snadné použití', 'Pokročilé AI funkce', 'Mobilní i desktop verze']),
      disadvantages: JSON.stringify(['Vodoznak ve free verzi', 'Omezené rozlišení exportu zdarma', 'Některé pokročilé funkce jen v PRO verzi']),
      detailInfo: 'CapCut je moderní video editor s integrovanými AI funkcemi. Nabízí jednoduché rozhraní pro začátečníky i pokročilé funkce pro profesionály. Automatické úpravy, efekty a přechody dělají z CapCutu skvělý nástroj pro tvorbu videí na sociální sítě.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '12', enterprise: 'Custom' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.capcut.com',
      hasTrial: true
    },
    {
      name: 'InVideo',
      description: 'Online platforma pro tvorbu profesionálních videí s pomocí AI',
      price: 15,
      category: 'Video tvorba',
      imageUrl: '/screenshots/invideo.png',
      tags: JSON.stringify(['AI', 'Video tvorba', 'Online nástroj']),
      advantages: JSON.stringify(['Rozsáhlá knihovna šablon', 'Automatické překlady', 'Text na video', 'Cloudové úložiště']),
      disadvantages: JSON.stringify(['Vyžaduje internetové připojení', 'Omezení ve free verzi', 'Složitější pokročilé funkce']),
      detailInfo: 'InVideo je webová platforma pro tvorbu profesionálních videí. Využívá AI pro automatické generování videí z textu, nabízí tisíce šablon a umožňuje snadnou spolupráci v týmu. Vhodné pro marketéry, podnikatele i tvůrce obsahu.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '15', enterprise: '30' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://invideo.io',
      hasTrial: true
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product
    });
  }

  console.log('Seed dokončen!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 