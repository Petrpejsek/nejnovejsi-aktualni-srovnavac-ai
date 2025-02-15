import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Nové produkty k přidání
  const newProducts = [
    {
      name: 'GetResponse',
      description: 'Komplexní marketingová platforma s AI funkcemi',
      price: 15,
      category: 'Marketing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=GetResponse',
      tags: JSON.stringify(['AI', 'Email marketing', 'Automatizace']),
      advantages: JSON.stringify(['Kompletní marketingové řešení', 'Snadné použití', 'Pokročilá automatizace']),
      disadvantages: JSON.stringify(['Vyšší cena pro větší seznamy', 'Složitější pokročilé funkce', 'Omezení ve free verzi']),
      detailInfo: 'GetResponse je komplexní marketingová platforma s pokročilými AI funkcemi. Nabízí nástroje pro email marketing, landing pages, webináře a marketing automation. Obsahuje AI asistenta pro tvorbu emailů a copywritingu. Podporuje A/B testování a personalizaci obsahu. Má pokročilé segmentační a analytické nástroje. Umožňuje vytváření automatizovaných marketingových kampaní. Nabízí integraci s e-commerce platformami a CRM systémy. Je vhodný pro malé firmy i velké korporace.',
      pricingInfo: JSON.stringify({
        basic: '15',
        pro: '49',
        enterprise: '99'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.getresponse.com',
      hasTrial: true
    },
    {
      name: 'SEMrush',
      description: 'Komplexní platforma pro SEO a digitální marketing',
      price: 119,
      category: 'Marketing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=SEMrush',
      tags: JSON.stringify(['SEO', 'Marketing', 'Analýza']),
      advantages: JSON.stringify(['Komplexní analýza', 'Pokročilé SEO nástroje', 'Konkurenční analýza']),
      disadvantages: JSON.stringify(['Vysoká cena', 'Složité pro začátečníky', 'Omezení dat v základní verzi']),
      detailInfo: 'SEMrush je komplexní platforma pro SEO a digitální marketing s integrovanými AI funkcemi. Nabízí nástroje pro analýzu klíčových slov, sledování pozic, audit webu a konkurenční analýzu. Obsahuje funkce pro content marketing, PPC reklamu a social media. Využívá AI pro predikci trendů a optimalizaci obsahu.',
      pricingInfo: JSON.stringify({
        basic: '119',
        pro: '229',
        enterprise: '449'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.semrush.com',
      hasTrial: true
    },
    {
      name: 'Anyword',
      description: 'AI copywriting platforma s prediktivním skóre',
      price: 24,
      category: 'Copywriting',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Anyword',
      tags: JSON.stringify(['AI', 'Copywriting', 'Marketing']),
      advantages: JSON.stringify(['Prediktivní analýza', 'Personalizovaný obsah', 'A/B testování']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Omezený počet generování', 'Pouze v angličtině']),
      detailInfo: 'Anyword je pokročilá AI platforma pro copywriting s unikátním prediktivním skóre. Využívá strojové učení pro předpově úspěšnosti textu před publikací. Nabízí personalizované copywritingové nástroje pro různé platformy a formáty.',
      pricingInfo: JSON.stringify({
        basic: '24',
        pro: '74',
        enterprise: 'Custom'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.anyword.com',
      hasTrial: true
    },
    {
      name: 'ProWritingAid',
      description: 'AI nástroj pro kontrolu a vylepšení psaného textu',
      price: 20,
      category: 'Psaní',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=ProWritingAid',
      tags: JSON.stringify(['AI', 'Gramatika', 'Editace']),
      advantages: JSON.stringify(['Detailní analýza', 'Stylistické návrhy', 'Integrace s editory']),
      disadvantages: JSON.stringify(['Složitější rozhraní', 'Pomalejší zpracování', 'Cena ročního předplatného']),
      detailInfo: 'ProWritingAid je komplexní nástroj pro analýzu a vylepšení textu pomocí AI. Nabízí více než 20 různých typů reportů včetně stylistiky, gramatiky a čtivosti.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '20',
        enterprise: '60'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.prowritingaid.com',
      hasTrial: true
    },
    {
      name: 'Writesonic',
      description: 'AI platforma pro generování marketingového obsahu',
      price: 12,
      category: 'Copywriting',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Writesonic',
      tags: JSON.stringify(['AI', 'Copywriting', 'Marketing']),
      advantages: JSON.stringify(['Kvalitní výstupy', 'Mnoho formátů', 'Příznivá cena']),
      disadvantages: JSON.stringify(['Omezení kreditů', 'Občas nepřesné', 'Nutnost úprav']),
      detailInfo: 'Writesonic je výkonná AI platforma pro generování různých typů marketingového obsahu. Specializuje se na tvorbu produktových popisů, blogových článků a reklamních textů.',
      pricingInfo: JSON.stringify({
        basic: '12',
        pro: '45',
        enterprise: '195'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.writesonic.com',
      hasTrial: true
    },
    {
      name: 'Frase',
      description: 'AI platforma pro SEO optimalizaci obsahu',
      price: 44,
      category: 'SEO',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Frase',
      tags: JSON.stringify(['AI', 'SEO', 'Obsahová strategie']),
      advantages: JSON.stringify(['SERP analýza', 'Obsahová optimalizace', 'Automatický výzkum']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Složitější ovládání', 'Omezení v základní verzi']),
      detailInfo: 'Frase je pokročilá AI platforma pro SEO a obsahovou optimalizaci. Automaticky analyzuje SERP a vytváří obsahové briefy na základě nejlépe hodnocených výsledků.',
      pricingInfo: JSON.stringify({
        basic: '44',
        pro: '114',
        enterprise: '199'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.frase.io',
      hasTrial: true
    },
    {
      name: 'QuillBot',
      description: 'AI nástroj pro přepisování a vylepšování textu',
      price: 9,
      category: 'Psaní',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=QuillBot',
      tags: JSON.stringify(['AI', 'Parafráze', 'Gramatika']),
      advantages: JSON.stringify(['Snadné použití', 'Různé styly přepisu', 'Gramatická kontrola']),
      disadvantages: JSON.stringify(['Omezení ve free verzi', 'Občas nepřirozené přepisy', 'Pouze v angličtině']),
      detailInfo: 'QuillBot je všestranný AI nástroj pro přepisování a vylepšování textu. Nabízí sedm různých módů parafráze pro různé styly psaní.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '9',
        enterprise: '20'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.quillbot.com',
      hasTrial: true
    },
    {
      name: 'Longshot',
      description: 'AI platforma pro tvorbu dlouhých článků a obsahu',
      price: 29,
      category: 'Copywriting',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Longshot',
      tags: JSON.stringify(['AI', 'Dlouhý obsah', 'SEO']),
      advantages: JSON.stringify(['Specializace na dlouhý obsah', 'SEO optimalizace', 'Výzkum témat']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Delší zpracování', 'Složitější nastavení']),
      detailInfo: 'Longshot je specializovaná AI platforma pro tvorbu dlouhých, SEO optimalizovaných článků. Využívá pokročilé algoritmy pro generování strukturovaného obsahu.',
      pricingInfo: JSON.stringify({
        basic: '29',
        pro: '59',
        enterprise: '119'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.longshot.ai',
      hasTrial: true
    },
    {
      name: 'GetGenie',
      description: 'AI asistent pro WordPress a SEO optimalizaci',
      price: 12,
      category: 'SEO',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=GetGenie',
      tags: JSON.stringify(['AI', 'WordPress', 'SEO']),
      advantages: JSON.stringify(['WordPress integrace', 'SEO optimalizace', 'Snadné použití']),
      disadvantages: JSON.stringify(['Pouze pro WordPress', 'Omezené funkce zdarma', 'Nový produkt']),
      detailInfo: 'GetGenie je specializovaný AI asistent pro WordPress s důrazem na SEO optimalizaci. Nabízí přímou integraci do WordPress editoru pro snadnou tvorbu obsahu.',
      pricingInfo: JSON.stringify({
        basic: '12',
        pro: '25',
        enterprise: '49'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.getgenie.ai',
      hasTrial: true
    },
    {
      name: 'Scalenut',
      description: 'AI platforma pro obsahovou strategii a SEO',
      price: 39,
      category: 'SEO',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Scalenut',
      tags: JSON.stringify(['AI', 'SEO', 'Obsahová strategie']),
      advantages: JSON.stringify(['Komplexní SEO řešení', 'Obsahová analýza', 'Konkurenční výzkum']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Složitější pro začátečníky', 'Omezení v základní verzi']),
      detailInfo: 'Scalenut je komplexní AI platforma pro obsahovou strategii a SEO optimalizaci. Nabízí pokročilé nástroje pro výzkum klíčových slov a analýzu SERP.',
      pricingInfo: JSON.stringify({
        basic: '39',
        pro: '79',
        enterprise: '159'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.scalenut.com',
      hasTrial: true
    },
    {
      name: 'AISEO',
      description: 'AI nástroj pro automatické SEO copywriting',
      price: 19,
      category: 'SEO',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=AISEO',
      tags: JSON.stringify(['AI', 'SEO', 'Copywriting']),
      advantages: JSON.stringify(['Automatická optimalizace', 'Rychlé generování', 'Více jazyků']),
      disadvantages: JSON.stringify(['Omezený počet slov', 'Kvalita vs. kvantita', 'Základní funkce']),
      detailInfo: 'AISEO je specializovaný AI nástroj pro automatické generování SEO optimalizovaného obsahu. Využívá pokročilé algoritmy pro analýzu klíčových slov a SERP.',
      pricingInfo: JSON.stringify({
        basic: '19',
        pro: '39',
        enterprise: '79'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.aiseo.ai',
      hasTrial: true
    },
    {
      name: 'Hypotenuse',
      description: 'AI platforma pro e-commerce obsah a produktové popisy',
      price: 29,
      category: 'E-commerce',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Hypotenuse',
      tags: JSON.stringify(['AI', 'E-commerce', 'Produktový obsah']),
      advantages: JSON.stringify(['Specializace na e-commerce', 'Bulk generování', 'Multijazyčnost']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Omezení kategorií', 'Specifické použití']),
      detailInfo: 'Hypotenuse je AI platforma specializovaná na tvorbu e-commerce obsahu a produktových popisů. Nabízí pokročilé funkce pro hromadné generování produktových popisů.',
      pricingInfo: JSON.stringify({
        basic: '29',
        pro: '59',
        enterprise: '499'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.hypotenuse.ai',
      hasTrial: true
    },
    {
      name: 'Bertha',
      description: 'AI copywriting asistent pro WordPress',
      price: 19,
      category: 'Copywriting',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Bertha',
      tags: JSON.stringify(['AI', 'WordPress', 'Copywriting']),
      advantages: JSON.stringify(['WordPress integrace', 'Jednoduchý interface', 'Přímé použití v editoru']),
      disadvantages: JSON.stringify(['Pouze pro WordPress', 'Omezený počet generování', 'Základní funkce']),
      detailInfo: 'Bertha je specializovaný AI copywriting asistent přímo integrovaný do WordPress. Nabízí více než 20 typů obsahových šablon pro různé účely.',
      pricingInfo: JSON.stringify({
        basic: '19',
        pro: '39',
        enterprise: '99'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.bertha.ai',
      hasTrial: true
    },
    {
      name: 'vidIQ',
      description: 'AI nástroj pro optimalizaci YouTube obsahu',
      price: 7,
      category: 'Video marketing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=vidIQ',
      tags: JSON.stringify(['AI', 'YouTube', 'Video optimalizace']),
      advantages: JSON.stringify(['YouTube analýza', 'Konkurenční výzkum', 'SEO nástroje']),
      disadvantages: JSON.stringify(['Omezení ve free verzi', 'Zaměření pouze na YouTube', 'Složitější funkce']),
      detailInfo: 'vidIQ je komplexní AI nástroj pro optimalizaci a růst na YouTube. Nabízí pokročilou analýzu klíčových slov a trendů.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '7',
        enterprise: '39'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.vidiq.com',
      hasTrial: true
    },
    {
      name: 'TubeBuddy',
      description: 'AI asistent pro růst na YouTube',
      price: 9,
      category: 'Video marketing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=TubeBuddy',
      tags: JSON.stringify(['AI', 'YouTube', 'Marketing']),
      advantages: JSON.stringify(['Komplexní nástroje', 'A/B testování', 'Analýza trendů']),
      disadvantages: JSON.stringify(['Placené pokročilé funkce', 'Pouze YouTube', 'Učící křivka']),
      detailInfo: 'TubeBuddy je pokročilý AI asistent pro optimalizaci a růst YouTube kanálů. Nabízí nástroje pro výzkum klíčových slov a tagů.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '9',
        enterprise: '49'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.tubebuddy.com',
      hasTrial: true
    },
    {
      name: 'Descript',
      description: 'Pokročilý editor videa a audia s AI funkcemi',
      price: 15,
      category: 'Video editace',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Descript',
      tags: JSON.stringify(['AI', 'Video editace', 'Audio editace']),
      advantages: JSON.stringify(['Editace pomocí textu', 'Pokročilé AI funkce', 'Intuitivní rozhraní']),
      disadvantages: JSON.stringify(['Vyšší nároky na hardware', 'Omezení ve free verzi', 'Složitější funkce']),
      detailInfo: 'Descript je revoluční nástroj pro editaci videa a audia, který umožňuje upravovat obsah stejně jako textový dokument. Nabízí pokročilé AI funkce jako odstranění výplňových slov a automatické titulky.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '15',
        enterprise: '30'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.descript.com',
      hasTrial: true
    },
    {
      name: 'Synthesia',
      description: 'AI platforma pro tvorbu video prezentací s avatary',
      price: 30,
      category: 'Video tvorba',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Synthesia',
      tags: JSON.stringify(['AI', 'Video tvorba', 'Digitální avatary']),
      advantages: JSON.stringify(['Profesionální avatary', 'Mnoho jazyků', 'Rychlá tvorba']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Omezený výběr avatarů', 'Občas strojový projev']),
      detailInfo: 'Synthesia umožňuje vytvářet profesionální videa s AI avatary, kteří mluví ve více než 120 jazycích. Ideální pro firemní prezentace, e-learning a marketingový obsah.',
      pricingInfo: JSON.stringify({
        basic: '30',
        pro: '90',
        enterprise: 'Custom'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.synthesia.io',
      hasTrial: true
    },
    {
      name: 'Murf',
      description: 'AI nástroj pro tvorbu voiceoverů',
      price: 20,
      category: 'Audio',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Murf',
      tags: JSON.stringify(['AI', 'Text to Speech', 'Audio']),
      advantages: JSON.stringify(['Přirozené hlasy', 'Mnoho jazyků', 'Snadné použití']),
      disadvantages: JSON.stringify(['Omezení ve free verzi', 'Některé hlasy znějí roboticky', 'Cena za delší nahrávky']),
      detailInfo: 'Murf nabízí AI hlasy pro tvorbu voiceoverů, podcastů a video prezentací. Obsahuje více než 120 přirozně znějících hlasů v různých jazycích a přízvucích.',
      pricingInfo: JSON.stringify({
        basic: '20',
        pro: '40',
        enterprise: '80'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.murf.ai',
      hasTrial: true
    },
    {
      name: 'AI Studios',
      description: 'Profesionální platforma pro tvorbu AI videí',
      price: 29,
      category: 'Video tvorba',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=AI+Studios',
      tags: JSON.stringify(['AI', 'Video', 'Produkce']),
      advantages: JSON.stringify(['Vysoká kvalita', 'Komplexní řešení', 'Profesionální výstup']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Složitější ovládání', 'Delší renderování']),
      detailInfo: 'AI Studios poskytuje komplexní řešení pro tvorbu profesionálních videí pomocí umělé inteligence. Nabízí pokročilé funkce pro video produkci a postprodukci.',
      pricingInfo: JSON.stringify({
        basic: '29',
        pro: '79',
        enterprise: '199'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.aistudios.com',
      hasTrial: true
    },
    {
      name: 'Creatify',
      description: 'AI nástroj pro automatizaci kreativní tvorby',
      price: 19,
      category: 'Kreativní tvorba',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Creatify',
      tags: JSON.stringify(['AI', 'Kreativa', 'Automatizace']),
      advantages: JSON.stringify(['Rychlá tvorba', 'Různé formáty', 'Intuitivní rozhraní']),
      disadvantages: JSON.stringify(['Omezená customizace', 'Základní funkce', 'Měsíční limit']),
      detailInfo: 'Creatify automatizuje proces kreativní tvorby pomocí AI. Umožňuje rychle vytvářet vizuální obsah pro různé platformy a účely.',
      pricingInfo: JSON.stringify({
        basic: '19',
        pro: '39',
        enterprise: '99'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://creatify.ai',
      hasTrial: true
    },
    {
      name: 'Browse AI',
      description: 'AI nástroj pro automatizaci webového výzkumu',
      price: 49,
      category: 'Automatizace',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Browse+AI',
      tags: JSON.stringify(['AI', 'Web scraping', 'Automatizace']),
      advantages: JSON.stringify(['Bez programování', 'Pravidelné aktualizace', 'API přístup']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Technická náročnost', 'Omezení rychlosti']),
      detailInfo: 'Browse AI umožňuje automatizovat sběr dat z webu bez nutnosti programování. Nabízí pokročilé funkce pro monitoring a extrakci dat.',
      pricingInfo: JSON.stringify({
        basic: '49',
        pro: '99',
        enterprise: '249'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.browse.ai',
      hasTrial: true
    },
    {
      name: 'Reclaim AI',
      description: 'AI asistent pro správu času a kalendáře',
      price: 15,
      category: 'Produktivita',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Reclaim+AI',
      tags: JSON.stringify(['AI', 'Kalendář', 'Produktivita']),
      advantages: JSON.stringify(['Automatické plánování', 'Inteligentní optimalizace', 'Integrace s kalendáři']),
      disadvantages: JSON.stringify(['Učící křivka', 'Omezení v základní verzi', 'Vyžaduje přístup ke kalendáři']),
      detailInfo: 'Reclaim AI je inteligentní asistent pro správu času, který automaticky optimalizuje váš kalendář a pomáhá najít čas na důležité úkoly.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '15',
        enterprise: '40'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://help.reclaim.ai',
      hasTrial: true
    },
    {
      name: 'Authority Hacker',
      description: 'AI platforma pro SEO a obsahový marketing',
      price: 99,
      category: 'Marketing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Authority+Hacker',
      tags: JSON.stringify(['AI', 'SEO', 'Marketing']),
      advantages: JSON.stringify(['Komplexní nástroje', 'Ověřené strategie', 'Detailní analýzy']),
      disadvantages: JSON.stringify(['Vysoká cena', 'Složité pro začátečníky', 'Časová náročnost']),
      detailInfo: 'Authority Hacker poskytuje pokročilé nástroje a strategie pro budování autoritativních webů a obsahový marketing s využitím AI.',
      pricingInfo: JSON.stringify({
        basic: '99',
        pro: '199',
        enterprise: '499'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://authorityhacker.com',
      hasTrial: true
    },
    {
      name: 'Scaleo',
      description: 'AI platforma pro affiliate marketing',
      price: 49,
      category: 'Marketing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Scaleo',
      tags: JSON.stringify(['AI', 'Affiliate', 'Marketing']),
      advantages: JSON.stringify(['Pokročilé sledování', 'Fraud detekce', 'Real-time statistiky']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Komplexní nastavení', 'Technická náročnost']),
      detailInfo: 'Scaleo je moderní platforma pro affiliate marketing s AI funkcemi pro optimalizaci kampaní a detekci podvodů.',
      pricingInfo: JSON.stringify({
        basic: '49',
        pro: '149',
        enterprise: '449'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://scaleo.io',
      hasTrial: true
    },
    {
      name: 'Mailchimp',
      description: 'AI-powered email marketing platforma',
      price: 13,
      category: 'Marketing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Mailchimp',
      tags: JSON.stringify(['AI', 'Email marketing', 'Automatizace']),
      advantages: JSON.stringify(['Snadné použití', 'Pokročilá automatizace', 'Integrace']),
      disadvantages: JSON.stringify(['Dražší pro větší seznamy', 'Omezené A/B testování', 'Základní šablony']),
      detailInfo: 'Mailchimp nabízí komplexní řešení pro email marketing s AI funkcemi pro personalizaci a optimalizaci kampaní.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '13',
        enterprise: '299'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.mailchimp.com',
      hasTrial: true
    },
    {
      name: 'Referral AI',
      description: 'AI platforma pro referral marketing',
      price: 29,
      category: 'Marketing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Referral+AI',
      tags: JSON.stringify(['AI', 'Referral', 'Marketing']),
      advantages: JSON.stringify(['Automatizace referralů', 'Personalizace', 'Analytics']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Omezené integrace', 'Složitější nastavení']),
      detailInfo: 'Referral AI automatizuje a optimalizuje referral programy pomocí umělé inteligence pro maximální efektivitu.',
      pricingInfo: JSON.stringify({
        basic: '29',
        pro: '79',
        enterprise: '199'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.referral-ai.com',
      hasTrial: true
    },
    {
      name: 'Rytr',
      description: 'AI copywriting asistent pro všechny typy obsahu',
      price: 9,
      category: 'Copywriting',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Rytr',
      tags: JSON.stringify(['AI', 'Copywriting', 'Obsah']),
      advantages: JSON.stringify(['Příznivá cena', 'Mnoho formátů', 'Jednoduché použití']),
      disadvantages: JSON.stringify(['Omezený počet znaků', 'Základní funkce', 'Kvalita vs. kvantita']),
      detailInfo: 'Rytr je dostupný AI copywriting nástroj pro tvorbu různých typů obsahu od blogů po reklamní texty.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '9',
        enterprise: '29'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.rytr.me',
      hasTrial: true
    },
    {
      name: 'Linkfire',
      description: 'AI platforma pro optimalizaci hudebního marketingu',
      price: 25,
      category: 'Marketing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Linkfire',
      tags: JSON.stringify(['AI', 'Hudba', 'Marketing']),
      advantages: JSON.stringify(['Smart links', 'Detailní analytika', 'Integrace s platformami']),
      disadvantages: JSON.stringify(['Specifické zaměření', 'Vyšší cena pro týmy', 'Omezené funkce zdarma']),
      detailInfo: 'Linkfire využívá AI pro optimalizaci hudebního marketingu a sledování výkonu napříč streamovacími platformami.',
      pricingInfo: JSON.stringify({
        basic: '25',
        pro: '50',
        enterprise: '150'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.linkfire.com',
      hasTrial: true
    },
    {
      name: 'ConvertBot',
      description: 'AI chatbot pro konverze a lead generation',
      price: 29,
      category: 'Marketing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=ConvertBot',
      tags: JSON.stringify(['AI', 'Chatbot', 'Konverze']),
      advantages: JSON.stringify(['Personalizace', 'Snadná integrace', 'Analytics']),
      disadvantages: JSON.stringify(['Měsíční předplatné', 'Omezení konverzací', 'Základní AI']),
      detailInfo: 'ConvertBot je inteligentní chatbot zaměřený na zvýšení konverzí a generování leadů pomocí AI personalizace.',
      pricingInfo: JSON.stringify({
        basic: '29',
        pro: '79',
        enterprise: '199'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.convertbot.com',
      hasTrial: true
    },
    {
      name: 'BuzzSumo',
      description: 'AI platforma pro content intelligence',
      price: 99,
      category: 'Marketing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=BuzzSumo',
      tags: JSON.stringify(['AI', 'Content', 'Analýza']),
      advantages: JSON.stringify(['Hluboká analýza', 'Monitoring trendů', 'Konkurenční výzkum']),
      disadvantages: JSON.stringify(['Vysoká cena', 'Složitější ovládání', 'Omezení dat']),
      detailInfo: 'BuzzSumo využívá AI pro analýzu obsahu, sledování trendů a identifikaci virálního potenciálu.',
      pricingInfo: JSON.stringify({
        basic: '99',
        pro: '179',
        enterprise: '299'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.buzzsumo.com',
      hasTrial: true
    },
    {
      name: 'Jasper',
      description: 'Pokročilý AI copywriting asistent',
      price: 49,
      category: 'Copywriting',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Jasper',
      tags: JSON.stringify(['AI', 'Copywriting', 'Marketing']),
      advantages: JSON.stringify(['Vysoká kvalita textů', 'Mnoho šablon', 'Týmová spolupráce']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Složitější ovládání', 'Nutnost kontroly']),
      detailInfo: 'Jasper je prémiový AI copywriting nástroj s pokročilými funkcemi pro tvorbu kvalitního obsahu všeho druhu.',
      pricingInfo: JSON.stringify({
        basic: '49',
        pro: '99',
        enterprise: '249'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.jasper.ai',
      hasTrial: true
    },
    {
      name: 'Pictory',
      description: 'AI video editor pro automatickou tvorbu videí',
      price: 19,
      category: 'Video editace',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Pictory',
      tags: JSON.stringify(['AI', 'Video', 'Automatizace']),
      advantages: JSON.stringify(['Automatická editace', 'Extrakce highlightů', 'Titulky']),
      disadvantages: JSON.stringify(['Omezená kreativita', 'Kvalita exportu', 'Cena za minutu']),
      detailInfo: 'Pictory automaticky vytváří krátká videa z dlouhých nahrávek pomocí AI analýzy obsahu.',
      pricingInfo: JSON.stringify({
        basic: '19',
        pro: '39',
        enterprise: '99'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.pictory.ai',
      hasTrial: true
    },
    {
      name: 'Lumen5',
      description: 'AI platforma pro tvorbu video obsahu',
      price: 29,
      category: 'Video tvorba',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Lumen5',
      tags: JSON.stringify(['AI', 'Video tvorba', 'Marketing']),
      advantages: JSON.stringify(['Snadné použití', 'Knihovna médií', 'Rychlá tvorba']),
      disadvantages: JSON.stringify(['Omezené šablony', 'Základní funkce', 'Watermark']),
      detailInfo: 'Lumen5 převádí textový obsah na video prezentace pomocí AI a rozsáhlé knihovny médií.',
      pricingInfo: JSON.stringify({
        basic: '29',
        pro: '79',
        enterprise: '199'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.lumen5.com',
      hasTrial: true
    },
    {
      name: 'Tome',
      description: 'AI asistent pro tvorbu prezentací',
      price: 10,
      category: 'Prezentace',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Tome',
      tags: JSON.stringify(['AI', 'Prezentace', 'Design']),
      advantages: JSON.stringify(['Generativní design', 'Interaktivní prvky', 'Moderní vzhled']),
      disadvantages: JSON.stringify(['Omezené formáty', 'Online only', 'Nutnost připojení']),
      detailInfo: 'Tome využívá AI pro automatické vytváření profesionálních prezentací s důrazem na vizuální stránku.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '10',
        enterprise: '25'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.tome.app',
      hasTrial: true
    },
    {
      name: 'Beautiful.ai',
      description: 'AI platforma pro design prezentací',
      price: 12,
      category: 'Prezentace',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Beautiful.ai',
      tags: JSON.stringify(['AI', 'Prezentace', 'Design']),
      advantages: JSON.stringify(['Smart šablony', 'Automatický design', 'Týmová spolupráce']),
      disadvantages: JSON.stringify(['Měsíční platba', 'Omezené možnosti', 'Závislost na internetu']),
      detailInfo: 'Beautiful.ai automaticky vytváří profesionální prezentace s využitím AI pro optimální rozvržení a design.',
      pricingInfo: JSON.stringify({
        basic: '12',
        pro: '40',
        enterprise: '100'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.beautiful.ai',
      hasTrial: true
    },
    {
      name: 'Gamma',
      description: 'AI nástroj pro tvorbu dokumentů a prezentací',
      price: 8,
      category: 'Prezentace',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Gamma',
      tags: JSON.stringify(['AI', 'Dokumenty', 'Prezentace']),
      advantages: JSON.stringify(['Flexibilní formát', 'Rychlá tvorba', 'Moderní design']),
      disadvantages: JSON.stringify(['Nový produkt', 'Méně funkcí', 'Omezená komunita']),
      detailInfo: 'Gamma kombinuje dokumenty a prezentace do jednoho formátu s využitím AI pro automatickou tvorbu obsahu.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '8',
        enterprise: '30'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.gamma.app',
      hasTrial: true
    },
    {
      name: '10web',
      description: 'AI platforma pro automatizaci WordPress vývoje',
      price: 10,
      category: 'Web Development',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=10web',
      tags: JSON.stringify(['AI', 'WordPress', 'Automatizace']),
      advantages: JSON.stringify(['Automatická optimalizace', 'Hosting v ceně', 'Page builder']),
      disadvantages: JSON.stringify(['Pouze pro WordPress', 'Omezení v základní verzi', 'Závislost na platformě']),
      detailInfo: '10web nabízí kompletní řešení pro WordPress s AI funkcemi pro automatickou optimalizaci a správu webu.',
      pricingInfo: JSON.stringify({
        basic: '10',
        pro: '35',
        enterprise: '65'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.10web.io',
      hasTrial: true
    },
    {
      name: 'TextCortex',
      description: 'AI copywriting asistent pro všechny typy obsahu',
      price: 29,
      category: 'Copywriting',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=TextCortex',
      tags: JSON.stringify(['AI', 'Copywriting', 'Content']),
      advantages: JSON.stringify(['Více jazyků', 'Kvalitní výstupy', 'Chrome extension']),
      disadvantages: JSON.stringify(['Měsíční limit', 'Vyšší cena', 'Občas nepřesné']),
      detailInfo: 'TextCortex je pokročilý AI copywriting nástroj s podporou více jazyků a integrací do prohlížeče.',
      pricingInfo: JSON.stringify({
        basic: '29',
        pro: '59',
        enterprise: '149'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.textcortex.com',
      hasTrial: true
    },
    {
      name: 'Simplified',
      description: 'All-in-one platforma pro design a marketing',
      price: 12,
      category: 'Design',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Simplified',
      tags: JSON.stringify(['AI', 'Design', 'Marketing']),
      advantages: JSON.stringify(['Vše v jednom', 'Jednoduchý interface', 'Týmová spolupráce']),
      disadvantages: JSON.stringify(['Základní funkce', 'Omezené šablony', 'Občas pomalé']),
      detailInfo: 'Simplified kombinuje design, copywriting a marketing nástroje v jedné platformě s AI asistencí.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '12',
        enterprise: '24'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.simplified.com',
      hasTrial: true
    },
    {
      name: 'Seamless.AI',
      description: 'AI platforma pro sales intelligence a lead generation',
      price: 97,
      category: 'Sales',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Seamless.AI',
      tags: JSON.stringify(['AI', 'Sales', 'Lead Generation']),
      advantages: JSON.stringify(['Přesná data', 'Automatické aktualizace', 'CRM integrace']),
      disadvantages: JSON.stringify(['Vysoká cena', 'Složité nastavení', 'Omezení kontaktů']),
      detailInfo: 'Seamless.AI poskytuje přesné kontaktní informace a lead data s pomocí umělé inteligence.',
      pricingInfo: JSON.stringify({
        basic: '97',
        pro: '197',
        enterprise: '297'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.seamless.ai',
      hasTrial: true
    },
    {
      name: 'Bit.ai',
      description: 'AI platforma pro týmovou dokumentaci a spolupráci',
      price: 8,
      category: 'Produktivita',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Bit.ai',
      tags: JSON.stringify(['AI', 'Dokumentace', 'Spolupráce']),
      advantages: JSON.stringify(['Smart dokumenty', 'Integrace', 'Real-time spolupráce']),
      disadvantages: JSON.stringify(['Učící křivka', 'Omezení v free verzi', 'Občas pomalé']),
      detailInfo: 'Bit.ai je moderní platforma pro tvorbu a správu dokumentů s AI asistencí a týmovou spoluprací.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '8',
        enterprise: '15'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.bit.ai',
      hasTrial: true
    },
    {
      name: 'InVideo',
      description: 'Online video editor s AI funkcemi',
      price: 15,
      category: 'Video editace',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=InVideo',
      tags: JSON.stringify(['AI', 'Video editace', 'Video tvorba']),
      advantages: JSON.stringify(['Jednoduché použití', 'Šablony', 'Automatické titulky']),
      disadvantages: JSON.stringify(['Watermark ve free verzi', 'Omezené exporty', 'Online only']),
      detailInfo: 'InVideo je intuitivní online video editor s AI funkcemi pro automatizaci běžných úkolů.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '15',
        enterprise: '30'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.invideo.io',
      hasTrial: true
    },
    {
      name: 'Grammarly',
      description: 'AI asistent pro kontrolu pravopisu a stylistiky',
      price: 12,
      category: 'Psaní',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Grammarly',
      tags: JSON.stringify(['AI', 'Gramatika', 'Psaní']),
      advantages: JSON.stringify(['Přesné opravy', 'Všude dostupné', 'Stylistické návrhy']),
      disadvantages: JSON.stringify(['Cena', 'Občas přísné', 'Některé false positives']),
      detailInfo: 'Grammarly je populární AI nástroj pro kontrolu pravopisu, gramatiky a stylistiky textu.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '12',
        enterprise: '25'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.grammarly.com',
      hasTrial: true
    },
    {
      name: 'ElevenLabs',
      description: 'AI platforma pro generování realistického hlasu',
      price: 22,
      category: 'Audio',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=ElevenLabs',
      tags: JSON.stringify(['AI', 'Text to Speech', 'Audio']),
      advantages: JSON.stringify(['Realistické hlasy', 'Mnoho jazyků', 'API dostupné']),
      disadvantages: JSON.stringify(['Drahé pro velké objemy', 'Omezení ve free verzi', 'Občas robotické']),
      detailInfo: 'ElevenLabs nabízí nejpokročilejší AI technologii pro generování přirozeně znějícího hlasu.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '22',
        enterprise: '99'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.elevenlabs.io',
      hasTrial: true
    },
    {
      name: 'AllIAI',
      description: 'AI platforma pro automatizaci business procesů',
      price: 49,
      category: 'Automatizace',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=AllIAI',
      tags: JSON.stringify(['AI', 'Automatizace', 'Business']),
      advantages: JSON.stringify(['Komplexní řešení', 'Customizace', 'Integrace']),
      disadvantages: JSON.stringify(['Vysoká cena', 'Složité nastavení', 'Technická náročnost']),
      detailInfo: 'AllIAI poskytuje komplexní řešení pro automatizaci firemních procesů pomocí umělé inteligence.',
      pricingInfo: JSON.stringify({
        basic: '49',
        pro: '99',
        enterprise: '199'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.alliai.com',
      hasTrial: true
    },
    {
      name: 'MindStudio',
      description: 'AI platforma pro tvorbu vzdělávacího obsahu',
      price: 29,
      category: 'Vzdělávání',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=MindStudio',
      tags: JSON.stringify(['AI', 'E-learning', 'Vzdělávání']),
      advantages: JSON.stringify(['Interaktivní obsah', 'Personalizace', 'Analytics']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Omezené šablony', 'Učící křivka']),
      detailInfo: 'MindStudio umožňuje vytvářet interaktivní vzdělávací obsah s pomocí umělé inteligence.',
      pricingInfo: JSON.stringify({
        basic: '29',
        pro: '79',
        enterprise: '199'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.mindstudio.ai',
      hasTrial: true
    },
    {
      name: 'Laxis',
      description: 'AI platforma pro právní analýzu a automatizaci',
      price: 89,
      category: 'Právo',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Laxis',
      tags: JSON.stringify(['AI', 'Právo', 'Automatizace']),
      advantages: JSON.stringify(['Právní analýza', 'Automatizace dokumentů', 'Bezpečnost']),
      disadvantages: JSON.stringify(['Vysoká cena', 'Specifické použití', 'Složité rozhraní']),
      detailInfo: 'Laxis využívá AI pro automatizaci právních procesů a analýzu dokumentů.',
      pricingInfo: JSON.stringify({
        basic: '89',
        pro: '199',
        enterprise: '499'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.laxis.com',
      hasTrial: true
    },
    {
      name: 'Lusha',
      description: 'AI platforma pro B2B prospecting a lead generation',
      price: 39,
      category: 'Sales',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Lusha',
      tags: JSON.stringify(['AI', 'Sales', 'Lead Generation']),
      advantages: JSON.stringify(['Přesná data', 'Chrome extension', 'CRM integrace']),
      disadvantages: JSON.stringify(['Omezení kreditů', 'Vyšší cena', 'Neúplná data']),
      detailInfo: 'Lusha pomáhá najít a ověřit kontaktní informace pro B2B prodej pomocí AI.',
      pricingInfo: JSON.stringify({
        basic: '39',
        pro: '79',
        enterprise: '149'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.lusha.com',
      hasTrial: true
    },
    {
      name: 'ClickUp',
      description: 'AI-powered platforma pro projektový management',
      price: 7,
      category: 'Produktivita',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=ClickUp',
      tags: JSON.stringify(['AI', 'Projektový management', 'Produktivita']),
      advantages: JSON.stringify(['Všestrannost', 'Customizace', 'Integrace']),
      disadvantages: JSON.stringify(['Složitější nastavení', 'Přehlcené rozhraní', 'Pomalejší načítání']),
      detailInfo: 'ClickUp je komplexní platforma pro projektový management s AI funkcemi pro automatizaci a optimalizaci.',
      pricingInfo: JSON.stringify({
        basic: '0',
        pro: '7',
        enterprise: '19'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.clickup.com',
      hasTrial: true
    },
    {
      name: 'Sprout Social',
      description: 'AI platforma pro správu sociálních sítí',
      price: 89,
      category: 'Social Media',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Sprout+Social',
      tags: JSON.stringify(['AI', 'Social Media', 'Marketing']),
      advantages: JSON.stringify(['Pokročilá analytika', 'Plánování', 'Týmová spolupráce']),
      disadvantages: JSON.stringify(['Vysoká cena', 'Složitější ovládání', 'Omezené integrace']),
      detailInfo: 'Sprout Social nabízí komplexní řešení pro správu sociálních sítí s AI funkcemi pro optimalizaci obsahu.',
      pricingInfo: JSON.stringify({
        basic: '89',
        pro: '149',
        enterprise: '249'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.sproutsocial.com',
      hasTrial: true
    },
    {
      name: 'LiveChat',
      description: 'AI chatbot a zákaznická podpora',
      price: 16,
      category: 'Zákaznická podpora',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=LiveChat',
      tags: JSON.stringify(['AI', 'Chat', 'Zákaznická podpora']),
      advantages: JSON.stringify(['24/7 podpora', 'Automatizace', 'Analytika']),
      disadvantages: JSON.stringify(['Cena per agent', 'Omezení v základu', 'Složitější nastavení']),
      detailInfo: 'LiveChat kombinuje lidskou podporu s AI chatbotem pro efektivní zákaznický servis.',
      pricingInfo: JSON.stringify({
        basic: '16',
        pro: '33',
        enterprise: '50'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.livechat.com',
      hasTrial: true
    },
    {
      name: 'AdCreative.ai',
      description: 'AI platforma pro tvorbu reklamních kreativ',
      price: 29,
      category: 'Marketing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=AdCreative.ai',
      tags: JSON.stringify(['AI', 'Reklama', 'Design']),
      advantages: JSON.stringify(['Rychlá tvorba', 'A/B testování', 'Performance predikce']),
      disadvantages: JSON.stringify(['Omezený počet kreativ', 'Vyšší cena', 'Občas generické']),
      detailInfo: 'AdCreative.ai automaticky generuje a optimalizuje reklamní kreativy pomocí umělé inteligence.',
      pricingInfo: JSON.stringify({
        basic: '29',
        pro: '59',
        enterprise: '119'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.adcreative.ai',
      hasTrial: true
    },
    {
      name: 'Brandwatch',
      description: 'AI platforma pro social listening a brand monitoring',
      price: 108,
      category: 'Marketing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Brandwatch',
      tags: JSON.stringify(['AI', 'Social Listening', 'Analytics']),
      advantages: JSON.stringify(['Hluboká analýza', 'Globální pokrytí', 'Real-time data']),
      disadvantages: JSON.stringify(['Vysoká cena', 'Složité ovládání', 'Zahlcení daty']),
      detailInfo: 'Brandwatch poskytuje komplexní přehled o značce a konkurenci pomocí AI analýzy sociálních médií.',
      pricingInfo: JSON.stringify({
        basic: '108',
        pro: '199',
        enterprise: '499'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.brandwatch.com',
      hasTrial: true
    },
    {
      name: 'Adobe Firefly',
      description: 'Pokročilý AI nástroj pro generování a úpravu obrázků od společnosti Adobe',
      price: 20,
      category: 'Generování obrázků',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Adobe+Firefly',
      tags: JSON.stringify(['AI', 'Generování obrázků', 'Úprava obrázků', 'Adobe']),
      advantages: JSON.stringify(['Vysoká kvalita', 'Mnoho stylů', 'Rychlá tvorba']),
      disadvantages: JSON.stringify(['Vyšší cena', 'Omezení výběru', 'Závislost na platformě']),
      detailInfo: 'Adobe Firefly je pokročilý AI nástroj pro generování a úpravu obrázků, který umožňuje vytvářet profesionální grafiku a manipulovat s existujícím obrázkem.',
      pricingInfo: JSON.stringify({
        basic: '20',
        pro: '50',
        enterprise: '100'
      }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.adobe.com/firefly',
      hasTrial: true
    }
  ];

  // Pro každý nový produkt
  for (const product of newProducts) {
    // Zkontrolujeme, jestli už produkt existuje
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: product.name
      }
    });

    // Pokud produkt neexistuje, vytvoříme ho
    if (!existingProduct) {
      await prisma.product.create({
        data: product
      });
      console.log(`Přidán nový produkt: ${product.name}`);
    } else {
      console.log(`Produkt ${product.name} již existuje, přeskakuji...`);
    }
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