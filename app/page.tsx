'use client';

import { useEffect, useState } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name } from '@coinbase/onchainkit/identity';
import { UserProfileCard } from '@/components/UserProfileCard';
import { HealthGoalsCard } from '@/components/HealthGoalsCard';
import { TodaysMealsCard } from '@/components/TodaysMealsCard';
import { ProgressChart } from '@/components/ProgressChart';
import { NutritionStatsCard } from '@/components/NutritionStatsCard';
import { QuickActionsCard } from '@/components/QuickActionsCard';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { generateMockData } from '@/lib/utils';
import { Utensils, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { setFrameReady } = useMiniKit();
  const [data, setData] = useState(generateMockData());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setFrameReady();
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [setFrameReady]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 animate-pulse-slow mx-auto">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading NutriFlow</h2>
          <p className="text-white text-opacity-80">Preparing your personalized nutrition dashboard...</p>
        </div>
      </div>
    );
  }

  const totalCalories = data.todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalMacros = data.todaysMeals.reduce(
    (acc, meal) => ({
      protein: acc.protein + meal.macros.protein,
      carbs: acc.carbs + meal.macros.carbs,
      fat: acc.fat + meal.macros.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white text-shadow">NutriFlow</h1>
            <p className="text-white text-opacity-80 text-sm">Your personalized nutrition mapped out, effortlessly</p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <Wallet>
            <ConnectWallet>
              <Name />
            </ConnectWallet>
          </Wallet>
          <div className="flex items-center text-white text-opacity-90">
            <Sparkles className="w-4 h-4 mr-1" />
            <span className="text-sm">Subscription-Based Platform</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Top Row - User Profile and Health Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <UserProfileCard user={data.user} />
            <HealthGoalsCard 
              goals={data.user.healthGoals}
              currentWeight={data.user.weight}
              progress={75}
            />
          </div>

          {/* Middle Row - Today's Meals and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <TodaysMealsCard 
                meals={data.todaysMeals}
                onLogMeal={handleLogMeal}
              />
            </div>
            <QuickActionsCard onAction={handleQuickAction} />
          </div>

          {/* Bottom Row - Progress Chart and Nutrition Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ProgressChart 
              data={data.weeklyProgress}
              variant="weight"
            />
            <NutritionStatsCard
              totalCalories={totalCalories}
              targetCalories={1400}
              macros={totalMacros}
              targetMacros={{ protein: 105, carbs: 175, fat: 47 }}
            />
          </div>

          {/* Subscription Card */}
          <div className="max-w-md mx-auto">
            <SubscriptionCard 
              currentPlan={data.user.subscriptionStatus}
              onUpgrade={handleUpgrade}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-white text-opacity-60">
        <p className="text-sm">
          © 2024 NutriFlow. Hyper-personalized nutrition for your unique goals.
        </p>
      </footer>
    </div>
  );
}
