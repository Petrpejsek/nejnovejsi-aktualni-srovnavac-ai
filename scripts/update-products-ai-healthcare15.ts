import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// AI healthcare tools - batch 15
const aiHealthcareProducts = [
  {
    externalUrl: "https://www.talkspace.com",
    name: "Talkspace",
    description: "Online terapeutická platforma využívající AI pro propojení pacientů s terapeuty a poskytování digitální podpory duševního zdraví",
    price: 69,
    category: "Zdravotnictví",
    imageUrl: "https://images.ctfassets.net/v3n26e09qg2r/4JWTb8r9hWVTt9qkgMDwQX/2d7bb39f951b2e2df69031474b1af86b/Talkspace_Brandmark_ColorDark.png",
    tags: JSON.stringify(["duševní zdraví", "terapie", "online poradenství", "AI podpora", "telehealth"]),
    advantages: JSON.stringify([
      "Dostupnost terapie odkudkoliv s internetovým připojením",
      "Flexibilní plány a možnosti komunikace (text, audio, video)",
      "AI asistent pomáhá s prvotním posouzením a doporučením vhodného terapeuta",
      "Nižší cena oproti tradiční terapii",
      "Diskrétnost a soukromí"
    ]),
    disadvantages: JSON.stringify([
      "Absence osobního kontaktu může některým pacientům nevyhovovat",
      "Ne všechny pojišťovny hradí online terapii",
      "Méně vhodné pro akutní krize a vážné psychiatrické stavy",
      "Kvalita terapie se může lišit dle přiděleného terapeuta"
    ]),
    detailInfo: "Talkspace je přední platforma pro online terapii, která využívá umělou inteligenci k propojení klientů s licencovanými terapeuty a k poskytování průběžné podpory. Platforma používá AI algoritmy k vyhodnocení potřeb klienta, doporučení vhodného terapeuta a monitorování průběhu terapie. Klienti mohou komunikovat se svými terapeuty prostřednictvím textových zpráv, audio nebo video hovorů. AI asistent také analyzuje komunikaci a pomáhá terapeutům sledovat náladu klienta, identifikovat klíčová témata a navrhovat vhodné terapeutické přístupy. Talkspace nabízí specializované programy pro různé potíže včetně úzkosti, deprese, párové terapie a závislostí.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Messaging Therapy",
          price: "69 $ týdně",
          features: [
            "Neomezené textové zprávy terapeutovi",
            "Odpovědi terapeuta 5 dní v týdnu",
            "AI asistent pro průběžnou podporu",
            "Přístup k digitálním vzdělávacím materiálům",
            "Sledování nálady a pokroku"
          ]
        },
        {
          name: "Live Therapy",
          price: "99 $ týdně",
          features: [
            "Všechny funkce z Messaging Therapy",
            "4 živé 30minutové video session měsíčně",
            "Rozšířená AI analýza terapeutických sezení",
            "Personalizovaná cvičení a aktivity",
            "Prioritní podpora"
          ]
        },
        {
          name: "Talkspace Psychiatry",
          price: "249 $ za úvodní konzultaci, 125 $ za follow-up",
          features: [
            "Psychiatrické vyšetření a diagnostika",
            "Předepisování léků (kde je to legálně možné)",
            "AI podpora pro monitoring účinků léků",
            "Koordinace péče s terapeutem",
            "Přístup k dokumentaci a léčebnému plánu"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example1"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.ginger.com",
    name: "Ginger",
    description: "Komplexní platforma pro péči o duševní zdraví s AI koučováním, terapií a psychiatrickou péčí na vyžádání",
    price: 50,
    category: "Zdravotnictví",
    imageUrl: "https://www.ginger.com/hubfs/Headspace%20Health_Ginger_Logo.png",
    tags: JSON.stringify(["duševní zdraví", "koučování", "terapie", "psychiatrie", "AI asistent"]),
    advantages: JSON.stringify([
      "Okamžitý přístup k AI koučování duševního zdraví 24/7",
      "Integrace různých úrovní péče (koučování, terapie, psychiatrie)",
      "Personalizované plány péče na základě AI analýzy",
      "Monitoring pokroku a adaptace léčebného plánu",
      "Často nabízeno jako zaměstnanecký benefit"
    ]),
    disadvantages: JSON.stringify([
      "Primárně dostupné jako zaměstnanecký benefit nebo přes pojištění",
      "Omezená dostupnost pro individuální předplatitele",
      "Může být méně osobní než tradiční péče o duševní zdraví",
      "Liší se pokrytí pojišťoven"
    ]),
    detailInfo: "Ginger (nyní součást Headspace Health) je platforma pro péči o duševní zdraví, která kombinuje AI technologii s lidskými odborníky. Nabízí víceúrovňový přístup zahrnující AI koučování, terapii a psychiatrickou péči. AI systém Ginger analyzuje interakce uživatelů, identifikuje vzorce a trendy, a poskytuje personalizovaná doporučení. Platforma nabízí textový chat s AI koučem dostupný 24/7, který může eskalovat případy k lidským terapeutům nebo psychiatrům podle potřeby. Ginger je často nabízen jako zaměstnanecký benefit a spolupracuje s pojišťovnami. AI také pomáhá koučům a terapeutům sledovat pokrok klientů, identifikovat rizikové faktory a přizpůsobovat léčebné plány.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Behavioral Health Coaching",
          price: "Obvykle součást zaměstnaneckého benefitu (cca 50 $ měsíčně)",
          features: [
            "Neomezený textový chat s AI koučem 24/7",
            "Personalizovaný plán duševního zdraví",
            "Sledování cílů a pokroku",
            "Digitální cvičení a zdroje pro svépomoc",
            "Možnost eskalace k terapeutovi"
          ]
        },
        {
          name: "Therapy & Psychiatric Care",
          price: "Zdravotní pojištění nebo zaměstnanecký program (individuálně)",
          features: [
            "Všechny funkce koučování",
            "Video sezení s licencovanými terapeuty",
            "Psychiatrické konzultace a předepisování léků",
            "Koordinovaná péče mezi koučem, terapeutem a psychiatrem",
            "AI monitorování a podpora mezi sezeními"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example2"]),
    hasTrial: true
  },
  {
    externalUrl: "https://www.kaiserpermanente.org",
    name: "Kaiser Permanente AI Health Hub",
    description: "Integrovaný systém zdravotní péče využívající AI pro prevenci nemocí, personalizaci léčby a zlepšení výsledků pacientů",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://static.spacecrafted.com/c55e25d1c04343a3a5ed3e33c59a67bb/i/9c9de11fa5da4f33a6c4172ab2ea71d7/1/4SoifmQp45JMgBnHp7ed2/Kaiser-Permanente-Logo.png",
    tags: JSON.stringify(["preventivní péče", "telemedicína", "personalizovaná medicína", "AI diagnostika", "zdravotní pojištění"]),
    advantages: JSON.stringify([
      "Integrovaný přístup kombinující pojištění a poskytování zdravotní péče",
      "AI predikce zdravotních rizik pro včasné zásahy",
      "Kontinuita péče napříč všemi specializacemi díky centralizovaným datům",
      "Virtuální konzultace a telemedicína s AI asistencí",
      "Personalizované plány léčby a prevence"
    ]),
    disadvantages: JSON.stringify([
      "Dostupné pouze členům Kaiser Permanente",
      "Regionální omezení (primárně USA)",
      "Vyšší měsíční pojistné oproti některým tradičním pojišťovnám",
      "Omezená síť poskytovatelů mimo systém Kaiser"
    ]),
    detailInfo: "Kaiser Permanente implementuje pokročilé AI technologie napříč svým integrovaným systémem zdravotní péče, který kombinuje pojištění, nemocnice a lékařské skupiny. Jejich AI systémy analyzují zdravotní záznamy, výsledky testů a demografické údaje k predikci zdravotních rizik a doporučení preventivních opatření. AI nástroje pomáhají lékařům s diagnostikou, podporují rozhodování o léčbě a optimalizují plánování péče. Platforma zahrnuje virtuální návštěvy s AI asistencí, chatboty pro základní zdravotní dotazy a aplikace pro monitoring chronických onemocnění. AI algoritmy také identifikují pacienty s vysokým rizikem hospitalizace nebo komplikací, což umožňuje včasné intervence.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Bronze",
          price: "Zdravotní pojištění (ceny se liší)",
          features: [
            "Základní preventivní péče s AI predikcí rizik",
            "Přístup k telemedicíně a virtuálním návštěvám",
            "Základní AI monitoring chronických stavů",
            "Mobilní aplikace s AI zdravotním asistentem",
            "Online přístup ke zdravotním záznamům"
          ]
        },
        {
          name: "Silver/Gold/Platinum",
          price: "Zdravotní pojištění (vyšší úrovně)",
          features: [
            "Všechny funkce z Bronze",
            "Rozšířená preventivní péče a screeningy",
            "Pokročilá AI personalizace léčby",
            "Prioritní virtuální konzultace",
            "Rozšířené nástroje pro monitoring zdraví",
            "Integrované wellness programy s AI koučováním"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example3"]),
    hasTrial: false
  },
  {
    externalUrl: "https://www.mayoclinic.org",
    name: "Mayo Clinic AI Healthcare Platform",
    description: "Prestižní zdravotnická instituce využívající umělou inteligenci pro diagnostiku, personalizovanou léčbu a výzkum v medicíně",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://cdn.mayoclinic.org/mayo-clinic-logo.svg",
    tags: JSON.stringify(["diagnostická AI", "personalizovaná medicína", "zdravotní výzkum", "digitální zdraví", "telemedicína"]),
    advantages: JSON.stringify([
      "Špičková diagnostická přesnost díky kombinaci AI a expertízy předních lékařů",
      "Personalizované léčebné plány založené na genetických a klinických datech",
      "Přístup k inovativním léčebným metodám a klinickým studiím",
      "AI predikce zdravotních rizik a komplikací",
      "Kontinuita péče s komplexní analýzou historických dat pacienta"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší náklady za specializovanou péči",
      "Potenciálně dlouhé čekací doby na konzultace",
      "Geografická omezení pro osobní návštěvy (hlavní centra v USA)",
      "Ne všechny AI služby jsou hrazeny pojištěním"
    ]),
    detailInfo: "Mayo Clinic integruje umělou inteligenci do mnoha aspektů své lékařské praxe, výzkumu a vzdělávání. Jejich AI systémy analyzují miliony zdravotních záznamů, lékařských obrazů a genetických dat k podpoře diagnostiky, predikci výsledků léčby a personalizaci léčebných plánů. Mayo vyvinula vlastní AI nástroje pro analýzu EKG, které dokáží detekovat srdeční onemocnění a další stavy, které nejsou viditelné pouhým okem. Jejich platforma pro digitální zdraví kombinuje telemedicínu, vzdálený monitoring pacientů a AI asistenty. V oblasti výzkumu Mayo využívá AI k objevování nových biomarkerů, vývoji léků a identifikaci kandidátů pro klinické studie.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Standard Care",
          price: "Variabilní dle pojištění a péče",
          features: [
            "Přístup k diagnostice podporované AI",
            "Personalizované léčebné plány",
            "Telemedicína s AI asistencí pro předběžné hodnocení",
            "Digitální zdravotní záznamy s AI analýzou trendů",
            "Základní monitoring chronických onemocnění"
          ]
        },
        {
          name: "Executive Health Program",
          price: "Od 5,000 $ (závisí na rozsahu)",
          features: [
            "Komplexní zdravotní hodnocení s AI analýzou",
            "Pokročilá preventivní péče a screeningy",
            "Prioritní přístup ke specialistům",
            "Genetické testování s AI interpretací",
            "Personalizovaný plán wellness a prevence",
            "Dedikovaný koordinátor péče"
          ]
        },
        {
          name: "Clinical Trials & Research",
          price: "Často bez poplatku pro účastníky",
          features: [
            "Přístup k inovativním AI metodám diagnostiky a léčby",
            "Pokročilá genomická analýza",
            "Experimentální léčebné přístupy",
            "Průběžný monitoring s AI vyhodnocením dat",
            "Přispění k pokroku v medicíně"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example4"]),
    hasTrial: false
  },
  {
    externalUrl: "https://www.clevelandclinic.org",
    name: "Cleveland Clinic AI Healthcare System",
    description: "Prestižní lékařské centrum implementující AI technologie pro zlepšení diagnostiky, personalizované léčby a výzkumu závažných onemocnění",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://my.clevelandclinic.org/-/scassets/images/org/brand/cleveland-clinic-logo.svg",
    tags: JSON.stringify(["zdravotní výzkum", "diagnostická AI", "personalizovaná medicína", "speciální péče", "lékařské vzdělávání"]),
    advantages: JSON.stringify([
      "Pokročilé AI algoritmy pro diagnostiku komplexních onemocnění",
      "Přístup k nejnovějšímu výzkumu a klinickým studiím",
      "Multidisciplinární týmy specialistů podporované AI nástroji",
      "Personalizovaná léčba založená na molekulárních a genetických datech",
      "AI predikce a prevence komplikací u vysoce rizikových pacientů"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší náklady specializované péče",
      "Geografická omezenost hlavních center na USA",
      "Potenciálně dlouhé čekací doby pro konzultace",
      "Některé AI služby nemusí být hrazeny pojišťovnami"
    ]),
    detailInfo: "Cleveland Clinic patří mezi světově uznávané lékařské instituce, které aktivně integrují umělou inteligenci do zdravotní péče a výzkumu. Jejich AI iniciativy zahrnují vývoj nástrojů pro analýzu lékařských obrazů, prediktivní algoritmy pro včasnou detekci onemocnění a systémy pro optimalizaci léčebných plánů. Klinika spolupracuje s technologickými partnery na vývoji AI řešení pro kardiovaskulární nemoci, onkologii, neurologické poruchy a další specializované oblasti. Jejich Center for Clinical Artificial Intelligence využívá rozsáhlé klinické databáze k vytváření a validaci AI modelů. Klinika také implementuje AI systémy pro zlepšení provozní efektivity, snížení administrativní zátěže lékařů a optimalizaci péče o pacienty.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Standard Care",
          price: "Variabilní (závisí na pojištění a poskytované péči)",
          features: [
            "Diagnostika podporovaná AI",
            "Personalizované léčebné plány",
            "Telemedicína s AI asistencí",
            "Přístup k základním klinickým studiím",
            "Digitální zdravotní záznamy s AI analýzou"
          ]
        },
        {
          name: "Executive Health Program",
          price: "Od 4,500 $ (individuálně)",
          features: [
            "Komplexní one-day zdravotní hodnocení s AI analýzou",
            "Pokročilá diagnostika a screeningy",
            "Personalizovaný plán prevence generovaný AI",
            "Prioritní přístup ke specialistům",
            "Koordinovaná následná péče"
          ]
        },
        {
          name: "Research & Clinical Trials",
          price: "Variabilní/často bez poplatku pro účastníky",
          features: [
            "Přístup k nejnovějším AI technologiím v medicíně",
            "Experimentální léčebné metody",
            "Pokročilé genomické profilování",
            "AI predikce léčebné odpovědi",
            "Přispění k medicínskému pokroku"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example5"]),
    hasTrial: false
  },
  {
    externalUrl: "https://www.mountsinai.org",
    name: "Mount Sinai AI Healthcare Platform",
    description: "Inovativní zdravotnický systém propojující AI technologie s klinickou péčí pro přesnější diagnostiku, léčbu a výzkum onemocnění",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://www.mountsinai.org/files/MSHealth/Assets/Graphics/MS-Logo-Stacked.svg",
    tags: JSON.stringify(["AI diagnostika", "genomická medicína", "zdravotní výzkum", "personalizovaná léčba", "zdravotní data"]),
    advantages: JSON.stringify([
      "Vlastní AI platformy pro analýzu zdravotnických obrazů a diagnostiku",
      "Specializace na využití umělé inteligence v genomice a precizní medicíně",
      "Integrace klinické péče s pokročilým výzkumem",
      "AI algoritmy pro predikci průběhu nemocí a odezvy na léčbu",
      "Velká databáze biologických vzorků a genetických dat pro ML učení"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší náklady některých pokročilých diagnostických a léčebných postupů",
      "Geografické omezení na oblast New York (pro osobní návštěvy)",
      "Ne všechny AI služby jsou hrazeny zdravotním pojištěním",
      "Potenciálně dlouhé čekací doby na specializované konzultace"
    ]),
    detailInfo: "Mount Sinai Health System patří mezi průkopníky implementace umělé inteligence v klinické praxi a biomedicínském výzkumu. Jejich Hasso Plattner Institute for Digital Health vyvíjí AI algoritmy pro analýzu multimodálních zdravotních dat včetně obrazů, genetických sekvencí a elektronických zdravotních záznamů. Mount Sinai vyvinul řadu AI nástrojů, včetně systému pro diagnostiku COVID-19 z CT snímků plic a algoritmu schopného předpovídat potenciální srdeční komplikace. Jejich BioMe Biobank obsahuje genetické údaje a biologické vzorky od více než 100,000 pacientů různého etnického původu, což umožňuje vývoj AI modelů s nižší mírou systematického zkreslení. Mount Sinai také využívá AI k identifikaci potenciálních kandidátů pro klinické studie a optimalizaci provozních aspektů nemocniční péče.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Standard Clinical Care",
          price: "Variabilní (závisí na pojištění a poskytované péči)",
          features: [
            "Přístup k diagnostice podporované AI",
            "Personalizované léčebné plány",
            "Telemedicína s AI hodnocením",
            "Standardní genetické testování",
            "Přístup k elektronickým zdravotním záznamům"
          ]
        },
        {
          name: "Executive Health Assessment",
          price: "Od 3,500 $ (individuálně)",
          features: [
            "Komplexní vyšetření s AI analýzou zdravotních rizik",
            "Pokročilé zobrazovací metody",
            "Genetické profilování s AI interpretací výsledků",
            "Personalizovaný preventivní plán",
            "Koordinovaný přístup ke specialistům",
            "Follow-up konzultace"
          ]
        },
        {
          name: "Research Programs & Clinical Trials",
          price: "Variabilní/často bez poplatku pro účastníky",
          features: [
            "Přístup k experimentálním AI diagnostickým metodám",
            "Pokročilé genomické a molekulární profilování",
            "Personalizované léčebné přístupy založené na AI",
            "Longitudinální sledování s AI analýzou průběžných dat",
            "Přispění k rozvoji medicíny"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example6"]),
    hasTrial: false
  },
  {
    externalUrl: "https://www.hopkinsmedicine.org",
    name: "Johns Hopkins AI Precision Medicine",
    description: "Špičkový systém zdravotní péče využívající umělou inteligenci pro precizní medicínu, pokročilou diagnostiku a personalizovanou léčbu",
    price: 0,
    category: "Zdravotnictví",
    imageUrl: "https://www.hopkinsmedicine.org/sebin/t/d/JohnsHopkinsMedicineLogoLg.png",
    tags: JSON.stringify(["precizní medicína", "diagnostická AI", "biomedicínský výzkum", "personalizovaná léčba", "genomika"]),
    advantages: JSON.stringify([
      "Integrace špičkového výzkumu s klinickou praxí",
      "AI systémy pro analýzu komplexních diagnostických dat",
      "Personalizované léčebné protokoly založené na molekulárních a genetických profilech",
      "Prediktivní algoritmy pro včasnou detekci onemocnění a komplikací",
      "Multidisciplinární přístup podporovaný AI nástroji pro rozhodování"
    ]),
    disadvantages: JSON.stringify([
      "Vyšší náklady za specializovanou a pokročilou péči",
      "Potenciálně dlouhé čekací doby na konzultace a procedury",
      "Geografické omezení (hlavní centra v USA)",
      "Některé pokročilé AI diagnostické metody nemusí být hrazeny pojištěním"
    ]),
    detailInfo: "Johns Hopkins Medicine je na předním místě v implementaci umělé inteligence do zdravotní péče, klinického výzkumu a lékařského vzdělávání. Jejich iniciativy v oblasti AI zahrnují vývoj algoritmů pro analýzu lékařských obrazů, prediktivní modelování pro identifikaci pacientů s vysokým rizikem komplikací a systémy pro personalizaci léčby na základě genetických a molekulárních charakteristik. Johns Hopkins Precision Medicine Analytics Platform (PMAP) kombinuje klinická, genomická a obrazová data k vytvoření komplexního pohledu na pacienta. Výzkumné týmy vyvinuly AI nástroje pro včasnou detekci sepse, předpověď rizika komplikací po chirurgických zákrocích a optimalizaci plánování léčby pro pacienty s rakovinou. Instituce také využívá AI pro zefektivnění klinických operací, redukci medicínských chyb a zlepšení koordinace péče.",
    pricingInfo: JSON.stringify({
      tiers: [
        {
          name: "Clinical Care",
          price: "Variabilní (závisí na pojištění a poskytované péči)",
          features: [
            "Diagnostika s podporou AI",
            "Personalizované léčebné protokoly",
            "Telemedicína s preliminárním AI hodnocením",
            "Přístup k elektronickým zdravotním záznamům",
            "Základní genetické testování"
          ]
        },
        {
          name: "Executive Health Program",
          price: "Od 4,000 $ (individuálně)",
          features: [
            "Komplexní vícedenní vyšetření s AI analýzou",
            "Pokročilé zobrazovací metody a diagnostika",
            "Rozšířené genetické a molekulární profilování",
            "Personalizovaný preventivní plán generovaný AI",
            "Prioritní přístup ke specialistům",
            "Dlouhodobé sledování zdravotního stavu"
          ]
        },
        {
          name: "Precision Medicine & Clinical Trials",
          price: "Variabilní/často bez poplatku pro účastníky",
          features: [
            "Přístup k nejnovějším AI diagnostickým technologiím",
            "Pokročilá genomická sekvenace a molekulární analýza",
            "Personalizované experimentální léčebné přístupy",
            "AI predikce odezvy na léčbu",
            "Možnost účasti v cutting-edge výzkumu"
          ]
        }
      ],
      isFree: false
    }),
    videoUrls: JSON.stringify(["https://www.youtube.com/watch?v=example7"]),
    hasTrial: false
  }
];

async function updateOrCreateProducts() {
  console.log("Ukládám AI zdravotnické nástroje do databáze (dávka 15)...");
  
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
            pricingInfo: product.pricingInfo,
            videoUrls: product.videoUrls,
            hasTrial: product.hasTrial
          }
        });
        
        console.log(`✅ Aktualizován: ${product.name}`);
      } else {
        console.log(`Vytvářím nový produkt: ${product.name}`);
        
        // Create new product
        const newProduct = await prisma.product.create({
          data: {
            externalUrl: product.externalUrl,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl,
            tags: product.tags,
            advantages: product.advantages,
            disadvantages: product.disadvantages,
            detailInfo: product.detailInfo,
            pricingInfo: product.pricingInfo,
            videoUrls: product.videoUrls,
            hasTrial: product.hasTrial
          }
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