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
   15, 15, 3, 'International', 'Medium', 'Indo-Chinese', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', '["indo-chinese", "manchurian", "vegan", "spicy"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- PRE-SEED COLLECTION RECIPES MAPPINGS
INSERT INTO public.collection_recipes (collection_id, recipe_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ff6f6666-6666-6666-6666-666666666666'), -- Khichdi (Healthy)
  ('11111111-1111-1111-1111-111111111111', 'fd4d4444-4444-4444-4444-444444444444'), -- Palak Paneer (Healthy)
  ('11111111-1111-1111-1111-111111111111', 'f1b1b111-1111-1111-1111-111111111111'), -- Masala Dosa (Healthy)
  ('22222222-2222-2222-2222-222222222222', 'fa2a2222-2222-2222-2222-222222222222'), -- Poha (Quick)
  ('22222222-2222-2222-2222-222222222222', 'fa4a4444-4444-4444-4444-444444444444'), -- Gobi Manchurian (Quick)
  ('22222222-2222-2222-2222-222222222222', 'fb2b2222-2222-2222-2222-222222222222'), -- Mango Lassi (Quick)
  ('33333333-3333-3333-3333-333333333333', 'f3b3b333-3333-3333-3333-333333333333'), -- Paneer Butter Masala (Chef Pick)
  ('33333333-3333-3333-3333-333333333333', 'f6b6b666-6666-6666-6666-666666666666'), -- Dal items (Chef Pick)
  ('33333333-3333-3333-3333-333333333333', 'fa3a3333-3333-3333-3333-333333333333'), -- Dal Baati (Chef Pick)
  ('44444444-4444-4444-4444-444444444444', 'f4b4b444-4444-4444-4444-444444444444'), -- Chole Bhature (Trending)
  ('44444444-4444-4444-4444-444444444444', 'f7b7b777-7777-7777-7777-777777777777'), -- Gulab Jamun (Trending)
  ('44444444-4444-4444-4444-444444444444', 'f5b5b555-5555-5555-5555-555555555555')  -- Biryani (Trending)
ON CONFLICT (collection_id, recipe_id) DO NOTHING;

