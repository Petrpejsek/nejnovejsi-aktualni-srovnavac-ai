import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  withRetryButton?: boolean;
  className?: string;
}

export default function ErrorDisplay({ 
  error, 
  onRetry, 
  withRetryButton = true,
  className = ''
}: ErrorDisplayProps) {
  if (!error) return null;
  
  return (
    <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <h2 className="text-lg font-semibold mb-2 text-red-700">Chyba</h2>
      <p className="text-red-600 whitespace-pre-line">{error}</p>
      
      {withRetryButton && onRetry && (
        <button 
          onClick={onRetry}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Zkusit znovu
        </button>
      )}
    </div>
  );
} 