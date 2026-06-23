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
    name: "Fluffy Blueberry Buttermilk Pancakes",
    description: "Golden, thick, and fluffy buttermilk pancakes bursting with fresh blueberries, served with warm maple syrup.",
    ingredients: ["2 cups all-purpose flour", "2 tsp baking powder", "1 tsp baking soda", "1/2 tsp salt", "2 tbsp sugar", "2 eggs", "2 cups buttermilk", "4 tbsp melted butter", "1 cup fresh blueberries", "Maple syrup for serving"],
    instructions: ["In a large bowl, whisk together flour, baking powder, baking soda, salt, and sugar.", "In a separate bowl, beat the eggs, then whisk in the buttermilk and melted butter.", "Pour the wet ingredients into the dry ingredients and stir gently until just combined (some lumps are okay).", "Heat a lightly greased griddle or frying pan over medium-high heat.", "Pour 1/4 cup of batter for each pancake, and sprinkle a few blueberries on top.", "Cook until bubbles form on the surface, then flip and cook until golden brown on the other side.", "Serve hot with maple syrup and extra blueberries."],
    preparation_time: 10,
    cooking_time: 15,
    servings: 4,
    category: "Breakfast",
    difficulty: "Easy",
    cuisine: "American",
    image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    tags: ["pancakes", "breakfast", "sweet", "blueberries"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f2b2b222-2222-2222-2222-222222222222",
    name: "Avocado Toast with Poached Egg",
    description: "Artisanal sourdough toast topped with creamy mashed avocado, perfectly poached eggs, and a sprinkle of chili flakes.",
    ingredients: ["2 slices artisanal sourdough bread", "1 ripe Hass avocado", "1 tbsp fresh lemon juice", "2 fresh eggs", "1 tsp white vinegar", "Salt and black pepper to taste", "1/2 tsp red chili flakes", "Microgreens for garnish"],
    instructions: ["Toast the sourdough bread slices until golden and crisp.", "In a small bowl, mash the avocado with lemon juice, salt, and pepper.", "Bring a pot of water to a gentle simmer and add vinegar. Swirl the water to create a vortex, and crack an egg into the center. Poach for 3 minutes, then remove with a slotted spoon.", "Spread the mashed avocado evenly over the toasted bread.", "Place one poached egg on top of each slice.", "Season with chili flakes, cracked black pepper, and garnish with microgreens."],
    preparation_time: 5,
    cooking_time: 5,
    servings: 2,
    category: "Breakfast",
    difficulty: "Easy",
    cuisine: "International",
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    tags: ["avocado", "toast", "egg", "healthy"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f3b3b333-3333-3333-3333-333333333333",
    name: "Mediterranean Chickpea Salad",
    description: "A vibrant and refreshing salad packed with chickpeas, crisp cucumbers, juicy cherry tomatoes, kalamata olives, and feta cheese, tossed in a zesty lemon-herb vinaigrette.",
    ingredients: ["2 cans (15 oz each) chickpeas, drained and rinsed", "1 English cucumber, diced", "1 pint cherry tomatoes, halved", "1/2 red onion, finely chopped", "1/2 cup Kalamata olives, pitted and halved", "1/2 cup crumbled feta cheese", "1/4 cup extra virgin olive oil", "2 tbsp fresh lemon juice", "1 tsp dried oregano", "Salt and pepper to taste"],
    instructions: ["In a large bowl, combine the chickpeas, cucumber, cherry tomatoes, red onion, Kalamata olives, and feta cheese.", "In a small jar, whisk together the olive oil, lemon juice, dried oregano, salt, and pepper to make the dressing.", "Pour the dressing over the salad and toss well to combine.", "Let the salad sit in the refrigerator for at least 15 minutes before serving to let the flavors meld."],
    preparation_time: 15,
    cooking_time: 0,
    servings: 4,
    category: "Lunch",
    difficulty: "Easy",
    cuisine: "Mediterranean",
    image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    tags: ["salad", "chickpeas", "fresh", "gluten-free"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f4b4b444-4444-4444-4444-444444444444",
    name: "Caprese Chicken Panini",
    description: "Grilled chicken breast, fresh mozzarella, ripe tomatoes, and sweet basil pesto pressed between crispy focaccia bread.",
    ingredients: ["2 panini buns or focaccia bread", "2 grilled chicken breasts, sliced", "1 ripe tomato, sliced", "4 slices fresh mozzarella cheese", "2 tbsp basil pesto", "1 tbsp balsamic glaze", "1 tbsp olive oil"],
    instructions: ["Slice the bread or panini buns in half.", "Spread 1 tablespoon of basil pesto on the bottom slice of each sandwich.", "Layer the sliced grilled chicken, fresh mozzarella cheese, and tomato slices.", "Drizzle the balsamic glaze over the tomatoes and cover with the top bread slice.", "Brush the outside of the sandwiches lightly with olive oil.", "Place in a panini press and cook for 5-8 minutes until the cheese is melted and the bread is toasted."],
    preparation_time: 10,
    cooking_time: 10,
    servings: 2,
    category: "Lunch",
    difficulty: "Easy",
    cuisine: "Italian",
    image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    tags: ["sandwich", "panini", "chicken", "caprese", "pesto"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f5b5b555-5555-5555-5555-555555555555",
    name: "Pan-Seared Salmon with Asparagus",
    description: "Crispy skin salmon fillet seasoned with garlic herb butter, paired with fresh lemon-infused grilled asparagus.",
    ingredients: ["2 fresh salmon fillets (6 oz each)", "1 bunch fresh asparagus, ends trimmed", "2 tbsp butter", "2 cloves garlic, minced", "1 tbsp fresh dill, chopped", "1 lemon, sliced", "2 tbsp olive oil", "Salt and freshly cracked black pepper"],
    instructions: ["Pat salmon fillets dry with paper towels. Season both sides with salt and pepper.", "Heat 1 tablespoon of olive oil in a large skillet over medium-high heat. Place salmon skin-side down and sear for 4-5 minutes until skin is crispy. Flip and cook for another 3-4 minutes.", "In a separate pan, heat the remaining olive oil and cook the asparagus for 5-7 minutes until tender-crisp. Season with salt, pepper, and lemon juice.", "During the last 2 minutes of cooking the salmon, add butter, minced garlic, and fresh dill to the skillet. Spoon the melted garlic dill butter over the salmon fillets.", "Serve the salmon hot with grilled asparagus and lemon slices."],
    preparation_time: 10,
    cooking_time: 15,
    servings: 2,
    category: "Dinner",
    difficulty: "Medium",
    cuisine: "International",
    image_url: "https://images.unsplash.com/photo-1485921325814-a50431496cc9?auto=format&fit=crop&w=800&q=80",
    tags: ["salmon", "fish", "dinner", "keto", "low-carb"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f6b6b666-6666-6666-6666-666666666666",
    name: "Classic Beef Stroganoff",
    description: "Tender strips of beef and sliced mushrooms sautéed in a rich, creamy sour cream sauce, served over hot egg noodles.",
    ingredients: ["1 lb beef sirloin, cut into thin strips", "8 oz cremini mushrooms, sliced", "1 medium onion, chopped", "2 cloves garlic, minced", "2 tbsp butter", "1 tbsp all-purpose flour", "1 cup beef broth", "1/2 cup sour cream", "1 tbsp Worcestershire sauce", "12 oz egg noodles", "Fresh parsley for garnish"],
    instructions: ["Cook the egg noodles according to package instructions. Drain and toss with a little butter to prevent sticking.", "In a large skillet over high heat, melt 1 tablespoon of butter and sear the beef strips for 1-2 minutes per side. Remove beef from the pan and set aside.", "Reduce heat to medium. Add the remaining butter, onion, mushrooms, and garlic. Sauté for 5-7 minutes until tender.", "Sprinkle flour over the vegetables and stir to combine. Cook for 1 minute.", "Slowly pour in the beef broth and Worcestershire sauce, scraping any browned bits from the bottom of the pan. Simmer for 5 minutes until thickened.", "Stir in the sour cream and return the beef (with its juices) to the skillet. Cook for another 2-3 minutes until heated through (do not boil).", "Serve the creamy beef and mushroom mixture over the egg noodles and garnish with chopped parsley."],
    preparation_time: 15,
    cooking_time: 20,
    servings: 4,
    category: "Dinner",
    difficulty: "Medium",
    cuisine: "Traditional",
    image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
    tags: ["beef", "dinner", "mushrooms", "comfort-food"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f7b7b777-7777-7777-7777-777777777777",
    name: "Decadent Chocolate Lava Cake",
    description: "Rich chocolate cakes with a luscious, warm molten chocolate center, dusted with powdered sugar.",
    ingredients: ["1/2 cup high-quality semi-sweet chocolate chips", "1/4 cup unsalted butter", "1 large egg", "1 egg yolk", "2 tbsp granulated sugar", "1 tbsp all-purpose flour", "1 pinch salt", "Powdered sugar and fresh raspberries for serving"],
    instructions: ["Preheat oven to 425°F (218°C). Grease two ramekins and dust them with cocoa powder.", "In a microwave-safe bowl, melt the chocolate chips and butter together in 30-second bursts, stirring until smooth.", "In a separate bowl, whisk the egg, egg yolk, sugar, and salt together until pale and thick.", "Fold the melted chocolate mixture and flour into the egg mixture until just combined.", "Divide the batter evenly between the prepared ramekins.", "Bake for 12-14 minutes until the edges are firm but the center is still soft.", "Let cool for 1 minute, then carefully invert onto dessert plates. Dust with powdered sugar and serve hot with fresh raspberries."],
    preparation_time: 15,
    cooking_time: 13,
    servings: 2,
    category: "Dessert",
    difficulty: "Hard",
    cuisine: "International",
    image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    tags: ["chocolate", "cake", "dessert", "lava", "sweet"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f8b8b888-8888-8888-8888-888888888888",
    name: "Classic New York Cheesecake",
    description: "Rich, dense, and creamy cheesecake with a buttery graham cracker crust, topped with sweet strawberry compote.",
    ingredients: ["1.5 cups graham cracker crumbs", "1/4 cup melted butter", "24 oz cream cheese, softened", "1 cup granulated sugar", "1 tsp vanilla extract", "3 large eggs", "1/2 cup sour cream", "1 cup strawberry compote for topping"],
    instructions: ["Preheat oven to 325°F (163°C). Mix graham cracker crumbs and melted butter, then press into the bottom of a 9-inch springform pan. Bake for 8 minutes and let cool.", "In a large bowl, beat the softened cream cheese and sugar until perfectly smooth.", "Add vanilla extract and then add eggs one at a time, mixing on low speed until just incorporated.", "Stir in the sour cream gently.", "Pour the filling over the cooled crust.", "Bake for 55-60 minutes until the edges are set but the center still jiggles slightly. Turn off the oven, crack the door, and let the cheesecake cool inside the oven for 1 hour.", "Chill in the refrigerator for at least 4 hours. Top with strawberry compote before slicing."],
    preparation_time: 25,
    cooking_time: 60,
    servings: 8,
    category: "Dessert",
    difficulty: "Hard",
    cuisine: "Traditional",
    image_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
    tags: ["cheesecake", "dessert", "strawberry", "sweet"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "f9b9b999-9999-9999-9999-999999999999",
    name: "Garlic Parmesan Roasted Chickpeas",
    description: "Crunchy, oven-roasted chickpeas tossed in olive oil, garlic powder, and fresh parmesan cheese.",
    ingredients: ["2 cans (15 oz each) chickpeas, drained and rinsed", "2 tbsp olive oil", "1 tsp garlic powder", "1/2 tsp onion powder", "1/4 cup grated parmesan cheese", "Salt and pepper to taste"],
    instructions: ["Preheat oven to 400°F (204°C). Pat the chickpeas completely dry with paper towels (moisture prevents crunchiness).", "In a medium bowl, toss the chickpeas with olive oil, garlic powder, onion powder, salt, and pepper.", "Spread the chickpeas in a single layer on a parchment-lined baking sheet.", "Roast for 20-25 minutes, tossing halfway through, until crispy.", "Remove from oven, immediately toss with grated parmesan cheese, and let cool slightly before eating."],
    preparation_time: 5,
    cooking_time: 25,
    servings: 4,
    category: "Snacks",
    difficulty: "Easy",
    cuisine: "American",
    image_url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
    tags: ["snack", "chickpeas", "crunchy", "savory"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fa1a1111-1111-1111-1111-111111111111",
    name: "Crispy Sweet Potato Fries",
    description: "Oven-baked sweet potato wedges seasoned with paprika and sea salt, served crispy on the outside.",
    ingredients: ["2 large sweet potatoes, cut into thin wedges", "2 tbsp cornstarch", "2 tbsp olive oil", "1 tsp smoked paprika", "1/2 tsp garlic powder", "1/2 tsp sea salt"],
    instructions: ["Soak the cut sweet potatoes in cold water for 30 minutes to release starch. Drain and pat dry.", "Preheat oven to 425°F (218°C) and grease a baking sheet.", "Toss the sweet potato wedges with cornstarch in a large zip-top bag to coat them lightly.", "Drizzle with olive oil, smoked paprika, and garlic powder, and toss well.", "Spread the wedges in a single layer on the baking sheet, ensuring they do not touch.", "Bake for 20 minutes, flipping halfway through, until crispy. Sprinkle with sea salt immediately after baking."],
    preparation_time: 15,
    cooking_time: 20,
    servings: 3,
    category: "Snacks",
    difficulty: "Easy",
    cuisine: "American",
    image_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
    tags: ["fries", "snack", "sweet-potato", "crispy"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fb2b2222-2222-2222-2222-222222222222",
    name: "Iced Matcha Green Tea Latte",
    description: "Wholesome and refreshing iced green tea latte made with ceremonial grade matcha powder, oat milk, and honey.",
    ingredients: ["1.5 tsp ceremonial grade matcha powder", "2 tbsp warm water (not boiling)", "1 cup oat milk", "1 tbsp honey or maple syrup", "1 cup ice cubes"],
    instructions: ["Sift the matcha powder into a small bowl to remove lumps.", "Add the warm water and whisk vigorously using a bamboo whisk (or small wire whisk) in a W-motion until frothy and smooth.", "Drizzle honey or maple syrup into the matcha mixture and stir.", "Fill a tall glass with ice cubes and pour in the oat milk.", "Slowly pour the whisked matcha over the oat milk to create a beautiful layered effect. Stir before drinking."],
    preparation_time: 5,
    cooking_time: 0,
    servings: 1,
    category: "Beverages",
    difficulty: "Easy",
    cuisine: "Japanese",
    image_url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80",
    tags: ["matcha", "latte", "beverage", "iced", "healthy"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fc3c3333-3333-3333-3333-333333333333",
    name: "Fresh Mint Mojito Mocktail",
    description: "A refreshing, non-alcoholic Cuban classic loaded with fresh mint, lime juice, and sparkling soda water.",
    ingredients: ["10 fresh mint leaves", "1/2 lime, cut into wedges", "2 tbsp simple syrup", "1 cup club soda", "Crushed ice"],
    instructions: ["In a sturdy glass, combine the mint leaves and lime wedges.", "Muddle them gently to release the lime juice and aromatic oils from the mint (do not shred the leaves).", "Add simple syrup to taste.", "Fill the glass with crushed ice.", "Top off with club soda or sparkling water, stir gently, and garnish with a mint sprig and lime round."],
    preparation_time: 5,
    cooking_time: 0,
    servings: 1,
    category: "Beverages",
    difficulty: "Easy",
    cuisine: "Cuban",
    image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    tags: ["mojito", "mocktail", "beverage", "mint", "lime"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fd4d4444-4444-4444-4444-444444444444",
    name: "Creamy Spinach Ricotta Stuffed Shells",
    description: "Jumbo pasta shells stuffed with a savory mixture of spinach, ricotta, mozzarella, and parmesan cheese, baked in marinara sauce.",
    ingredients: ["12 jumbo pasta shells", "10 oz fresh spinach, wilted and squeezed dry", "15 oz ricotta cheese", "1.5 cups shredded mozzarella cheese, divided", "1/2 cup grated parmesan cheese, divided", "1 egg", "2 cups marinara sauce", "1 tsp Italian seasoning", "Salt and pepper to taste"],
    instructions: ["Preheat oven to 375°F (190°C). Cook the jumbo shells in boiling salted water for 9 minutes. Drain and cool.", "In a medium bowl, mix together the wilted spinach, ricotta, 1 cup of mozzarella, 1/4 cup of parmesan, egg, Italian seasoning, salt, and pepper.", "Spread 1 cup of marinara sauce on the bottom of a 9x13 baking dish.", "Spoon the spinach cheese mixture into each pasta shell, placing them stuffed-side up in the baking dish.", "Pour the remaining marinara sauce over the shells and sprinkle with the remaining mozzarella and parmesan cheese.", "Cover with foil and bake for 25 minutes. Uncover and bake for an additional 5 minutes until the cheese is bubbly and golden."],
    preparation_time: 20,
    cooking_time: 30,
    servings: 4,
    category: "Vegetarian",
    difficulty: "Medium",
    cuisine: "Italian",
    image_url: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80",
    tags: ["vegetarian", "pasta", "spinach", "cheese", "italian"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fe5e5555-5555-5555-5555-555555555555",
    name: "Thai Green Curry with Tofu",
    description: "A spicy and aromatic Thai coconut curry loaded with crispy baked tofu, bamboo shoots, bell peppers, and fresh basil.",
    ingredients: ["1 block extra firm tofu, pressed and cubed", "1 tbsp soy sauce", "1 can (13.5 oz) coconut milk", "2 tbsp Thai green curry paste", "1 bell pepper, sliced", "1/2 cup bamboo shoots, drained", "1 cup fresh snap peas", "1 tbsp maple syrup", "1 tbsp lime juice", "Fresh Thai basil leaves"],
    instructions: ["Preheat oven to 400°F (204°C). Toss tofu cubes with soy sauce, place on a baking sheet, and bake for 20 minutes until crispy.", "In a large pot, heat 2 tablespoons of coconut milk over medium heat. Add the green curry paste and sauté for 1-2 minutes until fragrant.", "Gradually pour in the remaining coconut milk and stir until the paste is completely dissolved.", "Add the bell pepper, bamboo shoots, and snap peas. Simmer for 5-7 minutes until the vegetables are tender.", "Stir in the baked tofu, maple syrup, and lime juice. Cook for 2 more minutes to heat the tofu through.", "Turn off heat, stir in a handful of fresh Thai basil leaves, and serve hot over jasmine rice."],
    preparation_time: 15,
    cooking_time: 15,
    servings: 3,
    category: "Vegan",
    difficulty: "Medium",
    cuisine: "Thai",
    image_url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80",
    tags: ["vegan", "curry", "tofu", "thai", "spicy"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "ff6f6666-6666-6666-6666-666666666666",
    name: "Lemon Herb Grilled Chicken Breast",
    description: "Tender, juicy grilled chicken breasts marinated in olive oil, garlic, lemon zest, rosemary, and thyme.",
    ingredients: ["2 boneless, skinless chicken breasts", "3 tbsp olive oil", "2 cloves garlic, minced", "Zest and juice of 1 lemon", "1 tbsp fresh rosemary, chopped", "1 tbsp fresh thyme, chopped", "Salt and pepper to taste"],
    instructions: ["Place chicken breasts between plastic wrap and gently pound them to an even thickness of about 1/2 inch.", "In a shallow dish, whisk together the olive oil, minced garlic, lemon zest, lemon juice, rosemary, thyme, salt, and pepper to make the marinade.", "Add the chicken, coating it well. Marinate in the refrigerator for at least 30 minutes.", "Preheat a grill or grill pan to medium-high heat. Brush with a little oil.", "Grill the chicken for 5-6 minutes per side, or until the internal temperature reaches 165°F (74°C).", "Let the chicken rest for 5 minutes before slicing to retain the juices."],
    preparation_time: 10,
    cooking_time: 12,
    servings: 2,
    category: "Healthy",
    difficulty: "Easy",
    cuisine: "American",
    image_url: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
    tags: ["healthy", "chicken", "grilled", "high-protein", "low-carb"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fa2a2222-2222-2222-2222-222222222222",
    name: "15-Minute Garlic Butter Shrimp",
    description: "Juicy, plump shrimp sautéed in a rich garlic butter sauce, finished with fresh lemon juice and chopped parsley.",
    ingredients: ["1 lb large shrimp, peeled and deveined", "4 tbsp butter", "4 cloves garlic, minced", "1 tbsp olive oil", "Juice of 1/2 lemon", "2 tbsp fresh parsley, chopped", "Salt and red pepper flakes to taste"],
    instructions: ["Pat the shrimp dry with paper towels and season with salt.", "In a large skillet, heat the olive oil and 2 tablespoons of butter over medium-high heat.", "Add the shrimp in a single layer and sear for 2 minutes without moving, then flip.", "Add the minced garlic and red pepper flakes, cooking for 1 minute until fragrant.", "Add the remaining butter and lemon juice, stirring to coat the shrimp as the butter melts.", "Cook for 1-2 more minutes until the shrimp are pink and cooked through.", "Garnish with fresh parsley and serve hot with crusty bread."],
    preparation_time: 5,
    cooking_time: 10,
    servings: 2,
    category: "Quick Meals",
    difficulty: "Easy",
    cuisine: "International",
    image_url: "https://images.unsplash.com/photo-1559742811-82428b49223e?auto=format&fit=crop&w=800&q=80",
    tags: ["quick", "shrimp", "seafood", "garlic-butter", "15-minute"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fa3a3333-3333-3333-3333-333333333333",
    name: "Authentic Italian Spaghetti Carbonara",
    description: "Classic Roman pasta dish made with eggs, hard cheese, cured pork, and freshly cracked black pepper.",
    ingredients: ["12 oz spaghetti", "4 oz guanciale or pancetta, diced", "3 large eggs", "1 cup Pecorino Romano cheese, grated", "Salt and lots of freshly cracked black pepper"],
    instructions: ["Bring a large pot of salted water to a boil and cook spaghetti until al dente.", "While pasta cooks, heat a large skillet over medium heat and cook the diced guanciale until crispy. Remove skillet from heat.", "In a bowl, whisk together the eggs and Pecorino Romano cheese until thick. Add plenty of black pepper.", "Drain the pasta, reserving 1 cup of pasta water.", "Add the hot pasta directly to the skillet with the guanciale, and toss to coat in the rendered fat. Let cool for 30 seconds.", "Pour the egg-cheese mixture over the pasta, tossing rapidly to create a creamy sauce. Add splashes of warm pasta water if the sauce is too thick (do not cook over heat, or the eggs will scramble).", "Serve immediately with extra cheese and black pepper."],
    preparation_time: 10,
    cooking_time: 15,
    servings: 3,
    category: "Traditional",
    difficulty: "Medium",
    cuisine: "Italian",
    image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80",
    tags: ["carbonara", "pasta", "traditional", "italian", "classic"],
    created_at: "2026-06-23T00:00:00Z",
    updated_at: "2026-06-23T00:00:00Z"
  },
  {
    id: "fa4a4444-4444-4444-4444-444444444444",
    name: "Indian Butter Chicken (Murgh Makhani)",
    description: "Tender tandoori-spiced chicken pieces simmered in a silky, spiced, buttery tomato cream sauce.",
    ingredients: ["1.5 lbs chicken thighs, cut into bite-sized pieces", "1 cup plain yogurt", "2 tbsp lemon juice", "2 tbsp garam masala, divided", "1 tbsp turmeric", "3 tbsp butter", "1 large onion, finely chopped", "1 tbsp ginger-garlic paste", "1 can (14 oz) tomato puree", "1 cup heavy cream", "Fresh cilantro for garnish"],
    instructions: ["In a large bowl, combine yogurt, lemon juice, 1 tablespoon garam masala, turmeric, salt, and chicken. Marinate for at least 1 hour.", "Heat 1 tablespoon of butter in a large skillet over medium-high heat. Sear the chicken pieces until browned (about 3-4 minutes per side). Remove chicken from skillet and set aside.", "Melt the remaining butter in the same skillet. Sauté the chopped onion for 5 minutes until soft. Stir in the ginger-garlic paste and cook for 1 minute.", "Add the tomato puree and the remaining garam masala, simmering for 10 minutes.", "Pour in the heavy cream and return the chicken to the pan, simmering for an additional 8-10 minutes until chicken is tender and sauce is rich.", "Garnish with fresh cilantro and serve with warm garlic naan or basmati rice."],
    preparation_time: 20,
    cooking_time: 25,
    servings: 4,
    category: "International",
    difficulty: "Medium",
    cuisine: "Indian",
    image_url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    tags: ["butter-chicken", "curry", "indian", "international", "spicy"],
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
  { collection_id: '11111111-1111-1111-1111-111111111111', recipe_id: 'f2b2b222-2222-2222-2222-222222222222' },
  { collection_id: '11111111-1111-1111-1111-111111111111', recipe_id: 'f3b3b333-3333-3333-3333-333333333333' },
  { collection_id: '11111111-1111-1111-1111-111111111111', recipe_id: 'f5b5b555-5555-5555-5555-555555555555' },
  { collection_id: '11111111-1111-1111-1111-111111111111', recipe_id: 'ff6f6666-6666-6666-6666-666666666666' },
  { collection_id: '22222222-2222-2222-2222-222222222222', recipe_id: 'fa2a2222-2222-2222-2222-222222222222' },
  { collection_id: '22222222-2222-2222-2222-222222222222', recipe_id: 'fc3c3333-3333-3333-3333-333333333333' },
  { collection_id: '22222222-2222-2222-2222-222222222222', recipe_id: 'f9b9b999-9999-9999-9999-999999999999' },
  { collection_id: '33333333-3333-3333-3333-333333333333', recipe_id: 'fa3a3333-3333-3333-3333-333333333333' },
  { collection_id: '33333333-3333-3333-3333-333333333333', recipe_id: 'fa4a4444-4444-4444-4444-444444444444' },
  { collection_id: '33333333-3333-3333-3333-333333333333', recipe_id: 'f7b7b777-7777-7777-7777-777777777777' },
  { collection_id: '44444444-4444-4444-4444-444444444444', recipe_id: 'fe5e5555-5555-5555-5555-555555555555' },
  { collection_id: '44444444-4444-4444-4444-444444444444', recipe_id: 'f1b1b111-1111-1111-1111-111111111111' }
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
