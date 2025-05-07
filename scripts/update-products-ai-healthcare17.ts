import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// AI healthcare enterprise tools - batch 17
const aiHealthcareProducts = [
  {
    externalUrl: "https://www.ibm.com/watson-health",
    name: "IBM Watson Health",
    description: "AI platforma pro zdravotnictví nabízející pokročilou analýzu dat, výzkum a optimalizaci klinických procesů",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
    tags: JSON.stringify(["analýza zdravotnických dat", "klinické rozhodování", "výzkum léčiv", "onkologie", "genomika"]),
    advantages: JSON.stringify([
      "Schopnost analyzovat obrovské množství strukturovaných i nestrukturovaných zdravotnických dat",
      "Podpora klinického rozhodování založená na důkazech",
      "Pokročilá analýza obrazových dat pro radiologii a onkologii",
      "Akcelerace vývoje léčiv a klinického výzkumu",
      "Integrace s existujícími zdravotnickými systémy"
    ]),
    disadvantages: JSON.stringify([
      "Vysoká cena implementace a údržby pro menší zdravotnická zařízení",
      "Komplexní systém vyžadující odborné znalosti pro plné využití",
      "Závislost na kvalitě vstupních dat",
      "Potřeba rozsáhlého přizpůsobení pro specifické potřeby jednotlivých zařízení"
    ]),
    detailInfo: "IBM Watson Health představuje pokročilou AI platformu určenou pro transformaci zdravotnictví pomocí analýzy dat a strojového učení. Systém se zaměřuje na několik klíčových oblastí: podporu klinického rozhodování, výzkum a vývoj léčiv, onkologii, genomiku a řízení zdravotnických systémů. Watson využívá pokročilé algoritmy zpracování přirozeného jazyka k analýze lékařské literatury, zdravotnických záznamů a výzkumných dat, což umožňuje poskytovat lékařům a výzkumníkům relevantní informace založené na důkazech. V oblasti onkologie Watson analyzuje genetické profily nádorů a pomáhá identifikovat potenciálně účinné léčebné postupy. Platforma také umožňuje zdravotnickým organizacím optimalizovat administrativní procesy, zlepšovat kvalitu péče a snižovat náklady. IBM Watson Health představuje enterprise řešení, které se implementuje na úrovni zdravotnických zařízení, výzkumných ústavů nebo farmaceutických společností.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Enterprise Solutions",
          price: "Individuální nacenění (obvykle od stovek tisíc do milionů $ ročně)",
          features: [
            "Analýza zdravotnických dat a klinické rozhodování",
            "Onkologická diagnostická podpora",
            "Genomická analýza",
            "Výzkum a vývoj léčiv",
            "Optimalizace zdravotnických procesů",
            "Implementace a integrace",
            "Podpora a školení"
          ]
        },
        {
          name: "Research Partnerships",
          price: "Variabilní dle rozsahu spolupráce",
          features: [
            "Spolupráce na výzkumných projektech",
            "Přístup k pokročilým analytickým nástrojům",
            "Sdílení dat a výsledků",
            "Společný vývoj nových aplikací AI ve zdravotnictví",
            "Publikace výsledků"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example1"]),
    hasTrial: false
  },
  {
    externalUrl: "https://www.google.com/health",
    name: "Google Health",
    description: "AI iniciativa společnosti Google zaměřená na zdravotnické technologie, včetně diagnostických nástrojů, analýzy medicínských obrazů a zdravotnického výzkumu",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://www.gstatic.com/images/branding/googlelogo/1x/googlelogo_color_74x24dp.png",
    tags: JSON.stringify(["strojové učení", "medicínské obrazy", "diagnostika", "výzkum", "zdravotní záznamy"]),
    advantages: JSON.stringify([
      "Pokročilé algoritmy strojového učení pro analýzu medicínských obrazů",
      "Vysoká přesnost v detekci a diagnostice různých onemocnění",
      "Masivní výpočetní infrastruktura umožňující zpracování velkých objemů dat",
      "Interdisciplinární týmy zahrnující lékaře, výzkumníky a AI experty",
      "Integrace s dalšími Google technologiemi a platformami"
    ]),
    disadvantages: JSON.stringify([
      "Některé nástroje jsou stále ve vývojové nebo výzkumné fázi",
      "Potenciální obavy o soukromí a bezpečnost zdravotních dat",
      "Primárně B2B zaměření s omezenou dostupností pro individuální uživatele",
      "Regionální regulační omezení v různých zemích"
    ]),
    detailInfo: "Google Health představuje iniciativu společnosti Google v oblasti zdravotnictví, která využívá pokročilé technologie umělé inteligence a strojového učení k řešení zdravotnických výzev. Mezi klíčové projekty patří algoritmy pro analýzu medicínských obrazů, které dokáží detekovat různá onemocnění včetně rakoviny, diabetické retinopatie a kardiovaskulárních chorob. Google vyvíjí také nástroje pro zpracování a analýzu elektronických zdravotních záznamů, predikci zdravotních rizik a optimalizaci zdravotnických procesů. Společnost spolupracuje s předními zdravotnickými institucemi na výzkumu a implementaci těchto technologií. Na rozdíl od některých konkurenčních řešení, Google Health často integruje své nástroje do existujících zdravotnických systémů a platforem. Kromě klinických aplikací se Google Health také zaměřuje na veřejné zdraví, včetně nástrojů pro predikci a monitorování epidemií.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Research & Development Partnerships",
          price: "Variabilní dle projektu",
          features: [
            "Společný výzkum a vývoj AI zdravotnických aplikací",
            "Přístup k výpočetním zdrojům Google",
            "Technická podpora a expertíza",
            "Možnost publikace výsledků",
            "Potenciální integrace do Google zdravotnických produktů"
          ]
        },
        {
          name: "Enterprise Solutions",
          price: "Individuální nacenění",
          features: [
            "Implementace AI nástrojů pro analýzu medicínských obrazů",
            "Integrace s elektronickými zdravotními záznamy",
            "Analýza zdravotnických dat a prediktivní modelování",
            "Cloud infrastruktura pro zpracování a ukládání dat",
            "Školicí programy pro zdravotnický personál"
          ]
        },
        {
          name: "API & Cloud Services",
          price: "Platba za využití (Pay-as-you-go)",
          features: [
            "Přístup k API pro analýzu medicínských obrazů",
            "Cloud služby pro zpracování zdravotnických dat",
            "Škálovatelná infrastruktura",
            "Technická podpora",
            "Zabezpečení a ochrana dat v souladu s regulacemi"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example2"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.microsoft.com/en-us/ai/healthcare",
    name: "Microsoft Healthcare AI",
    description: "Komplexní sada AI nástrojů a cloudových řešení pro zdravotnictví zaměřená na zlepšení zdravotní péče, klinický výzkum a zdravotnické operace",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31",
    tags: JSON.stringify(["cloud computing", "AI ve zdravotnictví", "analýza dat", "klinické rozhodování", "zdravotnický výzkum"]),
    advantages: JSON.stringify([
      "Silná integrace s Microsoft Azure cloudovou platformou a dalšími Microsoft produkty",
      "Komplexní řešení pokrývající celé spektrum zdravotnických potřeb",
      "Silné zaměření na bezpečnost a dodržování regulačních požadavků (HIPAA, GDPR)",
      "Škálovatelnost od malých klinik po velké zdravotnické systémy",
      "Rozsáhlý ekosystém partnerů a vývojářů"
    ]),
    disadvantages: JSON.stringify([
      "Vyžaduje investice do Microsoft technologií a Azure cloudové platformy",
      "Potenciálně složitá implementace pro organizace bez zkušeností s Microsoft produkty",
      "Některé pokročilé funkce jsou dostupné pouze ve vyšších cenových úrovních",
      "Nutnost technické expertízy pro plné využití potenciálu platformy"
    ]),
    detailInfo: "Microsoft Healthcare AI kombinuje cloudovou platformu Azure, AI nástroje a specializovaná zdravotnická řešení k transformaci zdravotní péče. Platforma zahrnuje několik klíčových komponent: Azure API for FHIR umožňuje bezpečné ukládání a výměnu zdravotnických dat, Azure Health Bot poskytuje inteligentní konverzační rozhraní pro pacienty, Azure Cognitive Services umožňuje implementaci AI pro zpracování obrazu, textu a řeči v zdravotnických aplikacích. Microsoft nabízí také specializované nástroje pro výzkum, jako je Project InnerEye pro analýzu medicínských obrazů a Microsoft Genomics pro genomický výzkum. Platforma podporuje vývoj prediktivních modelů pro identifikaci rizikových pacientů, optimalizaci klinických procesů a personalizaci léčby. Microsoft také aktivně spolupracuje s výzkumnými institucemi a zdravotnickými organizacemi na vývoji a implementaci nových AI aplikací ve zdravotnictví.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Azure Health Services",
          price: "Platba za využití (Pay-as-you-go)",
          features: [
            "Azure API for FHIR",
            "Azure Health Bot",
            "Základní Azure Cognitive Services",
            "Cloudové úložiště pro zdravotnická data",
            "Základní analytické nástroje"
          ]
        },
        {
          name: "Healthcare AI Solutions",
          price: "Od 5,000 $ měsíčně (závisí na rozsahu implementace)",
          features: [
            "Pokročilá analýza medicínských obrazů",
            "Prediktivní modelování klinických výsledků",
            "Personalizované doporučovací systémy pro léčbu",
            "Analýza zdravotnických dokumentů a záznamů",
            "Integrace s existujícími systémy EHR"
          ]
        },
        {
          name: "Enterprise Health Intelligence",
          price: "Individuální nacenění pro velké zdravotnické organizace",
          features: [
            "Komplexní platforma pro zdravotnickou analýzu",
            "Pokročilé nástroje pro operační excellence",
            "Přizpůsobené AI modely pro specifické klinické potřeby",
            "Integrace napříč celým zdravotnickým systémem",
            "Dedikovaná implementační a technická podpora",
            "Program školení a rozvoje dovedností"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example3"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.siemens-healthineers.com",
    name: "Siemens Healthineers AI-Rad Companion",
    description: "Rodina AI-poháněných aplikací pro radiologii, které pomáhají lékařům analyzovat medicínské obrazy a zefektivnit diagnostický proces",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://www.siemens-healthineers.com/images/meta/siemens-healthineers-logo.png",
    tags: JSON.stringify(["radiologie", "AI diagnostika", "medicínské zobrazování", "CT", "MRI", "RTG"]),
    advantages: JSON.stringify([
      "Automatizace rutinních úkolů v radiologickém hodnocení",
      "Zvýšení přesnosti diagnostiky a snížení rizika přehlédnutí patologií",
      "Zkrácení času potřebného k interpretaci snímků",
      "Integrace s existujícími PACS a radiologickými systémy",
      "Standardizace radiologického hodnocení napříč jednotlivými pracovišti"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší počáteční investice do technologie",
      "Nutnost kompatibilního hardwaru a softwarové infrastruktury",
      "Potřeba školení personálu pro efektivní využití",
      "AI výsledky vyžadují vždy kontrolu a finální potvrzení radiologem"
    ]),
    detailInfo: "Siemens Healthineers AI-Rad Companion představuje rodinu aplikací založených na umělé inteligenci, které asistují radiologům při interpretaci medicínských obrazů. Tyto aplikace využívají pokročilé algoritmy strojového učení k automatické detekci, kvantifikaci a charakterizaci anatomických struktur a patologií. AI-Rad Companion zahrnuje specializované moduly pro různé modality a anatomické oblasti: AI-Rad Companion Brain MR automaticky segmentuje a kvantifikuje mozkové struktury, AI-Rad Companion Chest CT analyzuje plicní, srdeční a kostní struktury na CT hrudníku, AI-Rad Companion Prostate MR pomáhá s hodnocením MRI prostaty a AI-Rad Companion Breast MR asistuje při analýze MRI prsou. Systém pracuje jako druhý čtenář, který automaticky zpracovává obrazová data, identifikuje potenciální nálezy a připravuje standardizované zprávy. Výsledky jsou dostupné v radiologických pracovních stanicích a integrují se do klinického workflow. AI-Rad Companion je dostupný jako cloudové řešení i jako on-premise instalace, což nabízí flexibilitu dle potřeb zdravotnického zařízení.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Module-based Subscription",
          price: "Od 2,000 € měsíčně za modul (variabilní dle modulu a objemu)",
          features: [
            "Přístup k jednotlivým AI-Rad Companion modulům",
            "Cloudové zpracování obrazových dat",
            "Integrace s existujícími PACS systémy",
            "Pravidelné aktualizace algoritmů",
            "Základní technická podpora"
          ]
        },
        {
          name: "Enterprise Solution",
          price: "Individuální nacenění dle velikosti instituce",
          features: [
            "Přístup ke všem AI-Rad Companion modulům",
            "On-premise nebo hybridní cloudové řešení",
            "Plná integrace s dalšími systémy Siemens Healthineers",
            "Rozšířená technická podpora",
            "Program školení pro radiologický personál",
            "Služby implementace a optimalizace workflow"
          ]
        },
        {
          name: "Pay-per-use",
          price: "Platba za vyšetření (od 5 € za analýzu)",
          features: [
            "Platba pouze za skutečně využité analýzy",
            "Flexibilní využití různých modulů",
            "Bez dlouhodobých závazků",
            "Základní cloudová implementace",
            "Standardní technická podpora"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example4"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.philips.com/healthcare",
    name: "Philips IntelliSpace AI Workflow Suite",
    description: "Komplexní AI platforma pro radiologii a kardiologii, která integruje umělou inteligenci do klinických workflow a pomáhá zlepšit diagnostickou přesnost",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://www.philips.com/c-dam/corporate/newscenter/global/standard/resources/healthcare/2018/intellispace-pacs/Philips_shield_groot_RGB_HR.jpg",
    tags: JSON.stringify(["radiologie", "kardiologie", "AI diagnostika", "workflow optimalizace", "PACS integrace"]),
    advantages: JSON.stringify([
      "Integrace AI nástrojů přímo do radiologických a kardiologických workflow",
      "Kombinace AI aplikací od Philips i třetích stran v jedné platformě",
      "Centralizovaný přehled a správa výsledků AI analýz",
      "Plná interoperabilita s PACS, EMR a dalšími klinickými systémy",
      "Možnost přizpůsobení dle specifických potřeb daného zdravotnického zařízení"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší počáteční investice do infrastruktury a licence",
      "Nutnost integrace s existujícími systémy Philips pro plnou funkcionalitu",
      "Komplexní implementace vyžadující IT podporu a školení personálu",
      "Někteří konkurenti mohou nabízet specializovanější AI řešení pro specifické diagnózy"
    ]),
    detailInfo: "Philips IntelliSpace AI Workflow Suite je komplexní platforma navržená pro integraci AI technologií do běžných klinických workflow v radiologii a kardiologii. Systém funguje jako centrální hub pro AI aplikace, které analyzují medicínské obrazy a pomáhají lékařům s diagnostikou a rozhodováním. Platforma standardizuje způsob, jakým jsou AI výsledky prezentovány, a zajišťuje automatické začlenění těchto výsledků do klinických zpráv a dokumentace. IntelliSpace AI Workflow Suite podporuje nasazení AI aplikací vyvinutých společností Philips i třetími stranami, což umožňuje zdravotnickým zařízením vytvořit přizpůsobené portfolio AI nástrojů dle jejich potřeb. Systém se zaměřuje na zlepšení diagnostické přesnosti, zvýšení efektivity radiologů a kardiologů, a standardizaci diagnostických procesů. Platforma je plně integrována s dalšími systémy Philips, včetně PACS, informačních systémů a diagnostických přístrojů, což umožňuje bezproblémové začlenění AI do existujících workflow.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Standard Package",
          price: "Od 75,000 $ ročně (závisí na velikosti instituce)",
          features: [
            "Základní IntelliSpace AI Workflow Suite platforma",
            "Předplatné vybraných AI aplikací Philips",
            "Integrace s PACS a RIS systémy",
            "Standardní reporty a analytika",
            "Technická podpora a aktualizace"
          ]
        },
        {
          name: "Premium Package",
          price: "Od 150,000 $ ročně",
          features: [
            "Plný přístup k IntelliSpace AI Workflow Suite",
            "Rozšířené portfolio AI aplikací",
            "Integrace aplikací třetích stran",
            "Pokročilá vizualizace a reportování",
            "Prioritní podpora a dedikovaný account manager",
            "Adaptivní workflow optimalizace"
          ]
        },
        {
          name: "Enterprise Solution",
          price: "Individuální nacenění pro velké zdravotnické systémy",
          features: [
            "Přizpůsobené řešení pro celý zdravotnický systém",
            "Integrace napříč všemi odděleními a lokacemi",
            "Vlastní AI workflow design",
            "Implementace a školení na míru",
            "Služby strategického konzultingu",
            "Možnost spoluúčasti na vývoji nových AI aplikací"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example5"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.gehealthcare.com",
    name: "GE Healthcare Edison AI Platform",
    description: "Komplexní AI ekosystém pro zdravotnictví, který integruje umělou inteligenci do zobrazovacích metod, workflow a klinického rozhodování",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://www.gehealthcare.com/-/jssmedia/gehc/global/logos/logo-blue.svg",
    tags: JSON.stringify(["medicínské zobrazování", "klinické workflow", "AI diagnostika", "nemocniční efektivita", "interoperabilita"]),
    advantages: JSON.stringify([
      "Otevřený AI ekosystém s možností integrace aplikací třetích stran",
      "Silná integrace s GE zobrazovacími modalitami a informačními systémy",
      "AI nástroje dostupné 'on-device', 'on-premise' i v cloudu dle potřeby",
      "Komplexní přístup pokrývající celý klinický workflow",
      "Edison Developer Program pro vývoj nových AI aplikací"
    ]),
    disadvantages: JSON.stringify([
      "Nejvyšší přidaná hodnota při používání GE zdravotnických zařízení",
      "Vyšší náklady na implementaci a licencování",
      "Komplexita systému vyžaduje významné IT zdroje",
      "Potřeba přizpůsobení a integrace s existujícími systémy"
    ]),
    detailInfo: "GE Healthcare Edison je komplexní AI platforma navržená pro integraci umělé inteligence do různých aspektů zdravotní péče. Systém funguje jako ekosystém pro vývoj, implementaci a škálování AI aplikací napříč klinickými specializacemi. Edison poskytuje vývojářům nástroje, knihovny a služby pro tvorbu zdravotnických AI aplikací, zatímco zdravotnickým zařízením nabízí přístup k rostoucímu portfoliu validovaných AI řešení. Platforma je implementována na různých úrovních - přímo v medicínských přístrojích (on-device), v lokální infrastruktuře zdravotnického zařízení (on-premise) nebo v cloudu, což umožňuje flexibilitu dle potřeb a možností daného zařízení. Edison zahrnuje několik klíčových komponent, včetně Edison Platform (infrastruktura a nástroje), Edison Applications (portfolio AI aplikací) a Edison Services (vývojářské nástroje a služby). Systém je optimalizován pro práci s GE Healthcare zobrazovacími modalitami a informačními systémy, ale je navržen s důrazem na interoperabilitu a otevřené standardy.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Edison Basic",
          price: "Od 50,000 $ ročně (závisí na velikosti instituce)",
          features: [
            "Přístup k vybraným Edison AI aplikacím",
            "Základní integrace s GE zdravotnickými přístroji",
            "Standardní technická podpora",
            "Cloudové řešení s omezenou kapacitou",
            "Základní analytické nástroje"
          ]
        },
        {
          name: "Edison Professional",
          price: "Od 150,000 $ ročně",
          features: [
            "Rozšířený přístup k Edison AI ekosystému",
            "Pokročilé analytické nástroje a workflow optimalizace",
            "On-premise nebo hybridní cloudové nasazení",
            "Prioritní technická podpora",
            "Integrace s EMR a dalšími klinickými systémy",
            "Customizace dle potřeb zařízení"
          ]
        },
        {
          name: "Edison Enterprise",
          price: "Individuální nacenění pro velké zdravotnické systémy",
          features: [
            "Neomezený přístup k celému portfoliu Edison aplikací",
            "Enterprise-wide integrace a nasazení",
            "Dedikovaný implementation tým",
            "Možnost účasti v Edison Developer Program",
            "Strategické partnerství s GE Healthcare",
            "Customizované AI řešení na míru"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example6"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.butterflynetwork.com",
    name: "Butterfly iQ+",
    description: "Přenosný ultrazvukový systém s AI podporou, který přeměňuje smartphone na diagnostický nástroj a demokratizuje přístup k medicínskému zobrazování",
    price: 2399,
    category: "Zdravotnictví",
    imageUrl: "https://www.butterflynetwork.com/assets/favicon.svg",
    tags: JSON.stringify(["ultrazvuk", "přenosná diagnostika", "point-of-care", "telemedicína", "AI asistence"]),
    advantages: JSON.stringify([
      "Kompaktní celokapesní ultrazvukové zařízení kompatibilní s běžnými smartphony",
      "AI asistence pro interpretaci obrazu a navedení uživatele",
      "Jediná sonda pokrývající celé tělo (lineární, konvexní a sektorové zobrazení)",
      "Cloudové ukládání a sdílení vyšetření pro konzultace",
      "Výrazně nižší cena oproti tradičním ultrazvukovým systémům"
    ]),
    disadvantages: JSON.stringify([
      "Nižší obrazová kvalita ve srovnání s prémiovými klinickými ultrazvuky",
      "Omezená hloubka penetrace u některých aplikací",
      "Vyžaduje kompatibilní smartphone nebo tablet",
      "Některé pokročilé funkce vyžadují předplatné Butterfly Enterprise"
    ]),
    detailInfo: "Butterfly iQ+ je revoluční přenosný ultrazvukový systém velikosti sondy, který se připojuje přímo k smartphonu nebo tabletu a přeměňuje ho v plnohodnotný diagnostický nástroj. Na rozdíl od tradičních ultrazvuků používá Butterfly iQ+ technologii čipu na bázi polovodičů (Ultrasound-on-Chip™) místo piezoelektrických krystalů, což umožňuje vytvoření kompaktního zařízení za zlomek ceny konvenčních systémů. Zařízení obsahuje integrované AI funkce, které pomáhají s interpretací obrazu a navádějí uživatele při vyšetření. AI asistence zahrnuje automatickou identifikaci orgánů, měření ejekční frakce srdce, detekci B-lines v plicích a navedení jehly. Butterfly podporuje 20+ klinických aplikací včetně kardiologie, plicní diagnostiky, gynekologie a traumatologie. Součástí ekosystému je cloudová platforma Butterfly Cloud, která umožňuje ukládání, sdílení a analýzu vyšetření. Zařízení je navrženo nejen pro nemocnice, ale i pro použití v ordinacích praktických lékařů, v terénu nebo v rozvojových zemích, čímž demokratizuje přístup k diagnostickému zobrazování.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Butterfly iQ+ Personal",
          price: "2,399 $ jednorázově + 399 $ ročně",
          features: [
            "Butterfly iQ+ ultrazvuková sonda",
            "Butterfly aplikace pro iOS/Android",
            "Základní AI funkce pro navedení a interpretaci",
            "Cloudové ukládání (až 10 GB)",
            "Roční licence a limitovaná záruka",
            "Vzdělávací materiály"
          ]
        },
        {
          name: "Butterfly Pro",
          price: "2,399 $ jednorázově + 599 $ ročně",
          features: [
            "Všechny funkce Personal",
            "Rozšířené AI diagnostické nástroje",
            "Neomezené cloudové úložiště",
            "Pokročilé měření a anotace",
            "Prioritní podpora",
            "Rozšířená záruka"
          ]
        },
        {
          name: "Butterfly Enterprise",
          price: "Individuální nacenění (množstevní slevy)",
          features: [
            "Správa více zařízení v rámci instituce",
            "Integrace s PACS a EMR systémy",
            "Rozšířené administrativní a správní nástroje",
            "Customizované workflow a protokoly",
            "Dedikovaná implementační podpora",
            "Analýza využití a výkonnostní metriky",
            "Program školení a certifikace"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example7"]),
    hasTrial: false
  },
  {
    externalUrl: "https://www.pathai.com",
    name: "PathAI",
    description: "AI platforma pro digitální patologii, která pomáhá patologům s přesnější diagnostikou, kvantifikací biomarkerů a podporou klinických studií",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://www.pathai.com/hubfs/pathai_favicon-1.png",
    tags: JSON.stringify(["patologie", "digitální diagnostika", "biomarkery", "klinické studie", "onkologie"]),
    advantages: JSON.stringify([
      "Zvýšení přesnosti a konzistence patologické diagnostiky pomocí AI",
      "Automatizace rutinních a časově náročných úkolů",
      "Kvantitativní analýza biomarkerů s vyšší přesností než manuální hodnocení",
      "Redukce variability mezi různými patology",
      "Podpora výzkumu a vývoje léčiv prostřednictvím přesnější stratifikace pacientů"
    ]),
    disadvantages: JSON.stringify([
      "Vyžaduje digitalizaci patologických vzorků (whole slide imaging)",
      "Počáteční investice do infrastruktury a digitalizace",
      "Závislost na kvalitě digitalizovaných snímků",
      "Regulační omezení v některých regionech pro plně automatizovanou diagnostiku"
    ]),
    detailInfo: "PathAI je přední platforma v oblasti digitální patologie, která využívá umělou inteligenci k transformaci diagnostických procesů a výzkumu v patologii. Systém používá pokročilé algoritmy strojového učení k analýze digitalizovaných patologických vzorků, identifikaci buněčných struktur, kvantifikaci biomarkerů a detekci diagnosticky významných vzorců. PathAI se zaměřuje na několik klíčových oblastí: klinickou diagnostiku, kde asistuje patologům při interpretaci vzorků; farmaceutický výzkum, kde pomáhá s vývojem léčiv a klinickými studiemi; a akademický výzkum, kde podporuje vědecké bádání v oblasti patologie. Platforma nabízí konzistentní, kvantitativní a reprodukovatelné výsledky, které překonávají limity subjektivního manuálního hodnocení. PathAI aktivně spolupracuje s farmaceutickými společnostmi na vývoji companion diagnostics, identifikaci biomarkerů a stratifikaci pacientů pro klinické studie. Systém je navržen jako asistent patologa, který zvyšuje jeho efektivitu a přesnost, nikoliv jako náhrada lidského odborníka.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Clinical Diagnostic Solution",
          price: "Individuální nacenění pro zdravotnická zařízení",
          features: [
            "AI asistence pro běžnou diagnostiku",
            "Integrace s existujícími laboratorními systémy",
            "Kvantitativní analýza biomarkerů",
            "Workflow pro druhé názory a konzultace",
            "Školení a implementační podpora"
          ]
        },
        {
          name: "Research Solution",
          price: "Od 20,000 $ ročně (závisí na rozsahu výzkumu)",
          features: [
            "Přístup k AI nástrojům pro výzkumné účely",
            "Analýza dat a interpretace výsledků",
            "Podpora publikací a prezentací",
            "Customizované algoritmy a modely",
            "Kolaborativní výzkumná platforma"
          ]
        },
        {
          name: "Pharma Partnership",
          price: "Komplexní partnerské smlouvy",
          features: [
            "Vývoj companion diagnostics",
            "Podpora klinických studií",
            "Identifikace a validace biomarkerů",
            "Stratifikace a selekce pacientů",
            "Integrace s regulačními procesy",
            "Společný vývoj nových AI řešení"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example8"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.enlitic.com",
    name: "Enlitic Curie",
    description: "AI platforma pro radiologii, která automatizuje workflow, standardizuje reportování a zvyšuje diagnostickou přesnost pomocí hlubokého učení",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://www.enlitic.com/hubfs/Downloads/Brand%20Resources/enlitic_logo_square.png",
    tags: JSON.stringify(["radiologie", "workflow optimalizace", "AI diagnostika", "standardizace reportů", "DICOM"]),
    advantages: JSON.stringify([
      "Automatizace radiologického workflow od příjmu snímku po finální report",
      "Standardizace terminologie a formátu radiologických zpráv",
      "Inteligentní prioritizace studií na základě urgentních nálezů",
      "Snížení administrativní zátěže radiologů",
      "Integrace s existujícími PACS a RIS systémy"
    ]),
    disadvantages: JSON.stringify([
      "Vyžaduje dostatečné technické zázemí a IT infrastrukturu",
      "Počáteční investice do implementace a integrace",
      "Potřeba adaptace stávajících workflow procesů",
      "Závislost na kvalitě vstupních dat a DICOM metadat"
    ]),
    detailInfo: "Enlitic Curie představuje komplexní AI platformu zaměřenou na transformaci radiologických workflow. Na rozdíl od mnoha konkurenčních řešení, které se soustředí primárně na diagnostickou asistenci, Enlitic se zaměřuje na celý process flow - od příjmu snímku, přes jeho analýzu, až po vytvoření a distribuci radiologické zprávy. Klíčovou komponentou je Curie|ENDEX, který automaticky extrahuje, normalizuje a strukturuje DICOM metadata, což umožňuje efektivnější organizaci a vyhledávání studií. Curie|ENCODE používá pokročilé algoritmy hlubokého učení k analýze medicínských obrazů, identifikaci anatomických struktur a detekci abnormalit. Výsledky této analýzy jsou integrovány do Curie|ENGAGE, který generuje strukturované, standardizované radiologické zprávy s konzistentní terminologií. Systém je navržen tak, aby se plynule integroval do existujících PACS a RIS systémů, což minimalizuje narušení zavedených procesů. Enlitic Curie je využíván zdravotnickými zařízeními po celém světě k zefektivnění radiologických procesů, zvýšení produktivity radiologů a zlepšení kvality péče o pacienty.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Curie Standard",
          price: "Od 75,000 $ ročně (závisí na objemu studií)",
          features: [
            "Základní Curie platforma (ENDEX, ENCODE, ENGAGE)",
            "Integrace s jedním PACS/RIS systémem",
            "Standardní balíček AI modelů",
            "Základní technická podpora",
            "Implementační služby"
          ]
        },
        {
          name: "Curie Professional",
          price: "Od 150,000 $ ročně",
          features: [
            "Rozšířená Curie platforma",
            "Integrace s více PACS/RIS systémy",
            "Kompletní balíček AI modelů",
            "Prioritní technická podpora",
            "Pokročilá analýza dat a reportování",
            "Přizpůsobení workflow dle potřeb organizace"
          ]
        },
        {
          name: "Curie Enterprise",
          price: "Individuální nacenění pro velké zdravotnické systémy",
          features: [
            "Enterprise-wide nasazení Curie platformy",
            "Komplexní integrace napříč institucí",
            "Customizace AI modelů a workflow",
            "Dedikovaný implementation team",
            "24/7 prémiová podpora",
            "Možnost vývoje nových AI funkcí na míru"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example9"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.ardenthealth.com",
    name: "Ardent AI Health Assistant",
    description: "AI platforma pro proaktivní zdravotní management, která kombinuje prediktivní analýzu, personalizované intervence a koordinaci péče",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://www.ardenthealth.com/sites/all/themes/custom/ardent/logo.svg",
    tags: JSON.stringify(["prediktivní analýza", "zdravotní management", "chronická onemocnění", "preventivní péče", "koordinace péče"]),
    advantages: JSON.stringify([
      "Proaktivní identifikace rizikových pacientů pomocí prediktivních modelů",
      "Personalizované zdravotní intervence založené na individuálních potřebách",
      "Zlepšená koordinace péče mezi různými poskytovateli zdravotních služeb",
      "Snížení nákladů na zdravotní péči prostřednictvím včasných intervencí",
      "Komplexní přehled o zdravotním stavu pacienta napříč různými zdravotními epizodami"
    ]),
    disadvantages: JSON.stringify([
      "Vyžaduje rozsáhlou integraci s různými zdroji zdravotnických dat",
      "Efektivita závisí na kvalitě a úplnosti dostupných dat",
      "Komplexní implementace vyžadující změny v organizaci zdravotní péče",
      "Potenciální výzvy s akceptací ze strany zdravotnického personálu"
    ]),
    detailInfo: "Ardent AI Health Assistant je komplexní platforma zaměřená na proaktivní management zdraví pacientů a populací, která využívá umělou inteligenci k identifikaci rizik, predikci zdravotních komplikací a koordinaci péče. Systém integruje data z různých zdrojů - elektronických zdravotních záznamů, pojišťoven, laboratorních výsledků a wearables - k vytvoření holistického pohledu na zdravotní stav pacienta. Pokročilé algoritmy strojového učení analyzují tyto údaje v reálném čase, identifikují vzorce a predikují potenciální komplikace ještě před jejich vznikem. Na základě těchto predikcí platforma generuje personalizované intervence a doporučení, které jsou komunikovány pacientům i zdravotnickým týmům. Ardent AI se zaměřuje především na management chronických onemocnění, post-akutní péči a přechody mezi různými úrovněmi zdravotní péče. Systém pomáhá zdravotnickým zařízením zlepšovat klinické výsledky, zvyšovat spokojenost pacientů a optimalizovat využití zdrojů. Platforma je využívána nemocničními řetězci, pojišťovnami a organizacemi typu ACO (Accountable Care Organizations) k implementaci value-based care modelů a proaktivního přístupu ke zdraví populací.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Provider Solution",
          price: "Od 10 $ měsíčně za pacienta (minimálně 1,000 pacientů)",
          features: [
            "Prediktivní analýza rizik pacientů",
            "Klinické dashboardy a reporty",
            "Nástroje pro koordinaci péče",
            "Integrace s EMR systémy",
            "Automatizované notifikace pro zdravotnický personál"
          ]
        },
        {
          name: "Payer Solution",
          price: "Od 5 $ měsíčně za pojištěnce (minimálně 10,000 pojištěnců)",
          features: [
            "Populační analýza a stratifikace rizik",
            "Identifikace příležitostí pro intervence",
            "Analýza nákladů a utilizace",
            "Nástroje pro management chronických onemocnění",
            "Integrace s pojišťovacími systémy"
          ]
        },
        {
          name: "Enterprise Health System",
          price: "Individuální nacenění dle velikosti zdravotnického systému",
          features: [
            "Komplexní řešení pro celý zdravotnický systém",
            "Integrace napříč všemi zařízeními a úrovněmi péče",
            "Pokročilé analytické nástroje a customizované modely",
            "Strategické konzultace a implementační služby",
            "Kontinuální optimalizace a vývoj nových funkcí",
            "Měření a reporting ROI"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example10"]),
    hasTrial: true
  }
];

async function updateOrCreateProducts() {
  console.log("Ukládám AI zdravotnické enterprise nástroje do databáze (dávka 17)...");
  
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