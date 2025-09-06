'use client';

import { Activity, Zap, Target } from 'lucide-react';

interface NutritionStatsCardProps {
  totalCalories: number;
  targetCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  targetMacros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function NutritionStatsCard({ 
  totalCalories, 
  targetCalories, 
  macros, 
  targetMacros 
}: NutritionStatsCardProps) {
  const calorieProgress = Math.min(100, (totalCalories / targetCalories) * 100);
  
  const macroData = [
    { 
      name: 'Protein', 
      current: macros.protein, 
      target: targetMacros.protein, 
      color: 'bg-blue-500',
      icon: Activity 
    },
    { 
      name: 'Carbs', 
      current: macros.carbs, 
      target: targetMacros.carbs, 
      color: 'bg-green-500',
      icon: Zap 
    },
    { 
      name: 'Fat', 
      current: macros.fat, 
      target: targetMacros.fat, 
      color: 'bg-orange-500',
      icon: Target 
    },
  ];

  return (
    <div className="gradient-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Nutrition Stats</h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">
            {totalCalories.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            of {targetCalories.toLocaleString()} cal
          </p>
        </div>
      </div>

      {/* Calorie Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Daily Calories</span>
          <span className="font-medium">{calorieProgress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${calorieProgress}%` }}
          />
        </div>
      </div>

      {/* Macro Breakdown */}
      <div className="space-y-4">
        {macroData.map((macro) => {
          const progress = Math.min(100, (macro.current / macro.target) * 100);
          const Icon = macro.icon;
          
          return (
            <div key={macro.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm font-medium">{macro.name}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {macro.current}g / {macro.target}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${macro.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Daily Goal Progress</p>
            <p className="text-xs text-gray-600">
              {calorieProgress >= 90 ? 'Excellent progress!' : 'Keep going!'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">{calorieProgress.toFixed(0)}%</p>
            <p className="text-xs text-gray-600">Complete</p>
          </div>
        </div>
      </div>
    </div>
  );
}
