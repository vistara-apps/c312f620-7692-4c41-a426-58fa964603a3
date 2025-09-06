export interface User {
  userId: string;
  name: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietaryPreferences: string[];
  healthGoals: string[];
  subscriptionStatus: 'free' | 'basic' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}

export interface DietPlan {
  planId: string;
  userId: string;
  generatedDate: Date;
  calorieTarget: number;
  macroTargets: {
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: Meal[];
}

export interface Meal {
  mealId: string;
  dietPlanId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string;
  name: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  preparationTime: number;
}

export interface Recipe {
  recipeId: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface ProgressLog {
  logId: string;
  userId: string;
  logDate: Date;
  weight: number;
  foodConsumed: string[];
  adherenceScore: number;
}

export interface DashboardData {
  user: User;
  currentPlan: DietPlan;
  todaysMeals: Meal[];
  recentProgress: ProgressLog[];
  weeklyStats: {
    adherenceRate: number;
    avgCalories: number;
    weightChange: number;
  };
}
