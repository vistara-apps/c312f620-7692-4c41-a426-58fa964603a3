import axios from 'axios';

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
const EDAMAM_BASE_URL = 'https://api.edamam.com/api';

export interface EdamamRecipe {
  uri: string;
  label: string;
  image: string;
  source: string;
  url: string;
  shareAs: string;
  yield: number;
  dietLabels: string[];
  healthLabels: string[];
  cautions: string[];
  ingredientLines: string[];
  ingredients: Array<{
    text: string;
    quantity: number;
    measure: string;
    food: string;
    weight: number;
    foodCategory: string;
    foodId: string;
    image: string;
  }>;
  calories: number;
  totalWeight: number;
  totalTime: number;
  cuisineType: string[];
  mealType: string[];
  dishType: string[];
  totalNutrients: {
    [key: string]: {
      label: string;
      quantity: number;
      unit: string;
    };
  };
  totalDaily: {
    [key: string]: {
      label: string;
      quantity: number;
      unit: string;
    };
  };
}

export interface EdamamSearchResponse {
  q: string;
  from: number;
  to: number;
  more: boolean;
  count: number;
  hits: Array<{
    recipe: EdamamRecipe;
    _links: {
      self: {
        href: string;
        title: string;
      };
    };
  }>;
}

export interface MealPlanRequest {
  size: number;
  plan: {
    accept: {
      all: Array<{
        health: string[];
        diet: string[];
      }>;
    };
    fit: {
      ENERC_KCAL: {
        min: number;
        max: number;
      };
      PROCNT: {
        min: number;
        max: number;
      };
      FAT: {
        min: number;
        max: number;
      };
      CHOCDF: {
        min: number;
        max: number;
      };
    };
    sections: {
      [key: string]: {
        accept: {
          all: Array<{
            dish: string[];
            meal: string[];
          }>;
        };
        fit: {
          ENERC_KCAL: {
            min: number;
            max: number;
          };
        };
      };
    };
  };
}

export interface MealPlanResponse {
  selection: Array<{
    sections: {
      [key: string]: Array<{
        recipe: EdamamRecipe;
        _links: {
          self: {
            href: string;
            title: string;
          };
        };
      }>;
    };
  }>;
}

