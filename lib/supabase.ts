import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string;
          name: string;
          email: string;
          age: number;
          weight: number;
          height: number;
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
          dietary_preferences: string[];
          health_goals: string[];
          subscription_status: 'free' | 'basic' | 'premium';
          stripe_customer_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          name: string;
          email: string;
          age: number;
          weight: number;
          height: number;
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
          dietary_preferences: string[];
          health_goals: string[];
          subscription_status?: 'free' | 'basic' | 'premium';
          stripe_customer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          name?: string;
          email?: string;
          age?: number;
          weight?: number;
          height?: number;
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
          dietary_preferences?: string[];
          health_goals?: string[];
          subscription_status?: 'free' | 'basic' | 'premium';
          stripe_customer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      diet_plans: {
        Row: {
          plan_id: string;
          user_id: string;
          generated_date: string;
          calorie_target: number;
          macro_targets: {
            protein: number;
            carbs: number;
            fat: number;
          };
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          plan_id?: string;
          user_id: string;
          generated_date?: string;
          calorie_target: number;
          macro_targets: {
            protein: number;
            carbs: number;
            fat: number;
          };
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan_id?: string;
          user_id?: string;
          generated_date?: string;
          calorie_target?: number;
          macro_targets?: {
            protein: number;
            carbs: number;
            fat: number;
          };
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      meals: {
        Row: {
          meal_id: string;
          diet_plan_id: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          recipe_id: string;
          name: string;
          calories: number;
          macros: {
            protein: number;
            carbs: number;
            fat: number;
          };
          preparation_time: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          meal_id?: string;
          diet_plan_id: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          recipe_id: string;
          name: string;
          calories: number;
          macros: {
            protein: number;
            carbs: number;
            fat: number;
          };
          preparation_time: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          meal_id?: string;
          diet_plan_id?: string;
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          recipe_id?: string;
          name?: string;
          calories?: number;
          macros?: {
            protein: number;
            carbs: number;
            fat: number;
          };
          preparation_time?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      recipes: {
        Row: {
          recipe_id: string;
          name: string;
          description: string;
          ingredients: string[];
          instructions: string[];
          prep_time: number;
          cook_time: number;
          nutritional_info: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
          };
          image_url?: string;
          source: 'edamam' | 'custom';
          external_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          recipe_id?: string;
          name: string;
          description: string;
          ingredients: string[];
          instructions: string[];
          prep_time: number;
          cook_time: number;
          nutritional_info: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
          };
          image_url?: string;
          source?: 'edamam' | 'custom';
          external_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          recipe_id?: string;
          name?: string;
          description?: string;
          ingredients?: string[];
          instructions?: string[];
          prep_time?: number;
          cook_time?: number;
          nutritional_info?: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
          };
          image_url?: string;
          source?: 'edamam' | 'custom';
          external_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      progress_logs: {
        Row: {
          log_id: string;
          user_id: string;
          log_date: string;
          weight: number;
          food_consumed: string[];
          adherence_score: number;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          log_id?: string;
          user_id: string;
          log_date: string;
          weight: number;
          food_consumed: string[];
          adherence_score: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          log_id?: string;
          user_id?: string;
          log_date?: string;
          weight?: number;
          food_consumed?: string[];
          adherence_score?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
