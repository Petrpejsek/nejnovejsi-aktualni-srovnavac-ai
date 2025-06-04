'use client';

import { useState, useEffect } from 'react';

export default function AiToolsTestPage() {
  const [query, setQuery] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pollingStatus, setPollingStatus] = useState<string>('');

  // Poll for results
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (sessionId && loading) {
      // Start polling
      setPollingStatus('Waiting for results...');
      
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(`/api/search-results?sessionId=${sessionId}`);
          const data = await response.json();
          
          if (data.found && data.data) {
            // Results found
            setResults(data.data);
            setLoading(false);
            clearInterval(intervalId);
            setPollingStatus('Results received!');
          } else {
            // Still processing
            setPollingStatus('Still processing your request...');
          }
        } catch (err) {
          console.error('Polling error:', err);
          setPollingStatus('Error while polling for results');
        }
      }, 2000); // Poll every 2 seconds
    }
    
    // Clean up interval on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [sessionId, loading]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setResults(null);
    setPollingStatus('');
    
    try {
      // Generate a new session ID for this search
      const newSessionId = `test-${Date.now()}`;
      setSessionId(newSessionId);
      
      const response = await fetch('/api/ai-tools-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          sessionId: newSessionId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      // We won't have results immediately, just confirmation the search was started
      console.log('Search initiated:', data);
      
      // Polling will now be handled by the useEffect hook
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI Tools Search Test (N8N Integration)</h1>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="What AI tool are you looking for?"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          className="flex-1 border rounded p-2"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-2">{pollingStatus || 'Searching AI tools...'}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {results && (
        <div className="space-y-6">
          <div className="mb-6 border rounded p-4 shadow">
            <h2 className="text-xl font-semibold mb-2">Search Summary</h2>
            <p><strong>Session ID:</strong> {results.sessionId}</p>
            <p><strong>Processing Time:</strong> {results.processingTime || 'N/A'}ms</p>
            <p><strong>Results Count:</strong> {results.recommendations?.length || 0}</p>
          </div>
          
          {results.recommendations?.map((recommendation: any, index: number) => (
            <div key={index} className="mb-4 border rounded p-4 shadow">
              <div className="flex justify-between mb-2">
                <h3 className="text-lg font-semibold">{recommendation.id}</h3>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Match: {recommendation.matchPercentage}%
                </div>
              </div>
              <hr className="my-2" />
              <p className="mb-4">{recommendation.recommendation}</p>
              
              {recommendation.benefits && (
                <div className="mt-2">
                  <h4 className="font-medium">Benefits:</h4>
                  <ul className="list-disc list-inside pl-2">
                    {Array.isArray(recommendation.benefits) 
                      ? recommendation.benefits.map((benefit: string, i: number) => (
                          <li key={i}>{benefit}</li>
                        ))
                      : <li>{recommendation.benefits}</li>
                    }
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 