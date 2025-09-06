import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/services/database';
import { openaiService } from '@/lib/services/openai';
import { edamamService } from '@/lib/services/edamam';
import { z } from 'zod';

const generatePlanSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  regenerate: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, regenerate } = generatePlanSchema.parse(body);

    // Get user data
    const user = await databaseService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Check if user already has an active plan and regenerate is false
    if (!regenerate) {
      const existingPlan = await databaseService.getActiveDietPlan(userId);
      if (existingPlan) {
        return NextResponse.json(
          {
            success: false,
            error: 'User already has an active diet plan. Set regenerate=true to create a new one.',
          },
          { status: 400 }
        );
      }
    }

    // Generate nutrition plan using AI
    const nutritionPlan = await openaiService.generateNutritionPlan({
      age: user.age,
      weight: user.weight,
      height: user.height,
      activityLevel: user.activity_level,
      dietaryPreferences: user.dietary_preferences,
      healthGoals: user.health_goals,
    });

    // Create diet plan in database
    const dietPlan = await databaseService.createDietPlan({
      user_id: userId,
      calorie_target: nutritionPlan.calorieTarget,
      macro_targets: nutritionPlan.macroTargets,
    });

    // Generate meal suggestions for each meal type
    const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner'];
    const meals = [];

    for (const mealType of mealTypes) {
      try {
        // Get AI meal suggestions
        const mealSuggestions = await openaiService.generateMealSuggestions(
          {
            age: user.age,
            weight: user.weight,
            height: user.height,
            activityLevel: user.activity_level,
            dietaryPreferences: user.dietary_preferences,
            healthGoals: user.health_goals,
          },
          mealType,
          nutritionPlan.calorieTarget
        );

        // For each suggestion, try to find or create a recipe
        for (const suggestion of mealSuggestions.suggestions.slice(0, 2)) { // Take first 2 suggestions
          // Create a custom recipe from the AI suggestion
          const recipe = await databaseService.createRecipe({
            name: suggestion.name,
            description: suggestion.description,
            ingredients: suggestion.ingredients,
            instructions: [
              `This is an AI-generated recipe suggestion for ${mealType}.`,
              `Preparation time: ${suggestion.prepTime} minutes`,
              `Difficulty: ${suggestion.difficulty}`,
              'Follow standard cooking practices and adjust ingredients to taste.',
              ...suggestion.benefits.map(benefit => `• ${benefit}`),
            ],
            prep_time: suggestion.prepTime,
            cook_time: Math.max(0, suggestion.prepTime - 10),
            nutritional_info: {
              calories: suggestion.estimatedCalories,
              protein: Math.round(suggestion.estimatedCalories * 0.15 / 4), // Rough estimate
              carbs: Math.round(suggestion.estimatedCalories * 0.50 / 4),
              fat: Math.round(suggestion.estimatedCalories * 0.35 / 9),
            },
            source: 'custom',
          });

          // Create meal entry
          const meal = await databaseService.createMeal({
            diet_plan_id: dietPlan.plan_id,
            meal_type: mealType,
            recipe_id: recipe.recipe_id,
            name: recipe.name,
            calories: recipe.nutritional_info.calories,
            macros: {
              protein: recipe.nutritional_info.protein,
              carbs: recipe.nutritional_info.carbs,
              fat: recipe.nutritional_info.fat,
            },
            preparation_time: recipe.prep_time + recipe.cook_time,
          });

          meals.push(meal);
        }
      } catch (error) {
        console.error(`Error generating meals for ${mealType}:`, error);
        // Continue with other meal types even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        dietPlan: {
          id: dietPlan.plan_id,
          userId: dietPlan.user_id,
          calorieTarget: dietPlan.calorie_target,
          macroTargets: dietPlan.macro_targets,
          isActive: dietPlan.is_active,
          generatedDate: dietPlan.generated_date,
          createdAt: dietPlan.created_at,
        },
        meals: meals.map(meal => ({
          id: meal.meal_id,
          dietPlanId: meal.diet_plan_id,
          mealType: meal.meal_type,
          recipeId: meal.recipe_id,
          name: meal.name,
          calories: meal.calories,
          macros: meal.macros,
          preparationTime: meal.preparation_time,
        })),
        explanation: nutritionPlan.explanation,
        tips: nutritionPlan.tips,
        warnings: nutritionPlan.warnings,
      },
    });
  } catch (error) {
    console.error('Error generating diet plan:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate diet plan',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    // Get active diet plan
    const dietPlan = await databaseService.getActiveDietPlan(userId);
    if (!dietPlan) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active diet plan found',
        },
        { status: 404 }
      );
    }

    // Get meals for the diet plan
    const meals = await databaseService.getMealsByDietPlan(dietPlan.plan_id);

    // Get user for AI explanation
    const user = await databaseService.getUserById(userId);
    let explanation = 'Your personalized nutrition plan is designed to help you achieve your health goals.';
    
    if (user) {
      try {
        explanation = await openaiService.explainNutritionPlan(
          {
            age: user.age,
            weight: user.weight,
            height: user.height,
            activityLevel: user.activity_level,
            dietaryPreferences: user.dietary_preferences,
            healthGoals: user.health_goals,
          },
          {
            calorieTarget: dietPlan.calorie_target,
            macroTargets: dietPlan.macro_targets as { protein: number; carbs: number; fat: number },
          }
        );
      } catch (error) {
        console.error('Error generating explanation:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        dietPlan: {
          id: dietPlan.plan_id,
          userId: dietPlan.user_id,
          calorieTarget: dietPlan.calorie_target,
          macroTargets: dietPlan.macro_targets,
          isActive: dietPlan.is_active,
          generatedDate: dietPlan.generated_date,
          createdAt: dietPlan.created_at,
        },
        meals: meals.map(meal => ({
          id: meal.meal_id,
          dietPlanId: meal.diet_plan_id,
          mealType: meal.meal_type,
          recipeId: meal.recipe_id,
          name: meal.name,
          calories: meal.calories,
          macros: meal.macros,
          preparationTime: meal.preparation_time,
        })),
        explanation,
      },
    });
  } catch (error) {
    console.error('Error fetching diet plan:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch diet plan',
      },
      { status: 500 }
    );
  }
}
