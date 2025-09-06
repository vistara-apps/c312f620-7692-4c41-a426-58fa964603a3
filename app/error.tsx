'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          Oops! Something went wrong
        </h2>
        
        <p className="text-white text-opacity-80 mb-6">
          We encountered an error while loading your nutrition dashboard. 
          Don't worry, your data is safe!
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full btn-primary flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full btn-secondary"
          >
            Refresh Page
          </button>
        </div>
        
        {error.digest && (
          <p className="text-xs text-white text-opacity-60 mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
