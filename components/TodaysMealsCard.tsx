'use client';

import { Clock, Utensils, Plus } from 'lucide-react';
import { Meal } from '@/lib/types';
import { formatCalories } from '@/lib/utils';

interface TodaysMealsCardProps {
  meals: Meal[];
  onLogMeal?: (mealType: string) => void;
}

export function TodaysMealsCard({ meals, onLogMeal }: TodaysMealsCardProps) {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="gradient-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-orange-600" />
          Today's Meals
        </h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-orange-600">{formatCalories(totalCalories)}</p>
          <p className="text-sm text-gray-600">Total Calories</p>
        </div>
      </div>

      <div className="space-y-3">
        {mealTypes.map((mealType) => {
          const meal = meals.find(m => m.mealType === mealType);
          
          return (
            <div key={mealType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize">{mealType}</h4>
                  {meal && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {meal.preparationTime}min
                    </div>
                  )}
                </div>
                {meal ? (
                  <div className="mt-1">
                    <p className="text-sm text-gray-700">{meal.name}</p>
                    <p className="text-xs text-gray-500">{formatCalories(meal.calories)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">Not planned</p>
                )}
              </div>
              
              <button
                onClick={() => onLogMeal?.(mealType)}
                className="ml-3 p-2 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4 text-orange-600" />
              </button>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 btn-primary">
        Log Today's Meal
      </button>
    </div>
  );
}
