'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestRecommendations() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const getRecommendations = async () => {
    if (!query.trim()) {
      setError('Zadejte dotaz');
      return;
    }

    setIsLoading(true);
    setError('');
    setStatus('Načítám doporučení...');
    
    try {
      const startTime = Date.now();
      const response = await fetch('/api/recommendations-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (response.ok) {
        setRecommendations(data);
                  setStatus(`Loaded ${data.length} recommendations in ${duration}s`);
      } else {
        setError(data.error || 'Error loading recommendations');
                  setStatus(`Error after ${duration}s`);
      }
    } catch (err) {
              setError('An error occurred: ' + (err instanceof Error ? err.message : String(err)));
        setStatus('Error communicating with API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test doporučení AI</h1>
      
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zadejte dotaz..."
            className="border p-2 rounded flex-grow"
            onKeyDown={(e) => e.key === 'Enter' && getRecommendations()}
          />
          <button
            onClick={getRecommendations}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Načítám...' : 'Hledat'}
          </button>
        </div>
        
        {/* Příklady dotazů */}
        <div className="text-sm text-gray-600 mb-2">
          Příklady: 
          <button 
            onClick={() => setQuery('video')} 
            className="text-blue-500 hover:underline mx-1"
          >
            video
          </button>
          <button 
            onClick={() => setQuery('customer service')} 
            className="text-blue-500 hover:underline mx-1"
          >
            customer service
          </button>
          <button 
            onClick={() => setQuery('marketing')} 
            className="text-blue-500 hover:underline mx-1"
          >
            marketing
          </button>
        </div>
      </div>

      {/* Status a chyby */}
      {status && <p className="text-gray-600 mb-2">{status}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Výsledky */}
      {recommendations.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Doporučení:</h2>
          <div className="space-y-4">
            {recommendations.map((rec: any) => (
              <div key={rec.id} className="border p-4 rounded-lg bg-white shadow-sm">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">{rec.id}</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {rec.matchPercentage}% shoda
                  </span>
                </div>
                <p className="mt-2 text-gray-700">{rec.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link href="/" className="text-blue-500 hover:underline">
                        Back to Homepage
        </Link>
      </div>
    </div>
  );
} 