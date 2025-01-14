import SocialIcons from '@/components/SocialIcons'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            Kontaktujte nás
          </h1>
          
          <div className="prose prose-purple max-w-none">
            <p className="text-gray-600 mb-8">
              Máte dotaz nebo připomínku? Neváhejte nás kontaktovat. Rádi vám pomůžeme s výběrem vhodného AI nástroje nebo zodpovíme jakékoliv otázky.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-[14px] shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  E-mailový kontakt
                </h2>
                <p className="text-gray-600 mb-2">
                  Pro obecné dotazy:
                </p>
                <a href="mailto:info@example.com" className="text-purple-600 hover:text-purple-700">
                  info@example.com
                </a>
                <p className="text-gray-600 mt-4 mb-2">
                  Pro obchodní spolupráci:
                </p>
                <a href="mailto:business@example.com" className="text-purple-600 hover:text-purple-700">
                  business@example.com
                </a>
              </div>

              <div className="bg-white p-6 rounded-[14px] shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Sídlo společnosti
                </h2>
                <p className="text-gray-600">
                  AI Srovnávač s.r.o.<br />
                  Technologická 123<br />
                  160 00 Praha 6<br />
                  Česká republika
                </p>
                <p className="text-gray-600 mt-4">
                  IČO: 12345678<br />
                  DIČ: CZ12345678
                </p>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Sociální sítě
              </h2>
              <p className="text-gray-600 mb-4">
                Sledujte nás na sociálních sítích pro nejnovější novinky a aktualizace:
              </p>
              <SocialIcons className="mb-8" />
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Často kladené dotazy
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Jak dlouho trvá odpověď na dotaz?</h3>
                  <p className="text-gray-600">Snažíme se odpovídat na všechny dotazy do 24 hodin v pracovní dny.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Poskytujete technickou podporu?</h3>
                  <p className="text-gray-600">Ano, v případě problémů s používáním našeho webu jsme připraveni vám pomoci.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}