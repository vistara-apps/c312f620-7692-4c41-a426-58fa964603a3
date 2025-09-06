'use client';

import { Plus, Camera, Search, BookOpen } from 'lucide-react';

interface QuickActionsCardProps {
  onAction?: (action: string) => void;
}

export function QuickActionsCard({ onAction }: QuickActionsCardProps) {
  const actions = [
    {
      id: 'log-meal',
      label: 'Log Meal',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Add a meal to your log',
    },
    {
      id: 'scan-food',
      label: 'Scan Food',
      icon: Camera,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Scan barcode or photo',
    },
    {
      id: 'search-recipe',
      label: 'Find Recipe',
      icon: Search,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Search healthy recipes',
    },
    {
      id: 'view-plan',
      label: 'View Plan',
      icon: BookOpen,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'See your meal plan',
    },
  ];

  return (
    <div className="gradient-card p-6">
      <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          
          return (
            <button
              key={action.id}
              onClick={() => onAction?.(action.id)}
              className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">{action.label}</p>
              <p className="text-xs opacity-90 mt-1">{action.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Tip:</span> Log meals right after eating for better tracking!
          </p>
        </div>
      </div>
    </div>
  );
}
