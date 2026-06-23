-- ==========================================
-- RECIPE VAULT - DATABASE SCHEMA SETUP SCRIPT
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Enable UUID generation extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    preparation_time INTEGER NOT NULL DEFAULT 0,
    cooking_time INTEGER NOT NULL DEFAULT 0,
    servings INTEGER NOT NULL DEFAULT 1,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    cuisine TEXT NOT NULL,
    image_url TEXT,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- Safety checks
    CONSTRAINT servings_positive CHECK (servings > 0),
    CONSTRAINT prep_time_nonnegative CHECK (preparation_time >= 0),
    CONSTRAINT cook_time_nonnegative CHECK (cooking_time >= 0),
    CONSTRAINT check_difficulty CHECK (difficulty IN ('Easy', 'Medium', 'Hard'))
);

-- 2. Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create collection_recipes join table
CREATE TABLE IF NOT EXISTS public.collection_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- Ensure no duplicate mappings
    CONSTRAINT unique_collection_recipe UNIQUE (collection_id, recipe_id)
);

-- 4. Create indexes for high-speed queries
CREATE INDEX IF NOT EXISTS idx_recipes_name ON public.recipes (name);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes (category);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON public.recipes (difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON public.recipes (cuisine);
CREATE INDEX IF NOT EXISTS idx_collection_recipes_ids ON public.collection_recipes (collection_id, recipe_id);

-- 5. Trigger function to auto-update 'updated_at' column on recipe edit
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to recipes
DROP TRIGGER IF EXISTS set_recipes_updated_at ON public.recipes;
CREATE TRIGGER set_recipes_updated_at
    BEFORE UPDATE ON public.recipes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enabling full CRUD access for anonymous users as this
-- is a public-use portfolio app without login requirements.
-- =======================================================

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_recipes ENABLE ROW LEVEL SECURITY;

-- Recipes Policies
CREATE POLICY "Allow public select on recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on recipes" ON public.recipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on recipes" ON public.recipes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on recipes" ON public.recipes FOR DELETE USING (true);

-- Collections Policies
CREATE POLICY "Allow public select on collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Allow public insert on collections" ON public.collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on collections" ON public.collections FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on collections" ON public.collections FOR DELETE USING (true);

-- Collection-Recipes Relations Policies
CREATE POLICY "Allow public select on relations" ON public.collection_recipes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on relations" ON public.collection_recipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on relations" ON public.collection_recipes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on relations" ON public.collection_recipes FOR DELETE USING (true);

-- =======================================================
-- PRE-SEED DEFAULT COLLECTIONS
-- Populate the db with some core collections automatically
-- =======================================================
INSERT INTO public.collections (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Healthy Recipes', 'Nutritious, wholesome, and delicious meals optimized for your health and vitality.'),
  ('22222222-2222-2222-2222-222222222222', 'Quick Recipes', 'Delectable meals ready in under 30 minutes for busy weekdays.'),
  ('33333333-3333-3333-3333-333333333333', 'Chef Picks', 'Hand-picked culinary masterpieces crafted by our professional test kitchen experts.'),
  ('44444444-4444-4444-4444-444444444444', 'Trending Recipes', 'The absolute favorites being shared, printed, and cooked around the world right now.')
ON CONFLICT (id) DO NOTHING;
