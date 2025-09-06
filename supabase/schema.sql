-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE activity_level AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');
CREATE TYPE subscription_status AS ENUM ('free', 'basic', 'premium');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE recipe_source AS ENUM ('edamam', 'custom');

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
    height DECIMAL(5,2) NOT NULL CHECK (height > 0),
    activity_level activity_level NOT NULL DEFAULT 'moderate',
    dietary_preferences TEXT[] DEFAULT '{}',
    health_goals TEXT[] DEFAULT '{}',
    subscription_status subscription_status NOT NULL DEFAULT 'free',
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diet plans table
CREATE TABLE diet_plans (
    plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    generated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calorie_target INTEGER NOT NULL CHECK (calorie_target > 0),
    macro_targets JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE recipes (
    recipe_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients TEXT[] NOT NULL,
    instructions TEXT[] NOT NULL,
    prep_time INTEGER NOT NULL CHECK (prep_time >= 0),
    cook_time INTEGER NOT NULL CHECK (cook_time >= 0),
    nutritional_info JSONB NOT NULL,
    image_url TEXT,
    source recipe_source DEFAULT 'custom',
    external_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meals table
CREATE TABLE meals (
    meal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diet_plan_id UUID NOT NULL REFERENCES diet_plans(plan_id) ON DELETE CASCADE,
    meal_type meal_type NOT NULL,
    recipe_id UUID NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    macros JSONB NOT NULL,
    preparation_time INTEGER NOT NULL CHECK (preparation_time >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress logs table
CREATE TABLE progress_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
    food_consumed TEXT[] DEFAULT '{}',
    adherence_score INTEGER NOT NULL CHECK (adherence_score >= 0 AND adherence_score <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_status);
CREATE INDEX idx_diet_plans_user_id ON diet_plans(user_id);
CREATE INDEX idx_diet_plans_active ON diet_plans(user_id, is_active);
CREATE INDEX idx_meals_diet_plan ON meals(diet_plan_id);
CREATE INDEX idx_meals_type ON meals(meal_type);
CREATE INDEX idx_recipes_source ON recipes(source);
CREATE INDEX idx_recipes_external_id ON recipes(external_id);
CREATE INDEX idx_progress_logs_user_date ON progress_logs(user_id, log_date);
CREATE INDEX idx_progress_logs_date ON progress_logs(log_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diet_plans_updated_at BEFORE UPDATE ON diet_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_logs_updated_at BEFORE UPDATE ON progress_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Diet plans policies
CREATE POLICY "Users can view own diet plans" ON diet_plans FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own diet plans" ON diet_plans FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own diet plans" ON diet_plans FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Recipes are public for reading, but only system can insert/update
CREATE POLICY "Anyone can view recipes" ON recipes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage recipes" ON recipes FOR ALL TO service_role USING (true);

-- Meals policies
CREATE POLICY "Users can view own meals" ON meals FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM diet_plans dp 
        WHERE dp.plan_id = meals.diet_plan_id 
        AND auth.uid()::text = dp.user_id::text
    )
);
CREATE POLICY "Users can insert own meals" ON meals FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM diet_plans dp 
        WHERE dp.plan_id = meals.diet_plan_id 
        AND auth.uid()::text = dp.user_id::text
    )
);

-- Progress logs policies
CREATE POLICY "Users can view own progress" ON progress_logs FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own progress" ON progress_logs FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own progress" ON progress_logs FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Insert some sample recipes
INSERT INTO recipes (name, description, ingredients, instructions, prep_time, cook_time, nutritional_info, source) VALUES
(
    'Avocado Toast with Eggs',
    'A nutritious breakfast combining healthy fats from avocado with protein from eggs',
    ARRAY['2 slices whole grain bread', '1 ripe avocado', '2 eggs', '1 tbsp olive oil', 'Salt and pepper to taste', '1 tsp lemon juice'],
    ARRAY['Toast the bread slices until golden brown', 'Mash the avocado with lemon juice, salt, and pepper', 'Heat olive oil in a pan and cook eggs to your preference', 'Spread avocado mixture on toast', 'Top with cooked eggs', 'Season with additional salt and pepper if desired'],
    10,
    5,
    '{"calories": 420, "protein": 18, "carbs": 32, "fat": 24}'::jsonb,
    'custom'
),
(
    'Quinoa Buddha Bowl',
    'A colorful and nutritious bowl packed with plant-based protein and vegetables',
    ARRAY['1 cup cooked quinoa', '1/2 cup chickpeas', '1 cup mixed vegetables (broccoli, carrots, bell peppers)', '2 tbsp tahini', '1 tbsp olive oil', '1 tsp lemon juice', 'Salt and pepper to taste'],
    ARRAY['Cook quinoa according to package instructions', 'Roast vegetables with olive oil, salt, and pepper at 400°F for 20 minutes', 'Heat chickpeas in a pan with a little oil', 'Mix tahini with lemon juice and a little water to make dressing', 'Assemble bowl with quinoa as base', 'Top with roasted vegetables and chickpeas', 'Drizzle with tahini dressing'],
    15,
    25,
    '{"calories": 520, "protein": 22, "carbs": 68, "fat": 16}'::jsonb,
    'custom'
),
(
    'Grilled Salmon with Vegetables',
    'A lean protein-rich dinner with omega-3 fatty acids and fiber-rich vegetables',
    ARRAY['6 oz salmon fillet', '2 cups mixed vegetables (asparagus, zucchini, cherry tomatoes)', '2 tbsp olive oil', '1 lemon', 'Fresh herbs (dill, parsley)', 'Salt and pepper to taste'],
    ARRAY['Preheat grill to medium-high heat', 'Season salmon with salt, pepper, and herbs', 'Toss vegetables with olive oil, salt, and pepper', 'Grill salmon for 4-5 minutes per side', 'Grill vegetables for 8-10 minutes, turning occasionally', 'Serve salmon with grilled vegetables', 'Squeeze fresh lemon juice over the dish'],
    10,
    15,
    '{"calories": 480, "protein": 35, "carbs": 28, "fat": 22}'::jsonb,
    'custom'
);
