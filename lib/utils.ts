import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} lbs`;
}

export function formatCalories(calories: number): string {
  return `${calories.toLocaleString()} cal`;
}

export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  // Mifflin-St Jeor Equation
  const baseRate = 10 * (weight * 0.453592) + 6.25 * (height * 2.54) - 5 * age;
  return gender === 'male' ? baseRate + 5 : baseRate - 161;
}

export function getActivityMultiplier(activityLevel: string): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return multipliers[activityLevel as keyof typeof multipliers] || 1.2;
}

export function generateMockData() {
  return {
    user: {
      userId: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      age: 28,
      weight: 140,
      height: 66,
      activityLevel: 'moderate' as const,
      dietaryPreferences: ['vegetarian', 'gluten-free'],
      healthGoals: ['weight_loss', 'muscle_gain'],
      subscriptionStatus: 'premium' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    todaysMeals: [
      {
        mealId: '1',
        dietPlanId: '1',
        mealType: 'breakfast' as const,
        recipeId: '1',
        name: 'Avocado Toast with Eggs',
        calories: 420,
        macros: { protein: 18, carbs: 32, fat: 24 },
        preparationTime: 15,
      },
      {
        mealId: '2',
        dietPlanId: '1',
        mealType: 'lunch' as const,
        recipeId: '2',
        name: 'Quinoa Buddha Bowl',
        calories: 520,
        macros: { protein: 22, carbs: 68, fat: 16 },
        preparationTime: 25,
      },
      {
        mealId: '3',
        dietPlanId: '1',
        mealType: 'dinner' as const,
        recipeId: '3',
        name: 'Grilled Salmon & Vegetables',
        calories: 480,
        macros: { protein: 35, carbs: 28, fat: 22 },
        preparationTime: 30,
      },
    ],
    weeklyProgress: [
      { day: 'Mon', weight: 142, calories: 1420, adherence: 95 },
      { day: 'Tue', weight: 141.5, calories: 1380, adherence: 88 },
      { day: 'Wed', weight: 141.2, calories: 1450, adherence: 92 },
      { day: 'Thu', weight: 140.8, calories: 1400, adherence: 96 },
      { day: 'Fri', weight: 140.5, calories: 1420, adherence: 90 },
      { day: 'Sat', weight: 140.2, calories: 1480, adherence: 85 },
      { day: 'Sun', weight: 140, calories: 1400, adherence: 94 },
    ],
  };
}
