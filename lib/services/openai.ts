import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  activityLevel: string;
  dietaryPreferences: string[];
  healthGoals: string[];
  medicalConditions?: string[];
  allergies?: string[];
}

export interface NutritionRecommendation {
  calorieTarget: number;
  macroTargets: {
    protein: number;
    carbs: number;
    fat: number;
  };
  explanation: string;
  tips: string[];
  warnings?: string[];
}

export interface MealSuggestion {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  suggestions: Array<{
    name: string;
    description: string;
    estimatedCalories: number;
    prepTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    ingredients: string[];
    benefits: string[];
  }>;
}

class OpenAIService {
  private validateConfig() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
  }

  async generateNutritionPlan(userProfile: UserProfile): Promise<NutritionRecommendation> {
    this.validateConfig();

    const prompt = `
As a certified nutritionist and dietitian, create a personalized nutrition plan for the following user:

User Profile:
- Age: ${userProfile.age} years
- Weight: ${userProfile.weight} lbs
- Height: ${userProfile.height} inches
- Activity Level: ${userProfile.activityLevel}
- Dietary Preferences: ${userProfile.dietaryPreferences.join(', ') || 'None specified'}
- Health Goals: ${userProfile.healthGoals.join(', ') || 'General health'}
- Medical Conditions: ${userProfile.medicalConditions?.join(', ') || 'None specified'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None specified'}

Please provide:
1. Daily calorie target (based on BMR, activity level, and goals)
2. Macro targets in grams (protein, carbs, fat)
3. A clear explanation of the recommendations
4. 3-5 practical tips for following this plan
5. Any warnings or considerations

Format your response as JSON with the following structure:
{
  "calorieTarget": number,
  "macroTargets": {
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "explanation": "string",
  "tips": ["string"],
  "warnings": ["string"] (optional)
}

Be specific, scientific, and practical. Consider the user's goals and constraints.
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a certified nutritionist and dietitian with expertise in personalized nutrition planning. Provide evidence-based recommendations that are safe, practical, and tailored to individual needs.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content);
        throw new Error('Invalid response format from OpenAI');
      }
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
      throw new Error('Failed to generate personalized nutrition plan');
    }
  }

  async generateMealSuggestions(
    userProfile: UserProfile,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    calorieTarget: number
  ): Promise<MealSuggestion> {
    this.validateConfig();

    const mealCalories = {
      breakfast: Math.round(calorieTarget * 0.25),
      lunch: Math.round(calorieTarget * 0.35),
      dinner: Math.round(calorieTarget * 0.35),
      snack: Math.round(calorieTarget * 0.05),
    };

    const targetCalories = mealCalories[mealType];

    const prompt = `
As a nutritionist, suggest 3-4 ${mealType} options for a user with the following profile:

User Profile:
- Age: ${userProfile.age} years
- Weight: ${userProfile.weight} lbs
- Height: ${userProfile.height} inches
- Activity Level: ${userProfile.activityLevel}
- Dietary Preferences: ${userProfile.dietaryPreferences.join(', ') || 'None specified'}
- Health Goals: ${userProfile.healthGoals.join(', ') || 'General health'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None specified'}

Target calories for this ${mealType}: ~${targetCalories} calories

For each suggestion, provide:
- Name of the meal
- Brief description
- Estimated calories
- Preparation time in minutes
- Difficulty level (easy/medium/hard)
- Key ingredients list
- Health benefits

Format as JSON:
{
  "mealType": "${mealType}",
  "suggestions": [
    {
      "name": "string",
      "description": "string",
      "estimatedCalories": number,
      "prepTime": number,
      "difficulty": "easy|medium|hard",
      "ingredients": ["string"],
      "benefits": ["string"]
    }
  ]
}

Focus on practical, nutritious options that align with their goals and preferences.
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a nutritionist specializing in meal planning. Provide practical, healthy meal suggestions that are easy to prepare and nutritionally balanced.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 1200,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content);
        throw new Error('Invalid response format from OpenAI');
      }
    } catch (error) {
      console.error('Error generating meal suggestions:', error);
      throw new Error('Failed to generate meal suggestions');
    }
  }

  async explainNutritionPlan(
    userProfile: UserProfile,
    currentPlan: { calorieTarget: number; macroTargets: { protein: number; carbs: number; fat: number } }
  ): Promise<string> {
    this.validateConfig();

    const prompt = `
Explain this nutrition plan in simple, encouraging terms for the user:

User Profile:
- Age: ${userProfile.age} years
- Weight: ${userProfile.weight} lbs
- Height: ${userProfile.height} inches
- Activity Level: ${userProfile.activityLevel}
- Health Goals: ${userProfile.healthGoals.join(', ') || 'General health'}

Current Plan:
- Daily Calories: ${currentPlan.calorieTarget}
- Protein: ${currentPlan.macroTargets.protein}g
- Carbs: ${currentPlan.macroTargets.carbs}g
- Fat: ${currentPlan.macroTargets.fat}g

Provide a friendly, motivating explanation of:
1. Why these numbers make sense for their goals
2. What they can expect from following this plan
3. How this supports their specific health goals
4. Encouragement for their journey

Keep it conversational, positive, and under 200 words.
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a supportive nutritionist who explains complex nutrition concepts in simple, encouraging terms. Be positive, motivating, and practical.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 300,
      });

      return response.choices[0]?.message?.content || 'Your personalized nutrition plan is designed to help you achieve your health goals safely and effectively.';
    } catch (error) {
      console.error('Error explaining nutrition plan:', error);
      return 'Your personalized nutrition plan is designed to help you achieve your health goals safely and effectively.';
    }
  }

  async generateProgressInsights(
    userProfile: UserProfile,
    progressData: Array<{
      date: string;
      weight: number;
      adherence: number;
      calories: number;
    }>
  ): Promise<{
    insights: string[];
    recommendations: string[];
    motivation: string;
  }> {
    this.validateConfig();

    const recentProgress = progressData.slice(-7); // Last 7 days
    const avgAdherence = recentProgress.reduce((sum, day) => sum + day.adherence, 0) / recentProgress.length;
    const weightTrend = recentProgress[recentProgress.length - 1]?.weight - recentProgress[0]?.weight;

    const prompt = `
Analyze this user's recent progress and provide insights:

User Goals: ${userProfile.healthGoals.join(', ')}
Recent Progress (last 7 days):
${recentProgress.map(day => `- ${day.date}: Weight ${day.weight}lbs, Adherence ${day.adherence}%, Calories ${day.calories}`).join('\n')}

Average Adherence: ${avgAdherence.toFixed(1)}%
Weight Change: ${weightTrend > 0 ? '+' : ''}${weightTrend.toFixed(1)}lbs

Provide:
1. 2-3 key insights about their progress
2. 2-3 specific recommendations for improvement
3. A motivating message

Format as JSON:
{
  "insights": ["string"],
  "recommendations": ["string"],
  "motivation": "string"
}

Be encouraging, specific, and actionable.
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a supportive nutrition coach who provides actionable insights and motivation based on progress data.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        return {
          insights: ['Your progress shows dedication to your health goals.'],
          recommendations: ['Continue tracking your meals and stay consistent with your plan.'],
          motivation: 'Every step forward is progress. Keep up the great work!',
        };
      }
    } catch (error) {
      console.error('Error generating progress insights:', error);
      return {
        insights: ['Your progress shows dedication to your health goals.'],
        recommendations: ['Continue tracking your meals and stay consistent with your plan.'],
        motivation: 'Every step forward is progress. Keep up the great work!',
      };
    }
  }
}

export const openaiService = new OpenAIService();
