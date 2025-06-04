"use client";
import React, { useState } from 'react';

export default function SamostatnaStranka() {
  // Stav pro e-mail, segment a potvrzovací zprávu
  const [email, setEmail] = useState('');
  const [segment, setSegment] = useState('');
  const [sent, setSent] = useState(false);

  // Možné segmenty (zájmy)
  const segmentOptions = [
    { label: 'Nové produkty', value: 'novinky', icon: '📦' },
    { label: 'Slevy a akce', value: 'akce', icon: '🎯' },
    { label: 'Tipy & triky', value: 'tipy', icon: '💡' },
    { label: 'Všechno', value: 'vse', icon: '✨' },
  ];

  // Zpracování odeslání formuláře
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Odesílám data:', { email, segment });
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 shadow-2xl rounded-xl space-y-8">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              Děkujeme za přihlášení!
            </h2>
            <p className="text-gray-600">
              Brzy se můžete těšit na novinky do Vašeho e-mailu.
            </p>
            <div className="text-sm text-gray-500 pt-4 border-t border-gray-200 mt-6">
              <p>Váš e-mail: <span className="font-medium text-gray-700">{email}</span></p>
              <p className="mt-1">Vybraný segment: <span className="font-medium text-gray-700">{segmentOptions.find(s => s.value === segment)?.label}</span></p>
            </div>
            <button 
              onClick={() => { setSent(false); setEmail(''); setSegment('');}}
              className="mt-6 w-full px-4 py-3 text-sm font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Přihlásit další e-mail
            </button>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Zůstaňte v obraze
              </h1>
              <p className="text-gray-600 sm:text-lg">
                Nenechte si ujít žádné novinky a akce. Vyberte si, co vás zajímá.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  E-mailová adresa
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="vas@email.cz"
                  className="w-full px-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 transition-colors duration-150 ease-in-out"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  Co vás zajímá nejvíce?
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {segmentOptions.map(option => (
                    <button
                      type="button"
                      key={option.value}
                      className={`w-full flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg border transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400
                        ${
                          segment === option.value
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg ring-2 ring-indigo-300'
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:border-gray-300'
                        }
                      `}
                      onClick={() => setSegment(option.value)}
                    >
                      <span className="mr-2 text-lg">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                className={`w-full py-3.5 text-base font-semibold rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  ${
                    !email || !segment
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transform active:scale-[0.98]'
                  }
                `}
                disabled={!email || !segment}
              >
                Odebírat novinky
              </button>
              
              {(!email || !segment) && (
                <p className="text-xs text-gray-500 text-center">
                  Prosím, vyplňte svůj e-mail a vyberte alespoň jednu možnost.
                </p>
              )}
            </form>
          </>
        )}
      </div>
      <footer className="text-center mt-10 pb-8">
        <p className="text-xs text-gray-500">
          Váš e-mail je u nás v bezpečí. Spam neposíláme. Odhlásit se můžete kdykoliv.
        </p>
      </footer>
    </div>
  );
} 