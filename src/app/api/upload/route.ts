import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

// Predefined fallback food images to make the system look stunning even in fallback/offline mode
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80", // Salad
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80", // Pizza
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=80", // Pancakes
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&auto=format&fit=crop&q=80", // Toast
  "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&auto=format&fit=crop&q=80", // Soup
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string || "Healthy";

    if (!file) {
      return NextResponse.json({ error: "No file was uploaded" }, { status: 400 });
    }

    // Fallback mode if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.warn("Using fallback food image URL as Supabase is not configured.");
      // Select a random image from the stunning gallery
      const randomIndex = Math.floor(Math.random() * FALLBACK_IMAGES.length);
      return NextResponse.json({
        url: FALLBACK_IMAGES[randomIndex],
        fallback: true
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Clean and generate file name
    const fileExtension = file.name.split(".").pop();
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

    // Upload to 'recipe-images' bucket
    const { data, error } = await supabaseAdmin.storage
      .from("recipe-images")
      .upload(cleanFileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true
      });

    if (error) {
      console.error("Supabase Storage Error:", error);
      // Fallback instead of crash for standard demo experience
      const randomIndex = Math.floor(Math.random() * FALLBACK_IMAGES.length);
      return NextResponse.json({
        url: FALLBACK_IMAGES[randomIndex],
        error: error.message,
        fallback: true
      });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("recipe-images")
      .getPublicUrl(cleanFileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      fallback: false
    });
  } catch (error: any) {
    console.error("Upload error caught:", error);
    // Graceful fallback URL
    const randomIndex = Math.floor(Math.random() * FALLBACK_IMAGES.length);
    return NextResponse.json({
      url: FALLBACK_IMAGES[randomIndex],
      error: error.message || "Internal Server Error",
      fallback: true
    }, { status: 200 }); // Return 200 so UI continues smoothly with fallback
  }
}

