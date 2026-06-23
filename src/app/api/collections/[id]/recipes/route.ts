import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params;
    const body = await request.json();
    const { recipeId } = body;

    if (!recipeId) {
      return NextResponse.json({ error: "recipeId is required" }, { status: 400 });
    }

    const { data: relation, error } = await supabase
      .from("collection_recipes")
      .insert({
        collection_id: collectionId,
        recipe_id: recipeId,
      })
      .select()
      .single();

    if (error) {
      // Check for unique key constraint violation (already in collection)
      if (error.code === "23505") {
        return NextResponse.json({ message: "Recipe is already in this collection" }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(relation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params;
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get("recipeId");

    if (!recipeId) {
      return NextResponse.json({ error: "recipeId is required as a query parameter" }, { status: 400 });
    }

    const { error } = await supabase
      .from("collection_recipes")
      .delete()
      .eq("collection_id", collectionId)
      .eq("recipe_id", recipeId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Recipe removed from collection successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
