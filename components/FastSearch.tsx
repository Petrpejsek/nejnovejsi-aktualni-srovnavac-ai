'use client';

import { useState } from 'react';

interface FastSearchProps {
  onResults?: (results: any) => void;
  onSearchStart?: (sessionId: string) => void;
}

export default function FastSearch({ onResults, onSearchStart }: FastSearchProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setSearching(true);
    
    try {
      const sessionId = generateSessionId();
      console.log(`🔍 Starting search: "${query}" (session: ${sessionId})`);
      
      // Notify parent that we're starting the search
      onSearchStart?.(sessionId);
      
      // Immediate response - webhook to N8N
      const response = await fetch('/api/search-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          timestamp: Date.now(),
          sessionId,
          userAgent: navigator.userAgent,
          locale: 'en-US'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Webhook sent successfully:', result);
        
        // Show preliminary information
        onResults?.({
          preview: result.preview,
          sessionId: result.sessionId,
          status: 'processing'
        });
      } else {
        console.error('❌ Error sending webhook:', response.status);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you need... (e.g. email automation, video creation)"
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg placeholder-gray-400"
          disabled={searching}
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          {searching ? 'Searching...' : 'Find Tools'}
        </button>
      </form>
      
      {searching && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-purple-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span>Sending your query to the AI system...</span>
          </div>
        </div>
      )}
      
      {/* Quick suggestions */}
      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-2">💡 Popular searches:</p>
        <div className="flex flex-wrap gap-2">
          {quickSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setQuery(suggestion)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              disabled={searching}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const quickSuggestions = [
  'email automation',
  'video creation',
  'social media management',
  'customer support chatbot',
  'data analysis',
  'accounting and invoicing',
  'website design',
  'SEO optimization'
]; 