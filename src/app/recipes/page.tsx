"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { RecipeFilters } from "@/components/recipe-filters";
import { RandomRecipeModal } from "@/components/random-recipe-modal";
import { ExportImportActions } from "@/components/export-import-actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecipeCardSkeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/context/favorites-context";
import { Heart, Clock, Utensils, Sparkles, BookOpen, AlertCircle, PlusCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function RecipesCatalogPage() {
  // Filters State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [maxPrepTime, setMaxPrepTime] = useState<number | "">("");
  const [maxCookTime, setMaxCookTime] = useState<number | "">("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [randomModalOpen, setRandomModalOpen] = useState(false);

  // Favorites Context
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // Construct query string for API
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (difficulty) params.append("difficulty", difficulty);
    if (cuisine) params.append("cuisine", cuisine);
    if (maxPrepTime !== "") params.append("maxPrepTime", maxPrepTime.toString());
    if (maxCookTime !== "") params.append("maxCookTime", maxCookTime.toString());
    return params.toString();
  }, [search, category, difficulty, cuisine, maxPrepTime, maxCookTime]);

  // Fetch recipes via React Query
  const { data: recipes = [], isLoading, refetch, error } = useQuery<any[]>({
    queryKey: ["recipes", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/recipes?${queryParams}`);
      if (!res.ok) {
        throw new Error("Failed to fetch recipes catalog");
      }
      return res.json();
    },
  });

  // Fetch ALL recipes (no filters) to extract cuisines list for filter dropdown
  const { data: allRecipes = [] } = useQuery<any[]>({
    queryKey: ["all-recipes-list"],
    queryFn: async () => {
      const res = await fetch("/api/recipes");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Extract unique cuisines list dynamically
  const availableCuisines = useMemo(() => {
    const list = allRecipes
      .map((r) => r.cuisine?.trim())
      .filter(Boolean);
    return Array.from(new Set(list)) as string[];
  }, [allRecipes]);

  // Toggle favorite helper
  const handleToggleFavorite = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite(id)) {
      removeFavorite(id);
      toast.success(`Removed "${name}" from favorites.`);
    } else {
      addFavorite(id);
      toast.success(`Added "${name}" to favorites!`);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Recipe Vault</h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Discover a curation of gourmet entries or manage your personal recipes list.
          </p>
        </div>
        
        {/* Import/Export buttons */}
        <div className="self-start sm:self-auto">
          <ExportImportActions recipes={recipes} onImportSuccess={refetch} />
        </div>
      </div>

      {/* Advanced filters component */}
      <RecipeFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        cuisine={cuisine}
        setCuisine={setCuisine}
        maxPrepTime={maxPrepTime}
        setMaxPrepTime={setMaxPrepTime}
        maxCookTime={maxCookTime}
        setMaxCookTime={setMaxCookTime}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onTriggerRandom={() => setRandomModalOpen(true)}
        availableCuisines={availableCuisines}
      />

      {/* Database connection error card */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center flex flex-col items-center gap-3">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <h3 className="text-base font-bold text-red-800">Database Connection Error</h3>
          <p className="text-sm text-red-600">
            Failed to connect to the database. Make sure you initialized the tables inside Supabase.
          </p>
        </div>
      )}

      {/* Recipes Listing Showcase */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <RecipeCardSkeleton />
          <RecipeCardSkeleton />
          <RecipeCardSkeleton />
        </div>
      ) : recipes.length === 0 ? (
        /* Empty Matching state */
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center gap-4 shadow-sm max-w-lg mx-auto w-full my-6">
          <div className="h-14 w-14 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <BookOpen className="h-7 w-7" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-bold text-[#0F172A]">No Recipes Match Your Filters</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Try adjusting your search queries or clearing active sliders to discover matching plates.
            </p>
          </div>
          <Link href="/recipes/new">
            <Button size="sm" className="rounded-xl bg-[#2563EB] gap-1.5 mt-2 py-2">
              <PlusCircle className="h-4 w-4" />
              Add Recipe Manually
            </Button>
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => {
            const isFav = isFavorite(recipe.id);
            return (
              <Link href={`/recipes/${recipe.id}`} key={recipe.id}>
                <Card className="h-full bg-white flex flex-col justify-between group">
                  <div>
                    {/* Card Banner Image */}
                    <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                      <img
                        src={recipe.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"}
                        alt={recipe.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Floating favorite button */}
                      <button
                        onClick={(e) => handleToggleFavorite(e, recipe.id, recipe.name)}
                        className={`absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all ${
                          isFav
                            ? "bg-red-50 text-red-500 border border-red-100"
                            : "bg-white/80 hover:bg-white text-slate-400 hover:text-slate-600 border border-slate-100"
                        }`}
                        title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        <Heart className={`h-5 w-5 ${isFav ? "fill-red-500" : ""}`} />
                      </button>
                    </div>

                    {/* Card Description Content */}
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
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

                  {/* Card Info Footer */}
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
            );
          })}
        </div>
      ) : (
        /* LIST VIEW MODE */
        <div className="flex flex-col gap-4">
          {recipes.map((recipe) => {
            const isFav = isFavorite(recipe.id);
            return (
              <Link href={`/recipes/${recipe.id}`} key={recipe.id}>
                <Card className="bg-white group overflow-hidden flex flex-col md:flex-row h-auto md:h-44 justify-between">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center flex-1">
                    {/* Thumbnail Image */}
                    <div className="relative h-44 md:h-full w-full md:w-56 shrink-0 overflow-hidden bg-slate-100">
                      <img
                        src={recipe.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"}
                        alt={recipe.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Mobile floating fav */}
                      <button
                        onClick={(e) => handleToggleFavorite(e, recipe.id, recipe.name)}
                        className={`absolute top-3 right-3 md:hidden h-9 w-9 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all ${
                          isFav
                            ? "bg-red-50 text-red-500"
                            : "bg-white/80 hover:bg-white text-slate-400"
                        }`}
                      >
                        <Heart className={`h-4.5 w-4.5 ${isFav ? "fill-red-500" : ""}`} />
                      </button>
                    </div>

                    {/* Metadata Content */}
                    <div className="p-6 flex flex-col justify-between flex-1 gap-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-[#2563EB] rounded-full uppercase">
                            {recipe.category}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                            recipe.difficulty === "Easy"
                              ? "bg-green-50 text-[#22C55E]"
                              : recipe.difficulty === "Medium"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-red-50 text-red-500"
                          }`}>
                            {recipe.difficulty}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold ml-1 flex items-center gap-1">
                            <Utensils className="h-3 w-3" />
                            {recipe.cuisine}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#2563EB] transition-colors duration-200">
                          {recipe.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {recipe.description || "No description provided."}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-slate-500 text-xs font-bold mt-1">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-[#2563EB]" />
                          Prep: {recipe.preparation_time || 0} mins
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-[#22C55E]" />
                          Cook: {recipe.cooking_time || 0} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Actions layout */}
                  <div className="hidden md:flex flex-col items-end justify-between p-6 border-l border-slate-100">
                    <button
                      onClick={(e) => handleToggleFavorite(e, recipe.id, recipe.name)}
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                        isFav
                          ? "bg-red-50 text-red-500 border border-red-100"
                          : "hover:bg-slate-50 text-slate-400 hover:text-slate-600"
                      }`}
                      title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Heart className={`h-5.5 w-5.5 ${isFav ? "fill-red-500" : ""}`} />
                    </button>
                    
                    <span className="text-[10px] text-slate-400 font-bold">
                      Serves {recipe.servings || 1}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Rolling random Surprise Me generator */}
      <RandomRecipeModal isOpen={randomModalOpen} onClose={() => setRandomModalOpen(false)} />
    </div>
  );
}