class EdamamService {
  private validateConfig() {
    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
      throw new Error('Edamam API credentials are not configured');
    }
  }

  async searchRecipes(
    query: string,
    dietLabels: string[] = [],
    healthLabels: string[] = [],
    mealType: string[] = [],
    calories?: { min: number; max: number },
    from: number = 0,
    to: number = 20
  ): Promise<EdamamSearchResponse> {
    this.validateConfig();

    const params = new URLSearchParams({
      type: 'public',
      q: query,
      app_id: EDAMAM_APP_ID!,
      app_key: EDAMAM_APP_KEY!,
      from: from.toString(),
      to: to.toString(),
    });

    // Add diet labels
    dietLabels.forEach(label => params.append('diet', label));
    
    // Add health labels
    healthLabels.forEach(label => params.append('health', label));
    
    // Add meal type
    mealType.forEach(type => params.append('mealType', type));

    // Add calorie range
    if (calories) {
      params.append('calories', `${calories.min}-${calories.max}`);
    }

    try {
      const response = await axios.get(`${EDAMAM_BASE_URL}/recipes/v2`, {
        params,
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw new Error('Failed to search recipes from Edamam');
    }
  }

  async generateMealPlan(
    calorieTarget: number,
    macroTargets: { protein: number; carbs: number; fat: number },
    dietLabels: string[] = [],
    healthLabels: string[] = []
  ): Promise<MealPlanResponse> {
    this.validateConfig();

    // Calculate calorie distribution for meals
    const breakfastCalories = Math.round(calorieTarget * 0.25);
    const lunchCalories = Math.round(calorieTarget * 0.35);
    const dinnerCalories = Math.round(calorieTarget * 0.35);
    const snackCalories = Math.round(calorieTarget * 0.05);

    const mealPlanRequest: MealPlanRequest = {
      size: 7, // 7 days
      plan: {
        accept: {
          all: [{
            health: healthLabels,
            diet: dietLabels,
          }],
        },
        fit: {
          ENERC_KCAL: {
            min: calorieTarget * 0.9,
            max: calorieTarget * 1.1,
          },
          PROCNT: {
            min: macroTargets.protein * 0.8,
            max: macroTargets.protein * 1.2,
          },
          FAT: {
            min: macroTargets.fat * 0.8,
            max: macroTargets.fat * 1.2,
          },
          CHOCDF: {
            min: macroTargets.carbs * 0.8,
            max: macroTargets.carbs * 1.2,
          },
        },
        sections: {
          Breakfast: {
            accept: {
              all: [{
                dish: ['cereals', 'egg', 'pancake', 'bread'],
                meal: ['breakfast'],
              }],
            },
            fit: {
              ENERC_KCAL: {
                min: breakfastCalories * 0.8,
                max: breakfastCalories * 1.2,
              },
            },
          },
          Lunch: {
            accept: {
              all: [{
                dish: ['salad', 'soup', 'main course'],
                meal: ['lunch/dinner'],
              }],
            },
            fit: {
              ENERC_KCAL: {
                min: lunchCalories * 0.8,
                max: lunchCalories * 1.2,
              },
            },
          },
          Dinner: {
            accept: {
              all: [{
                dish: ['main course', 'side dish'],
                meal: ['lunch/dinner'],
              }],
            },
            fit: {
              ENERC_KCAL: {
                min: dinnerCalories * 0.8,
                max: dinnerCalories * 1.2,
              },
            },
          },
        },
      },
    };

    try {
      const response = await axios.post(
        `${EDAMAM_BASE_URL}/meal-planner/v1/${EDAMAM_APP_ID}/select`,
        mealPlanRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Edamam-Account-User': EDAMAM_APP_ID!,
            'Edamam-Account-Key': EDAMAM_APP_KEY!,
          },
          timeout: 15000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw new Error('Failed to generate meal plan from Edamam');
    }
  }

  async getRecipeById(recipeId: string): Promise<EdamamRecipe> {
    this.validateConfig();

    try {
      const response = await axios.get(`${EDAMAM_BASE_URL}/recipes/v2/${recipeId}`, {
        params: {
          type: 'public',
          app_id: EDAMAM_APP_ID!,
          app_key: EDAMAM_APP_KEY!,
        },
        timeout: 10000,
      });

      return response.data.recipe;
    } catch (error) {
      console.error('Error fetching recipe by ID:', error);
      throw new Error('Failed to fetch recipe from Edamam');
    }
  }

  // Helper method to convert Edamam recipe to our Recipe format
  convertToRecipe(edamamRecipe: EdamamRecipe): {
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
    source: 'edamam';
    external_id: string;
  } {
    const protein = edamamRecipe.totalNutrients.PROCNT?.quantity || 0;
    const carbs = edamamRecipe.totalNutrients.CHOCDF?.quantity || 0;
    const fat = edamamRecipe.totalNutrients.FAT?.quantity || 0;

    return {
      name: edamamRecipe.label,
      description: `${edamamRecipe.source} recipe with ${edamamRecipe.yield} servings`,
      ingredients: edamamRecipe.ingredientLines,
      instructions: [
        'This recipe is from an external source.',
        `Visit the original recipe at: ${edamamRecipe.url}`,
        'Follow the instructions provided on the source website.',
      ],
      prep_time: Math.max(0, (edamamRecipe.totalTime || 30) - 20),
      cook_time: Math.min(edamamRecipe.totalTime || 30, 20),
      nutritional_info: {
        calories: Math.round(edamamRecipe.calories / edamamRecipe.yield),
        protein: Math.round(protein / edamamRecipe.yield),
        carbs: Math.round(carbs / edamamRecipe.yield),
        fat: Math.round(fat / edamamRecipe.yield),
      },
      image_url: edamamRecipe.image,
      source: 'edamam' as const,
      external_id: edamamRecipe.uri.split('#recipe_')[1],
    };
  }
}

export const edamamService = new EdamamService();
