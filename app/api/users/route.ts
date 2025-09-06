import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/services/database';
import { openaiService } from '@/lib/services/openai';
import { stripeService } from '@/lib/services/stripe';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(13, 'Must be at least 13 years old').max(120, 'Invalid age'),
  weight: z.number().min(50, 'Weight must be at least 50 lbs').max(1000, 'Invalid weight'),
  height: z.number().min(36, 'Height must be at least 36 inches').max(96, 'Invalid height'),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  dietaryPreferences: z.array(z.string()).default([]),
  healthGoals: z.array(z.string()).default([]),
  subscriptionStatus: z.enum(['free', 'basic', 'premium']).default('free'),
});

const updateUserSchema = createUserSchema.partial();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Create user in database
    const user = await databaseService.createUser({
      name: validatedData.name,
      email: validatedData.email,
      age: validatedData.age,
      weight: validatedData.weight,
      height: validatedData.height,
      activity_level: validatedData.activityLevel,
      dietary_preferences: validatedData.dietaryPreferences,
      health_goals: validatedData.healthGoals,
      subscription_status: validatedData.subscriptionStatus,
    });

    // Create Stripe customer for future payments
    try {
      const stripeCustomer = await stripeService.createCustomer(
        user.email,
        user.name,
        user.user_id
      );

      // Update user with Stripe customer ID
      await databaseService.updateUser(user.user_id, {
        stripe_customer_id: stripeCustomer.id,
      });
    } catch (stripeError) {
      console.error('Failed to create Stripe customer:', stripeError);
      // Continue without Stripe customer - can be created later
    }

    // Generate initial nutrition plan using AI
    try {
      const nutritionPlan = await openaiService.generateNutritionPlan({
        age: user.age,
        weight: user.weight,
        height: user.height,
        activityLevel: user.activity_level,
        dietaryPreferences: user.dietary_preferences,
        healthGoals: user.health_goals,
      });

      // Create diet plan in database
      await databaseService.createDietPlan({
        user_id: user.user_id,
        calorie_target: nutritionPlan.calorieTarget,
        macro_targets: nutritionPlan.macroTargets,
      });
    } catch (aiError) {
      console.error('Failed to generate initial nutrition plan:', aiError);
      // Continue without AI-generated plan - user can generate one later
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          age: user.age,
          weight: user.weight,
          height: user.height,
          activityLevel: user.activity_level,
          dietaryPreferences: user.dietary_preferences,
          healthGoals: user.health_goals,
          subscriptionStatus: user.subscription_status,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);

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
        error: 'Failed to create user',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either userId or email is required',
        },
        { status: 400 }
      );
    }

    let user;
    if (userId) {
      user = await databaseService.getUserById(userId);
    } else if (email) {
      user = await databaseService.getUserByEmail(email);
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          age: user.age,
          weight: user.weight,
          height: user.height,
          activityLevel: user.activity_level,
          dietaryPreferences: user.dietary_preferences,
          healthGoals: user.health_goals,
          subscriptionStatus: user.subscription_status,
          stripeCustomerId: user.stripe_customer_id,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    const validatedData = updateUserSchema.parse(updateData);

    // Convert camelCase to snake_case for database
    const dbUpdateData: any = {};
    if (validatedData.name) dbUpdateData.name = validatedData.name;
    if (validatedData.email) dbUpdateData.email = validatedData.email;
    if (validatedData.age) dbUpdateData.age = validatedData.age;
    if (validatedData.weight) dbUpdateData.weight = validatedData.weight;
    if (validatedData.height) dbUpdateData.height = validatedData.height;
    if (validatedData.activityLevel) dbUpdateData.activity_level = validatedData.activityLevel;
    if (validatedData.dietaryPreferences) dbUpdateData.dietary_preferences = validatedData.dietaryPreferences;
    if (validatedData.healthGoals) dbUpdateData.health_goals = validatedData.healthGoals;
    if (validatedData.subscriptionStatus) dbUpdateData.subscription_status = validatedData.subscriptionStatus;

    const updatedUser = await databaseService.updateUser(userId, dbUpdateData);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: updatedUser.user_id,
          name: updatedUser.name,
          email: updatedUser.email,
          age: updatedUser.age,
          weight: updatedUser.weight,
          height: updatedUser.height,
          activityLevel: updatedUser.activity_level,
          dietaryPreferences: updatedUser.dietary_preferences,
          healthGoals: updatedUser.health_goals,
          subscriptionStatus: updatedUser.subscription_status,
          updatedAt: updatedUser.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);

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
        error: 'Failed to update user',
      },
      { status: 500 }
    );
  }
}
