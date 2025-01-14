export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            O nás
          </h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-gray-600 mb-6">
              Jsme tým nadšenců do umělé inteligence, kteří se rozhodli vytvořit přehledný srovnávač AI nástrojů pro české uživatele. Naším cílem je pomoci vám najít ty nejlepší AI nástroje pro vaše potřeby.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              Naše mise
            </h2>
            <p className="text-gray-600 mb-6">
              Chceme demokratizovat přístup k umělé inteligenci a pomoci lidem orientovat se v rychle se rozvíjejícím světě AI technologií. Věříme, že správně zvolené AI nástroje mohou výrazně zlepšit produktivitu a kreativitu každého z nás.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              Co děláme
            </h2>
            <ul className="list-disc list-inside text-gray-600 mb-6">
              <li className="mb-2">Pečlivě testujeme a hodnotíme AI nástroje</li>
              <li className="mb-2">Poskytujeme nezávislá srovnání a recenze</li>
              <li className="mb-2">Sledujeme nejnovější trendy v AI</li>
              <li className="mb-2">Pomáháme vám s výběrem nejvhodnějšího řešení</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              Naše hodnoty
            </h2>
            <p className="text-gray-600 mb-6">
              Transparentnost, nezávislost a užitečnost jsou základními pilíři naší práce. Všechna naše doporučení jsou založena na skutečných zkušenostech a důkladném testování.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 