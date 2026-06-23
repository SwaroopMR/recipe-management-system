import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Get exact count of recipes
    const { count, error: countError } = await supabase
      .from("recipes")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if (count === null || count === 0) {
      return NextResponse.json({ error: "No recipes available in the vault yet" }, { status: 404 });
    }

    // Pick a random row offset
    const randomIndex = Math.floor(Math.random() * count);

    // Fetch the recipe at the random index
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("*")
      .range(randomIndex, randomIndex)
      .single();

    if (recipeError) {
      return NextResponse.json({ error: recipeError.message }, { status: 500 });
    }

    return NextResponse.json(recipe);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
