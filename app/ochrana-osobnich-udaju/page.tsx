export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            Ochrana osobních údajů
          </h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-gray-600 mb-6">
              Ochrana vašich osobních údajů je pro nás prioritou. Tento dokument popisuje, jak zpracováváme a chráníme vaše osobní údaje.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              1. Jaké údaje shromažďujeme
            </h2>
            <p className="text-gray-600 mb-6">
              Shromažďujeme pouze nezbytné údaje potřebné pro fungování našich služeb:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6">
              <li>E-mailová adresa (pokud se registrujete)</li>
              <li>Údaje o používání webu</li>
              <li>Cookies a podobné technologie</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              2. Jak údaje používáme
            </h2>
            <p className="text-gray-600 mb-6">
              Vaše údaje používáme pro:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6">
              <li>Poskytování našich služeb</li>
              <li>Zlepšování uživatelského zážitku</li>
              <li>Komunikaci s vámi</li>
              <li>Analýzu a vylepšování našich služeb</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              3. Zabezpečení údajů
            </h2>
            <p className="text-gray-600 mb-6">
              Implementujeme vhodná technická a organizační opatření k ochraně vašich osobních údajů proti neoprávněnému přístupu, ztrátě nebo poškození.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              4. Vaše práva
            </h2>
            <p className="text-gray-600 mb-6">
              Máte právo na:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6">
              <li>Přístup k vašim údajům</li>
              <li>Opravu nepřesných údajů</li>
              <li>Výmaz údajů</li>
              <li>Omezení zpracování</li>
              <li>Přenositelnost údajů</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              5. Kontaktní údaje
            </h2>
            <p className="text-gray-600 mb-6">
              Pro uplatnění vašich práv nebo dotazy ohledně zpracování osobních údajů nás kontaktujte na privacy@example.com.
            </p>

            <div className="mt-8 p-4 bg-purple-50 rounded-[14px] text-sm text-gray-600">
              <p>
                Poslední aktualizace: {new Date().toLocaleDateString('cs-CZ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 