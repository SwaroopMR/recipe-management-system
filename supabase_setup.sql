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

-- PRE-SEED PREDEFINED RECIPES
INSERT INTO public.recipes (id, name, description, ingredients, instructions, preparation_time, cooking_time, servings, category, difficulty, cuisine, image_url, tags) VALUES
  ('f1b1b111-1111-1111-1111-111111111111', 'Fluffy Blueberry Buttermilk Pancakes', 'Golden, thick, and fluffy buttermilk pancakes bursting with fresh blueberries, served with warm maple syrup.', 
   '["2 cups all-purpose flour", "2 tsp baking powder", "1 tsp baking soda", "1/2 tsp salt", "2 tbsp sugar", "2 eggs", "2 cups buttermilk", "4 tbsp melted butter", "1 cup fresh blueberries", "Maple syrup for serving"]'::jsonb, 
   '["In a large bowl, whisk together flour, baking powder, baking soda, salt, and sugar.", "In a separate bowl, beat the eggs, then whisk in the buttermilk and melted butter.", "Pour the wet ingredients into the dry ingredients and stir gently until just combined (some lumps are okay).", "Heat a lightly greased griddle or frying pan over medium-high heat.", "Pour 1/4 cup of batter for each pancake, and sprinkle a few blueberries on top.", "Cook until bubbles form on the surface, then flip and cook until golden brown on the other side.", "Serve hot with maple syrup and extra blueberries."]'::jsonb, 
   10, 15, 4, 'Breakfast', 'Easy', 'American', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80', '["pancakes", "breakfast", "sweet", "blueberries"]'::jsonb),
  
  ('f2b2b222-2222-2222-2222-222222222222', 'Avocado Toast with Poached Egg', 'Artisanal sourdough toast topped with creamy mashed avocado, perfectly poached eggs, and a sprinkle of chili flakes.', 
   '["2 slices artisanal sourdough bread", "1 ripe Hass avocado", "1 tbsp fresh lemon juice", "2 fresh eggs", "1 tsp white vinegar", "Salt and black pepper to taste", "1/2 tsp red chili flakes", "Microgreens for garnish"]'::jsonb, 
   '["Toast the sourdough bread slices until golden and crisp.", "In a small bowl, mash the avocado with lemon juice, salt, and pepper.", "Bring a pot of water to a gentle simmer and add vinegar. Swirl the water to create a vortex, and crack an egg into the center. Poach for 3 minutes, then remove with a slotted spoon.", "Spread the mashed avocado evenly over the toasted bread.", "Place one poached egg on top of each slice.", "Season with chili flakes, cracked black pepper, and garnish with microgreens."]'::jsonb, 
   5, 5, 2, 'Breakfast', 'Easy', 'International', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', '["avocado", "toast", "egg", "healthy"]'::jsonb),
  
  ('f3b3b333-3333-3333-3333-333333333333', 'Mediterranean Chickpea Salad', 'A vibrant and refreshing salad packed with chickpeas, crisp cucumbers, juicy cherry tomatoes, kalamata olives, and feta cheese, tossed in a zesty lemon-herb vinaigrette.', 
   '["2 cans (15 oz each) chickpeas, drained and rinsed", "1 English cucumber, diced", "1 pint cherry tomatoes, halved", "1/2 red onion, finely chopped", "1/2 cup Kalamata olives, pitted and halved", "1/2 cup crumbled feta cheese", "1/4 cup extra virgin olive oil", "2 tbsp fresh lemon juice", "1 tsp dried oregano", "Salt and pepper to taste"]'::jsonb, 
   '["In a large bowl, combine the chickpeas, cucumber, cherry tomatoes, red onion, Kalamata olives, and feta cheese.", "In a small jar, whisk together the olive oil, lemon juice, dried oregano, salt, and pepper to make the dressing.", "Pour the dressing over the salad and toss well to combine.", "Let the salad sit in the refrigerator for at least 15 minutes before serving to let the flavors meld."]'::jsonb, 
   15, 0, 4, 'Lunch', 'Easy', 'Mediterranean', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', '["salad", "chickpeas", "fresh", "gluten-free"]'::jsonb),
  
  ('f4b4b444-4444-4444-4444-444444444444', 'Caprese Chicken Panini', 'Grilled chicken breast, fresh mozzarella, ripe tomatoes, and sweet basil pesto pressed between crispy focaccia bread.', 
   '["2 panini buns or focaccia bread", "2 grilled chicken breasts, sliced", "1 ripe tomato, sliced", "4 slices fresh mozzarella cheese", "2 tbsp basil pesto", "1 tbsp balsamic glaze", "1 tbsp olive oil"]'::jsonb, 
   '["Slice the bread or panini buns in half.", "Spread 1 tablespoon of basil pesto on the bottom slice of each sandwich.", "Layer the sliced grilled chicken, fresh mozzarella cheese, and tomato slices.", "Drizzle the balsamic glaze over the tomatoes and cover with the top bread slice.", "Brush the outside of the sandwiches lightly with olive oil.", "Place in a panini press and cook for 5-8 minutes until the cheese is melted and the bread is toasted."]'::jsonb, 
   10, 10, 2, 'Lunch', 'Easy', 'Italian', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80', '["sandwich", "panini", "chicken", "caprese", "pesto"]'::jsonb),
  
  ('f5b5b555-5555-5555-5555-555555555555', 'Pan-Seared Salmon with Asparagus', 'Crispy skin salmon fillet seasoned with garlic herb butter, paired with fresh lemon-infused grilled asparagus.', 
   '["2 fresh salmon fillets (6 oz each)", "1 bunch fresh asparagus, ends trimmed", "2 tbsp butter", "2 cloves garlic, minced", "1 tbsp fresh dill, chopped", "1 lemon, sliced", "2 tbsp olive oil", "Salt and freshly cracked black pepper"]'::jsonb, 
   '["Pat salmon fillets dry with paper towels. Season both sides with salt and pepper.", "Heat 1 tablespoon of olive oil in a large skillet over medium-high heat. Place salmon skin-side down and sear for 4-5 minutes until skin is crispy. Flip and cook for another 3-4 minutes.", "In a separate pan, heat the remaining olive oil and cook the asparagus for 5-7 minutes until tender-crisp. Season with salt, pepper, and lemon juice.", "During the last 2 minutes of cooking the salmon, add butter, minced garlic, and fresh dill to the skillet. Spoon the melted garlic dill butter over the salmon fillets.", "Serve the salmon hot with grilled asparagus and lemon slices."]'::jsonb, 
   10, 15, 2, 'Dinner', 'Medium', 'International', 'https://images.unsplash.com/photo-1485921325814-a50431496cc9?auto=format&fit=crop&w=800&q=80', '["salmon", "fish", "dinner", "keto", "low-carb"]'::jsonb),
  
  ('f6b6b666-6666-6666-6666-666666666666', 'Classic Beef Stroganoff', 'Tender strips of beef and sliced mushrooms sautéed in a rich, creamy sour cream sauce, served over hot egg noodles.', 
   '["1 lb beef sirloin, cut into thin strips", "8 oz cremini mushrooms, sliced", "1 medium onion, chopped", "2 cloves garlic, minced", "2 tbsp butter", "1 tbsp all-purpose flour", "1 cup beef broth", "1/2 cup sour cream", "1 tbsp Worcestershire sauce", "12 oz egg noodles", "Fresh parsley for garnish"]'::jsonb, 
   '["Cook the egg noodles according to package instructions. Drain and toss with a little butter to prevent sticking.", "In a large skillet over high heat, melt 1 tablespoon of butter and sear the beef strips for 1-2 minutes per side. Remove beef from the pan and set aside.", "Reduce heat to medium. Add the remaining butter, onion, mushrooms, and garlic. Sauté for 5-7 minutes until tender.", "Sprinkle flour over the vegetables and stir to combine. Cook for 1 minute.", "Slowly pour in the beef broth and Worcestershire sauce, scraping any browned bits from the bottom of the pan. Simmer for 5 minutes until thickened.", "Stir in the sour cream and return the beef (with its juices) to the skillet. Cook for another 2-3 minutes until heated through (do not boil).", "Serve the creamy beef and mushroom mixture over the egg noodles and garnish with chopped parsley."]'::jsonb, 
   15, 20, 4, 'Dinner', 'Medium', 'Traditional', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', '["beef", "dinner", "mushrooms", "comfort-food"]'::jsonb),
  
  ('f7b7b777-7777-7777-7777-777777777777', 'Decadent Chocolate Lava Cake', 'Rich chocolate cakes with a luscious, warm molten chocolate center, dusted with powdered sugar.', 
   '["1/2 cup high-quality semi-sweet chocolate chips", "1/4 cup unsalted butter", "1 large egg", "1 egg yolk", "2 tbsp granulated sugar", "1 tbsp all-purpose flour", "1 pinch salt", "Powdered sugar and fresh raspberries for serving"]'::jsonb, 
   '["Preheat oven to 425°F (218°C). Grease two ramekins and dust them with cocoa powder.", "In a microwave-safe bowl, melt the chocolate chips and butter together in 30-second bursts, stirring until smooth.", "In a separate bowl, whisk the egg, egg yolk, sugar, and salt together until pale and thick.", "Fold the melted chocolate mixture and flour into the egg mixture until just combined.", "Divide the batter evenly between the prepared ramekins.", "Bake for 12-14 minutes until the edges are firm but the center is still soft.", "Let cool for 1 minute, then carefully invert onto dessert plates. Dust with powdered sugar and serve hot with fresh raspberries."]'::jsonb, 
   15, 13, 2, 'Dessert', 'Hard', 'International', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', '["chocolate", "cake", "dessert", "lava", "sweet"]'::jsonb),
  
  ('f8b8b888-8888-8888-8888-888888888888', 'Classic New York Cheesecake', 'Rich, dense, and creamy cheesecake with a buttery graham cracker crust, topped with sweet strawberry compote.', 
   '["1.5 cups graham cracker crumbs", "1/4 cup melted butter", "24 oz cream cheese, softened", "1 cup granulated sugar", "1 tsp vanilla extract", "3 large eggs", "1/2 cup sour cream", "1 cup strawberry compote for topping"]'::jsonb, 
   '["Preheat oven to 325°F (163°C). Mix graham cracker crumbs and melted butter, then press into the bottom of a 9-inch springform pan. Bake for 8 minutes and let cool.", "In a large bowl, beat the softened cream cheese and sugar until perfectly smooth.", "Add vanilla extract and then add eggs one at a time, mixing on low speed until just incorporated.", "Stir in the sour cream gently.", "Pour the filling over the cooled crust.", "Bake for 55-60 minutes until the edges are set but the center still jiggles slightly. Turn off the oven, crack the door, and let the cheesecake cool inside the oven for 1 hour.", "Chill in the refrigerator for at least 4 hours. Top with strawberry compote before slicing."]'::jsonb, 
   25, 60, 8, 'Dessert', 'Hard', 'Traditional', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80', '["cheesecake", "dessert", "strawberry", "sweet"]'::jsonb),
  
  ('f9b9b999-9999-9999-9999-999999999999', 'Garlic Parmesan Roasted Chickpeas', 'Crunchy, oven-roasted chickpeas tossed in olive oil, garlic powder, and fresh parmesan cheese.', 
   '["2 cans (15 oz each) chickpeas, drained and rinsed", "2 tbsp olive oil", "1 tsp garlic powder", "1/2 tsp onion powder", "1/4 cup grated parmesan cheese", "Salt and pepper to taste"]'::jsonb, 
   '["Preheat oven to 400°F (204°C). Pat the chickpeas completely dry with paper towels (moisture prevents crunchiness).", "In a medium bowl, toss the chickpeas with olive oil, garlic powder, onion powder, salt, and pepper.", "Spread the chickpeas in a single layer on a parchment-lined baking sheet.", "Roast for 20-25 minutes, tossing halfway through, until crispy.", "Remove from oven, immediately toss with grated parmesan cheese, and let cool slightly before eating."]'::jsonb, 
   5, 25, 4, 'Snacks', 'Easy', 'American', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80', '["snack", "chickpeas", "crunchy", "savory"]'::jsonb),
  
  ('fa1a1111-1111-1111-1111-111111111111', 'Crispy Sweet Potato Fries', 'Oven-baked sweet potato wedges seasoned with paprika and sea salt, served crispy on the outside.', 
   '["2 large sweet potatoes, cut into thin wedges", "2 tbsp cornstarch", "2 tbsp olive oil", "1 tsp smoked paprika", "1/2 tsp garlic powder", "1/2 tsp sea salt"]'::jsonb, 
   '["Soak the cut sweet potatoes in cold water for 30 minutes to release starch. Drain and pat dry.", "Preheat oven to 425°F (218°C) and grease a baking sheet.", "Toss the sweet potato wedges with cornstarch in a large zip-top bag to coat them lightly.", "Drizzle with olive oil, smoked paprika, and garlic powder, and toss well.", "Spread the wedges in a single layer on the baking sheet, ensuring they do not touch.", "Bake for 20 minutes, flipping halfway through, until crispy. Sprinkle with sea salt immediately after baking."]'::jsonb, 
   15, 20, 3, 'Snacks', 'Easy', 'American', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80', '["fries", "snack", "sweet-potato", "crispy"]'::jsonb),
  
  ('fb2b2222-2222-2222-2222-222222222222', 'Iced Matcha Green Tea Latte', 'Wholesome and refreshing iced green tea latte made with ceremonial grade matcha powder, oat milk, and honey.', 
   '["1.5 tsp ceremonial grade matcha powder", "2 tbsp warm water (not boiling)", "1 cup oat milk", "1 tbsp honey or maple syrup", "1 cup ice cubes"]'::jsonb, 
   '["Sift the matcha powder into a small bowl to remove lumps.", "Add the warm water and whisk vigorously using a bamboo whisk (or small wire whisk) in a W-motion until frothy and smooth.", "Drizzle honey or maple syrup into the matcha mixture and stir.", "Fill a tall glass with ice cubes and pour in the oat milk.", "Slowly pour the whisked matcha over the oat milk to create a beautiful layered effect. Stir before drinking."]'::jsonb, 
   5, 0, 1, 'Beverages', 'Easy', 'Japanese', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80', '["matcha", "latte", "beverage", "iced", "healthy"]'::jsonb),
  
  ('fc3c3333-3333-3333-3333-333333333333', 'Fresh Mint Mojito Mocktail', 'A refreshing, non-alcoholic Cuban classic loaded with fresh mint, lime juice, and sparkling soda water.', 
   '["10 fresh mint leaves", "1/2 lime, cut into wedges", "2 tbsp simple syrup", "1 cup club soda", "Crushed ice"]'::jsonb, 
   '["In a sturdy glass, combine the mint leaves and lime wedges.", "Muddle them gently to release the lime juice and aromatic oils from the mint (don''t shred the leaves).", "Add simple syrup to taste.", "Fill the glass with crushed ice.", "Top off with club soda or sparkling water, stir gently, and garnish with a mint sprig and lime round."]'::jsonb, 
   5, 0, 1, 'Beverages', 'Easy', 'Cuban', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', '["mojito", "mocktail", "beverage", "mint", "lime"]'::jsonb),
  
  ('fd4d4444-4444-4444-4444-444444444444', 'Creamy Spinach Ricotta Stuffed Shells', 'Jumbo pasta shells stuffed with a savory mixture of spinach, ricotta, mozzarella, and parmesan cheese, baked in marinara sauce.', 
   '["12 jumbo pasta shells", "10 oz fresh spinach, wilted and squeezed dry", "15 oz ricotta cheese", "1.5 cups shredded mozzarella cheese, divided", "1/2 cup grated parmesan cheese, divided", "1 egg", "2 cups marinara sauce", "1 tsp Italian seasoning", "Salt and pepper to taste"]'::jsonb, 
   '["Preheat oven to 375°F (190°C). Cook the jumbo shells in boiling salted water for 9 minutes. Drain and cool.", "In a medium bowl, mix together the wilted spinach, ricotta, 1 cup of mozzarella, 1/4 cup of parmesan, egg, Italian seasoning, salt, and pepper.", "Spread 1 cup of marinara sauce on the bottom of a 9x13 baking dish.", "Spoon the spinach cheese mixture into each pasta shell, placing them stuffed-side up in the baking dish.", "Pour the remaining marinara sauce over the shells and sprinkle with the remaining mozzarella and parmesan cheese.", "Cover with foil and bake for 25 minutes. Uncover and bake for an additional 5 minutes until the cheese is bubbly and golden."]'::jsonb, 
   20, 30, 4, 'Vegetarian', 'Medium', 'Italian', 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80', '["vegetarian", "pasta", "spinach", "cheese", "italian"]'::jsonb),
  
  ('fe5e5555-5555-5555-5555-555555555555', 'Thai Green Curry with Tofu', 'A spicy and aromatic Thai coconut curry loaded with crispy baked tofu, bamboo shoots, bell peppers, and fresh basil.', 
   '["1 block extra firm tofu, pressed and cubed", "1 tbsp soy sauce", "1 can (13.5 oz) coconut milk", "2 tbsp Thai green curry paste", "1 bell pepper, sliced", "1/2 cup bamboo shoots, drained", "1 cup fresh snap peas", "1 tbsp maple syrup", "1 tbsp lime juice", "Fresh Thai basil leaves"]'::jsonb, 
   '["Preheat oven to 400°F (204°C). Toss tofu cubes with soy sauce, place on a baking sheet, and bake for 20 minutes until crispy.", "In a large pot, heat 2 tablespoons of coconut milk over medium heat. Add the green curry paste and sauté for 1-2 minutes until fragrant.", "Gradually pour in the remaining coconut milk and stir until the paste is completely dissolved.", "Add the bell pepper, bamboo shoots, and snap peas. Simmer for 5-7 minutes until the vegetables are tender.", "Stir in the baked tofu, maple syrup, and lime juice. Cook for 2 more minutes to heat the tofu through.", "Turn off heat, stir in a handful of fresh Thai basil leaves, and serve hot over jasmine rice."]'::jsonb, 
   15, 15, 3, 'Vegan', 'Medium', 'Thai', 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80', '["vegan", "curry", "tofu", "thai", "spicy"]'::jsonb),
  
  ('ff6f6666-6666-6666-6666-666666666666', 'Lemon Herb Grilled Chicken Breast', 'Tender, juicy grilled chicken breasts marinated in olive oil, garlic, lemon zest, rosemary, and thyme.', 
   '["2 boneless, skinless chicken breasts", "3 tbsp olive oil", "2 cloves garlic, minced", "Zest and juice of 1 lemon", "1 tbsp fresh rosemary, chopped", "1 tbsp fresh thyme, chopped", "Salt and pepper to taste"]'::jsonb, 
   '["Place chicken breasts between plastic wrap and gently pound them to an even thickness of about 1/2 inch.", "In a shallow dish, whisk together the olive oil, minced garlic, lemon zest, lemon juice, rosemary, thyme, salt, and pepper to make the marinade.", "Add the chicken, coating it well. Marinate in the refrigerator for at least 30 minutes.", "Preheat a grill or grill pan to medium-high heat. Brush with a little oil.", "Grill the chicken for 5-6 minutes per side, or until the internal temperature reaches 165°F (74°C).", "Let the chicken rest for 5 minutes before slicing to retain the juices."]'::jsonb, 
   10, 12, 2, 'Healthy', 'Easy', 'American', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80', '["healthy", "chicken", "grilled", "high-protein", "low-carb"]'::jsonb),
  
  ('fa2a2222-2222-2222-2222-222222222222', '15-Minute Garlic Butter Shrimp', 'Juicy, plump shrimp sautéed in a rich garlic butter sauce, finished with fresh lemon juice and chopped parsley.', 
   '["1 lb large shrimp, peeled and deveined", "4 tbsp butter", "4 cloves garlic, minced", "1 tbsp olive oil", "Juice of 1/2 lemon", "2 tbsp fresh parsley, chopped", "Salt and red pepper flakes to taste"]'::jsonb, 
   '["Pat the shrimp dry with paper towels and season with salt.", "In a large skillet, heat the olive oil and 2 tablespoons of butter over medium-high heat.", "Add the shrimp in a single layer and sear for 2 minutes without moving, then flip.", "Add the minced garlic and red pepper flakes, cooking for 1 minute until fragrant.", "Add the remaining butter and lemon juice, stirring to coat the shrimp as the butter melts.", "Cook for 1-2 more minutes until the shrimp are pink and cooked through.", "Garnish with fresh parsley and serve hot with crusty bread."]'::jsonb, 
   5, 10, 2, 'Quick Meals', 'Easy', 'International', 'https://images.unsplash.com/photo-1559742811-82428b49223e?auto=format&fit=crop&w=800&q=80', '["quick", "shrimp", "seafood", "garlic-butter", "15-minute"]'::jsonb),
  
  ('fa3a3333-3333-3333-3333-333333333333', 'Authentic Italian Spaghetti Carbonara', 'Classic Roman pasta dish made with eggs, hard cheese, cured pork, and freshly cracked black pepper.', 
   '["12 oz spaghetti", "4 oz guanciale or pancetta, diced", "3 large eggs", "1 cup Pecorino Romano cheese, grated", "Salt and lots of freshly cracked black pepper"]'::jsonb, 
   '["Bring a large pot of salted water to a boil and cook spaghetti until al dente.", "While pasta cooks, heat a large skillet over medium heat and cook the diced guanciale until crispy. Remove skillet from heat.", "In a bowl, whisk together the eggs and Pecorino Romano cheese until thick. Add plenty of black pepper.", "Drain the pasta, reserving 1 cup of pasta water.", "Add the hot pasta directly to the skillet with the guanciale, and toss to coat in the rendered fat. Let cool for 30 seconds.", "Pour the egg-cheese mixture over the pasta, tossing rapidly to create a creamy sauce. Add splashes of warm pasta water if the sauce is too thick (do not cook over heat, or the eggs will scramble).", "Serve immediately with extra cheese and black pepper."]'::jsonb, 
   10, 15, 3, 'Traditional', 'Medium', 'Italian', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80', '["carbonara", "pasta", "traditional", "italian", "classic"]'::jsonb),
  
  ('fa4a4444-4444-4444-4444-444444444444', 'Indian Butter Chicken (Murgh Makhani)', 'Tender tandoori-spiced chicken pieces simmered in a silky, spiced, buttery tomato cream sauce.', 
   '["1.5 lbs chicken thighs, cut into bite-sized pieces", "1 cup plain yogurt", "2 tbsp lemon juice", "2 tbsp garam masala, divided", "1 tbsp turmeric", "3 tbsp butter", "1 large onion, finely chopped", "1 tbsp ginger-garlic paste", "1 can (14 oz) tomato puree", "1 cup heavy cream", "Fresh cilantro for garnish"]'::jsonb, 
   '["In a large bowl, combine yogurt, lemon juice, 1 tablespoon garam masala, turmeric, salt, and chicken. Marinate for at least 1 hour.", "Heat 1 tablespoon of butter in a large skillet over medium-high heat. Sear the chicken pieces until browned (about 3-4 minutes per side). Remove chicken from skillet and set aside.", "Melt the remaining butter in the same skillet. Sauté the chopped onion for 5 minutes until soft. Stir in the ginger-garlic paste and cook for 1 minute.", "Add the tomato puree and the remaining garam masala, simmering for 10 minutes.", "Pour in the heavy cream and return the chicken to the pan, simmering for an additional 8-10 minutes until chicken is tender and sauce is rich.", "Garnish with fresh cilantro and serve with warm garlic naan or basmati rice."]'::jsonb, 
   20, 25, 4, 'International', 'Medium', 'Indian', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', '["butter-chicken", "curry", "indian", "international", "spicy"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- PRE-SEED COLLECTION RECIPES MAPPINGS
INSERT INTO public.collection_recipes (collection_id, recipe_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'f2b2b222-2222-2222-2222-222222222222'),
  ('11111111-1111-1111-1111-111111111111', 'f3b3b333-3333-3333-3333-333333333333'),
  ('11111111-1111-1111-1111-111111111111', 'f5b5b555-5555-5555-5555-555555555555'),
  ('11111111-1111-1111-1111-111111111111', 'ff6f6666-6666-6666-6666-666666666666'),
  ('22222222-2222-2222-2222-222222222222', 'fa2a2222-2222-2222-2222-222222222222'),
  ('22222222-2222-2222-2222-222222222222', 'fc3c3333-3333-3333-3333-333333333333'),
  ('22222222-2222-2222-2222-222222222222', 'f9b9b999-9999-9999-9999-999999999999'),
  ('33333333-3333-3333-3333-333333333333', 'fa3a3333-3333-3333-3333-333333333333'),
  ('33333333-3333-3333-3333-333333333333', 'fa4a4444-4444-4444-4444-444444444444'),
  ('33333333-3333-3333-3333-333333333333', 'f7b7b777-7777-7777-7777-777777777777'),
  ('44444444-4444-4444-4444-444444444444', 'fe5e5555-5555-5555-5555-555555555555'),
  ('44444444-4444-4444-4444-444444444444', 'f1b1b111-1111-1111-1111-111111111111')
ON CONFLICT (collection_id, recipe_id) DO NOTHING;

