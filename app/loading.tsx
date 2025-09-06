import { Utensils } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 animate-pulse-slow mx-auto">
          <Utensils className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Loading NutriFlow</h2>
        <p className="text-white text-opacity-80">Preparing your personalized nutrition dashboard...</p>
        
        <div className="mt-6 space-y-3 max-w-md mx-auto">
          <div className="h-4 bg-white bg-opacity-20 rounded animate-pulse"></div>
          <div className="h-4 bg-white bg-opacity-20 rounded w-3/4 mx-auto animate-pulse"></div>
          <div className="h-4 bg-white bg-opacity-20 rounded w-1/2 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
