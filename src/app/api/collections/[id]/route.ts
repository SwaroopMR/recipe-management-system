import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { collectionSchema } from "@/lib/zod-schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the collection
    const { data: collection, error: colError } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (colError) {
      return NextResponse.json({ error: colError.message }, { status: 500 });
    }

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Fetch related recipes
    const { data: relRecipes, error: relError } = await supabase
      .from("collection_recipes")
      .select(`
        recipes (
          id,
          name,
          description,
          preparation_time,
          cooking_time,
          servings,
          category,
          difficulty,
          cuisine,
          image_url,
          tags,
          created_at
        )
      `)
      .eq("collection_id", id);

    if (relError) {
      return NextResponse.json({ error: relError.message }, { status: 500 });
    }

    // Map recipes cleanly
    const recipes = relRecipes
      ? relRecipes.map((item: any) => item.recipes).filter(Boolean)
      : [];

    return NextResponse.json({
      ...collection,
      recipes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = collectionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { name, description } = validation.data;

    const { data: updatedCol, error } = await supabase
      .from("collections")
      .update({ name, description })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedCol);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Collection deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
