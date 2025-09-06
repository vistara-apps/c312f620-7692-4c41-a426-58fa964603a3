import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/services/database';
import { openaiService } from '@/lib/services/openai';
import { z } from 'zod';
import { format } from 'date-fns';

const logProgressSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  date: z.string().optional(),
  weight: z.number().min(50, 'Weight must be at least 50 lbs').max(1000, 'Invalid weight'),
  foodConsumed: z.array(z.string()).default([]),
  adherenceScore: z.number().min(0, 'Adherence score must be at least 0').max(100, 'Adherence score must be at most 100'),
  notes: z.string().optional(),
});

const getProgressSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  days: z.number().min(1).max(365).default(30),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = logProgressSchema.parse(body);

    // Use provided date or today's date
    const logDate = validatedData.date || format(new Date(), 'yyyy-MM-dd');

    // Check if user exists
    const user = await databaseService.getUserById(validatedData.userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Create or update progress log
    const progressLog = await databaseService.upsertProgressLog(
      validatedData.userId,
      logDate,
      {
        weight: validatedData.weight,
        food_consumed: validatedData.foodConsumed,
        adherence_score: validatedData.adherenceScore,
        notes: validatedData.notes,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        progressLog: {
          id: progressLog.log_id,
          userId: progressLog.user_id,
          date: progressLog.log_date,
          weight: progressLog.weight,
          foodConsumed: progressLog.food_consumed,
          adherenceScore: progressLog.adherence_score,
          notes: progressLog.notes,
          createdAt: progressLog.created_at,
          updatedAt: progressLog.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('Error logging progress:', error);

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
        error: 'Failed to log progress',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const validatedParams = getProgressSchema.parse({
      userId,
      days,
      startDate,
      endDate,
    });

    // Check if user exists
    const user = await databaseService.getUserById(validatedParams.userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Get progress logs
    const progressLogs = await databaseService.getUserProgressLogs(
      validatedParams.userId,
      validatedParams.days,
      validatedParams.startDate,
      validatedParams.endDate
    );

    // Get user stats
    const stats = await databaseService.getUserStats(validatedParams.userId, validatedParams.days);

    // Generate AI insights if we have enough data
    let insights = null;
    if (progressLogs.length >= 3) {
      try {
        const progressData = progressLogs.map(log => ({
          date: log.log_date,
          weight: log.weight,
          adherence: log.adherence_score,
          calories: 0, // We don't track calories directly in progress logs yet
        }));

        insights = await openaiService.generateProgressInsights(
          {
            age: user.age,
            weight: user.weight,
            height: user.height,
            activityLevel: user.activity_level,
            dietaryPreferences: user.dietary_preferences,
            healthGoals: user.health_goals,
          },
          progressData
        );
      } catch (error) {
        console.error('Error generating AI insights:', error);
        // Continue without insights
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        progressLogs: progressLogs.map(log => ({
          id: log.log_id,
          userId: log.user_id,
          date: log.log_date,
          weight: log.weight,
          foodConsumed: log.food_consumed,
          adherenceScore: log.adherence_score,
          notes: log.notes,
          createdAt: log.created_at,
          updatedAt: log.updated_at,
        })),
        stats: {
          totalLogs: stats.totalLogs,
          averageWeight: stats.averageWeight,
          averageAdherence: stats.averageAdherence,
          weightChange: stats.weightChange,
          streakDays: stats.streakDays,
        },
        insights: insights ? {
          insights: insights.insights,
          recommendations: insights.recommendations,
          motivation: insights.motivation,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error fetching progress:', error);

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
        error: 'Failed to fetch progress',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { logId, ...updateData } = body;

    if (!logId) {
      return NextResponse.json(
        {
          success: false,
          error: 'logId is required',
        },
        { status: 400 }
      );
    }

    const validatedData = logProgressSchema.partial().parse(updateData);

    // Convert camelCase to snake_case for database
    const dbUpdateData: any = {};
    if (validatedData.weight !== undefined) dbUpdateData.weight = validatedData.weight;
    if (validatedData.foodConsumed !== undefined) dbUpdateData.food_consumed = validatedData.foodConsumed;
    if (validatedData.adherenceScore !== undefined) dbUpdateData.adherence_score = validatedData.adherenceScore;
    if (validatedData.notes !== undefined) dbUpdateData.notes = validatedData.notes;

    const updatedLog = await databaseService.updateProgressLog(logId, dbUpdateData);

    return NextResponse.json({
      success: true,
      data: {
        progressLog: {
          id: updatedLog.log_id,
          userId: updatedLog.user_id,
          date: updatedLog.log_date,
          weight: updatedLog.weight,
          foodConsumed: updatedLog.food_consumed,
          adherenceScore: updatedLog.adherence_score,
          notes: updatedLog.notes,
          createdAt: updatedLog.created_at,
          updatedAt: updatedLog.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('Error updating progress log:', error);

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
        error: 'Failed to update progress log',
      },
      { status: 500 }
    );
  }
}
