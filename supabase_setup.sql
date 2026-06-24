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
  ('f1b1b111-1111-1111-1111-111111111111', 'South Indian Masala Dosa', 'Crispy fermented rice and lentil crepes stuffed with a spiced potato mash, served with coconut chutney and sambar.', 
   '["3 cups dosa batter (fermented rice and lentil)", "4 large potatoes, boiled and mashed", "1 medium onion, sliced", "2 green chilies, chopped", "1 tsp mustard seeds", "1 tsp split black gram (urad dal)", "1/2 tsp turmeric powder", "10 curry leaves", "2 tbsp oil", "Salt to taste"]'::jsonb, 
   '["In a pan, heat oil and add mustard seeds and urad dal. Sauté until golden.", "Add green chilies, onions, and curry leaves. Sauté until onions are translucent.", "Add turmeric, salt, and mashed potatoes. Mix well, cook for 5 minutes, and set potato stuffing aside.", "Heat a non-stick griddle (tawa) and ladle dosa batter in the center. Spread in a circular motion to make it thin and crispy.", "Drizzle a teaspoon of oil or ghee around the edges.", "Once the bottom turns golden-brown, place a portion of the potato stuffing in the center.", "Fold the dosa and serve hot with coconut chutney and sambar."]'::jsonb, 
   10, 15, 4, 'Breakfast', 'Medium', 'South Indian', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80', '["dosa", "breakfast", "south-indian", "crispy"]'::jsonb),
  
  ('f2b2b222-2222-2222-2222-222222222222', 'Punjabi Aloo Paratha', 'Traditional North Indian whole wheat flatbread stuffed with a spiced mashed potato mixture, griddled with ghee.', 
   '["2 cups whole wheat flour (atta)", "3 large potatoes, boiled and mashed", "1 green chili, finely chopped", "1/2 tsp red chili powder", "1/2 tsp garam masala", "1/2 tsp dry mango powder (amchur)", "2 tbsp fresh coriander, chopped", "Water for kneading", "Ghee or butter for roasting", "Salt to taste"]'::jsonb, 
   '["Knead whole wheat flour with water and a pinch of salt into a soft dough. Let it rest for 15 minutes.", "Mix mashed potatoes with green chili, red chili powder, garam masala, amchur, fresh coriander, and salt.", "Divide dough and potato stuffing into equal-sized balls.", "Roll a dough ball into a small circle, place a potato ball in the center, and fold the edges to seal completely.", "Gently roll the stuffed dough ball into a flatbread, using dry flour to prevent sticking.", "Place on a hot griddle and cook both sides. Apply ghee or butter and roast until golden-brown spots appear.", "Serve hot with yogurt, pickle, or a dollop of white butter."]'::jsonb, 
   15, 15, 3, 'Breakfast', 'Medium', 'North Indian', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80', '["paratha", "breakfast", "north-indian", "flatbread"]'::jsonb),
  
  ('f3b3b333-3333-3333-3333-333333333333', 'Paneer Butter Masala', 'Succulent cottage cheese cubes simmered in a rich, creamy, and mildly sweet onion-tomato gravy.', 
   '["250g paneer, cubed", "2 large tomatoes, pureed", "1 large onion, chopped", "1 tbsp ginger-garlic paste", "10 cashew nuts, soaked in warm water", "2 tbsp butter", "1 tbsp oil", "1/2 cup heavy cream", "1 tsp red chili powder", "1/2 tsp garam masala", "1 tsp dried fenugreek leaves (kasuri methi)", "Salt to taste"]'::jsonb, 
   '["Blend the chopped onions and soaked cashews into a smooth paste.", "Heat oil and 1 tablespoon of butter in a pan. Add ginger-garlic paste and sauté for a minute.", "Add onion-cashew paste and cook until golden brown.", "Add tomato puree, red chili powder, salt, and garam masala. Cook until oil starts separating from the gravy.", "Pour in 1/2 cup water, bring to a simmer, and stir in the paneer cubes.", "Simmer for 5 minutes. Stir in the heavy cream and crushed kasuri methi.", "Top with the remaining butter and serve hot with naan or roti."]'::jsonb, 
   15, 20, 3, 'Lunch', 'Medium', 'North Indian', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', '["paneer", "lunch", "creamy", "north-indian"]'::jsonb),
  
  ('f4b4b444-4444-4444-4444-444444444444', 'Amritsari Chole Bhature', 'A classic Punjabi lunch combination of spicy chickpea curry (chole) and deep-fried puffed bread (bhatura).', 
   '["1 cup chickpeas (kabuli chana), soaked overnight", "2 cups all-purpose flour (maida)", "1/4 cup yogurt", "1/2 tsp baking soda", "2 medium onions, pureed", "3 tomatoes, pureed", "1 tbsp ginger-garlic paste", "2 tbsp chole masala powder", "Oil for frying and cooking", "Salt to taste"]'::jsonb, 
   '["Boil the soaked chickpeas with salt and a tea bag (for dark color) until tender.", "Mix flour, yogurt, baking soda, 1 tablespoon oil, and salt. Knead into a soft dough and let rest for 2 hours.", "Heat 2 tablespoons of oil in a pot. Sauté ginger-garlic paste and onion puree until golden.", "Add tomato puree and cook until oil separates. Stir in chole masala and salt.", "Add boiled chickpeas with their cooking water. Simmer for 15-20 minutes until the gravy thickens.", "Roll dough into oval shapes and deep-fry in hot oil until they puff up and turn golden-brown.", "Serve the hot puffed bhature with the spicy chole, sliced onions, and lemon wedges."]'::jsonb, 
   20, 30, 3, 'Lunch', 'Hard', 'Punjabi', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80', '["chole", "bhature", "punjabi", "spicy"]'::jsonb),
  
  ('f5b5b555-5555-5555-5555-555555555555', 'Mughlai Vegetable Biryani', 'Fragrant basmati rice layered with spiced mixed vegetables, saffron, and caramelized onions, cooked on low heat (dum).', 
   '["2 cups Basmati rice, washed and soaked for 30 mins", "2 cups mixed vegetables (carrots, peas, beans, potatoes), chopped", "1 cup yogurt", "1 large onion, thinly sliced", "1 tbsp ginger-garlic paste", "1/2 tsp saffron strands, soaked in 2 tbsp warm milk", "1/4 cup fresh mint and coriander, chopped", "2 tbsp ghee", "Whole spices (bay leaf, cloves, cardamom, cinnamon)", "Salt to taste"]'::jsonb, 
   '["Boil Basmati rice with whole spices and salt until 70% cooked. Drain and set aside.", "In a pan, fry the sliced onions until dark golden and crispy (birista). Set aside.", "In a large pot, heat ghee. Add ginger-garlic paste and mixed vegetables. Sauté for 5 minutes.", "Stir in yogurt, biryani masala powder, and salt. Cook until vegetables are tender.", "Layer the partially cooked rice over the vegetable mixture.", "Sprinkle fried onions, chopped mint, coriander, and saffron milk on top.", "Cover the pot tightly with foil and a lid. Cook on very low heat (dum) for 15-20 minutes.", "Gently mix the layers and serve hot with raita."]'::jsonb, 
   20, 30, 4, 'Dinner', 'Hard', 'Mughlai', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', '["biryani", "rice", "dinner", "traditional"]'::jsonb),
  
  ('f6b6b666-6666-6666-6666-666666666666', 'Dal Makhani with Jeera Rice', 'Creamy, slow-cooked black lentils and kidney beans simmered overnight with spices, served with cumin-tempered basmati rice.', 
   '["3/4 cup whole black lentils (urad dal)", "1/4 cup red kidney beans (rajma)", "3 cloves garlic, minced", "1 tbsp ginger, grated", "1 cup tomato puree", "3 tbsp butter", "2 tbsp heavy cream", "1 tsp cumin seeds", "1 cup Basmati rice", "Salt and red chili powder to taste"]'::jsonb, 
   '["Cook the egg noodles or prepare basmati rice. Soak black lentils and kidney beans overnight. Cook in a pressure cooker with salt until soft.", "In a large pot, melt 2 tablespoons of butter. Add ginger, garlic, and tomato puree. Sauté for 5 minutes.", "Add the cooked lentils and beans. Mash some lentils with the back of a spoon to make it creamy.", "Simmer on low heat for 30 minutes, adding water as needed. Stir in red chili powder, remaining butter, and heavy cream.", "For the rice, cook Basmati rice. Heat oil in a pan, add cumin seeds until they splutter, and toss with the cooked rice.", "Serve the hot Dal Makhani garnished with cream alongside the Jeera Rice."]'::jsonb, 
   15, 45, 3, 'Dinner', 'Medium', 'North Indian', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', '["dal-makhani", "lentils", "rice", "creamy"]'::jsonb),
  
  ('f7b7b777-7777-7777-7777-777777777777', 'Festive Gulab Jamun', 'Soft, golden milk-solid dumplings fried and soaked in a warm, cardamom-infused sugar syrup.', 
   '["1 cup milk powder", "1/4 cup all-purpose flour", "1 tbsp ghee", "3 tbsp milk", "1/4 tsp baking powder", "1 cup sugar", "1 cup water", "3 green cardamoms, crushed", "1 tsp rose water", "Oil or ghee for deep frying"]'::jsonb, 
   '["In a pot, combine sugar, water, and crushed cardamoms. Simmer for 10 minutes to make a sticky syrup. Stir in rose water and keep warm.", "In a bowl, mix milk powder, flour, baking powder, and ghee. Add milk gradually to form a soft, smooth dough (do not over-knead).", "Shape dough into small, smooth balls without any cracks.", "Heat oil or ghee on low-medium heat. Fry the balls, stirring constantly, until they are deep golden-brown.", "Remove and immediately submerge the hot gulab jamuns in the warm sugar syrup.", "Let them soak for at least 1 hour until they double in size before serving."]'::jsonb, 
   15, 20, 6, 'Dessert', 'Hard', 'North Indian', 'https://images.unsplash.com/photo-1589135306090-e4733e8b0a7a?auto=format&fit=crop&w=800&q=80', '["sweet", "dessert", "traditional", "cardamom"]'::jsonb),
  
  ('f8b8b888-8888-8888-8888-888888888888', 'Traditional Gajar Ka Halwa', 'Grated red carrots slow-cooked with whole milk, ghee, sugar, and studded with roasted cashews and raisins.', 
   '["4 cups red carrots, grated", "2 cups whole milk", "1/2 cup sugar", "4 tbsp ghee", "1/4 cup mixed nuts (cashews, almonds, pistachios), sliced", "1/4 tsp green cardamom powder"]'::jsonb, 
   '["In a heavy-bottomed pan, add the grated carrots and milk. Cook on medium heat, stirring occasionally, until all the milk evaporates.", "Add ghee and sugar to the pan. Mix well and cook for another 15 minutes, stirring continuously as the halwa thickens.", "In a separate small pan, heat a teaspoon of ghee and lightly roast the mixed nuts until golden.", "Stir the roasted nuts and cardamom powder into the carrot mixture.", "Serve hot or warm, garnished with extra pistachios."]'::jsonb, 
   15, 35, 4, 'Dessert', 'Medium', 'North Indian', 'https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&w=800&q=80', '["dessert", "carrot", "sweet", "halwa"]'::jsonb),
  
  ('f9b9b999-9999-9999-9999-999999999999', 'Gujarati Khaman Dhokla', 'Tempered, steamed chickpea flour sponge cakes, soft and fluffy, seasoned with green chilies, mustard, and fresh coriander.', 
   '["1.5 cups chickpea flour (besan)", "1 tbsp semolina (rava)", "1 tsp ginger-chili paste", "1 tsp fruit salt (eno)", "1 tbsp lemon juice", "1 tsp mustard seeds", "10 curry leaves", "2 green chilies, slit", "1 tbsp oil", "Salt and a pinch of turmeric"]'::jsonb, 
   '["In a bowl, whisk besan, rava, ginger-chili paste, turmeric, lemon juice, salt, and 1 cup of water into a smooth batter.", "Grease a steamer pan. Add fruit salt to the batter, stir quickly as it froths, and immediately pour into the pan.", "Steam for 15 minutes until a toothpick inserted comes out clean. Let cool and cut into squares.", "For tempering, heat oil in a pan. Add mustard seeds, curry leaves, and slit green chilies. Sauté for a minute.", "Add 1/4 cup water and a teaspoon of sugar to the tempering, bring to a boil, and pour evenly over the dhokla.", "Garnish with fresh coriander and grated coconut."]'::jsonb, 
   10, 15, 4, 'Snacks', 'Medium', 'Gujarati', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80', '["dhokla", "snack", "steamed", "gujarati", "vegan"]'::jsonb),
  
  ('fa1a1111-1111-1111-1111-111111111111', 'Mumbai Vada Pav', 'The ultimate Indian street food snack: a spiced deep-fried potato dumpling stuffed inside a soft bread roll with spicy chutneys.', 
   '["4 soft dinner rolls (pav)", "3 potatoes, boiled and mashed", "1 cup chickpea flour (besan)", "2 green chilies, minced", "3 cloves garlic, minced", "1/2 tsp mustard seeds", "1/4 tsp turmeric powder", "Oil for deep frying", "Spicy garlic dry chutney"]'::jsonb, 
   '["Heat 1 tsp oil, sauté mustard seeds, minced garlic, green chilies, and turmeric. Add to mashed potatoes with salt and mix.", "Shape potato mixture into round balls.", "Whisk besan with water, salt, and a pinch of turmeric into a thick batter.", "Dip potato balls in the batter to coat them, and deep-fry in hot oil until golden-brown. Drain on paper towels.", "Slice the pav rolls in half, spread green coriander chutney and sweet tamarind chutney inside.", "Place the hot fried potato vada inside and serve with fried salted green chilies."]'::jsonb, 
   15, 15, 4, 'Snacks', 'Medium', 'Maharashtrian', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80', '["vada-pav", "street-food", "snack", "vegan"]'::jsonb),
  
  ('fb2b2222-2222-2222-2222-222222222222', 'Creamy Mango Lassi', 'A rich and refreshing sweet drink blending ripe sweet mangoes with thick yogurt, flavored with cardamom.', 
   '["2 cups ripe mango pulp (alphonso preferred)", "2 cups thick yogurt (curd)", "1/2 cup cold milk", "4 tbsp sugar or honey", "1/4 tsp green cardamom powder", "Ice cubes"]'::jsonb, 
   '["In a blender, add the ripe mango pulp, yogurt, cold milk, and sugar.", "Blend until perfectly smooth and creamy.", "Add cardamom powder and ice cubes, and blend again for 10 seconds.", "Pour into tall glasses and garnish with chopped pistachios or saffron strands."]'::jsonb, 
   5, 0, 2, 'Beverages', 'Easy', 'North Indian', 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80', '["mango", "lassi", "beverage", "sweet", "yogurt"]'::jsonb),
  
  ('fc3c3333-3333-3333-3333-333333333333', 'Authentic Masala Chai', 'Traditional Indian spiced tea brewed with milk, black tea leaves, fresh ginger, and whole spices.', 
   '["2 cups water", "1 cup milk", "2 tbsp black tea leaves", "1 inch fresh ginger, crushed", "3 green cardamoms, crushed", "1 small cinnamon stick", "2 cloves", "2 tsp sugar"]'::jsonb, 
   '["In a saucepan, bring the water to a boil.", "Add the crushed ginger, cardamoms, cinnamon, and cloves. Simmer for 3 minutes to infuse the spices.", "Add black tea leaves and simmer for another 2 minutes.", "Pour in the milk and sugar, and bring the tea to a rolling boil.", "Lower the heat and let it simmer for 2 minutes until it turns a deep caramel color.", "Strain through a tea strainer into cups and serve hot."]'::jsonb, 
   5, 10, 2, 'Beverages', 'Easy', 'Indian Traditional', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80', '["chai", "tea", "spiced", "beverage", "hot"]'::jsonb),
  
  ('fd4d4444-4444-4444-4444-444444444444', 'Classic Palak Paneer', 'Creamy cottage cheese cubes served in a vibrant, spiced, and velvety pureed spinach gravy.', 
   '["200g paneer, cubed", "1 large bunch fresh spinach (palak), cleaned", "1 onion, finely chopped", "1 tomato, chopped", "1 tsp ginger-garlic paste", "2 green chilies", "2 tbsp butter or oil", "2 tbsp fresh cream", "1/2 tsp garam masala", "Salt to taste"]'::jsonb, 
   '["Blanch spinach leaves and green chilies in boiling water for 2 minutes. Immediately transfer to cold water, then puree in a blender.", "Heat oil or butter in a pan, sauté the chopped onions until soft.", "Add ginger-garlic paste and tomatoes, cooking until the mixture becomes mushy.", "Add the spinach puree and salt, bringing it to a gentle simmer (do not boil too long to retain the green color).", "Add the paneer cubes and garam masala, simmer for 3 minutes.", "Stir in the fresh cream and serve hot with garlic naan or roti."]'::jsonb, 
   10, 15, 3, 'Vegetarian', 'Easy', 'North Indian', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80', '["spinach", "paneer", "healthy", "vegetarian"]'::jsonb),
  
  ('fe5e5555-5555-5555-5555-555555555555', 'Punjabi Chana Masala', 'Tangy and spicy chickpea curry slow-cooked with a bold spice blend in a savory tomato-onion sauce.', 
   '["1.5 cups chickpeas, soaked overnight", "1 large onion, finely chopped", "2 tomatoes, pureed", "1 tbsp ginger-garlic paste", "2 green chilies, slit", "1 tsp cumin seeds", "1 tbsp chana masala powder", "1/2 tsp turmeric powder", "2 tbsp oil", "Salt to taste"]'::jsonb, 
   '["Pressure cook the soaked chickpeas with salt until tender.", "Heat oil in a pot, add cumin seeds until they splutter.", "Sauté chopped onions and ginger-garlic paste until golden brown.", "Add tomato puree, green chilies, turmeric, chana masala, and salt. Sauté until oil separates.", "Add the cooked chickpeas along with their cooking water.", "Simmer on medium heat for 15 minutes, mashing a few chickpeas to thicken the gravy.", "Garnish with fresh chopped coriander and lemon juice."]'::jsonb, 
   10, 20, 4, 'Vegan', 'Easy', 'Punjabi', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', '["chana", "vegan", "curry", "spicy", "chickpeas"]'::jsonb),
  
  ('ff6f6666-6666-6666-6666-666666666666', 'Comforting Moong Dal Khichdi', 'A comforting, nutritious, and easily digestible single-pot meal of yellow lentils and rice tempered with cumin and turmeric.', 
   '["1/2 cup yellow split moong dal", "1/2 cup Basmati rice", "1 tbsp ghee or oil", "1 tsp cumin seeds", "1/2 tsp turmeric powder", "1 pinch asafoetida (hing)", "1 tsp ginger, grated", "Salt to taste"]'::jsonb, 
   '["Wash the rice and split moong dal together, then soak in water for 15 minutes.", "Heat ghee or oil in a pressure cooker. Add cumin seeds and asafoetida.", "Add the grated ginger and sauté for 30 seconds.", "Add the drained rice and dal, turmeric powder, and salt. Stir for a minute.", "Pour in 4 cups of water. Close the lid and cook for 3-4 whistles until soft and mushy.", "Serve hot with a dollop of ghee and pickle."]'::jsonb, 
   10, 15, 3, 'Healthy', 'Easy', 'Indian Traditional', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', '["khichdi", "healthy", "comfort-food", "lentils"]'::jsonb),
  
  ('fa2a2222-2222-2222-2222-222222222222', 'Maharashtrian Kanda Poha', 'A quick and light breakfast snack made of flattened rice flakes sautéed with onions, peanuts, mustard seeds, and turmeric.', 
   '["2 cups thick poha (flattened rice)", "1 large onion, finely chopped", "2 tbsp raw peanuts", "1 tsp mustard seeds", "2 green chilies, chopped", "10 curry leaves", "1/2 tsp turmeric powder", "1 tbsp oil", "Lemon wedges and coriander for garnish"]'::jsonb, 
   '["Rinse the poha in a strainer under running water until soft but not mushy. Leave to drain.", "Heat oil in a pan, roast raw peanuts until crunchy, and set aside.", "In the same oil, add mustard seeds until they splutter, then add chopped onions, green chilies, and curry leaves. Sauté until onions are soft.", "Add turmeric powder and salt, and stir.", "Add the rinsed poha and roasted peanuts. Mix gently until well combined.", "Cover and steam on very low heat for 2 minutes. Garnish with chopped coriander and lemon juice."]'::jsonb, 
   5, 8, 2, 'Quick Meals', 'Easy', 'Maharashtrian', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80', '["poha", "quick", "breakfast", "vegan"]'::jsonb),
  
  ('fa3a3333-3333-3333-3333-333333333333', 'Rajasthani Dal Baati Churma', 'A traditional Rajasthani masterpiece consisting of baked whole wheat rolls (baati), mixed lentil curry (dal), and sweet crumbled wheat (churma).', 
   '["2 cups whole wheat flour (atta)", "1/2 cup semolina (rava)", "1/2 cup split pigeon peas (toor dal)", "1/4 cup split green moong dal", "1/2 cup ghee", "1 tsp mustard seeds", "1/2 tsp red chili powder", "Cardamom powder and powdered sugar for churma", "Salt to taste"]'::jsonb, 
   '["Mix wheat flour, rava, 4 tbsp ghee, and salt. Knead into a stiff dough. Shape into round balls (baatis).", "Bake the baatis in an oven at 375°F (190°C) or gas tandoor for 30 minutes, turning occasionally until golden-brown and hard. Soak in melted ghee.", "For the dal, boil toor dal and moong dal with salt and turmeric. Temper with ghee, mustard seeds, red chili powder, and cumin.", "For the churma, crush 2 baked baatis into fine crumbs. Mix with 2 tbsp ghee, powdered sugar, and cardamom powder.", "Serve the baatis hot, cracked open and drizzled with ghee, accompanied by the spiced dal and sweet churma."]'::jsonb, 
   25, 35, 3, 'Traditional', 'Hard', 'Rajasthani', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80', '["dal-baati", "rajasthani", "traditional", "ghee"]'::jsonb),
  
  ('fa4a4444-4444-4444-4444-444444444444', 'Indo-Chinese Gobi Manchurian', 'An internationally popular Indo-Chinese fusion dish of crispy cauliflower florets tossed in a sweet, spicy, and tangy soy-garlic sauce.', 
   '["1 cauliflower, cut into florets", "1/2 cup cornstarch", "1/4 cup all-purpose flour", "2 tbsp garlic, finely chopped", "1 tbsp ginger, finely chopped", "3 spring onions, chopped", "2 tbsp soy sauce", "2 tbsp chili sauce", "1 tbsp tomato ketchup", "Oil for deep frying", "Salt and pepper to taste"]'::jsonb, 
   '["Whisk cornstarch, flour, salt, pepper, and water into a smooth, thick batter.", "Dip cauliflower florets into the batter and deep-fry in hot oil until golden-brown and crispy. Drain.", "Heat 1 tablespoon of oil in a pan. Sauté the chopped garlic, ginger, and spring onions.", "Stir in the soy sauce, chili sauce, tomato ketchup, and a splash of water, simmering for a minute.", "Toss the fried cauliflower florets in the sauce until fully coated.", "Garnish with spring onion tops and serve immediately."]'::jsonb, 
   15, 15, 3, 'International', 'Medium', 'Indo-Chinese', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', '["indo-chinese", "manchurian", "vegan", "spicy"]'::jsonb),

  ('fb111111-1111-1111-1111-111111111111', 'Baingan Bharta', 'Smoky roasted eggplant mashed and cooked with onions, tomatoes, ginger, garlic, and fragrant Indian spices. A Punjabi household classic.',
   '["1 large eggplant (bharta baingan)", "2 tbsp mustard oil", "1 tsp cumin seeds", "1 large onion, finely chopped", "1 tbsp ginger-garlic paste", "2 green chilies, slit", "2 large tomatoes, finely chopped", "1/2 tsp turmeric powder", "1 tsp Kashmiri red chili powder", "1 tsp garam masala", "1/4 cup fresh coriander, chopped", "Salt to taste"]'::jsonb,
   '["Wash the eggplant, make a few slits, and brush with oil. Roast directly on a gas flame or bake until skin is charred and flesh is tender.", "Cool, peel off the charred skin, and mash the flesh with a fork.", "Heat mustard oil in a pan until it smokes. Add cumin seeds and let them splutter.", "Add chopped onions, green chilies, and ginger-garlic paste. Sauté until onions are golden brown.", "Add chopped tomatoes, turmeric, red chili powder, and salt. Cook until tomatoes turn mushy and oil separates.", "Add the mashed eggplant and mix thoroughly. Cook on medium-low heat for 10 minutes, stirring occasionally.", "Stir in garam masala and garnish with fresh coriander. Serve hot with roti or paratha."]'::jsonb,
   15, 25, 4, 'Dinner', 'Medium', 'Punjabi', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80', '["eggplant", "vegan", "smoky", "curry", "traditional"]'::jsonb),

  ('fb222222-2222-2222-2222-222222222222', 'Aloo Gobi', 'A comforting dry curry made with potatoes (aloo) and cauliflower (gobi) tossed in aromatic dry spices.',
   '["1 medium cauliflower, cut into florets", "2 medium potatoes, peeled and cubed", "2 tbsp oil", "1 tsp cumin seeds", "1/4 tsp asafoetida (hing)", "1 tsp ginger, finely grated", "1/2 tsp turmeric powder", "1 tsp red chili powder", "1 tsp coriander powder", "1/2 tsp amchur (dry mango powder)", "1/2 tsp garam masala", "Salt to taste", "Fresh coriander for garnish"]'::jsonb,
   '["Heat oil in a pan. Add cumin seeds and asafoetida. Let cumin crackle.", "Add grated ginger and sauté for 30 seconds.", "Add potato cubes, cauliflower florets, turmeric, and salt. Mix well to coat the vegetables.", "Cover and cook on low heat for 15-20 minutes, stirring occasionally, until vegetables are tender.", "Add red chili powder, coriander powder, and amchur. Stir gently to avoid breaking the cauliflower.", "Cook uncovered for another 5 minutes to get a slight crispy edge.", "Sprinkle garam masala, garnish with fresh coriander, and serve warm with rotis."]'::jsonb,
   15, 20, 4, 'Lunch', 'Easy', 'North Indian', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80', '["aloo", "gobi", "vegan", "dry-curry", "lunch"]'::jsonb),

  ('fb333333-3333-3333-3333-333333333333', 'Bhindi Masala', 'Crispy and delicious stir-fried okra (bhindi) cooked with onions, tomatoes, and dry spices.',
   '["250g okra (bhindi), washed, dried thoroughly, and chopped", "2 tbsp oil", "1/2 tsp cumin seeds", "1 large onion, sliced", "1 tomato, finely chopped", "1/2 tsp turmeric powder", "1 tsp coriander powder", "1/2 tsp red chili powder", "1/2 tsp amchur (dry mango powder)", "Salt to taste"]'::jsonb,
   '["Ensure the okra is completely dry before cutting to prevent sliminess. Slice into 1-inch pieces.", "Heat 1.5 tbsp oil in a pan. Add the chopped okra and sauté on medium heat for 8-10 minutes until lightly browned. Remove and set aside.", "In the same pan, heat the remaining oil. Add cumin seeds.", "Add sliced onions and sauté until translucent.", "Add chopped tomatoes, turmeric, red chili powder, coriander powder, amchur, and salt. Cook until tomatoes are soft.", "Add the sautéed okra to the pan and mix gently.", "Cook uncovered on low heat for another 5-7 minutes. Serve hot with roti."]'::jsonb,
   15, 15, 3, 'Lunch', 'Easy', 'North Indian', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80', '["okra", "bhindi", "vegan", "stir-fry", "lunch"]'::jsonb),

  ('fb444444-4444-4444-4444-444444444444', 'Chana Palak', 'Protein-packed chickpeas cooked in a healthy, spiced spinach gravy. Vegan and highly nutritious.',
   '["1.5 cups chickpeas, boiled", "1 large bunch spinach (palak)", "1 tbsp oil", "1 tsp cumin seeds", "1 medium onion, finely chopped", "1 tsp ginger-garlic paste", "2 tomatoes, pureed", "1/2 tsp turmeric powder", "1 tsp garam masala", "Salt to taste"]'::jsonb,
   '["Blanch the spinach in boiling water for 2 minutes, then plunge into cold water to retain color. Puree in a blender.", "Heat oil in a pan. Add cumin seeds and let them splutter.", "Add chopped onions and ginger-garlic paste. Sauté until golden brown.", "Add tomato puree, turmeric, and salt. Cook until the mixture thickens and releases oil.", "Add the boiled chickpeas and blanched spinach puree. Add a little water if too thick.", "Simmer on medium heat for 8-10 minutes so chickpeas absorb the spinach flavor.", "Stir in garam masala and serve hot with steamed basmati rice or flatbreads."]'::jsonb,
   15, 20, 4, 'Dinner', 'Easy', 'North Indian', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80', '["spinach", "chickpeas", "vegan", "healthy", "dinner"]'::jsonb),

  ('fb555555-5555-5555-5555-555555555555', 'Paneer Tikka Masala', 'Tandoori grilled paneer cubes marinated in yogurt and spices, served in a rich, creamy, and spiced tomato-based gravy.',
   '["250g paneer, cut into cubes", "1 bell pepper and 1 onion, cut into petals", "1/2 cup yogurt", "1 tbsp ginger-garlic paste", "2 tsp Kashmiri red chili powder", "1/2 tsp turmeric powder", "1 tsp garam masala", "1 tbsp lemon juice", "2 tbsp mustard oil", "1 onion chopped", "2 tomatoes pureed", "1/4 cup heavy cream", "1 tbsp butter", "cashew paste (10 cashews)", "Salt to taste"]'::jsonb,
   '["In a bowl, mix yogurt, ginger-garlic paste, red chili powder, turmeric, garam masala, salt, lemon juice, and mustard oil. Marinate paneer, bell pepper, and onion petals for 30 minutes.", "Skewer paneer and vegetables and grill in an oven or pan until lightly charred. Set aside.", "For gravy, heat butter and oil in a pan. Sauté chopped onions until golden.", "Add tomato puree, cashew paste, remaining spices, and salt. Cook until oil separates.", "Add 1/2 cup water and bring to a simmer. Add grilled paneer and veggies.", "Stir in heavy cream, simmer for 3 minutes, and garnish with coriander. Serve with garlic naan."]'::jsonb,
   20, 20, 4, 'Dinner', 'Medium', 'North Indian', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', '["paneer", "tikka", "creamy", "vegetarian", "dinner"]'::jsonb),

  ('fb666666-6666-6666-6666-666666666666', 'Medu Vada', 'Crispy, savory fried lentil donuts made from a fluffy skinless black gram batter, flavored with peppercorns and curry leaves.',
   '["1 cup whole white urad dal (black gram), soaked for 4 hours", "2 green chilies, chopped", "1 inch ginger, chopped", "1 sprig curry leaves, chopped", "1 tsp whole black peppercorns", "A pinch of asafoetida (hing)", "Oil for deep frying", "Salt to taste"]'::jsonb,
   '["Drain soaked urad dal completely. Grind in a blender, adding very little ice-cold water, to make a thick, fluffy batter.", "Whip the batter vigorously with your hand for 5 minutes to incorporate air (batter should float in water).", "Mix in green chilies, ginger, curry leaves, black peppercorns, hing, and salt.", "Wet your palms. Take a portion of batter, shape it into a ball, and make a hole in the center with your thumb.", "Gently slide the shaped vada into hot oil. Fry on medium heat until golden and crispy on both sides.", "Drain on paper towels and serve immediately with hot sambar and coconut chutney."]'::jsonb,
   20, 20, 4, 'Breakfast', 'Hard', 'South Indian', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80', '["breakfast", "south-indian", "crispy", "vegan", "lentils"]'::jsonb),

  ('fb777777-7777-7777-7777-777777777777', 'Idli with Sambar', 'Soft, pillowy steamed cakes made of fermented rice and lentil batter, served with a piping hot vegetable lentil stew (sambar).',
   '["3 cups idli batter (fermented rice & urad dal batter)", "1/2 cup split yellow pigeon peas (toor dal)", "1 cup mixed vegetables (drumsticks, carrots, pumpkin)", "1 small onion, chopped", "1 tomato, chopped", "2 tbsp sambar powder", "1/2 tsp turmeric powder", "1 tsp mustard seeds", "10 curry leaves", "2 dry red chilies", "1 tbsp oil or ghee", "Salt to taste"]'::jsonb,
   '["Grease idli molds, pour fermented idli batter into each mold, and steam for 10-12 minutes. Set steamed idlis aside.", "For sambar, pressure cook toor dal with turmeric and salt until mushy. Cook mixed vegetables in water separately.", "Heat oil in a pot, add mustard seeds, curry leaves, and dry red chilies. Add onions and sauté until translucent.", "Add tomatoes and cook until soft. Pour in cooked dal, vegetables, sambar powder, and tamarind water.", "Boil the sambar for 10 minutes until flavors combine.", "Serve steaming hot idlis dunked in the flavorful sambar alongside coconut chutney."]'::jsonb,
   15, 20, 4, 'Breakfast', 'Medium', 'South Indian', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80', '["idli", "breakfast", "steamed", "south-indian", "vegan"]'::jsonb),

  ('fb888888-8888-8888-8888-888888888888', 'Malai Kofta', 'Creamy and luxurious North Indian dish featuring deep-fried potato and paneer balls (koftas) in a rich, mildly sweet tomato-cashew sauce.',
   '["200g paneer, grated", "2 large potatoes, boiled and mashed", "2 tbsp cornstarch", "1/4 cup mixed nuts (raisins, cashews), chopped", "1 onion chopped", "3 tomatoes pureed", "1 tbsp ginger-garlic paste", "12 cashews soaked and blended", "1 tsp red chili powder", "1/2 tsp garam masala", "1/2 cup cream", "2 tbsp butter", "Salt to taste"]'::jsonb,
   '["In a bowl, mix grated paneer, mashed potatoes, cornstarch, and salt. Knead into a smooth dough.", "Divide into balls, stuffing each with chopped nuts. Deep-fry or air-fry the koftas until golden brown. Set aside.", "For gravy, melt butter in a pan. Add ginger-garlic paste and sauté. Add onions and cook until soft.", "Add tomato puree, red chili powder, and salt. Cook until oil separates. Stir in the cashew paste and cook for 2 minutes.", "Add 1 cup water and simmer for 5 minutes. Stir in the cream and garam masala.", "Place the fried koftas in a serving dish, pour the hot gravy over them just before serving, and garnish with cream."]'::jsonb,
   30, 25, 4, 'Dinner', 'Hard', 'North Indian', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', '["kofta", "creamy", "vegetarian", "festive", "dinner"]'::jsonb),

  ('fb999999-9999-9999-9999-999999999999', 'Kadhi Pakora', 'A traditional Punjabi dish of spiced gram flour fritters (pakoras) submerged in a tangy, spiced yogurt and chickpea flour gravy.',
   '["1 cup yogurt (sour preferred)", "1/2 cup gram flour (besan)", "1/2 tsp turmeric powder", "1 tsp red chili powder", "1 cup besan (for pakora)", "1 onion sliced (for pakora)", "1/2 tsp chili powder (for pakora)", "Water", "Oil for frying", "1 tbsp oil (for tempering)", "1/2 tsp mustard seeds", "1/2 tsp fenugreek seeds (methi)", "1 pinch hing", "2 dry red chilies", "10 curry leaves"]'::jsonb,
   '["Whisk yogurt, 1/2 cup besan, turmeric, chili powder, and 3 cups of water into a lump-free, thin mixture.", "Pour the mixture into a deep pot, bring to a boil, then simmer on low heat for 30 minutes, stirring occasionally.", "For pakoras, mix besan, sliced onions, chili powder, salt, and water to make a thick batter. Spoon portions into hot oil and fry until golden-brown.", "Add the fried pakoras to the simmering yogurt gravy.", "Heat oil in a small pan, add mustard seeds, fenugreek seeds, hing, dry red chilies, and curry leaves. Let them splutter.", "Pour the hot tempering over the kadhi, cover for 5 minutes, and serve with steamed rice."]'::jsonb,
   20, 30, 4, 'Lunch', 'Medium', 'Punjabi', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', '["kadhi", "pakora", "yogurt", "vegetarian", "traditional"]'::jsonb),

  ('fc111111-1111-1111-1111-111111111111', 'Matar Paneer', 'A popular, everyday North Indian curry of soft paneer cubes and green peas simmered in a spiced onion-tomato gravy.',
   '["200g paneer, cubed", "1 cup green peas (matar), fresh or frozen", "1 large onion, chopped", "2 medium tomatoes, chopped", "1 tbsp ginger-garlic paste", "1 tsp cumin seeds", "1 tsp coriander powder", "1/2 tsp turmeric powder", "1/2 tsp red chili powder", "1/2 tsp garam masala", "2 tbsp oil or ghee", "Salt to taste"]'::jsonb,
   '["Heat oil in a pan, lightly toast paneer cubes until golden, then soak in warm water to keep soft. Drain and set aside.", "In the same pan, add cumin seeds. Sauté onions and ginger-garlic paste until golden brown.", "Add chopped tomatoes and cook until soft and mushy.", "Add coriander powder, turmeric, red chili powder, and salt. Cook until oil separates.", "Add the peas and 1 cup of water, simmer for 5 minutes until peas are tender.", "Add paneer cubes and garam masala, cooking for 3 minutes on low heat.", "Garnish with fresh coriander and serve warm with roti or paratha."]'::jsonb,
   15, 20, 4, 'Lunch', 'Easy', 'North Indian', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', '["paneer", "matar", "peas", "vegetarian", "lunch"]'::jsonb),

  ('fc222222-2222-2222-2222-222222222222', 'Jeera Aloo', 'Super quick and delicious dry potato dish sautéed with abundance of cumin seeds, ginger, green chilies, and basic spices.',
   '["4 medium potatoes, boiled, peeled and cubed", "2 tbsp oil or ghee", "1.5 tsp cumin seeds (jeera)", "1 inch ginger, finely chopped", "2 green chilies, chopped", "1/2 tsp turmeric powder", "1 tsp coriander powder", "1/2 tsp red chili powder", "1/2 tsp amchur (dry mango powder)", "Salt to taste", "Coriander for garnish"]'::jsonb,
   '["Heat oil or ghee in a pan. Add cumin seeds and let them sizzle and turn fragrant.", "Add chopped ginger and green chilies. Sauté for a minute.", "Add turmeric powder, coriander powder, and red chili powder. Stir quickly on low heat so spices don't burn.", "Add the cubed boiled potatoes and salt. Toss gently to combine and coat the potatoes with spices.", "Cook on medium heat for 5-7 minutes until the potato edges get slightly crispy.", "Sprinkle dry mango powder (amchur) and fresh coriander.", "Mix well and serve hot with parathas or as a side dish with lentils."]'::jsonb,
   10, 10, 3, 'Quick Meals', 'Easy', 'North Indian', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80', '["aloo", "cumin", "vegan", "quick", "lunch"]'::jsonb),

  ('fc333333-3333-3333-3333-333333333333', 'Bhel Puri', 'A popular Mumbai street food snack made of puffed rice, roasted peanuts, finely chopped vegetables, crispy sev, and sweet-sour chutneys.',
   '["2 cups puffed rice (kurmura/murmura)", "1/2 cup sev (crispy chickpea flour noodles)", "1/4 cup roasted peanuts", "1 medium potato, boiled and cubed", "1 onion, finely chopped", "1 tomato, finely chopped", "2 tbsp green coriander chutney", "2 tbsp sweet tamarind-date chutney", "1 tbsp lemon juice", "1 tsp chaat masala", "Salt to taste"]'::jsonb,
   '["Dry roast the puffed rice in a pan for 2 minutes to make it extra crispy. Let it cool.", "In a large mixing bowl, combine puffed rice, sev, roasted peanuts, potato cubes, chopped onion, and chopped tomato.", "Add green chutney, tamarind chutney, and lemon juice. Adjust chutney quantities to your taste.", "Add chaat masala and salt. Toss everything together quickly to prevent the puffed rice from turning soggy.", "Transfer to serving plates immediately, garnish with more sev and fresh coriander, and serve right away."]'::jsonb,
   15, 0, 2, 'Snacks', 'Easy', 'Mumbai Street Food', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80', '["bhel", "snack", "street-food", "vegan", "quick"]'::jsonb),

  ('fc444444-4444-4444-4444-444444444444', 'Classic Samosa', 'A timeless Indian street snack: flaky pastry crusts shaped into cones, stuffed with a spicy potato and peas filling, and deep-fried.',
   '["2 cups all-purpose flour (maida)", "4 tbsp oil or ghee (for dough)", "1/2 tsp carom seeds (ajwain)", "3 large potatoes, boiled and mashed", "1/2 cup green peas, boiled", "1 tsp cumin seeds", "1 tsp ginger-garlic paste", "1 tsp red chili powder", "1 tsp coriander powder", "1/2 tsp dry mango powder (amchur)", "Oil for deep frying", "Salt to taste"]'::jsonb,
   '["In a bowl, mix flour, ajwain, salt, and 4 tbsp oil. Rub oil into flour. Add cold water slowly and knead into a stiff dough. Rest covered for 30 minutes.", "For stuffing, heat 1 tbsp oil in a pan, sauté cumin and ginger-garlic paste. Add potatoes, peas, spices, and salt. Sauté for 5 minutes. Let cool.", "Divide dough into equal balls. Roll a ball into an oval sheet and cut it in half.", "Fold one half sheet into a cone shape. Stuff with 2 tablespoons potato filling. Seal the bottom edges with a dab of water.", "Deep fry the samosas in medium-low hot oil until golden-brown and crispy (about 10-12 minutes per batch).", "Serve hot with sweet tamarind chutney and spicy mint-coriander chutney."]'::jsonb,
   30, 20, 6, 'Snacks', 'Hard', 'North Indian', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80', '["samosa", "snack", "crispy", "street-food", "vegan"]'::jsonb),

  ('fc555555-5555-5555-5555-555555555555', 'Rava Dhokla', 'Quick steamed cakes made of semolina (rava) and yogurt, seasoned with mustard seeds, sesame seeds, and curry leaves.',
   '["1 cup semolina (suji/rava)", "1/2 cup yogurt (curd)", "1/2 cup water", "1 tsp fruit salt (eno)", "1 tsp ginger-chili paste", "1 tbsp oil", "1 tsp mustard seeds", "1 tsp sesame seeds", "10 curry leaves", "Chopped coriander for garnish", "Salt to taste"]'::jsonb,
   '["In a bowl, mix semolina, yogurt, ginger-chili paste, salt, and 1/2 cup water to form a smooth batter. Rest for 10 minutes.", "Grease a steaming pan. Add fruit salt to the batter, pour in 1 tbsp water to activate, stir quickly, and pour batter into the pan.", "Steam in a preheated steamer for 12-15 minutes until a toothpick inserted comes out clean.", "Let the dhokla cool for 5 minutes, then cut into square pieces.", "For tempering, heat oil in a small pan. Add mustard seeds, sesame seeds, and curry leaves. Let them splutter.", "Pour the tempering evenly over the steamed dhokla squares. Garnish with chopped coriander and serve."]'::jsonb,
   10, 15, 4, 'Snacks', 'Easy', 'Gujarati', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80', '["dhokla", "steamed", "gujarati", "quick", "vegetarian"]'::jsonb),

  ('fc666666-6666-6666-6666-666666666666', 'Sabudana Khichdi', 'A popular gluten-free Maharashtrian breakfast dish made of tapioca pearls (sabudana) tossed with peanuts, green chilies, and potatoes.',
   '["1 cup tapioca pearls (sabudana), soaked overnight", "1/2 cup raw peanuts, roasted and coarsely ground", "2 tbsp oil or ghee", "1 tsp cumin seeds", "1 medium potato, boiled and cubed", "2 green chilies, finely chopped", "1 tbsp lemon juice", "Fresh coriander chopped", "Salt to taste"]'::jsonb,
   '["Ensure sabudana is well-soaked and drained. Grains should mash easily between fingers without being sticky.", "Mix the coarsely ground roasted peanuts and salt into the soaked sabudana.", "Heat oil or ghee in a pan. Add cumin seeds and let them splutter.", "Add green chilies and potato cubes. Sauté for 2-3 minutes.", "Add the sabudana-peanut mixture to the pan. Stir gently to combine.", "Cover and cook on low heat for 5 minutes, until the sabudana pearls turn translucent.", "Remove cover, stir in lemon juice and chopped coriander. Serve hot."]'::jsonb,
   15, 15, 2, 'Healthy', 'Medium', 'Maharashtrian', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80', '["tapioca", "healthy", "breakfast", "vegan", "fasting"]'::jsonb),

  ('fc777777-7777-7777-7777-777777777777', 'Rajma Masala', 'Red kidney beans slow-cooked in a robust onion-tomato gravy with warm spices. A comforting staple in North Indian homes.',
   '["1 cup red kidney beans (rajma), soaked overnight", "2 tbsp oil or ghee", "1 tsp cumin seeds", "1 large onion, finely chopped", "1 tbsp ginger-garlic paste", "2 tomatoes, pureed", "1/2 tsp turmeric powder", "1 tsp red chili powder", "1 tsp coriander powder", "1/2 tsp garam masala", "Salt to taste"]'::jsonb,
   '["Pressure cook soaked kidney beans in 3 cups of water with salt until perfectly soft and melt-in-mouth (about 5-6 whistles).", "Heat oil or ghee in a large pot. Add cumin seeds and let them splutter.", "Add chopped onions and ginger-garlic paste. Sauté until dark golden brown.", "Add tomato puree, turmeric, red chili powder, and coriander powder. Sauté until the paste starts leaving oil.", "Add the cooked kidney beans along with their cooking water. Mash a few beans with the back of a spoon to thicken gravy.", "Simmer on low-medium heat for 15-20 minutes until the gravy thickens and flavors meld.", "Stir in garam masala and garnish with fresh coriander. Serve hot with steamed basmati rice (Rajma Chawal)."]'::jsonb,
   15, 30, 4, 'Dinner', 'Medium', 'Punjabi', 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?auto=format&fit=crop&w=800&q=80', '["rajma", "kidney-beans", "vegan", "curry", "dinner"]'::jsonb),

  ('fc888888-8888-8888-8888-888888888888', 'Kashmiri Dum Aloo', 'Baby potatoes deep-fried and slow-cooked in a rich, spicy, and tangy yogurt gravy seasoned with fennel and dry ginger powder.',
   '["15 baby potatoes, boiled and peeled", "1 cup yogurt (curd), whisked", "2 tbsp mustard oil", "1/2 tsp cumin seeds", "1 pinch asafoetida (hing)", "2 tsp fennel powder (saunf)", "1 tsp dry ginger powder (sonth)", "2 tsp Kashmiri red chili powder", "1/2 tsp garam masala", "Salt to taste"]'::jsonb,
   '["Prick peeled baby potatoes all over with a toothpick. Deep fry or pan fry until they get a golden, crispy skin. Set aside.", "In a bowl, mix whisked yogurt, fennel powder, ginger powder, red chili powder, and salt.", "Heat mustard oil in a pot. Add cumin seeds and hing.", "Lower the heat completely and slowly pour in the yogurt-spice mixture, stirring continuously to prevent yogurt from curdling.", "Add the fried baby potatoes and 1/2 cup of water. Mix well.", "Cover the pot tightly with a lid and cook on low heat for 15-20 minutes (dum) until potatoes absorb the gravy.", "Sprinkle garam masala and serve hot with naan or steamed rice."]'::jsonb,
   20, 30, 3, 'Dinner', 'Medium', 'Kashmiri', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80', '["aloo", "kashmiri", "spicy", "vegetarian", "dinner"]'::jsonb),

  ('fc999999-9999-9999-9999-999999999999', 'Bisi Bele Bath', 'A traditional, spicy, and tangy rice-lentil dish from Karnataka, packed with mixed vegetables, tamarind, and a special spice powder.',
   '["1/2 cup Basmati rice", "1/2 cup split yellow pigeon peas (toor dal)", "1 cup mixed vegetables (carrots, beans, peas, potato)", "2 tbsp Bisi Bele Bath powder", "1 tbsp tamarind paste", "2 tbsp ghee or oil", "1 tsp mustard seeds", "10 curry leaves", "2 tbsp cashews, roasted", "Salt to taste"]'::jsonb,
   '["Wash rice and toor dal. Cook them together in a pressure cooker with 4 cups of water and turmeric until completely soft and mushy.", "In a large pot, boil the chopped mixed vegetables in water with a pinch of salt until tender.", "Add the cooked rice-dal mixture, tamarind paste, Bisi Bele Bath powder, and salt to the pot of vegetables. Mix well.", "Simmer on low-medium heat for 10 minutes, stirring frequently so it does not stick to the bottom. Add water if it gets too dry; it should have a thick, porridge-like consistency.", "For tempering, heat ghee or oil in a pan. Sauté mustard seeds, curry leaves, and cashews until golden.", "Pour the hot tempering over the rice dish and mix well. Serve hot with potato chips or papadum."]'::jsonb,
   20, 30, 4, 'Traditional', 'Hard', 'South Indian', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80', '["rice", "lentils", "south-indian", "traditional", "vegetarian"]'::jsonb),

  ('fd111111-1111-1111-1111-111111111111', 'Rava Kesari', 'A classic South Indian sweet pudding made of semolina, sugar, ghee, cardamom, and roasted nuts, tinted with saffron.',
   '["1/2 cup semolina (suji/rava)", "1 cup sugar", "1/4 cup ghee", "1.5 cups water", "10 cashews, chopped", "1 tbsp raisins", "1/4 tsp cardamom powder", "A few strands of saffron, soaked in 1 tbsp warm milk"]'::jsonb,
   '["Heat 1 tablespoon of ghee in a pan and roast cashews and raisins until golden. Set aside.", "In the same pan, roast semolina on medium-low heat until fragrant (do not let it brown, about 5 minutes). Remove and set aside.", "Bring water to a boil in a saucepan. Lower the heat and slowly pour in the roasted semolina, stirring constantly to avoid lumps.", "Cover and cook on low heat for 2 minutes until semolina absorbs the water and cooks.", "Add sugar and remaining ghee. The mixture will turn liquidy again. Stir continuously until sugar dissolves and it starts thickening.", "Add the saffron milk, cardamom powder, roasted cashews, and raisins.", "Stir until the pudding leaves the sides of the pan. Serve warm."]'::jsonb,
   5, 15, 4, 'Dessert', 'Easy', 'South Indian', 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=800&q=80', '["halwa", "sweet", "dessert", "saffron", "vegetarian"]'::jsonb),

  ('fd222222-2222-2222-2222-222222222222', 'Coconut Chutney', 'A classic and healthy South Indian dipping sauce made of freshly grated coconut, roasted chickpeas, and chilies, tempered with curry leaves.',
   '["1 cup fresh coconut, grated", "2 tbsp roasted split chickpeas (dalia)", "2 green chilies", "1 inch ginger", "Salt to taste", "1 tsp oil (for tempering)", "1/2 tsp mustard seeds", "1 dry red chili", "5-6 curry leaves", "a pinch of hing"]'::jsonb,
   '["In a blender, combine grated coconut, roasted chickpeas, green chilies, ginger, salt, and 1/2 cup of water.", "Blend into a smooth paste. Add more water if a thinner consistency is desired. Transfer to a bowl.", "For tempering, heat oil in a small pan on medium heat.", "Add mustard seeds and let them crackle.", "Add dry red chili, curry leaves, and a pinch of hing. Fry for 10-15 seconds.", "Pour this hot tempering over the coconut paste and stir. Serve chilled or at room temperature with idli or dosa."]'::jsonb,
   10, 2, 6, 'Healthy', 'Easy', 'South Indian', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80', '["coconut", "chutney", "healthy", "vegan", "condiment"]'::jsonb),

  ('fd333333-3333-3333-3333-333333333333', 'Gujarati Khichdi and Kadhi', 'Light and comforting rice and yellow lentil mixture paired with a warm, thin sweet-spicy yogurt soup (Kadhi).',
   '["1/2 cup rice", "1/2 cup yellow split moong dal", "1 tsp ghee", "1/2 tsp turmeric powder", "Salt to taste", "1 cup yogurt (for kadhi)", "2 tbsp gram flour (besan) (for kadhi)", "1 tsp ginger-chili paste (for kadhi)", "1 tbsp sugar (for kadhi)", "1 tsp mustard seeds", "1 pinch hing", "5 curry leaves", "1 cinnamon stick", "2 cloves"]'::jsonb,
   '["Wash rice and moong dal together. Cook in a pressure cooker with 4 cups of water, turmeric, and salt until very soft. Drizzle with ghee.", "For Kadhi, whisk yogurt, besan, ginger-chili paste, sugar, salt, and 2 cups of water until smooth.", "Pour into a saucepan, bring to a boil, and simmer for 10 minutes on low heat, stirring occasionally.", "In a small pan, heat 1 tsp ghee. Add mustard seeds, cinnamon, cloves, hing, and curry leaves. Let them splutter.", "Pour the hot tempering over the simmering kadhi and boil for 2 more minutes.", "Serve the hot, comforting Khichdi accompanied by the warm, sweet-tangy Kadhi."]'::jsonb,
   15, 25, 3, 'Healthy', 'Easy', 'Gujarati', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', '["khichdi", "kadhi", "gujarati", "healthy", "comfort-food"]'::jsonb),

  ('fd444444-4444-4444-4444-444444444444', 'Shahi Tukda', 'A royal bread pudding dessert from the Awadhi cuisine: deep-fried bread slices soaked in cardamom sugar syrup and topped with rabri (thick sweetened milk) and nuts.',
   '["4 slices white bread, crusts removed", "3 cups whole milk", "1/2 cup sugar", "1/4 cup water", "4 tbsp ghee (for frying bread)", "1/4 tsp green cardamom powder", "A few saffron strands", "2 tbsp sliced almonds and pistachios"]'::jsonb,
   '["For rabri, boil whole milk in a wide heavy-bottomed pan. Simmer on low heat, stirring frequently and scraping sides, until milk reduces to 1/3 of its volume and gets thick. Stir in 2 tbsp sugar, cardamom powder, and saffron. Set aside.", "In a separate pan, combine remaining sugar and water. Simmer for 5 minutes to make a thin cardamom syrup. Keep warm.", "Cut bread slices diagonally into triangles. Heat ghee in a pan and shallow-fry or deep-fry bread triangles until crispy and golden-brown.", "Dip the fried bread slices in the warm sugar syrup for 30 seconds, then place them on a serving plate.", "Pour the thick rabri generously over the soaked bread slices.", "Garnish with sliced almonds and pistachios and serve warm or chilled."]'::jsonb,
   15, 20, 4, 'Dessert', 'Medium', 'Mughlai', 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=800&q=80', '["sweet", "dessert", "royal", "creamy", "vegetarian"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- PRE-SEED COLLECTION RECIPES MAPPINGS
INSERT INTO public.collection_recipes (collection_id, recipe_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ff6f6666-6666-6666-6666-666666666666'), -- Khichdi (Healthy)
  ('11111111-1111-1111-1111-111111111111', 'fd4d4444-4444-4444-4444-444444444444'), -- Palak Paneer (Healthy)
  ('11111111-1111-1111-1111-111111111111', 'f1b1b111-1111-1111-1111-111111111111'), -- Masala Dosa (Healthy)
  ('11111111-1111-1111-1111-111111111111', 'fb444444-4444-4444-4444-444444444444'), -- Chana Palak (Healthy)
  ('11111111-1111-1111-1111-111111111111', 'fc666666-6666-6666-6666-666666666666'), -- Sabudana Khichdi (Healthy)
  ('11111111-1111-1111-1111-111111111111', 'fd222222-2222-2222-2222-222222222222'), -- Coconut Chutney (Healthy)
  ('11111111-1111-1111-1111-111111111111', 'fd333333-3333-3333-3333-333333333333'), -- Gujarati Khichdi and Kadhi (Healthy)

  ('22222222-2222-2222-2222-222222222222', 'fa2a2222-2222-2222-2222-222222222222'), -- Poha (Quick)
  ('22222222-2222-2222-2222-222222222222', 'fa4a4444-4444-4444-4444-444444444444'), -- Gobi Manchurian (Quick)
  ('22222222-2222-2222-2222-222222222222', 'fb2b2222-2222-2222-2222-222222222222'), -- Mango Lassi (Quick)
  ('22222222-2222-2222-2222-222222222222', 'fb333333-3333-3333-3333-333333333333'), -- Bhindi Masala (Quick)
  ('22222222-2222-2222-2222-222222222222', 'fc222222-2222-2222-2222-222222222222'), -- Jeera Aloo (Quick)
  ('22222222-2222-2222-2222-222222222222', 'fc333333-3333-3333-3333-333333333333'), -- Bhel Puri (Quick)
  ('22222222-2222-2222-2222-222222222222', 'fc555555-5555-5555-5555-555555555555'), -- Rava Dhokla (Quick)

  ('33333333-3333-3333-3333-333333333333', 'f3b3b333-3333-3333-3333-333333333333'), -- Paneer Butter Masala (Chef Pick)
  ('33333333-3333-3333-3333-333333333333', 'f6b6b666-6666-6666-6666-666666666666'), -- Dal items (Chef Pick)
  ('33333333-3333-3333-3333-333333333333', 'fa3a3333-3333-3333-3333-333333333333'), -- Dal Baati (Chef Pick)
  ('33333333-3333-3333-3333-333333333333', 'fb111111-1111-1111-1111-111111111111'), -- Baingan Bharta (Chef Pick)
  ('33333333-3333-3333-3333-333333333333', 'fb555555-5555-5555-5555-555555555555'), -- Paneer Tikka Masala (Chef Pick)
  ('33333333-3333-3333-3333-333333333333', 'fb888888-8888-8888-8888-888888888888'), -- Malai Kofta (Chef Pick)
  ('33333333-3333-3333-3333-333333333333', 'fc999999-9999-9999-9999-999999999999'), -- Bisi Bele Bath (Chef Pick)

  ('44444444-4444-4444-4444-444444444444', 'f4b4b444-4444-4444-4444-444444444444'), -- Chole Bhature (Trending)
  ('44444444-4444-4444-4444-444444444444', 'f7b7b777-7777-7777-7777-777777777777'), -- Gulab Jamun (Trending)
  ('44444444-4444-4444-4444-444444444444', 'f5b5b555-5555-5555-5555-555555555555'), -- Biryani (Trending)
  ('44444444-4444-4444-4444-444444444444', 'fb777777-7777-7777-7777-777777777777'), -- Idli with Sambar (Trending)
  ('44444444-4444-4444-4444-444444444444', 'fc444444-4444-4444-4444-444444444444'), -- Classic Samosa (Trending)
  ('44444444-4444-4444-4444-444444444444', 'fc777777-7777-7777-7777-777777777777'), -- Rajma Masala (Trending)
  ('44444444-4444-4444-4444-444444444444', 'fd444444-4444-4444-4444-444444444444')  -- Shahi Tukda (Trending)
ON CONFLICT (collection_id, recipe_id) DO NOTHING;
