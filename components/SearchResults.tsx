'use client';

import { useEffect, useState } from 'react';

interface SearchResultsProps {
  sessionId: string;
  onResults?: (results: any) => void;
  preview?: any;
}

interface Recommendation {
  id: string;
  matchPercentage: number;
  recommendation: string;
  product: {
    id: string;
    title: string;
    description: string;
    category: string;
    price?: string;
    website?: string;
    imageUrl?: string;
  };
  personalizedReason?: string;
  urgencyBonus?: number;
  contextualTips?: string[];
}

export default function SearchResults({ sessionId, onResults, preview }: SearchResultsProps) {
  const [status, setStatus] = useState<'waiting' | 'processing' | 'completed' | 'error'>('waiting');
  const [progress, setProgress] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  // Polling pro získávání výsledků
  useEffect(() => {
    if (!sessionId || status === 'completed') return;

    let pollCount = 0;
    const maxPolls = 30; // 30 attempts = 30 seconds
    
    const pollForResults = async () => {
      try {
        console.log(`🔄 Polling for session ${sessionId} (attempt ${pollCount + 1})`);
        
        const response = await fetch(`/api/search-results?sessionId=${sessionId}`);
        const data = await response.json();
        
        if (data.found && data.data) {
          console.log('✅ Results found:', data.data);
          setStatus('completed');
          setProgress(100);
          setRecommendations(data.data.recommendations || []);
          setProcessingTime(data.data.processingTime);
          
          // Pass results to parent component
          onResults?.(data.data);
          
          return; // Stop polling
        }
        
        pollCount++;
        if (pollCount >= maxPolls) {
          setError('Timeout - results not found within 30 seconds');
          setStatus('error');
          return;
        }
        
        // Continue polling
        setTimeout(pollForResults, 1000);
        
      } catch (err) {
        console.error('❌ Polling error:', err);
        pollCount++;
        if (pollCount < maxPolls) {
          setTimeout(pollForResults, 2000); // Longer pause on error
        } else {
          setError('Error retrieving results');
          setStatus('error');
        }
      }
    };

    // Spustíme polling s malým zpožděním
    const timeoutId = setTimeout(pollForResults, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [sessionId, onResults, status]);

  // Simulace pokroku pro lepší UX
  useEffect(() => {
    if (status === 'waiting' || status === 'processing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 10;
          const newProgress = Math.min(prev + increment, 90); // Nikdy nepřekročíme 90% dokud nemáme skutečné výsledky
          
          if (newProgress > 30 && status === 'waiting') {
            setStatus('processing');
          }
          
          return newProgress;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [status]);

  if (status === 'completed' && recommendations.length > 0) {
    return (
      <div className="mt-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎯 We found {recommendations.length} perfect tools for you!
          </h2>
          {processingTime && (
            <p className="text-sm text-gray-500">
              Analysis completed in {(processingTime / 1000).toFixed(1)}s
            </p>
          )}
        </div>
        
        <div className="space-y-6">
          {recommendations.map((rec, index) => (
            <div key={rec.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Header s match percentage */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {rec.product.title}
                  </h3>
                  <p className="text-sm text-gray-500">{rec.product.category}</p>
                </div>
                <div className="ml-4 text-right">
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    <span className="font-semibold">{rec.matchPercentage}% match</span>
                  </div>
                  {rec.urgencyBonus && rec.urgencyBonus > 0 && (
                    <div className="mt-1 text-xs text-orange-600">
                      +{rec.urgencyBonus}% for speed
                    </div>
                  )}
                </div>
              </div>

              {/* Doporučení */}
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{rec.recommendation}</p>
                {rec.personalizedReason && (
                  <p className="mt-2 text-sm text-purple-600 font-medium">
                    💡 {rec.personalizedReason}
                  </p>
                )}
              </div>

              {/* Popis produktu */}
              <div className="mb-4">
                <p className="text-gray-600">{rec.product.description}</p>
              </div>

              {/* Kontextové tipy */}
              {rec.contextualTips && rec.contextualTips.length > 0 && (
                <div className="mb-4">
                  {rec.contextualTips.map((tip, tipIndex) => (
                    <div key={tipIndex} className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
                      {tip}
                    </div>
                  ))}
                </div>
              )}

              {/* Footer s akcemi */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  {rec.product.price && (
                    <span className="text-sm font-medium text-gray-700">
                      {rec.product.price}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">#{index + 1} recommendation</span>
                </div>
                <div className="flex gap-2">
                  {rec.product.website && (
                    <a
                      href={rec.product.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Try Tool
                    </a>
                  )}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mt-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-600 mb-2">❌ Search Error</div>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading stav
  return (
    <div className="mt-8 text-center">
      <div className="max-w-md mx-auto">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Status messages */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
            <span className="font-medium text-lg">
              {status === 'waiting' && 'Analyzing your needs...'}
              {status === 'processing' && 'Finding the best tools...'}
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            {progress < 30 && '🔍 Categorizing your requirements'}
            {progress >= 30 && progress < 60 && '⚡ Comparing with tools database'}
            {progress >= 60 && progress < 85 && '🎯 Creating personalized recommendations'}
            {progress >= 85 && '✨ Finalizing analysis...'}
          </div>

          {/* Preview informace */}
          {preview && (
            <div className="mt-4 bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-700 mb-2">
                Expected results: ~{preview.estimatedTools} tools
              </p>
              {preview.categories && preview.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center">
                  {preview.categories.map((cat: string) => (
                    <span key={cat} className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 