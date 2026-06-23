"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFavorites } from "@/context/favorites-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { RecipeCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Clock, Utensils, Star, BookOpen } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();

  // Fetch all recipes to filter
  const { data: recipes = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["recipes"],
    queryFn: async () => {
      const res = await fetch("/api/recipes");
      if (!res.ok) throw new Error("Failed to fetch recipes database");
      return res.json();
    },
  });

  // Filter recipes client-side based on favorited IDs
  const favoritedRecipes = useMemo(() => {
    return recipes.filter((r) => favorites.includes(r.id));
  }, [recipes, favorites]);

  // Remove Favorite handler
  const handleRemoveFavorite = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeFavorite(id);
    toast.success(`Removed "${name}" from favorites.`);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Title Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
          <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
          My Favorites
        </h1>
        <p className="text-sm text-slate-500">
          Your personally curated collection of saved recipes, stored locally in your browser.
        </p>
      </div>

      {/* Grid listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <RecipeCardSkeleton />
          <RecipeCardSkeleton />
          <RecipeCardSkeleton />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center text-red-600">
          Failed to load favorites. Please check your Supabase configurations.
        </div>
      ) : favoritedRecipes.length === 0 ? (
        /* Empty Favorites list */
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center gap-5 shadow-sm max-w-lg mx-auto w-full my-12">
          <div className="h-16 w-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <Heart className="h-8 w-8 fill-red-100" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xl font-bold text-[#0F172A]">No Favorites Saved Yet</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              When browsing the catalog, click the heart icon on any recipe to save it to your personal favorites dashboard.
            </p>
          </div>
          <Link href="/recipes">
            <Button className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] gap-2 py-2.5">
              <BookOpen className="h-4 w-4" />
              Browse Recipes
            </Button>
          </Link>
        </div>
      ) : (
        /* Grid of favorited recipes */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoritedRecipes.map((recipe) => (
            <Link href={`/recipes/${recipe.id}`} key={recipe.id}>
              <Card className="h-full bg-white flex flex-col justify-between group">
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={recipe.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    <button
                      onClick={(e) => handleRemoveFavorite(e, recipe.id, recipe.name)}
                      className="absolute top-4 right-4 h-10 w-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shadow-md border border-red-100 transition-all hover:bg-red-100"
                      title="Remove from Favorites"
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </button>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-[#2563EB] rounded-full uppercase tracking-wider">
                        {recipe.category}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        recipe.difficulty === "Easy"
                          ? "bg-green-50 text-[#22C55E]"
                          : recipe.difficulty === "Medium"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-500"
                      }`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                    <CardTitle className="mt-2 line-clamp-1 group-hover:text-[#2563EB] transition-colors duration-200">
                      {recipe.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {recipe.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardFooter className="mt-4 pt-3 flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-[#2563EB]" />
                    {(recipe.preparation_time || 0) + (recipe.cooking_time || 0)} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Utensils className="h-4 w-4 text-[#22C55E]" />
                    {recipe.cuisine}
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
