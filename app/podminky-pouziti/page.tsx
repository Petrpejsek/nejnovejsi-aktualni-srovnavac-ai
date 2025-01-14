export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            Podmínky použití
          </h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-gray-600 mb-6">
              Vítejte na AI Srovnávači. Používáním našich služeb souhlasíte s následujícími podmínkami použití. Prosíme, přečtěte si je pečlivě.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              1. Definice pojmů
            </h2>
            <p className="text-gray-600 mb-6">
              "Služba" znamená webovou stránku AI Srovnávač a všechny její funkce. "Uživatel" je každá osoba, která přistupuje k našim službám.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              2. Použití služby
            </h2>
            <p className="text-gray-600 mb-6">
              Službu můžete používat pouze v souladu s těmito podmínkami a platnými zákony. Zavazujete se nepoužívat službu k nelegálním nebo neoprávněným účelům.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              3. Duševní vlastnictví
            </h2>
            <p className="text-gray-600 mb-6">
              Veškerý obsah na této webové stránce, včetně textů, grafiky, log a softwaru je majetkem AI Srovnávače nebo jeho poskytovatelů obsahu a je chráněn autorskými právy.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              4. Omezení odpovědnosti
            </h2>
            <p className="text-gray-600 mb-6">
              Poskytujeme službu "tak jak je" bez jakýchkoliv záruk. Neneseme odpovědnost za přímé, nepřímé, náhodné nebo následné škody vyplývající z použití nebo nemožnosti použití našich služeb.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              5. Změny podmínek
            </h2>
            <p className="text-gray-600 mb-6">
              Vyhrazujeme si právo kdykoliv změnit tyto podmínky použití. O významných změnách vás budeme informovat prostřednictvím našich webových stránek.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              6. Kontakt
            </h2>
            <p className="text-gray-600 mb-6">
              Máte-li jakékoliv dotazy ohledně těchto podmínek použití, kontaktujte nás na info@example.com.
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