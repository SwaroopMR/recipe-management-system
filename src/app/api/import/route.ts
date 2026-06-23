import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { recipeSchema } from "@/lib/zod-schemas";

// Helper to parse CSV lines safely
function parseCSV(text: string): any[] {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const results: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by comma but respect quoted values (e.g. "salt, pepper")
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
    const values = matches.map((v) => v.trim().replace(/^["']|["']$/g, "").replace(/""/g, '"'));

    if (values.length < headers.length) continue;

    const entry: any = {};
    headers.forEach((header, index) => {
      entry[header] = values[index];
    });

    results.push(entry);
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("format") || "json";
    const body = await request.text();

    let rawRecipes: any[] = [];

    if (type === "csv") {
      const parsed = parseCSV(body);
      rawRecipes = parsed.map((item) => {
        // Map types and structure ingredients/instructions/tags which are stored as delimited text in CSV
        const parseDelimited = (val: string) => {
          if (!val) return [];
          return val
            .split(/[;|]/)
            .map((s) => s.trim())
            .filter(Boolean);
        };

        return {
          name: item.name || "",
          description: item.description || "",
          ingredients: parseDelimited(item.ingredients),
          instructions: parseDelimited(item.instructions),
          preparation_time: parseInt(item.preparation_time || item.prep_time || "0") || 0,
          cooking_time: parseInt(item.cooking_time || item.cook_time || "0") || 0,
          servings: parseInt(item.servings || "1") || 1,
          category: item.category || "Healthy",
          difficulty: item.difficulty || "Medium",
          cuisine: item.cuisine || "International",
          image_url: item.image_url || "",
          tags: parseDelimited(item.tags || item.tag_list),
        };
      });
    } else {
      // JSON Import
      const parsed = JSON.parse(body);
      rawRecipes = Array.isArray(parsed) ? parsed : [parsed];
    }

    const validRecipes: any[] = [];
    const errors: any[] = [];

    // Validate each recipe with Zod
    rawRecipes.forEach((recipe, index) => {
      const result = recipeSchema.safeParse(recipe);
      if (result.success) {
        validRecipes.push(result.data);
      } else {
        errors.push({
          index,
          name: recipe.name || `Recipe #${index + 1}`,
          error: result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
        });
      }
    });

    if (validRecipes.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid recipes found to import.",
        errors,
      }, { status: 400 });
    }

    // Insert valid recipes to Supabase
    const { data: inserted, error: dbError } = await supabase
      .from("recipes")
      .insert(validRecipes.map((r) => ({
        name: r.name,
        description: r.description,
        ingredients: r.ingredients,
        instructions: r.instructions,
        preparation_time: r.preparation_time,
        cooking_time: r.cooking_time,
        servings: r.servings,
        category: r.category,
        difficulty: r.difficulty,
        cuisine: r.cuisine,
        image_url: r.image_url || null,
        tags: r.tags || [],
      })))
      .select();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: inserted.length,
      imported: inserted,
      failed_count: errors.length,
      errors,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
