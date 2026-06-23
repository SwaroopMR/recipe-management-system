import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    supabaseUrl !== "https://your-supabase-project.supabase.co" &&
    !!supabaseAnonKey &&
    !supabaseAnonKey.includes("your-anon-key")
  );
};

// Pre-seeded recipes for fallback mode (every category has beautiful recipes)
const PREDEFINED_RECIPES = [
  {
    id: "f1b1b111-1111-1111-1111-111111111111",
    name: "South Indian Masala Dosa",
    description: "Crispy fermented rice and lentil crepes stuffed with a spiced potato mash, served with coconut chutney and sambar.",
    ingredients: ["3 cups dosa batter (fermented rice and lentil)", "4 large potatoes, boiled and mashed", "1 medium onion, sliced", "2 green chilies, chopped", "1 tsp mustard seeds", "1 tsp split black gram (urad dal)", "1/2 tsp turmeric powder", "10 curry leaves", "2 tbsp oil", "Salt to taste"],
    instructions: ["In a pan, heat oil and add mustard seeds and urad dal. Sauté until golden.", "Add green chilies, onions, and curry leaves. Sauté until onions are translucent.", "Add turmeric, salt, and mashed potatoes. Mix well, cook for 5 minutes, and set potato stuffing aside.", "Heat a non-stick griddle (tawa) and ladle dosa batter in the center. Spread in a circular motion to make it thin and crispy.", "Drizzle a teaspoon of oil or ghee around the edges.", "Once the bottom turns golden-brown, place a portion of the potato stuffing in the center.", "Fold the dosa and serve hot with coconut chutney and sambar."],
    preparation_time: 10,
    cooking_time: 15,
    servings: 4,
    category: "Breakfast",
    difficulty: "Medium",
    cuisine: "South Indian",
    image_url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
    tags: ["dosa", "breakfast", "south-indian", "crispy"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f2b2b222-2222-2222-2222-222222222222",
    name: "Punjabi Aloo Paratha",
    description: "Traditional North Indian whole wheat flatbread stuffed with a spiced mashed potato mixture, griddled with ghee.",
    ingredients: ["2 cups whole wheat flour (atta)", "3 large potatoes, boiled and mashed", "1 green chili, finely chopped", "1/2 tsp red chili powder", "1/2 tsp garam masala", "1/2 tsp dry mango powder (amchur)", "2 tbsp fresh coriander, chopped", "Water for kneading", "Ghee or butter for roasting", "Salt to taste"],
    instructions: ["Knead whole wheat flour with water and a pinch of salt into a soft dough. Let it rest for 15 minutes.", "Mix mashed potatoes with green chili, red chili powder, garam masala, amchur, fresh coriander, and salt.", "Divide dough and potato stuffing into equal-sized balls.", "Roll a dough ball into a small circle, place a potato ball in the center, and fold the edges to seal completely.", "Gently roll the stuffed dough ball into a flatbread, using dry flour to prevent sticking.", "Place on a hot griddle and cook both sides. Apply ghee or butter and roast until golden-brown spots appear.", "Serve hot with yogurt, pickle, or a dollop of white butter."],
    preparation_time: 15,
    cooking_time: 15,
    servings: 3,
    category: "Breakfast",
    difficulty: "Medium",
    cuisine: "North Indian",
    image_url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80",
    tags: ["paratha", "breakfast", "north-indian", "flatbread"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f3b3b333-3333-3333-3333-333333333333",
    name: "Paneer Butter Masala",
    description: "Succulent cottage cheese cubes simmered in a rich, creamy, and mildly sweet onion-tomato gravy.",
    ingredients: ["250g paneer, cubed", "2 large tomatoes, pureed", "1 large onion, chopped", "1 tbsp ginger-garlic paste", "10 cashew nuts, soaked in warm water", "2 tbsp butter", "1 tbsp oil", "1/2 cup heavy cream", "1 tsp red chili powder", "1/2 tsp garam masala", "1 tsp dried fenugreek leaves (kasuri methi)", "Salt to taste"],
    instructions: ["Blend the chopped onions and soaked cashews into a smooth paste.", "Heat oil and 1 tablespoon of butter in a pan. Add ginger-garlic paste and sauté for a minute.", "Add onion-cashew paste and cook until golden brown.", "Add tomato puree, red chili powder, salt, and garam masala. Cook until oil starts separating from the gravy.", "Pour in 1/2 cup water, bring to a simmer, and stir in the paneer cubes.", "Simmer for 5 minutes. Stir in the heavy cream and crushed kasuri methi.", "Top with the remaining butter and serve hot with naan or roti."],
    preparation_time: 15,
    cooking_time: 20,
    servings: 3,
    category: "Lunch",
    difficulty: "Medium",
    cuisine: "North Indian",
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
    tags: ["paneer", "lunch", "creamy", "north-indian"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f4b4b444-4444-4444-4444-444444444444",
    name: "Amritsari Chole Bhature",
    description: "A classic Punjabi lunch combination of spicy chickpea curry (chole) and deep-fried puffed bread (bhatura).",
    ingredients: ["1 cup chickpeas (kabuli chana), soaked overnight", "2 cups all-purpose flour (maida)", "1/4 cup yogurt", "1/2 tsp baking soda", "2 medium onions, pureed", "3 tomatoes, pureed", "1 tbsp ginger-garlic paste", "2 tbsp chole masala powder", "Oil for frying and cooking", "Salt to taste"],
    instructions: ["Boil the soaked chickpeas with salt and a tea bag (for dark color) until tender.", "Mix flour, yogurt, baking soda, 1 tablespoon oil, and salt. Knead into a soft dough and let rest for 2 hours.", "Heat 2 tablespoons of oil in a pot. Sauté ginger-garlic paste and onion puree until golden.", "Add tomato puree and cook until oil separates. Stir in chole masala and salt.", "Add boiled chickpeas with their cooking water. Simmer for 15-20 minutes until the gravy thickens.", "Roll dough into oval shapes and deep-fry in hot oil until they puff up and turn golden-brown.", "Serve the hot puffed bhature with the spicy chole, sliced onions, and lemon wedges."],
    preparation_time: 20,
    cooking_time: 30,
    servings: 3,
    category: "Lunch",
    difficulty: "Hard",
    cuisine: "Punjabi",
    image_url: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80",
    tags: ["chole", "bhature", "punjabi", "spicy"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f5b5b555-5555-5555-5555-555555555555",
    name: "Mughlai Vegetable Biryani",
    description: "Fragrant basmati rice layered with spiced mixed vegetables, saffron, and caramelized onions, cooked on low heat (dum).",
    ingredients: ["2 cups Basmati rice, washed and soaked for 30 mins", "2 cups mixed vegetables (carrots, peas, beans, potatoes), chopped", "1 cup yogurt", "1 large onion, thinly sliced", "1 tbsp ginger-garlic paste", "1/2 tsp saffron strands, soaked in 2 tbsp warm milk", "1/4 cup fresh mint and coriander, chopped", "2 tbsp ghee", "Whole spices (bay leaf, cloves, cardamom, cinnamon)", "Salt to taste"],
    instructions: ["Boil Basmati rice with whole spices and salt until 70% cooked. Drain and set aside.", "In a pan, fry the sliced onions until dark golden and crispy (birista). Set aside.", "In a large pot, heat ghee. Add ginger-garlic paste and mixed vegetables. Sauté for 5 minutes.", "Stir in yogurt, biryani masala powder, and salt. Cook until vegetables are tender.", "Layer the partially cooked rice over the vegetable mixture.", "Sprinkle fried onions, chopped mint, coriander, and saffron milk on top.", "Cover the pot tightly with foil and a lid. Cook on very low heat (dum) for 15-20 minutes.", "Gently mix the layers and serve hot with raita."],
    preparation_time: 20,
    cooking_time: 30,
    servings: 4,
    category: "Dinner",
    difficulty: "Hard",
    cuisine: "Mughlai",
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    tags: ["biryani", "rice", "dinner", "traditional"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f6b6b666-6666-6666-6666-666666666666",
    name: "Dal Makhani with Jeera Rice",
    description: "Creamy, slow-cooked black lentils and kidney beans simmered overnight with spices, served with cumin-tempered basmati rice.",
    ingredients: ["3/4 cup whole black lentils (urad dal)", "1/4 cup red kidney beans (rajma)", "3 cloves garlic, minced", "1 tbsp ginger, grated", "1 cup tomato puree", "3 tbsp butter", "2 tbsp heavy cream", "1 tsp cumin seeds", "1 cup Basmati rice", "Salt and red chili powder to taste"],
    instructions: ["Cook the egg noodles or prepare basmati rice. Soak black lentils and kidney beans overnight. Cook in a pressure cooker with salt until soft.", "In a large pot, melt 2 tablespoons of butter. Add ginger, garlic, and tomato puree. Sauté for 5 minutes.", "Add the cooked lentils and beans. Mash some lentils with the back of a spoon to make it creamy.", "Simmer on low heat for 30 minutes, adding water as needed. Stir in red chili powder, remaining butter, and heavy cream.", "For the rice, cook Basmati rice. Heat oil in a pan, add cumin seeds until they splutter, and toss with the cooked rice.", "Serve the hot Dal Makhani garnished with cream alongside the Jeera Rice."],
    preparation_time: 15,
    cooking_time: 45,
    servings: 3,
    category: "Dinner",
    difficulty: "Medium",
    cuisine: "North Indian",
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    tags: ["dal-makhani", "lentils", "rice", "creamy"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f7b7b777-7777-7777-7777-777777777777",
    name: "Festive Gulab Jamun",
    description: "Soft, golden milk-solid dumplings fried and soaked in a warm, cardamom-infused sugar syrup.",
    ingredients: ["1 cup milk powder", "1/4 cup all-purpose flour", "1 tbsp ghee", "3 tbsp milk", "1/4 tsp baking powder", "1 cup sugar", "1 cup water", "3 green cardamoms, crushed", "1 tsp rose water", "Oil or ghee for deep frying"],
    instructions: ["In a pot, combine sugar, water, and crushed cardamoms. Simmer for 10 minutes to make a sticky syrup. Stir in rose water and keep warm.", "In a bowl, mix milk powder, flour, baking powder, and ghee. Add milk gradually to form a soft, smooth dough (do not over-knead).", "Shape dough into small, smooth balls without any cracks.", "Heat oil or ghee on low-medium heat. Fry the balls, stirring constantly, until they are deep golden-brown.", "Remove and immediately submerge the hot gulab jamuns in the warm sugar syrup.", "Let them soak for at least 1 hour until they double in size before serving."],
    preparation_time: 15,
    cooking_time: 20,
    servings: 6,
    category: "Dessert",
    difficulty: "Hard",
    cuisine: "North Indian",
    image_url: "https://images.unsplash.com/photo-1589135306090-e4733e8b0a7a?auto=format&fit=crop&w=800&q=80",
    tags: ["sweet", "dessert", "traditional", "cardamom"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f8b8b888-8888-8888-8888-888888888888",
    name: "Traditional Gajar Ka Halwa",
    description: "Grated red carrots slow-cooked with whole milk, ghee, sugar, and studded with roasted cashews and raisins.",
    ingredients: ["4 cups red carrots, grated", "2 cups whole milk", "1/2 cup sugar", "4 tbsp ghee", "1/4 cup mixed nuts (cashews, almonds, pistachios), sliced", "1/4 tsp green cardamom powder"],
    instructions: ["In a heavy-bottomed pan, add the grated carrots and milk. Cook on medium heat, stirring occasionally, until all the milk evaporates.", "Add ghee and sugar to the pan. Mix well and cook for another 15 minutes, stirring continuously as the halwa thickens.", "In a separate small pan, heat a teaspoon of ghee and lightly roast the mixed nuts until golden.", "Stir the roasted nuts and cardamom powder into the carrot mixture.", "Serve hot or warm, garnished with extra pistachios."],
    preparation_time: 15,
    cooking_time: 35,
    servings: 4,
    category: "Dessert",
    difficulty: "Medium",
    cuisine: "North Indian",
    image_url: "https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&w=800&q=80",
    tags: ["dessert", "carrot", "sweet", "halwa"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f9b9b999-9999-9999-9999-999999999999",
    name: "Gujarati Khaman Dhokla",
    description: "Tempered, steamed chickpea flour sponge cakes, soft and fluffy, seasoned with green chilies, mustard, and fresh coriander.",
    ingredients: ["1.5 cups chickpea flour (besan)", "1 tbsp semolina (rava)", "1 tsp ginger-chili paste", "1 tsp fruit salt (eno)", "1 tbsp lemon juice", "1 tsp mustard seeds", "10 curry leaves", "2 green chilies, slit", "1 tbsp oil", "Salt and a pinch of turmeric"],
    instructions: ["In a bowl, whisk besan, rava, ginger-chili paste, turmeric, lemon juice, salt, and 1 cup of water into a smooth batter.", "Grease a steamer pan. Add fruit salt to the batter, stir quickly as it froths, and immediately pour into the pan.", "Steam for 15 minutes until a toothpick inserted comes out clean. Let cool and cut into squares.", "For tempering, heat oil in a pan. Add mustard seeds, curry leaves, and slit green chilies. Sauté for a minute.", "Add 1/4 cup water and a teaspoon of sugar to the tempering, bring to a boil, and pour evenly over the dhokla.", "Garnish with fresh coriander and grated coconut."],
    preparation_time: 10,
    cooking_time: 15,
    servings: 4,
    category: "Snacks",
    difficulty: "Medium",
    cuisine: "Gujarati",
    image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80",
    tags: ["dhokla", "snack", "steamed", "gujarati", "vegan"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fa1a1111-1111-1111-1111-111111111111",
    name: "Mumbai Vada Pav",
    description: "The ultimate Indian street food snack: a spiced deep-fried potato dumpling stuffed inside a soft bread roll with spicy chutneys.",
    ingredients: ["4 soft dinner rolls (pav)", "3 potatoes, boiled and mashed", "1 cup chickpea flour (besan)", "2 green chilies, minced", "3 cloves garlic, minced", "1/2 tsp mustard seeds", "1/4 tsp turmeric powder", "Oil for deep frying", "Spicy garlic dry chutney"],
    instructions: ["Heat 1 tsp oil, sauté mustard seeds, minced garlic, green chilies, and turmeric. Add to mashed potatoes with salt and mix.", "Shape potato mixture into round balls.", "Whisk besan with water, salt, and a pinch of turmeric into a thick batter.", "Dip potato balls in the batter to coat them, and deep-fry in hot oil until golden-brown. Drain on paper towels.", "Slice the pav rolls in half, spread green coriander chutney and sweet tamarind chutney inside.", "Place the hot fried potato vada inside and serve with fried salted green chilies."],
    preparation_time: 15,
    cooking_time: 15,
    servings: 4,
    category: "Snacks",
    difficulty: "Medium",
    cuisine: "Maharashtrian",
    image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80",
    tags: ["vada-pav", "street-food", "snack", "vegan"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fb2b2222-2222-2222-2222-222222222222",
    name: "Creamy Mango Lassi",
    description: "A rich and refreshing sweet drink blending ripe sweet mangoes with thick yogurt, flavored with cardamom.",
    ingredients: ["2 cups ripe mango pulp (alphonso preferred)", "2 cups thick yogurt (curd)", "1/2 cup cold milk", "4 tbsp sugar or honey", "1/4 tsp green cardamom powder", "Ice cubes"],
    instructions: ["In a blender, add the ripe mango pulp, yogurt, cold milk, and sugar.", "Blend until perfectly smooth and creamy.", "Add cardamom powder and ice cubes, and blend again for 10 seconds.", "Pour into tall glasses and garnish with chopped pistachios or saffron strands."],
    preparation_time: 5,
    cooking_time: 0,
    servings: 2,
    category: "Beverages",
    difficulty: "Easy",
    cuisine: "North Indian",
    image_url: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80",
    tags: ["mango", "lassi", "beverage", "sweet", "yogurt"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fc3c3333-3333-3333-3333-333333333333",
    name: "Authentic Masala Chai",
    description: "Traditional Indian spiced tea brewed with milk, black tea leaves, fresh ginger, and whole spices.",
    ingredients: ["2 cups water", "1 cup milk", "2 tbsp black tea leaves", "1 inch fresh ginger, crushed", "3 green cardamoms, crushed", "1 small cinnamon stick", "2 cloves", "2 tsp sugar"],
    instructions: ["In a saucepan, bring the water to a boil.", "Add the crushed ginger, cardamoms, cinnamon, and cloves. Simmer for 3 minutes to infuse the spices.", "Add black tea leaves and simmer for another 2 minutes.", "Pour in the milk and sugar, and bring the tea to a rolling boil.", "Lower the heat and let it simmer for 2 minutes until it turns a deep caramel color.", "Strain through a tea strainer into cups and serve hot."],
    preparation_time: 5,
    cooking_time: 10,
    servings: 2,
    category: "Beverages",
    difficulty: "Easy",
    cuisine: "Indian Traditional",
    image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    tags: ["chai", "tea", "spiced", "beverage", "hot"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fd4d4444-4444-4444-4444-444444444444",
    name: "Classic Palak Paneer",
    description: "Creamy cottage cheese cubes served in a vibrant, spiced, and velvety pureed spinach gravy.",
    ingredients: ["200g paneer, cubed", "1 large bunch fresh spinach (palak), cleaned", "1 onion, finely chopped", "1 tomato, chopped", "1 tsp ginger-garlic paste", "2 green chilies", "2 tbsp butter or oil", "2 tbsp fresh cream", "1/2 tsp garam masala", "Salt to taste"],
    instructions: ["Blanch spinach leaves and green chilies in boiling water for 2 minutes. Immediately transfer to cold water, then puree in a blender.", "Heat oil or butter in a pan, sauté the chopped onions until soft.", "Add ginger-garlic paste and tomatoes, cooking until the mixture becomes mushy.", "Add the spinach puree and salt, bringing it to a gentle simmer (do not boil too long to retain the green color).", "Add the paneer cubes and garam masala, simmer for 3 minutes.", "Stir in the fresh cream and serve hot with garlic naan or roti."],
    preparation_time: 10,
    cooking_time: 15,
    servings: 3,
    category: "Vegetarian",
    difficulty: "Easy",
    cuisine: "North Indian",
    image_url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80",
    tags: ["spinach", "paneer", "healthy", "vegetarian"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fe5e5555-5555-5555-5555-555555555555",
    name: "Punjabi Chana Masala",
    description: "Tangy and spicy chickpea curry slow-cooked with a bold spice blend in a savory tomato-onion sauce.",
    ingredients: ["1.5 cups chickpeas, soaked overnight", "1 large onion, finely chopped", "2 tomatoes, pureed", "1 tbsp ginger-garlic paste", "2 green chilies, slit", "1 tsp cumin seeds", "1 tbsp chana masala powder", "1/2 tsp turmeric powder", "2 tbsp oil", "Salt to taste"],
    instructions: ["Pressure cook the soaked chickpeas with salt until tender.", "Heat oil in a pot, add cumin seeds until they splutter.", "Sauté chopped onions and ginger-garlic paste until golden brown.", "Add tomato puree, green chilies, turmeric, chana masala, and salt. Sauté until oil separates.", "Add the cooked chickpeas along with their cooking water.", "Simmer on medium heat for 15 minutes, mashing a few chickpeas to thicken the gravy.", "Garnish with fresh chopped coriander and lemon juice."],
    preparation_time: 10,
    cooking_time: 20,
    servings: 4,
    category: "Vegan",
    difficulty: "Easy",
    cuisine: "Punjabi",
    image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    tags: ["chana", "vegan", "curry", "spicy", "chickpeas"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "ff6f6666-6666-6666-6666-666666666666",
    name: "Comforting Moong Dal Khichdi",
    description: "A comforting, nutritious, and easily digestible single-pot meal of yellow lentils and rice tempered with cumin and turmeric.",
    ingredients: ["1/2 cup yellow split moong dal", "1/2 cup Basmati rice", "1 tbsp ghee or oil", "1 tsp cumin seeds", "1/2 tsp turmeric powder", "1 pinch asafoetida (hing)", "1 tsp ginger, grated", "Salt to taste"],
    instructions: ["Wash the rice and split moong dal together, then soak in water for 15 minutes.", "Heat ghee or oil in a pressure cooker. Add cumin seeds and asafoetida.", "Add the grated ginger and sauté for 30 seconds.", "Add the drained rice and dal, turmeric powder, and salt. Stir for a minute.", "Pour in 4 cups of water. Close the lid and cook for 3-4 whistles until soft and mushy.", "Serve hot with a dollop of ghee and pickle."],
    preparation_time: 10,
    cooking_time: 15,
    servings: 3,
    category: "Healthy",
    difficulty: "Easy",
    cuisine: "Indian Traditional",
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    tags: ["khichdi", "healthy", "comfort-food", "lentils"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fa2a2222-2222-2222-2222-222222222222",
    name: "Maharashtrian Kanda Poha",
    description: "A quick and light breakfast snack made of flattened rice flakes sautéed with onions, peanuts, mustard seeds, and turmeric.",
    ingredients: ["2 cups thick poha (flattened rice)", "1 large onion, finely chopped", "2 tbsp raw peanuts", "1 tsp mustard seeds", "2 green chilies, chopped", "10 curry leaves", "1/2 tsp turmeric powder", "1 tbsp oil", "Lemon wedges and coriander for garnish"],
    instructions: ["Rinse the poha in a strainer under running water until soft but not mushy. Leave to drain.", "Heat oil in a pan, roast raw peanuts until crunchy, and set aside.", "In the same oil, add mustard seeds until they splutter, then add chopped onions, green chilies, and curry leaves. Sauté until onions are soft.", "Add turmeric powder and salt, and stir.", "Add the rinsed poha and roasted peanuts. Mix gently until well combined.", "Cover and steam on very low heat for 2 minutes. Garnish with chopped coriander and lemon juice."],
    preparation_time: 5,
    cooking_time: 8,
    servings: 2,
    category: "Quick Meals",
    difficulty: "Easy",
    cuisine: "Maharashtrian",
    image_url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80",
    tags: ["poha", "quick", "breakfast", "vegan"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fa3a3333-3333-3333-3333-333333333333",
    name: "Rajasthani Dal Baati Churma",
    description: "A traditional Rajasthani masterpiece consisting of baked whole wheat rolls (baati), mixed lentil curry (dal), and sweet crumbled wheat (churma).",
    ingredients: ["2 cups whole wheat flour (atta)", "1/2 cup semolina (rava)", "1/2 cup split pigeon peas (toor dal)", "1/4 cup split green moong dal", "1/2 cup ghee", "1 tsp mustard seeds", "1/2 tsp red chili powder", "Cardamom powder and powdered sugar for churma", "Salt to taste"],
    instructions: ["Mix wheat flour, rava, 4 tbsp ghee, and salt. Knead into a stiff dough. Shape into round balls (baatis).", "Bake the baatis in an oven at 375°F (190°C) or gas tandoor for 30 minutes, turning occasionally until golden-brown and hard. Soak in melted ghee.", "For the dal, boil toor dal and moong dal with salt and turmeric. Temper with ghee, mustard seeds, red chili powder, and cumin.", "For the churma, crush 2 baked baatis into fine crumbs. Mix with 2 tbsp ghee, powdered sugar, and cardamom powder.", "Serve the baatis hot, cracked open and drizzled with ghee, accompanied by the spiced dal and sweet churma."],
    preparation_time: 25,
    cooking_time: 35,
    servings: 3,
    category: "Traditional",
    difficulty: "Hard",
    cuisine: "Rajasthani",
    image_url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&q=80",
    tags: ["dal-baati", "rajasthani", "traditional", "ghee"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fa4a4444-4444-4444-4444-444444444444",
    name: "Indo-Chinese Gobi Manchurian",
    description: "An internationally popular Indo-Chinese fusion dish of crispy cauliflower florets tossed in a sweet, spicy, and tangy soy-garlic sauce.",
    ingredients: ["1 cauliflower, cut into florets", "1/2 cup cornstarch", "1/4 cup all-purpose flour", "2 tbsp garlic, finely chopped", "1 tbsp ginger, finely chopped", "3 spring onions, chopped", "2 tbsp soy sauce", "2 tbsp chili sauce", "1 tbsp tomato ketchup", "Oil for deep frying", "Salt and pepper to taste"],
    instructions: ["Whisk cornstarch, flour, salt, pepper, and water into a smooth, thick batter.", "Dip cauliflower florets into the batter and deep-fry in hot oil until golden-brown and crispy. Drain.", "Heat 1 tablespoon of oil in a pan. Sauté the chopped garlic, ginger, and spring onions.", "Stir in the soy sauce, chili sauce, tomato ketchup, and a splash of water, simmering for a minute.", "Toss the fried cauliflower florets in the sauce until fully coated.", "Garnish with spring onion tops and serve immediately."],
    preparation_time: 15,
    cooking_time: 15,
    servings: 3,
    category: "International",
    difficulty: "Medium",
    cuisine: "Indo-Chinese",
    image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    tags: ["indo-chinese", "manchurian", "vegan", "spicy"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  }
];

// Local state for in-memory DB when Supabase is not configured
let fallbackRecipes = [...PREDEFINED_RECIPES];
let fallbackCollections = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Healthy Recipes', description: 'Nutritious, wholesome, and delicious meals optimized for your health and vitality.' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Quick Recipes', description: 'Delectable meals ready in under 30 minutes for busy weekdays.' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Chef Picks', description: 'Hand-picked culinary masterpieces crafted by our professional test kitchen experts.' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Trending Recipes', description: 'The absolute favorites being shared, printed, and cooked around the world right now.' }
];
let fallbackCollectionRecipes = [
  { collection_id: '11111111-1111-1111-1111-111111111111', recipe_id: 'ff6f6666-6666-6666-6666-666666666666' },
  { collection_id: '11111111-1111-1111-1111-111111111111', recipe_id: 'fd4d4444-4444-4444-4444-444444444444' },
  { collection_id: '11111111-1111-1111-1111-111111111111', recipe_id: 'f1b1b111-1111-1111-1111-111111111111' },
  { collection_id: '22222222-2222-2222-2222-222222222222', recipe_id: 'fa2a2222-2222-2222-2222-222222222222' },
  { collection_id: '22222222-2222-2222-2222-222222222222', recipe_id: 'fa4a4444-4444-4444-4444-444444444444' },
  { collection_id: '22222222-2222-2222-2222-222222222222', recipe_id: 'fb2b2222-2222-2222-2222-222222222222' },
  { collection_id: '33333333-3333-3333-3333-333333333333', recipe_id: 'f3b3b333-3333-3333-3333-333333333333' },
  { collection_id: '33333333-3333-3333-3333-333333333333', recipe_id: 'f6b6b666-6666-6666-6666-666666666666' },
  { collection_id: '33333333-3333-3333-3333-333333333333', recipe_id: 'fa3a3333-3333-3333-3333-333333333333' },
  { collection_id: '44444444-4444-4444-4444-444444444444', recipe_id: 'f4b4b444-4444-4444-4444-444444444444' },
  { collection_id: '44444444-4444-4444-4444-444444444444', recipe_id: 'f7b7b777-7777-7777-7777-777777777777' },
  { collection_id: '44444444-4444-4444-4444-444444444444', recipe_id: 'f5b5b555-5555-5555-5555-555555555555' }
];

// Helper to mock chained Supabase query builder responses
const mockQueryChain = (data: any, error: any = null) => {
  const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
  const promise = Promise.resolve({ data, error, count }) as any;
  const chainFn = () => mockQueryChain(data, error);
  
  promise.select = chainFn;
  promise.order = chainFn;
  promise.ilike = chainFn;
  promise.or = chainFn;
  
  promise.eq = (column: string, value: any) => {
    if (Array.isArray(data)) {
      const filtered = data.filter(item => item[column] === value);
      return mockQueryChain(filtered, error);
    }
    return mockQueryChain(data, error);
  };
  
  promise.range = (from: number, to: number) => {
    if (Array.isArray(data)) {
      const sliced = data.slice(from, to + 1);
      return mockQueryChain(sliced, error);
    }
    return mockQueryChain(data, error);
  };
  
  promise.limit = (lim: number) => {
    if (Array.isArray(data)) {
      const sliced = data.slice(0, lim);
      return mockQueryChain(sliced, error);
    }
    return mockQueryChain(data, error);
  };
  
  promise.single = () => {
    const singleData = Array.isArray(data) ? data[0] || null : data;
    return Promise.resolve({ data: singleData, error, count: singleData ? 1 : 0 });
  };
  
  promise.maybeSingle = () => {
    const singleData = Array.isArray(data) ? data[0] || null : data;
    return Promise.resolve({ data: singleData, error, count: singleData ? 1 : 0 });
  };
  
  return promise;
};

// Create safe fallback mock client if credentials are not ready
const createFallbackClient = () => {
  console.warn("Supabase credentials not configured in .env.local. Running in fallback mode.");
  return {
    from: (table: string) => {
      if (table === "recipes") {
        return {
          select: () => mockQueryChain(fallbackRecipes),
          insert: (data: any) => {
            const arr = Array.isArray(data) ? data : [data];
            const inserted = arr.map(item => {
              const row = {
                id: crypto.randomUUID(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                ...item
              };
              fallbackRecipes.push(row);
              return row;
            });
            return mockQueryChain(Array.isArray(data) ? inserted : inserted[0]);
          },
          update: (data: any) => {
            const updateChain = mockQueryChain(data);
            updateChain.eq = (col: string, val: any) => {
              if (col === "id") {
                const idx = fallbackRecipes.findIndex(r => r.id === val);
                if (idx !== -1) {
                  fallbackRecipes[idx] = { ...fallbackRecipes[idx], ...data, updated_at: new Date().toISOString() };
                }
              }
              return mockQueryChain(data);
            };
            return updateChain;
          },
          delete: () => {
            const deleteChain = mockQueryChain(null);
            deleteChain.eq = (col: string, val: any) => {
              if (col === "id") {
                fallbackRecipes = fallbackRecipes.filter(r => r.id !== val);
              }
              return mockQueryChain(null);
            };
            return deleteChain;
          },
        };
      }
      
      if (table === "collections") {
        return {
          select: () => mockQueryChain(fallbackCollections),
          insert: (data: any) => {
            const arr = Array.isArray(data) ? data : [data];
            const inserted = arr.map(item => {
              const row = {
                id: crypto.randomUUID(),
                created_at: new Date().toISOString(),
                ...item
              };
              fallbackCollections.push(row);
              return row;
            });
            return mockQueryChain(Array.isArray(data) ? inserted : inserted[0]);
          },
          update: (data: any) => {
            const updateChain = mockQueryChain(data);
            updateChain.eq = (col: string, val: any) => {
              if (col === "id") {
                const idx = fallbackCollections.findIndex(c => c.id === val);
                if (idx !== -1) {
                  fallbackCollections[idx] = { ...fallbackCollections[idx], ...data };
                }
              }
              return mockQueryChain(data);
            };
            return updateChain;
          },
          delete: () => {
            const deleteChain = mockQueryChain(null);
            deleteChain.eq = (col: string, val: any) => {
              if (col === "id") {
                fallbackCollections = fallbackCollections.filter(c => c.id !== val);
              }
              return mockQueryChain(null);
            };
            return deleteChain;
          },
        };
      }
      
      if (table === "collection_recipes") {
        return {
          select: () => mockQueryChain(fallbackCollectionRecipes),
          insert: (data: any) => {
            const arr = Array.isArray(data) ? data : [data];
            const inserted = arr.map(item => {
              const row = {
                id: crypto.randomUUID(),
                created_at: new Date().toISOString(),
                ...item
              };
              fallbackCollectionRecipes.push(row);
              return row;
            });
            return mockQueryChain(Array.isArray(data) ? inserted : inserted[0]);
          },
          update: (data: any) => mockQueryChain(data),
          delete: () => {
            const deleteChain = mockQueryChain(null);
            deleteChain.eq = (col: string, val: any) => {
              if (col === "collection_id") {
                fallbackCollectionRecipes = fallbackCollectionRecipes.filter(cr => cr.collection_id !== val);
                const nextChain = mockQueryChain(null);
                nextChain.eq = (col2: string, val2: any) => {
                  if (col2 === "recipe_id") {
                    fallbackCollectionRecipes = fallbackCollectionRecipes.filter(
                      cr => !(cr.collection_id === val && cr.recipe_id === val2)
                    );
                  }
                  return mockQueryChain(null);
                };
                return nextChain;
              }
              if (col === "recipe_id") {
                fallbackCollectionRecipes = fallbackCollectionRecipes.filter(cr => cr.recipe_id !== val);
              }
              return mockQueryChain(null);
            };
            return deleteChain;
          },
        };
      }
      
      return {
        select: () => mockQueryChain([]),
        insert: (data: any) => mockQueryChain(data),
        update: (data: any) => mockQueryChain(data),
        delete: () => mockQueryChain(null),
      };
    },
    storage: {
      from: (bucket: string) => ({
        upload: () => Promise.resolve({ data: { path: "fallback.png" }, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `/fallback-image.png` } }),
        remove: () => Promise.resolve({ error: null }),
      }),
    },
  } as any;
};

// Export normal browser-safe client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient();

// Export admin/service-role client for backend API routes
export const supabaseAdmin = isSupabaseConfigured() && supabaseServiceKey && !supabaseServiceKey.includes("your-service-role-key")
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase;
