import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { recipeSchema } from "@/lib/zod-schemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const cuisine = searchParams.get("cuisine") || "";
    const maxPrepTime = searchParams.get("maxPrepTime") ? parseInt(searchParams.get("maxPrepTime")!) : null;
    const maxCookTime = searchParams.get("maxCookTime") ? parseInt(searchParams.get("maxCookTime")!) : null;

    let query = supabase.from("recipes").select("*");

    // Implement filters
    if (category) {
      query = query.eq("category", category);
    }
    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }
    if (cuisine) {
      query = query.eq("cuisine", cuisine);
    }
    if (maxPrepTime !== null && !isNaN(maxPrepTime)) {
      query = query.lte("preparation_time", maxPrepTime);
    }
    if (maxCookTime !== null && !isNaN(maxCookTime)) {
      query = query.lte("cooking_time", maxCookTime);
    }

    // Execute query
    let { data: recipes, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!recipes) recipes = [];

    // Filter recipes client-side/server-side if search query is provided
    // (Doing text search across multiple columns because supabase text search requires tsvector configuration)
    if (search) {
      const searchLower = search.toLowerCase();
      recipes = recipes.filter((recipe: any) => {
        const nameMatch = recipe.name?.toLowerCase().includes(searchLower);
        const descMatch = recipe.description?.toLowerCase().includes(searchLower);
        const cuisineMatch = recipe.cuisine?.toLowerCase().includes(searchLower);
        const categoryMatch = recipe.category?.toLowerCase().includes(searchLower);
        
        // Search in tags JSON list
        let tagsMatch = false;
        if (recipe.tags) {
          try {
            const tags = Array.isArray(recipe.tags) 
              ? recipe.tags 
              : typeof recipe.tags === "string" 
                ? JSON.parse(recipe.tags) 
                : [];
            tagsMatch = tags.some((tag: string) => tag.toLowerCase().includes(searchLower));
          } catch (e) {
            // Ignored
          }
        }

        // Search in ingredients JSON list
        let ingredientsMatch = false;
        if (recipe.ingredients) {
          try {
            const ingredients = Array.isArray(recipe.ingredients) 
              ? recipe.ingredients 
              : typeof recipe.ingredients === "string" 
                ? JSON.parse(recipe.ingredients) 
                : [];
            ingredientsMatch = ingredients.some((ing: string) => ing.toLowerCase().includes(searchLower));
          } catch (e) {
            // Ignored
          }
        }

        return nameMatch || descMatch || cuisineMatch || categoryMatch || tagsMatch || ingredientsMatch;
      });
    }

    return NextResponse.json(recipes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data with Zod
    const validation = recipeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const recipeData = validation.data;

    // Convert arrays of strings to JSON-safe database inputs
    const { data: newRecipe, error } = await supabase
      .from("recipes")
      .insert({
        name: recipeData.name,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        preparation_time: recipeData.preparation_time,
        cooking_time: recipeData.cooking_time,
        servings: recipeData.servings,
        category: recipeData.category,
        difficulty: recipeData.difficulty,
        cuisine: recipeData.cuisine,
        image_url: recipeData.image_url || null,
        tags: recipeData.tags || [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(newRecipe, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
