import { supabase, type Database } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

type DietPlan = Database['public']['Tables']['diet_plans']['Row'];
type DietPlanInsert = Database['public']['Tables']['diet_plans']['Insert'];

type Meal = Database['public']['Tables']['meals']['Row'];
type MealInsert = Database['public']['Tables']['meals']['Insert'];

type Recipe = Database['public']['Tables']['recipes']['Row'];
type RecipeInsert = Database['public']['Tables']['recipes']['Insert'];

type ProgressLog = Database['public']['Tables']['progress_logs']['Row'];
type ProgressLogInsert = Database['public']['Tables']['progress_logs']['Insert'];
type ProgressLogUpdate = Database['public']['Tables']['progress_logs']['Update'];

class DatabaseService {
  // User operations
  async createUser(userData: UserInsert): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }

    return data;
  }

  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }

    return data;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      console.error('Error fetching user by email:', error);
      throw new Error('Failed to fetch user');
    }

    return data;
  }

  async updateUser(userId: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }

    return data;
  }

  // Diet plan operations
  async createDietPlan(planData: DietPlanInsert): Promise<DietPlan> {
    // First, deactivate any existing active plans for the user
    await supabase
      .from('diet_plans')
      .update({ is_active: false })
      .eq('user_id', planData.user_id)
      .eq('is_active', true);

    const { data, error } = await supabase
      .from('diet_plans')
      .insert(planData)
      .select()
      .single();

    if (error) {
      console.error('Error creating diet plan:', error);
      throw new Error('Failed to create diet plan');
    }

    return data;
  }

  async getActiveDietPlan(userId: string): Promise<DietPlan | null> {
    const { data, error } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No active plan found
      }
      console.error('Error fetching active diet plan:', error);
      throw new Error('Failed to fetch active diet plan');
    }

    return data;
  }

  async getUserDietPlans(userId: string): Promise<DietPlan[]> {
    const { data, error } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user diet plans:', error);
      throw new Error('Failed to fetch diet plans');
    }

    return data;
  }

  // Recipe operations
  async createRecipe(recipeData: RecipeInsert): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .insert(recipeData)
      .select()
      .single();

    if (error) {
      console.error('Error creating recipe:', error);
      throw new Error('Failed to create recipe');
    }

    return data;
  }

  async getRecipeById(recipeId: string): Promise<Recipe | null> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('recipe_id', recipeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Recipe not found
      }
      console.error('Error fetching recipe:', error);
      throw new Error('Failed to fetch recipe');
    }

    return data;
  }

  async searchRecipes(
    query?: string,
    source?: 'edamam' | 'custom',
    limit: number = 20
  ): Promise<Recipe[]> {
    let queryBuilder = supabase
      .from('recipes')
      .select('*')
      .limit(limit);

    if (query) {
      queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    }

    if (source) {
      queryBuilder = queryBuilder.eq('source', source);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error searching recipes:', error);
      throw new Error('Failed to search recipes');
    }

    return data;
  }

  async getRecipeByExternalId(externalId: string): Promise<Recipe | null> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('external_id', externalId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Recipe not found
      }
      console.error('Error fetching recipe by external ID:', error);
      throw new Error('Failed to fetch recipe');
    }

    return data;
  }

  // Meal operations
  async createMeal(mealData: MealInsert): Promise<Meal> {
    const { data, error } = await supabase
      .from('meals')
      .insert(mealData)
      .select()
      .single();

    if (error) {
      console.error('Error creating meal:', error);
      throw new Error('Failed to create meal');
    }

    return data;
  }

  async getMealsByDietPlan(dietPlanId: string): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('diet_plan_id', dietPlanId)
      .order('meal_type');

    if (error) {
      console.error('Error fetching meals by diet plan:', error);
      throw new Error('Failed to fetch meals');
    }

    return data;
  }

  async getMealsByType(
    dietPlanId: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('diet_plan_id', dietPlanId)
      .eq('meal_type', mealType);

    if (error) {
      console.error('Error fetching meals by type:', error);
      throw new Error('Failed to fetch meals');
    }

    return data;
  }

  // Progress log operations
  async createProgressLog(logData: ProgressLogInsert): Promise<ProgressLog> {
    const { data, error } = await supabase
      .from('progress_logs')
      .insert(logData)
      .select()
      .single();

    if (error) {
      console.error('Error creating progress log:', error);
      throw new Error('Failed to create progress log');
    }

    return data;
  }

  async updateProgressLog(logId: string, updates: ProgressLogUpdate): Promise<ProgressLog> {
    const { data, error } = await supabase
      .from('progress_logs')
      .update(updates)
      .eq('log_id', logId)
      .select()
      .single();

    if (error) {
      console.error('Error updating progress log:', error);
      throw new Error('Failed to update progress log');
    }

    return data;
  }

  async getProgressLogByDate(userId: string, date: string): Promise<ProgressLog | null> {
    const { data, error } = await supabase
      .from('progress_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Log not found
      }
      console.error('Error fetching progress log by date:', error);
      throw new Error('Failed to fetch progress log');
    }

    return data;
  }

  async getUserProgressLogs(
    userId: string,
    limit: number = 30,
    startDate?: string,
    endDate?: string
  ): Promise<ProgressLog[]> {
    let queryBuilder = supabase
      .from('progress_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(limit);

    if (startDate) {
      queryBuilder = queryBuilder.gte('log_date', startDate);
    }

    if (endDate) {
      queryBuilder = queryBuilder.lte('log_date', endDate);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error fetching user progress logs:', error);
      throw new Error('Failed to fetch progress logs');
    }

    return data;
  }

  // Analytics and aggregations
  async getUserStats(userId: string, days: number = 30): Promise<{
    totalLogs: number;
    averageWeight: number;
    averageAdherence: number;
    weightChange: number;
    streakDays: number;
  }> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const logs = await this.getUserProgressLogs(userId, days, startDate, endDate);

    if (logs.length === 0) {
      return {
        totalLogs: 0,
        averageWeight: 0,
        averageAdherence: 0,
        weightChange: 0,
        streakDays: 0,
      };
    }

    const totalLogs = logs.length;
    const averageWeight = logs.reduce((sum, log) => sum + log.weight, 0) / totalLogs;
    const averageAdherence = logs.reduce((sum, log) => sum + log.adherence_score, 0) / totalLogs;
    
    const sortedLogs = logs.sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime());
    const weightChange = sortedLogs[sortedLogs.length - 1].weight - sortedLogs[0].weight;

    // Calculate streak (consecutive days with logs)
    let streakDays = 0;
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      
      const hasLog = logs.some(log => log.log_date === checkDate);
      if (hasLog) {
        streakDays++;
      } else {
        break;
      }
    }

    return {
      totalLogs,
      averageWeight: Math.round(averageWeight * 10) / 10,
      averageAdherence: Math.round(averageAdherence),
      weightChange: Math.round(weightChange * 10) / 10,
      streakDays,
    };
  }

  // Utility methods
  async upsertProgressLog(userId: string, date: string, logData: Omit<ProgressLogInsert, 'user_id' | 'log_date'>): Promise<ProgressLog> {
    const existingLog = await this.getProgressLogByDate(userId, date);
    
    if (existingLog) {
      return this.updateProgressLog(existingLog.log_id, logData);
    } else {
      return this.createProgressLog({
        ...logData,
        user_id: userId,
        log_date: date,
      });
    }
  }

  async getOrCreateRecipeFromExternal(externalId: string, recipeData: RecipeInsert): Promise<Recipe> {
    const existingRecipe = await this.getRecipeByExternalId(externalId);
    
    if (existingRecipe) {
      return existingRecipe;
    }

    return this.createRecipe({
      ...recipeData,
      external_id: externalId,
    });
  }
}

export const databaseService = new DatabaseService();
