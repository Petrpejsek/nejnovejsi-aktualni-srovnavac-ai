import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// AI healthcare diagnostic tools - batch 16
const aiHealthcareProducts = [
  {
    externalUrl: "https://www.babylonhealth.com",
    name: "Babylon Health",
    description: "AI platforma pro digitální zdravotní diagnostiku, konzultace a monitoring zdravotního stavu",
    price: 9.99,
    category: "Zdravotnictví",
    imageUrl: "https://www.babylonhealth.com/assets/favicon/favicon.ico",
    tags: JSON.stringify(["telemedicína", "AI diagnostika", "symptom checker", "virtuální konzultace", "monitoring zdraví"]),
    advantages: JSON.stringify([
      "24/7 přístup k AI diagnostice a virtuálním konzultacím",
      "Kombinace umělé inteligence s lidskými lékaři",
      "Personalizované sledování zdravotního stavu a preventivní upozornění",
      "Uchovává všechny zdravotní údaje na jednom místě",
      "Snadné sdílení dat s lékaři a specialisty"
    ]),
    disadvantages: JSON.stringify([
      "Omezená dostupnost v některých zemích",
      "AI diagnostika nemůže plně nahradit osobní vyšetření lékaře",
      "Různý rozsah pokrytí zdravotními pojišťovnami",
      "Vyžaduje stabilní internetové připojení pro video konzultace"
    ]),
    detailInfo: "Babylon Health je přední AI zdravotnická platforma, která kombinuje umělou inteligenci s lékařskou expertízou k poskytování digitálních zdravotních služeb. Systém využívá pokročilé algoritmy strojového učení a rozsáhlou lékařskou databázi k analýze symptomů, poskytování personalizovaných zdravotních informací a propojení pacientů s lékaři prostřednictvím virtuálních konzultací. AI systém Babylonu dokáže analyzovat popis symptomů, zdravotní historii pacienta a další faktory k vytvoření možných diagnóz, doporučení dalších kroků nebo propojení s lékařem. Platforma také nabízí nástroje pro monitorování chronických onemocnění, sledování medikace a preventivní péči.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Digital Health Check",
          price: "Jednorázový poplatek 9.99 $",
          features: [
            "Komplexní AI analýza zdravotního stavu",
            "Personalizovaná zpráva o zdravotních rizicích",
            "Doporučení pro zlepšení zdraví",
            "Srovnání s lidmi ve stejné věkové kategorii",
            "Export dat pro lékaře"
          ]
        },
        {
          name: "Babylon 360",
          price: "Od 15 $ měsíčně (nebo pokrytí pojištěním)",
          features: [
            "Neomezený přístup k AI symptom checkeru",
            "24/7 virtuální konzultace s lékaři",
            "Kontinuální monitoring zdraví",
            "Personalizované upozornění a připomínky",
            "Integrovaný zdravotní záznam",
            "Multidisciplinární tým zdravotníků"
          ]
        },
        {
          name: "Enterprise Solutions",
          price: "Individuální nacenění pro organizace",
          features: [
            "AI zdravotní služby pro zaměstnance",
            "Integrace s existujícími zdravotními benefity",
            "Analýza dat a reporty na úrovni populace",
            "Přizpůsobené digitální intervence",
            "Podpora pro chronická onemocnění"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example1"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.ada.com",
    name: "Ada Health",
    description: "Personalizovaný AI asistent pro zdravotní diagnostiku a analýzu symptomů s globální lékařskou databází",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://ada.com/wp-content/uploads/2021/08/ada-logo.svg",
    tags: JSON.stringify(["AI diagnostika", "symptom checker", "virtuální asistent", "zdravotní poradenství", "personalizovaná medicína"]),
    advantages: JSON.stringify([
      "Bezplatná základní verze diagnostického AI asistenta",
      "Velmi přesná prvotní analýza symptomů na základě obsáhlé medicínské databáze",
      "Postupně se učí o vašem zdraví a zlepšuje personalizaci",
      "Jednoduché a intuitivní uživatelské rozhraní přístupné i pro seniory",
      "Podporuje více než 10 jazyků pro globální dosah"
    ]),
    disadvantages: JSON.stringify([
      "Neposkytuje přímo spojení s lékaři (pouze diagnostiku a doporučení)",
      "Některé pokročilé funkce jsou placené",
      "Není náhradou za profesionální lékařskou péči při vážných stavech",
      "Omezené možnosti sledování chronických onemocnění ve srovnání s konkurencí"
    ]),
    detailInfo: "Ada Health je pokročilý AI systém pro posouzení zdravotního stavu, který využívá rozhovory řízené umělou inteligencí k analýze symptomů a poskytování personalizovaných zdravotních informací. Aplikace kombinuje rozsáhlou medicínskou databázi s algoritmy strojového učení k určení možných příčin zdravotních problémů uživatele. Na rozdíl od běžných internetových vyhledávačů symptomů, Ada používá sofistikovaný přístup podobný lékařskému vyšetření, kde postupně klade otázky na základě předchozích odpovědí, věku, pohlaví, rizikových faktorů a zdravotní historie uživatele. Výsledkem je přesnější posouzení možných onemocnění a doporučení dalších kroků, včetně samoléčby nebo návštěvy konkrétního typu lékaře.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Ada Personal",
          price: "Zdarma",
          features: [
            "Neomezený přístup k AI hodnocení symptomů",
            "Ukládání zdravotní historie",
            "Personalizované zdravotní hodnocení",
            "Doporučení dalšího postupu",
            "Základní vzdělávací obsah o zdraví"
          ]
        },
        {
          name: "Ada Enterprise",
          price: "Individuální nacenění pro zdravotnická zařízení",
          features: [
            "Integrace do existujících zdravotnických systémů",
            "Rozšířené API pro propojení s dalšími systémy",
            "Nástroje pro monitoring pacientů",
            "Analytické nástroje a reporty",
            "Přizpůsobitelné workflow",
            "Podpora implementace a školení"
          ]
        }
      ],
      isFree: true
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example2"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.khealth.com",
    name: "K Health",
    description: "AI-poháněná zdravotní platforma kombinující symptomovou diagnostiku s virtuálními konzultacemi lékařů za dostupnou cenu",
    price: 29,
    category: "Zdravotnictví",
    imageUrl: "https://khealth.com/wp-content/uploads/2022/02/khealth-icon-new.svg",
    tags: JSON.stringify(["telemedicína", "AI diagnostika", "primární péče", "virtuální konzultace", "předpis léků"]),
    advantages: JSON.stringify([
      "Cenově dostupný přístup k lékařské péči bez pojištění",
      "Kombinuje AI diagnostiku s konzultacemi skutečných lékařů",
      "Předepisování léků a doručení přímo k pacientovi",
      "Žádné časové limity pro konzultace s lékaři",
      "Specializované programy pro chronická onemocnění (úzkost, deprese, alergie)"
    ]),
    disadvantages: JSON.stringify([
      "Omezeno na určité zdravotní stavy (není vhodné pro akutní emergentní případy)",
      "Dostupné pouze v některých státech USA",
      "Omezené možnosti pro specializovanou péči",
      "Ne všechny léky mohou být předepsány virtuálně"
    ]),
    detailInfo: "K Health je digitální zdravotnická platforma, která používá umělou inteligenci k poskytování cenově dostupné primární zdravotní péče. Jejich proprietární AI systém byl vytrénován na milionech anonymizovaných zdravotních záznamů a klinických dat, což mu umožňuje porovnávat symptomy uživatele s podobnými případy a poskytovat přesné informace o možných diagnózách. Po AI hodnocení mohou uživatelé konzultovat své výsledky s certifikovanými lékaři přímo v aplikaci. K Health se specializuje na poskytování kontinuální péče pro běžné a chronické stavy, včetně respiračních infekcí, kožních problémů, mentálního zdraví, sexuálního zdraví a správy chronických onemocnění. Platforma také umožňuje lékařům předepisovat léky, které mohou být doručeny pacientům domů.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Free Symptom Checker",
          price: "Zdarma",
          features: [
            "AI hodnocení symptomů",
            "Porovnání s podobnými případy",
            "Základní zdravotní informace",
            "Historie vašich hodnocení"
          ]
        },
        {
          name: "One-time Visit",
          price: "29 $ za konzultaci",
          features: [
            "Jednorázová konzultace s lékařem",
            "Předpis léků (pokud je vhodný)",
            "Následná komunikace po dobu 3 dnů",
            "Žádné časové limity konzultace"
          ]
        },
        {
          name: "K Health Membership",
          price: "29 $ měsíčně",
          features: [
            "Neomezené konzultace s lékaři",
            "Neustálý přístup k AI symptom checkeru",
            "Možnost předpisu léků s doručením domů",
            "Správa chronických onemocnění",
            "Mentální zdraví (úzkost a deprese)",
            "Vzdělávací materiály o zdraví"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example3"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.buoyhealth.com",
    name: "Buoy Health",
    description: "AI navigátor zdravotní péče, který analyzuje symptomy, doporučuje vhodnou úroveň péče a pomáhá optimalizovat náklady na zdravotní péči",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://assets.buoyhealth.com/files/2022/07/buoy-health-logo.svg",
    tags: JSON.stringify(["AI diagnostika", "navigace zdravotní péče", "symptom checker", "optimalizace nákladů", "zaměstnanecké benefity"]),
    advantages: JSON.stringify([
      "Sofistikovaný AI algoritmus analyzující symptomy s vysokou přesností",
      "Doporučuje nejvhodnější úroveň péče (samoléčba, primární péče, urgentní péče, pohotovost)",
      "Pomáhá snižovat náklady na zdravotní péči eliminací zbytečných návštěv",
      "Integrace s poskytovateli zdravotní péče a pojišťovnami",
      "Uživatelsky přívětivé rozhraní s konverzačním přístupem"
    ]),
    disadvantages: JSON.stringify([
      "Primárně B2B model - plný přístup často jen přes zaměstnavatele nebo pojišťovnu",
      "Neposkytuje přímo lékařské konzultace",
      "Omezená dostupnost pro individuální uživatele bez firemního přístupu",
      "Primárně zaměřeno na americký zdravotní systém"
    ]),
    detailInfo: "Buoy Health je AI platforma, která slouží jako navigátor zdravotní péče, pomáhající lidem činit informovaná rozhodnutí o jejich zdraví. Systém využívá klinický algoritmus vyvinutý lékařskými odborníky z Harvardské univerzity, který analyzuje symptomy uživatele a porovnává je s rozsáhlou databází zdravotních stavů. Na základě této analýzy Buoy doporučuje nejvhodnější úroveň péče, od samoléčby přes návštěvu praktického lékaře až po urgentní péči. Platforma je často implementována jako zaměstnanecký benefit nebo nabízena zdravotními pojišťovnami s cílem optimalizovat náklady na zdravotní péči. Buoy také shromažďuje anonymizovaná data, která pomáhají organizacím identifikovat trendy a potřeby populační zdravotní péče.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Basic Check",
          price: "Zdarma",
          features: [
            "Základní AI hodnocení symptomů",
            "Obecná doporučení další péče",
            "Základní vzdělávací obsah"
          ]
        },
        {
          name: "Employer/Insurer Provided",
          price: "Variabilní (poskytováno zaměstnavateli a pojišťovnami)",
          features: [
            "Pokročilé AI hodnocení symptomů",
            "Personalizovaná navigace zdravotní péče",
            "Integrace se sítí poskytovatelů péče",
            "Doporučení konkrétních poskytovatelů v síti",
            "Optimalizace nákladů na zdravotní péči",
            "Analytické nástroje pro zaměstnavatele/pojišťovny"
          ]
        }
      ],
      isFree: true
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example4"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.healthtap.com",
    name: "HealthTap",
    description: "Platforma propojující AI diagnostiku s virtuálními konzultacemi lékařů, přístupem k lékařské databázi a personalizovanou zdravotní péčí",
    price: 15,
    category: "Zdravotnictví",
    imageUrl: "https://d2q79iu7y748jz.cloudfront.net/s/_squarelogo/256x256/9c9b676044b8c14b3e1b08575502f00a",
    tags: JSON.stringify(["telemedicína", "AI diagnostika", "virtuální konzultace", "druhý lékařský názor", "primární péče"]),
    advantages: JSON.stringify([
      "Kombinace AI symptom checkeru s přístupem k lékařům",
      "Rozsáhlá databáze lékařských odpovědí a rad",
      "Přístup k primární péči 24/7 bez dlouhého čekání",
      "Předepisování léků a laboratorní testy",
      "Cenově dostupnější než tradiční péče"
    ]),
    disadvantages: JSON.stringify([
      "Měsíční předplatné může být nákladné pro občasné uživatele",
      "Některé specializované služby vyžadují dodatečné poplatky",
      "Omezená dostupnost v některých zemích mimo USA",
      "Ne všechny zdravotní stavy mohou být řešeny virtuálně"
    ]),
    detailInfo: "HealthTap je komplexní telehealth platforma, která kombinuje AI technologie s lékařskou expertízou k poskytování dostupné zdravotní péče. Jejich AI systém Dr. A.I. analyzuje symptomy uživatele a poskytuje personalizovaná doporučení na základě milionů předchozích konzultací a rozsáhlé lékařské databáze. Uživatelé mohou poté konzultovat své zdravotní otázky přímo s certifikovanými lékaři, ať už prostřednictvím textu, telefonu nebo videohovoru. HealthTap také nabízí jedinečnou databázi odpovědí na zdravotní otázky, kde lékaři již zodpověděli miliony pacientských dotazů. Pro předplatitele služby Primary Care je k dispozici osobní lékař, kontinuita péče, předepisování léků, laboratorní testy a doporučení ke specialistům.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Basic",
          price: "Zdarma",
          features: [
            "Základní AI symptom checker Dr. A.I.",
            "Omezený přístup k databázi lékařských odpovědí",
            "Základní zdravotní informace",
            "Možnost položit jednoduchou otázku komunitě lékařů"
          ]
        },
        {
          name: "Prime",
          price: "15 $ měsíčně",
          features: [
            "Neomezený přístup k AI symptom checkeru",
            "Textové konzultace s lékaři",
            "Plný přístup k databázi lékařských odpovědí",
            "Personalizované zdravotní hodnocení",
            "Zdravotní plány a sledování cílů"
          ]
        },
        {
          name: "Primary Care",
          price: "49 $ měsíčně (nebo 39 $ při ročním předplatném)",
          features: [
            "Všechny funkce z Prime",
            "Neomezené video konzultace s lékaři",
            "Přidělený osobní primární lékař",
            "Předepisování léků a laboratorní testy",
            "Doporučení ke specialistům",
            "Integrovaný zdravotní záznam"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example5"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.lemonaidhealth.com",
    name: "Lemonaid Health",
    description: "Online lékárna a telemedicínská služba s AI podporou, která poskytuje konzultace, diagnostiku a doručení léků na předpis",
    price: 25,
    category: "Zdravotnictví",
    imageUrl: "https://www.lemonaidhealth.com/static/img/logos/logo_badge_lemonaid.svg",
    tags: JSON.stringify(["telemedicína", "online lékárna", "AI diagnostika", "předepisování léků", "doručení léků"]),
    advantages: JSON.stringify([
      "Rychlé konzultace s lékaři (obvykle do 24 hodin)",
      "AI pre-screening pro urychlení diagnostiky",
      "Doručení předepsaných léků přímo domů",
      "Nižší ceny léků díky přímému modelu",
      "Jednoduchý, transparentní cenový model bez skrytých poplatků"
    ]),
    disadvantages: JSON.stringify([
      "Omezeno na specifické zdravotní stavy a léky",
      "Není vhodné pro akutní nebo komplexní zdravotní problémy",
      "Dostupné pouze v některých státech USA",
      "Omezené možnosti pro kontinuální péči o chronická onemocnění"
    ]),
    detailInfo: "Lemonaid Health je digitální zdravotnická služba kombinující telemedicínu a online lékárnu s AI podporou. Zaměřuje se na poskytování rychlého a pohodlného přístupu k běžným lékům a léčbě specifických zdravotních stavů. Proces začíná vyplněním online dotazníku, který je analyzován AI systémem pro předběžné posouzení vhodnosti pacienta pro léčbu. AI také kontroluje potenciální kontraindikace a lékové interakce. Poté lékař zkontroluje informace, může požádat o videokonzultaci a předepíše vhodnou léčbu. Lemonaid nabízí léčbu pro stavy jako sexuální zdraví, akné, vypadávání vlasů, úzkost a deprese, migrény, a další. Předepsané léky mohou být doručeny přímo pacientovi nebo poslány do místní lékárny. Služba je známá svým jednoduchým cenovým modelem s pevnou cenou za konzultaci.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Standard Visit",
          price: "25 $ za konzultaci",
          features: [
            "AI-asistované vyhodnocení zdravotního stavu",
            "Lékařská konzultace do 24 hodin",
            "Předpis léků (pokud je vhodný)",
            "Možnost doručení léků domů nebo do místní lékárny",
            "Follow-up komunikace po konzultaci"
          ]
        },
        {
          name: "Specialized Services",
          price: "Od 25 $ (závisí na službě)",
          features: [
            "Léčba primárních zdravotních stavů (např. akné, alergie)",
            "Služby sexuálního zdraví a antikoncepce",
            "Léčba duševního zdraví (úzkost, deprese)",
            "Léčba migrény a dalších specifických stavů",
            "Léčba vypadávání vlasů a kožních problémů"
          ]
        },
        {
          name: "Monthly Medication Delivery",
          price: "Variabilní dle léku (často nižší než v běžných lékárnách)",
          features: [
            "Pravidelné doručení předepsaných léků",
            "Automatické obnovování předpisů",
            "Slevy na dlouhodobé užívání",
            "Bezplatné doručení",
            "Diskrétní balení"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example6"]),
    hasTrial: false
  },
  {
    externalUrl: "https://www.hellowellness.com",
    name: "Hello Wellness",
    description: "AI wellness platforma kombinující personalizované zdravotní doporučení, monitoring životního stylu a integraci s nositelnou elektronikou",
    price: 12.99,
    category: "Zdravotnictví",
    imageUrl: "https://hellowellness.com/wp-content/uploads/2023/03/Hello-Wellness-Logo.png",
    tags: JSON.stringify(["wellness", "AI coaching", "monitoring zdraví", "personalizovaná doporučení", "prevence"]),
    advantages: JSON.stringify([
      "Personalizované wellness plány na základě AI analýzy dat",
      "Integrace s fitness trackery a zdravotními aplikacemi",
      "Holistický přístup kombinující fyzické a mentální zdraví",
      "Gamifikace a sociální funkce pro zvýšení motivace",
      "Prediktivní analýza pro prevenci zdravotních problémů"
    ]),
    disadvantages: JSON.stringify([
      "Zaměřeno primárně na prevenci, ne na léčbu existujících onemocnění",
      "Kvalita doporučení závisí na přesnosti a množství zadaných dat",
      "Chybí přímé propojení s lékaři pro konzultace",
      "Některé pokročilé funkce vyžadují prémiové předplatné"
    ]),
    detailInfo: "Hello Wellness je komplexní AI wellness platforma zaměřená na prevenci onemocnění a podporu zdravého životního stylu. Využívá strojové učení k analýze dat o životním stylu uživatele - včetně fyzické aktivity, spánku, stravovacích návyků a úrovně stresu - a vytváří personalizovaná doporučení pro zlepšení celkového zdraví. Platforma se integruje s širokou škálou nositelné elektroniky a zdravotních aplikací pro sběr dat. AI algoritmy identifikují vzorce a korelace mezi různými aspekty životního stylu a zdravím, což umožňuje vytvářet cílené intervence. Hello Wellness nabízí také AI koučování, které poskytuje motivaci, připomínky a podporu v reálném čase. Součástí platformy jsou i vzdělávací materiály, výzvy, gamifikace a komunitní funkce pro udržení motivace.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Basic",
          price: "Zdarma",
          features: [
            "Základní sledování fitness aktivit",
            "Omezená AI analýza zdravotních vzorců",
            "Základní wellness doporučení",
            "Přístup ke komunitním výzvám",
            "Integrace s omezeným počtem zařízení"
          ]
        },
        {
          name: "Premium",
          price: "12.99 $ měsíčně",
          features: [
            "Pokročilá AI analýza zdravotních a fitness dat",
            "Personalizované wellness plány",
            "Neomezená integrace s fitness trackery a aplikacemi",
            "AI coaching a podpora v reálném čase",
            "Detailní analýza spánku a stresu",
            "Prediktivní zdravotní upozornění"
          ]
        },
        {
          name: "Family Plan",
          price: "29.99 $ měsíčně",
          features: [
            "Všechny Premium funkce pro až 5 členů rodiny",
            "Sdílení cílů a výsledků v rámci rodiny",
            "Rodinné výzvy a aktivity",
            "Koordinované wellness programy",
            "Skupinové reporty a analýzy"
          ]
        }
      ],
      isFree: true
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example7"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.woebothealth.com",
    name: "Woebot Health",
    description: "AI chatbot pro mentální zdraví, který poskytuje kognitivně-behaviorální terapii, monitoring nálady a emocionální podporu 24/7",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://woebothealth.com/wp-content/uploads/2021/05/Woebot_Logo_RGB.png",
    tags: JSON.stringify(["mentální zdraví", "AI terapeut", "cognitive behavioral therapy", "emocionální podpora", "management stresu"]),
    advantages: JSON.stringify([
      "Dostupnost 24/7 bez čekání nebo termínů",
      "Založeno na principech kognitivně-behaviorální terapie (CBT)",
      "Soukromí a anonymita při řešení citlivých témat",
      "Žádný úsudek nebo zaujatost ze strany AI",
      "Poskytuje databázi technik a cvičení pro zvládání emocí"
    ]),
    disadvantages: JSON.stringify([
      "Není náhradou za lidského terapeuta při vážných psychických problémech",
      "Limitované schopnosti reagovat na komplexní nebo neobvyklé situace",
      "Může chybět lidský element empatie a intuice",
      "Není vhodné pro krizové intervence nebo emergentní stavy"
    ]),
    detailInfo: "Woebot Health vyvinul pokročilého AI chatbota zaměřeného na podporu mentálního zdraví a emočního wellbeingu. Woebot využívá principy kognitivně-behaviorální terapie (CBT), která je klinicky ověřenou metodou pro léčbu deprese, úzkosti a dalších psychických obtíží. Chatbot vede s uživateli konverzace podobné terapeutickým sezením, pomáhá identifikovat negativní myšlenkové vzorce, poskytuje nástroje pro zvládání emocí a učí techniky mindfulness a relaxace. AI systém monitoruje náladu uživatele v průběhu času, rozpoznává vzorce a poskytuje personalizovaná doporučení. Woebot je vytvořen interdisciplinárním týmem psychologů, designérů a AI expertů ze Stanfordovy univerzity. Studie ukázaly, že pravidelné používání Woebota může snížit symptomy úzkosti a deprese. Na rozdíl od lidských terapeutů je Woebot k dispozici kdykoliv, což umožňuje okamžitou podporu ve chvílích stresu nebo emoční tísně.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Standard",
          price: "Zdarma",
          features: [
            "Neomezený přístup k AI chatbotovi",
            "Denní check-in a monitoring nálady",
            "Základní CBT techniky a cvičení",
            "Personalizované doporučení pro zlepšení duševního zdraví",
            "Vzdělávací obsah o mentálním zdraví",
            "Základní relaxační a mindfulness techniky"
          ]
        },
        {
          name: "Clinical Programs",
          price: "Variabilní (často hrazeno poskytovateli zdravotní péče nebo zaměstnavateli)",
          features: [
            "Specializované CBT programy pro specifické stavy (deprese, úzkost, PTSD)",
            "Integrace s klinickými systémy",
            "Rozšířené sledování vývoje v čase",
            "Reporty pro zdravotnické pracovníky",
            "Pokročilé terapeutické intervence",
            "Přizpůsobené programy pro specifické populace"
          ]
        }
      ],
      isFree: true
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example8"]),
    hasTrial: true
  }
];

