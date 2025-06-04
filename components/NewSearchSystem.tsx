'use client';

import { useState } from 'react';
import FastSearch from './FastSearch';
import SearchResults from './SearchResults';

export default function NewSearchSystem() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchStart = (sessionId: string) => {
    console.log('🚀 New search started with session:', sessionId);
    setCurrentSessionId(sessionId);
    setSearchResults(null);
    setIsSearching(true);
  };

  const handleSearchResults = (results: any) => {
    console.log('📋 Search results received:', results);
    setSearchResults(results);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
              Find the Perfect AI Tool for Your Needs
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Describe what you need, and our AI system will find the best solution for you from over 200 tools in seconds.
            </p>
          </div>

          {/* Main search form */}
          <div className="mb-8">
            <FastSearch 
              onSearchStart={handleSearchStart}
              onResults={handleSearchResults}
            />
          </div>

          {/* Results or loading */}
          {currentSessionId && (
            <SearchResults 
              sessionId={currentSessionId}
              onResults={handleSearchResults}
              preview={searchResults?.preview}
            />
          )}

          {/* Sample categories when no active search */}
          {!isSearching && !searchResults && (
            <div className="mt-16">
              <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
                💡 Popular Tool Categories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularCategories.map((category) => (
                  <div 
                    key={category.name}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{category.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                      <div className="text-xs text-purple-600 font-medium">
                        {category.toolCount} tools
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System advantages */}
          {!isSearching && !searchResults && (
            <div className="mt-20 text-center">
              <h2 className="text-2xl font-semibold mb-8 text-gray-800">
                🚀 Why Our AI Advisor is the Best
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {advantages.map((advantage) => (
                  <div key={advantage.title} className="text-center">
                    <div className="text-3xl mb-4">{advantage.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {advantage.title}
                    </h3>
                    <p className="text-gray-600">
                      {advantage.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const popularCategories = [
  {
    name: 'Video Creation',
    icon: '🎬',
    description: 'AI tools for creating and editing videos',
    toolCount: 15,
  },
  {
    name: 'Email Marketing',
    icon: '📧',
    description: 'Automation and personalization of email campaigns',
    toolCount: 12,
  },
  {
    name: 'Website Building',
    icon: '🌐',
    description: 'Create websites without coding',
    toolCount: 18,
  },
  {
    name: 'Customer Service',
    icon: '🤖',
    description: 'Chatbots and customer support automation',
    toolCount: 8,
  },
  {
    name: 'Accounting',
    icon: '💰',
    description: 'Automation of accounting processes and analytics',
    toolCount: 10,
  },
  {
    name: 'SEO Optimization',
    icon: '🔍',
    description: 'Tools to improve website visibility',
    toolCount: 14,
  },
];

const advantages = [
  {
    icon: '⚡',
    title: 'Fast Results',
    description: 'Analysis and recommendations in 2-5 seconds thanks to optimized AI architecture',
  },
  {
    icon: '🎯',
    title: 'Personalized',
    description: 'Each recommendation is tailored to your specific needs and situation',
  },
  {
    icon: '🔄',
    title: 'Always Up-to-date',
    description: 'The database is continuously updated with the latest AI tools on the market',
  },
]; 