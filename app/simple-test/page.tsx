'use client';

import { useState } from 'react';

interface Recommendation {
  id: string;
  matchPercentage: number;
  recommendation: string;
  product?: {
    name?: string;
    category?: string;
    description?: string;
    imageUrl?: string;
    externalUrl?: string;
    similarity?: number;
    [key: string]: any;
  };
}

interface ApiResponse {
  recommendations: Recommendation[];
  [key: string]: any;
}

export default function SimpleTestPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResults(null);
    console.log('Hledám:', query);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API chyba:', response.status, errorText);
        setError(`API Error: ${response.status} ${response.statusText}`);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('Výsledek:', data);
      setResults(data);
    } catch (err) {
      console.error('Chyba:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    "marketing",
    "video",
    "restaurant",
    "customer service",
    "email automatizace",
    "zvýšit výkon webu",
    "social media manager"
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '26px', marginBottom: '20px' }}>AI Doporučovací systém - Test</h1>
      
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {exampleQueries.map(q => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              style={{
                padding: '6px 12px',
                background: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {q}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zadejte dotaz (např. marketing, video, restaurant)"
            style={{ 
              padding: '12px',
              flex: 1,
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Načítám...' : 'Hledat'}
          </button>
        </div>
      </div>
      
      {loading && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          marginTop: '20px',
          backgroundColor: '#f7f7f7',
          borderRadius: '8px'
        }}>
          <div style={{ 
            borderTop: '3px solid #4f46e5',
            borderRight: '3px solid transparent',
            borderBottom: '3px solid transparent',
            borderLeft: '3px solid transparent',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 15px auto'
          }} />
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p>Hledám nejlepší doporučení pro "{query}"...</p>
        </div>
      )}
      
      {error && (
        <div style={{ 
          padding: '15px',
          backgroundColor: '#FEE2E2', 
          color: '#B91C1C',
          border: '1px solid #F87171',
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Chyba:</p>
          <p>{error}</p>
        </div>
      )}
      
      {results && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            borderBottom: '1px solid #eee',
            paddingBottom: '10px'
          }}>
            <h2 style={{ fontSize: '20px', margin: 0 }}>
              Nalezeno {results.recommendations?.length || 0} doporučení
            </h2>
            {responseTime && (
              <span style={{ fontSize: '14px', color: '#666' }}>
                Čas odpovědi: {(responseTime / 1000).toFixed(2)}s
              </span>
            )}
          </div>
          
          {results.recommendations?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {results.recommendations.map((rec: Recommendation) => (
                <div 
                  key={rec.id}
                  style={{ 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    backgroundColor: 'white'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '15px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '20px', margin: '0 0 5px 0' }}>
                        {rec.product?.name || 'Neznámý produkt'}
                      </h3>
                      {rec.product?.category && (
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          Kategorie: {rec.product.category}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                      <span style={{ 
                        backgroundColor: '#e0e7ff',
                        color: '#4338ca',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {rec.matchPercentage}% Match
                      </span>
                      {rec.product?.similarity !== undefined && (
                        <span style={{ 
                          fontSize: '12px',
                          color: '#6b7280',
                          backgroundColor: '#f3f4f6',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          Similarity: {(rec.product.similarity * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {rec.product?.description && (
                    <p style={{ margin: '0 0 15px 0', color: '#6b7280', fontSize: '14px' }}>
                      {rec.product.description}
                    </p>
                  )}
                  
                  <div style={{ 
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '15px'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#0c4a6e', fontSize: '16px' }}>Personalizované doporučení:</h4>
                    <p style={{ margin: 0, color: '#0369a1' }}>
                      {rec.recommendation}
                    </p>
                  </div>
                  
                  {rec.product?.externalUrl && (
                    <div style={{ textAlign: 'right' }}>
                      <a 
                        href={rec.product.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          backgroundColor: '#4f46e5',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        Navštívit stránku
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              color: '#6b7280'
            }}>
              <p>Žádná doporučení nebyla nalezena.</p>
              <p style={{ fontSize: '14px' }}>Zkuste upravit dotaz nebo vybrat jiné téma.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 