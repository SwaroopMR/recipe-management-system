"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFavorites } from "@/context/favorites-context";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Clock,
  Utensils,
  Share2,
  Printer,
  FileDown,
  Edit2,
  Trash2,
  Heart,
  ChevronLeft,
  Calendar,
  AlertTriangle,
  FolderPlus,
  Tag,
  CheckSquare,
  Square
} from "lucide-react";
import Link from "next/link";

export default function RecipeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;

  // Favorites Context
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // Modals state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState("");

  // Interactive Checklist State
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // 1. Fetch current recipe
  const { data: recipe, isLoading, error } = useQuery<any>({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const res = await fetch(`/api/recipes/${id}`);
      if (!res.ok) throw new Error("Recipe not found");
      return res.json();
    },
    enabled: !!id,
  });

  // 2. Fetch list of recipes to recommend related ones (same category, different ID)
  const { data: relatedRecipes = [] } = useQuery<any[]>({
    queryKey: ["related-recipes", recipe?.category],
    queryFn: async () => {
      const res = await fetch(`/api/recipes?category=${recipe?.category}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.filter((r: any) => r.id !== id).slice(0, 3);
    },
    enabled: !!recipe?.category,
  });

  // 3. Fetch collections to populate "Add to Collection" dialog
  const { data: collections = [] } = useQuery<any[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await fetch("/api/collections");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: collectionOpen,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete recipe");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Recipe deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      router.push("/recipes");
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not delete recipe");
    },
  });

  // Add to Collection Mutation
  const addToCollectionMutation = useMutation({
    mutationFn: async (colId: string) => {
      const res = await fetch(`/api/collections/${colId}/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: id }),
      });
      if (!res.ok) throw new Error("Failed to add recipe to collection");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Recipe added to collection!");
      setCollectionOpen(false);
      setSelectedCollection("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add to collection");
    },
  });

  // Checklist toggles
  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // 4. Share link trigger
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.name,
        text: recipe.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // 5. Client-Side PDF Export using dynamic imports
  const handleExportPDF = async () => {
    const printArea = document.getElementById("recipe-print-area");
    if (!printArea) return;

    setExportingPDF(true);
    const toastId = toast.loading("Generating print-ready PDF...");

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      // Create high-res canvas rendering of the element
      const canvas = await html2canvas(printArea, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 page width in mm
      const pageHeight = 297; // A4 page height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${recipe.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_recipe.pdf`;
      pdf.save(fileName);
      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate PDF document", { id: toastId });
    } finally {
      setExportingPDF(false);
    }
  };

  // Dynamic values
  const ingredientsList = useMemo(() => {
    if (!recipe?.ingredients) return [];
    return Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : JSON.parse(recipe.ingredients);
  }, [recipe?.ingredients]);

  const instructionsList = useMemo(() => {
    if (!recipe?.instructions) return [];
    return Array.isArray(recipe.instructions)
      ? recipe.instructions
      : JSON.parse(recipe.instructions);
  }, [recipe?.instructions]);

  const tagsList = useMemo(() => {
    if (!recipe?.tags) return [];
    return Array.isArray(recipe.tags)
      ? recipe.tags
      : JSON.parse(recipe.tags);
  }, [recipe?.tags]);

  // Construct JSON-LD Schema.org Structured Data
  const jsonLd = useMemo(() => {
    if (!recipe) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Recipe",
      "name": recipe.name,
      "description": recipe.description,
      "image": recipe.image_url || "",
      "author": {
        "@type": "Organization",
        "name": "Recipe Vault"
      },
      "datePublished": recipe.created_at,
      "prepTime": `PT${recipe.preparation_time}M`,
      "cookTime": `PT${recipe.cooking_time}M`,
      "totalTime": `PT${recipe.preparation_time + recipe.cooking_time}M`,
      "recipeYield": `${recipe.servings} servings`,
      "recipeCategory": recipe.category,
      "recipeCuisine": recipe.cuisine,
      "recipeIngredient": ingredientsList,
      "recipeInstructions": instructionsList.map((step: string, index: number) => ({
        "@type": "HowToStep",
        "position": index + 1,
        "text": step
      }))
    };
  }, [recipe, ingredientsList, instructionsList]);

  // Loading skeleton block
  if (isLoading) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-96 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-[#0F172A]">Recipe Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
          The recipe you are trying to view does not exist or has been deleted.
        </p>
        <Link href="/recipes">
          <Button size="sm" className="rounded-xl bg-[#2563EB]">
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const isFav = isFavorite(recipe.id);

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Schema.org Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Navigation and Actions Row (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <Link href="/recipes" className="flex items-center gap-1.5 text-slate-500 hover:text-[#0F172A] font-bold text-sm">
          <ChevronLeft className="h-4.5 w-4.5" />
          Back to Recipes
        </Link>

        {/* Action button triggers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add to Collection */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCollectionOpen(true)}
            className="rounded-xl border-slate-200 text-xs font-semibold py-2"
          >
            <FolderPlus className="h-4 w-4 text-[#2563EB]" />
            Save to Collection
          </Button>

          {/* Share */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="rounded-xl border-slate-200 text-xs font-semibold py-2"
          >
            <Share2 className="h-4 w-4 text-slate-500" />
            Share
          </Button>

          {/* Export PDF */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            loading={exportingPDF}
            className="rounded-xl border-slate-200 text-xs font-semibold py-2"
          >
            <FileDown className="h-4 w-4 text-[#22C55E]" />
            PDF Export
          </Button>

          {/* Browser Print */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="rounded-xl border-slate-200 text-xs font-semibold py-2"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            Print
          </Button>

          <div className="h-6 w-[1px] bg-slate-200" />

          {/* Edit */}
          <Link href={`/recipes/${recipe.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 text-xs font-semibold py-2 text-[#2563EB] hover:bg-blue-50/50"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </Link>

          {/* Delete */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="rounded-xl border-slate-200 text-xs font-semibold py-2 text-red-600 hover:bg-red-50/50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* RENDER DOME FOR EXPORTS & PRINTING */}
      <div id="recipe-print-area" className="bg-white border border-slate-100 rounded-3xl overflow-hidden p-6 md:p-10 shadow-sm flex flex-col gap-8">
        
        {/* Banner Section */}
        <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
          <img
            src={recipe.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=80"}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />

          {/* Floating Category and Fav button inside print layout */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-6 md:p-8">
            <div className="flex flex-col gap-2 text-white">
              <span className="px-3 py-1 bg-[#2563EB] text-white rounded-full text-xs font-extrabold tracking-wider uppercase self-start shadow-md">
                {recipe.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">{recipe.name}</h1>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              if (isFav) {
                removeFavorite(recipe.id);
                toast.success("Removed from favorites.");
              } else {
                addFavorite(recipe.id);
                toast.success("Added to favorites!");
              }
            }}
            className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/90 backdrop-blur shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 no-print transition-all"
          >
            <Heart className={`h-6 w-6 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        </div>

        {/* Cooking Info KPIs Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-100 p-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-[#2563EB]" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prep Time</p>
              <p className="text-sm font-extrabold text-[#0F172A]">{recipe.preparation_time || 0} mins</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-[#22C55E]" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cook Time</p>
              <p className="text-sm font-extrabold text-[#0F172A]">{recipe.cooking_time || 0} mins</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Utensils className="h-6 w-6 text-[#2563EB]" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Servings</p>
              <p className="text-sm font-extrabold text-[#0F172A]">{recipe.servings || 1} people</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tag className="h-6 w-6 text-[#22C55E]" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cuisine / Level</p>
              <p className="text-sm font-extrabold text-[#0F172A]">{recipe.cuisine} • {recipe.difficulty}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About This Plate</h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">{recipe.description}</p>
          </div>
        )}

        <hr className="border-slate-100" />

        {/* Main Cooking Details: Ingredients Checklist and Instructions Step list */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Ingredients list */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[#0F172A] border-b border-slate-100 pb-2">Ingredients Checklist</h2>
            <ul className="flex flex-col gap-3">
              {ingredientsList.map((ingredient: string, index: number) => {
                const isChecked = checkedIngredients.includes(index);
                return (
                  <li
                    key={index}
                    onClick={() => toggleIngredient(index)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer select-none transition-all ${
                      isChecked
                        ? "bg-slate-50 text-slate-400 font-bold"
                        : "hover:bg-slate-50 font-bold text-slate-600"
                    }`}
                  >
                    <span className="shrink-0 mt-0.5 text-blue-600">
                      {isChecked ? (
                        <CheckSquare className="h-5 w-5 text-[#22C55E]" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-300" />
                      )}
                    </span>
                    <span className={`text-sm ${isChecked ? "line-through" : ""}`}>{ingredient}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Instructions Step list */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[#0F172A] border-b border-slate-100 pb-2">Preparation Instructions</h2>
            <ol className="flex flex-col gap-4">
              {instructionsList.map((step: string, index: number) => {
                const isCompleted = completedSteps.includes(index);
                return (
                  <li
                    key={index}
                    onClick={() => toggleStep(index)}
                    className={`flex gap-4 p-4 border border-slate-50 rounded-2xl cursor-pointer select-none transition-all ${
                      isCompleted
                        ? "bg-[#22C55E]/5 border-[#22C55E]/10 text-slate-400"
                        : "bg-white hover:bg-slate-50/50 hover:shadow-sm"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-extrabold text-xs transition-colors ${
                      isCompleted
                        ? "bg-[#22C55E] text-white"
                        : "bg-blue-50 text-[#2563EB]"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm leading-relaxed font-bold ${isCompleted ? "line-through" : "text-slate-700"}`}>
                        {step}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Tags */}
        {tagsList.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 mr-1 uppercase">Tags:</span>
            {tagsList.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* RELATED RECIPES SHOWCASE SECTION (Hidden on print) */}
      {relatedRecipes.length > 0 && (
        <div className="flex flex-col gap-6 mt-6 no-print">
          <h2 className="text-xl font-extrabold text-[#0F172A]">Related Recipes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedRecipes.map((related) => (
              <Link href={`/recipes/${related.id}`} key={related.id}>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group">
                  {related.image_url && (
                    <img
                      src={related.image_url}
                      alt={related.name}
                      className="w-full h-32 object-cover rounded-xl border border-slate-100"
                    />
                  )}
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0F172A] group-hover:text-[#2563EB] transition-colors line-clamp-1">
                      {related.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase">
                      {related.cuisine} • {related.difficulty}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Delete Warning modal */}
      <Dialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Recipe"
        description="Are you absolutely sure you want to delete this recipe from your Recipe Vault permanently? This action cannot be undone."
        footerActions={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate()}
              loading={deleteMutation.isPending}
              className="rounded-xl"
            >
              Delete Permanent
            </Button>
          </>
        }
      />

      {/* Add to Collection Modal */}
      <Dialog
        isOpen={collectionOpen}
        onClose={() => setCollectionOpen(false)}
        title="Add to Collection"
        description="Choose a folder collection to categorize this recipe."
        footerActions={
          <>
            <Button variant="outline" onClick={() => setCollectionOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => addToCollectionMutation.mutate(selectedCollection)}
              disabled={!selectedCollection || addToCollectionMutation.isPending}
              className="rounded-xl bg-[#22C55E]"
            >
              Add Recipe
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2 py-2">
          {collections.length === 0 ? (
            <p className="text-slate-400 text-xs py-2 text-center">
              No collections available. Create collections on the Collections tab first.
            </p>
          ) : (
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB]"
            >
              <option value="">Select a Collection Folder</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name} ({col.recipe_count || 0})
                </option>
              ))}
            </select>
          )}
        </div>
      </Dialog>
    </div>
  );
}
