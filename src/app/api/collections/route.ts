import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { collectionSchema } from "@/lib/zod-schemas";

export async function GET(request: NextRequest) {
  try {
    // Fetch collections and include the associated recipe relations to calculate recipe count
    const { data: collections, error } = await supabase
      .from("collections")
      .select(`
        *,
        collection_recipes (
          recipe_id
        )
      `)
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map output to include a clean recipe_count field
    const mapped = collections?.map((col: any) => ({
      id: col.id,
      name: col.name,
      description: col.description,
      created_at: col.created_at,
      recipe_count: col.collection_recipes ? col.collection_recipes.length : 0,
    })) || [];

    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = collectionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { name, description } = validation.data;

    const { data: newCollection, error } = await supabase
      .from("collections")
      .insert({ name, description })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(newCollection, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
