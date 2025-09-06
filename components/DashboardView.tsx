'use client';

import { useState, useEffect } from 'react';
import { UserProfileCard } from '@/components/UserProfileCard';
import { HealthGoalsCard } from '@/components/HealthGoalsCard';
import { TodaysMealsCard } from '@/components/TodaysMealsCard';
import { ProgressChart } from '@/components/ProgressChart';
import { NutritionStatsCard } from '@/components/NutritionStatsCard';
import { QuickActionsCard } from '@/components/QuickActionsCard';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { Utensils, Sparkles, RefreshCw } from 'lucide-react';

interface DashboardViewProps {
  user: any;
}

export function DashboardView({ user }: DashboardViewProps) {
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user.id]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load diet plan
      const dietPlanResponse = await fetch(`/api/diet-plans?userId=${user.id}`);
      if (dietPlanResponse.ok) {
        const dietPlanResult = await dietPlanResponse.json();
        if (dietPlanResult.success) {
          setDietPlan(dietPlanResult.data);
        }
      }

      // Load progress data
      const progressResponse = await fetch(`/api/progress?userId=${user.id}&days=30`);
      if (progressResponse.ok) {
        const progressResult = await progressResponse.json();
        if (progressResult.success) {
          setProgressData(progressResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setIsGeneratingPlan(true);
      
      const response = await fetch('/api/diet-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          regenerate: true,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setDietPlan(result.data);
      } else {
        console.error('Failed to generate diet plan:', result.error);
      }
    } catch (error) {
      console.error('Error generating diet plan:', error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleLogMeal = (mealType: string) => {
    console.log('Logging meal for:', mealType);
    // In a real app, this would open a meal logging interface
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // In a real app, this would handle various quick actions
  };

  const handleUpgrade = () => {
    console.log('Upgrading subscription');
    // In a real app, this would open the subscription upgrade flow
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mb-4 animate-pulse mx-auto">
            <Utensils className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Dashboard</h2>
          <p className="text-gray-600">Preparing your personalized nutrition data...</p>
        </div>
      </div>
    );
  }

  // Calculate nutrition stats if we have meal data
  const totalCalories = dietPlan?.meals?.reduce((sum: number, meal: any) => sum + meal.calories, 0) || 0;
  const totalMacros = dietPlan?.meals?.reduce(
    (acc: any, meal: any) => ({
      protein: acc.protein + (meal.macros?.protein || 0),
      carbs: acc.carbs + (meal.macros?.carbs || 0),
      fat: acc.fat + (meal.macros?.fat || 0),
    }),
    { protein: 0, carbs: 0, fat: 0 }
  ) || { protein: 0, carbs: 0, fat: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <Utensils className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">NutriFlow</h1>
                <p className="text-gray-600 text-sm">Welcome back, {user.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600">
                <Sparkles className="w-4 h-4 mr-1" />
                <span className="text-sm capitalize">{user.subscriptionStatus} Plan</span>
              </div>
              
              {!dietPlan && (
                <button
                  onClick={handleGeneratePlan}
                  disabled={isGeneratingPlan}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isGeneratingPlan ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Diet Plan'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {!dietPlan ? (
            // No diet plan state
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Utensils className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Let's create your personalized nutrition plan based on your goals and preferences.
              </p>
              <button
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
              >
                {isGeneratingPlan ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your Plan...
                  </>
                ) : (
                  'Generate My Diet Plan'
                )}
              </button>
            </div>
          ) : (
            // Dashboard with diet plan
            <>
              {/* Top Row - User Profile and Health Goals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <UserProfileCard user={user} />
                <HealthGoalsCard 
                  goals={user.healthGoals}
                  currentWeight={user.weight}
                  progress={progressData?.stats?.weightChange ? 
                    Math.max(0, Math.min(100, 50 + (progressData.stats.weightChange * 10))) : 50
                  }
                />
              </div>

              {/* Middle Row - Today's Meals and Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <TodaysMealsCard 
                    meals={dietPlan.meals || []}
                    onLogMeal={handleLogMeal}
                  />
                </div>
                <QuickActionsCard onAction={handleQuickAction} />
              </div>

              {/* Bottom Row - Progress Chart and Nutrition Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ProgressChart 
                  data={progressData?.progressLogs || []}
                  variant="weight"
                />
                <NutritionStatsCard
                  totalCalories={totalCalories}
                  targetCalories={dietPlan.dietPlan?.calorieTarget || 2000}
                  macros={totalMacros}
                  targetMacros={dietPlan.dietPlan?.macroTargets || { protein: 150, carbs: 200, fat: 65 }}
                />
              </div>

              {/* AI Insights */}
              {dietPlan.explanation && (
                <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Personalized Plan</h3>
                  <p className="text-gray-700 leading-relaxed">{dietPlan.explanation}</p>
                  
                  {dietPlan.tips && dietPlan.tips.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Tips for Success:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {dietPlan.tips.map((tip: string, index: number) => (
                          <li key={index} className="text-gray-700 text-sm">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Insights */}
              {progressData?.insights && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-lg mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Progress Insights</h3>
                  
                  {progressData.insights.insights.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Key Insights:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {progressData.insights.insights.map((insight: string, index: number) => (
                          <li key={index} className="text-gray-700 text-sm">{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {progressData.insights.recommendations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {progressData.insights.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-gray-700 text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {progressData.insights.motivation && (
                    <div className="bg-white bg-opacity-50 rounded-lg p-4">
                      <p className="text-gray-800 font-medium italic">"{progressData.insights.motivation}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Subscription Card */}
              <div className="max-w-md mx-auto">
                <SubscriptionCard 
                  currentPlan={user.subscriptionStatus}
                  onUpgrade={handleUpgrade}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-gray-600 text-sm">
            © 2024 NutriFlow. Hyper-personalized nutrition for your unique goals.
          </p>
        </div>
      </footer>
    </div>
  );
}
