'use client';

import { useState } from 'react';

export default function TestPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Zadejte dotaz');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API odpověď:', data);
      setResults(data);
    } catch (err) {
      console.error('Error:', err);
              setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test doporučení</h1>
      
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zadejte dotaz..."
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          >
            {loading ? 'Načítám...' : 'Hledat'}
          </button>
        </div>
        
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {loading && <div className="text-center">Načítám doporučení...</div>}
      
      {results && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Nalezeno {results.recommendations?.length || 0} doporučení:
          </h2>
          
          {results.recommendations?.length > 0 ? (
            <div className="space-y-4">
              {results.recommendations.map((rec: any) => (
                <div key={rec.id} className="border p-4 rounded shadow-sm">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{rec.product?.name || 'Unknown'}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {rec.matchPercentage}% Match
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">{rec.recommendation}</p>
                  {rec.product && (
                    <div className="mt-2 text-sm text-gray-500">
                      {rec.product.category && <span>Kategorie: {rec.product.category}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Žádná doporučení nebyla nalezena.</p>
          )}
          
          <details className="mt-6">
            <summary className="cursor-pointer text-blue-500">Zobrazit kompletní odpověď API</summary>
            <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
} 