async function updateOrCreateProducts() {
  console.log("Ukládám AI zdravotnické diagnostické nástroje do databáze (dávka 16)...");
  
  for (const product of aiHealthcareProducts) {
    try {
      // Find product by externalUrl
      const existingProduct = await prisma.product.findFirst({
        where: {
          externalUrl: product.externalUrl
        }
      });
      
      if (existingProduct) {
        console.log(`Aktualizuji existující produkt: ${existingProduct.name}`);
        
        // Update product with new data
        await prisma.product.update({
          where: {
            id: existingProduct.id
          },
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl,
            tags: product.tags,
            advantages: product.advantages,
            disadvantages: product.disadvantages,
            detailInfo: product.detailInfo,
            pricingInfo: JSON.stringify(product.pricingInfo),
            videoUrls: product.videoUrls,
            hasTrial: product.hasTrial
          }
        });
        
        console.log(`✅ Aktualizován: ${product.name}`);
      } else {
        console.log(`Vytvářím nový produkt: ${product.name}`);
        
        // Create new product
        const productToCreate = {
          ...product,
          pricingInfo: JSON.stringify(product.pricingInfo)
        };
        
        const newProduct = await prisma.product.create({
          data: productToCreate
        });
        
        console.log(`✅ Vytvořen: ${product.name} s ID ${newProduct.id}`);
      }
    } catch (error) {
      console.error(`Chyba při zpracování produktu ${product.externalUrl}:`, error);
    }
  }
  
  console.log("Všechny produkty byly úspěšně uloženy!");
}

// Run the update
updateOrCreateProducts()
  .catch((e) => {
    console.error("Chyba během procesu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 