"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recipeSchema, RecipeInput } from "@/lib/zod-schemas";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const CATEGORIES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Snacks",
  "Beverages",
  "Vegetarian",
  "Vegan",
  "Healthy",
  "Quick Meals",
  "Traditional",
  "International"
];

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;

  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Dynamic lists states (synced with React Hook Form)
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [tagInput, setTagInput] = useState("");

  // 1. Fetch current recipe data
  const { data: recipe, isLoading, error } = useQuery<any>({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const res = await fetch(`/api/recipes/${id}`);
      if (!res.ok) throw new Error("Failed to load recipe details");
      return res.json();
    },
    enabled: !!id,
  });

  // Set up React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecipeInput>({
    resolver: zodResolver(recipeSchema) as any,
  });

  const imageUrl = watch("image_url");

  // Sync loaded recipe data into the form fields
  useEffect(() => {
    if (!recipe) return;

    // Parse lists if they are strings or JSONB
    const ingList = Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : typeof recipe.ingredients === "string"
      ? JSON.parse(recipe.ingredients)
      : [""];

    const instList = Array.isArray(recipe.instructions)
      ? recipe.instructions
      : typeof recipe.instructions === "string"
      ? JSON.parse(recipe.instructions)
      : [""];

    const tList = Array.isArray(recipe.tags)
      ? recipe.tags
      : typeof recipe.tags === "string"
      ? JSON.parse(recipe.tags)
      : [];

    setIngredients(ingList);
    setInstructions(instList);
    setTagInput(tList.join(", "));
    setImagePreview(recipe.image_url || null);

    reset({
      name: recipe.name || "",
      description: recipe.description || "",
      ingredients: ingList,
      instructions: instList,
      preparation_time: recipe.preparation_time || 0,
      cooking_time: recipe.cooking_time || 0,
      servings: recipe.servings || 1,
      category: recipe.category || "Healthy",
      difficulty: recipe.difficulty || "Medium",
      cuisine: recipe.cuisine || "",
      image_url: recipe.image_url || "",
      tags: tList,
    });
  }, [recipe, reset]);

  // Dynamic Lists Handlers
  const handleAddIngredient = () => {
    setIngredients((prev) => [...prev, ""]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length === 1) return;
    setIngredients((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      setValue("ingredients", updated, { shouldValidate: true });
      return updated;
    });
  };

  const handleIngredientChange = (index: number, val: string) => {
    setIngredients((prev) => {
      const copy = [...prev];
      copy[index] = val;
      setValue("ingredients", copy, { shouldValidate: true });
      return copy;
    });
  };

  const handleAddInstruction = () => {
    setInstructions((prev) => [...prev, ""]);
  };

  const handleRemoveInstruction = (index: number) => {
    if (instructions.length === 1) return;
    setInstructions((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      setValue("instructions", updated, { shouldValidate: true });
      return updated;
    });
  };

  const handleInstructionChange = (index: number, val: string) => {
    setInstructions((prev) => {
      const copy = [...prev];
      copy[index] = val;
      setValue("instructions", copy, { shouldValidate: true });
      return copy;
    });
  };

  // Image Upload File Stream handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading("Uploading recipe image...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", watch("category") || "Healthy");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image file");
      }

      setValue("image_url", data.url, { shouldValidate: true });
      setImagePreview(data.url);
      
      if (data.fallback) {
        toast.warning("Supabase offline. Loaded stunning category placeholder image.", { id: toastId });
      } else {
        toast.success("Image uploaded successfully!", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Could not upload image", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  // Submit edits Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: RecipeInput) => {
      const res = await fetch(`/api/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update recipe details");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Successfully updated "${data.name}" details!`);
      queryClient.invalidateQueries({ queryKey: ["recipe", id] });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      router.push(`/recipes/${id}`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not update recipe. Please check fields.");
    },
  });

  const onSubmit = (data: RecipeInput) => {
    // Process tags
    const processedTags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    
    data.tags = processedTags;
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-[#0F172A]">Could Not Load Recipe Form</h2>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
          The recipe you are trying to edit does not exist or has been deleted.
        </p>
        <Link href="/recipes">
          <Button size="sm" className="rounded-xl bg-[#2563EB]">
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6">
      {/* Back button */}
      <div>
        <Link href={`/recipes/${id}`} className="flex items-center gap-1.5 text-slate-500 hover:text-[#0F172A] font-bold text-sm">
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Recipe Details
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Edit Recipe</h1>
        <p className="text-sm text-slate-500 mt-1">
          Modify and update details for <strong>{recipe.name}</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Form Fields */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="bg-white p-6 flex flex-col gap-4">
            {/* Recipe Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0F172A] uppercase">Recipe Title</label>
              <Input
                placeholder="e.g. Creamy Lemon Garlic Salmon"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0F172A] uppercase">Short Description</label>
              <Textarea
                placeholder="Give a brief summary, history, or flavor profile of this recipe..."
                error={errors.description?.message}
                {...register("description")}
              />
            </div>

            {/* Preparation and Cooking Times & Servings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0F172A] uppercase">Prep Time (mins)</label>
                <Input
                  type="number"
                  error={errors.preparation_time?.message}
                  {...register("preparation_time", { valueAsNumber: true })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0F172A] uppercase">Cooking Time (mins)</label>
                <Input
                  type="number"
                  error={errors.cooking_time?.message}
                  {...register("cooking_time", { valueAsNumber: true })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0F172A] uppercase">Servings</label>
                <Input
                  type="number"
                  error={errors.servings?.message}
                  {...register("servings", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Cuisine and Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0F172A] uppercase">Cuisine Origin</label>
                <Input
                  placeholder="e.g. Italian, Japanese, Indian"
                  error={errors.cuisine?.message}
                  {...register("cuisine")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0F172A] uppercase">Tags (comma-separated)</label>
                <Input
                  placeholder="e.g. glutenfree, spicy, quick, keto"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* DYNAMIC INGREDIENTS LIST */}
          <Card className="bg-white p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-[#0F172A]">Ingredients Checklist</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddIngredient}
                className="text-xs border-slate-200 py-1.5 rounded-lg"
              >
                <Plus className="h-4 w-4 text-[#2563EB]" />
                Add Ingredient
              </Button>
            </div>
            {errors.ingredients && (
              <span className="text-xs font-bold text-red-500">{errors.ingredients.message}</span>
            )}
            <div className="flex flex-col gap-3">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="Ingredient line"
                    value={ing}
                    onChange={(e) => handleIngredientChange(idx, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveIngredient(idx)}
                    disabled={ingredients.length === 1}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 border-0 rounded-lg h-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* DYNAMIC INSTRUCTIONS LIST */}
          <Card className="bg-white p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-[#0F172A]">Cooking Steps</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddInstruction}
                className="text-xs border-slate-200 py-1.5 rounded-lg"
              >
                <Plus className="h-4 w-4 text-[#2563EB]" />
                Add Step
              </Button>
            </div>
            {errors.instructions && (
              <span className="text-xs font-bold text-red-500">{errors.instructions.message}</span>
            )}
            <div className="flex flex-col gap-4">
              {instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="h-8 w-8 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs mt-1 shrink-0">
                    {idx + 1}
                  </span>
                  <Textarea
                    placeholder="Describe this cooking step instructions..."
                    value={step}
                    onChange={(e) => handleInstructionChange(idx, e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveInstruction(idx)}
                    disabled={instructions.length === 1}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 border-0 rounded-lg h-auto mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side Settings Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Metadata selection card */}
          <Card className="bg-white p-6 flex flex-col gap-4">
            {/* Category selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0F172A] uppercase">Category</label>
              <select
                {...register("category")}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0F172A] uppercase">Difficulty Level</label>
              <select
                {...register("difficulty")}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB]"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </Card>

          {/* Dynamic Image Upload Widget */}
          <Card className="bg-white p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase">Recipe Image</h3>
            
            {imagePreview || imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-100 shadow-sm aspect-video">
                <img
                  src={imagePreview || imageUrl}
                  alt="Uploaded Recipe Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setValue("image_url", "", { shouldValidate: true });
                  }}
                  className="absolute bottom-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-lg p-1.5 shadow-md flex items-center justify-center transition-colors"
                  title="Remove Image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center gap-2 hover:border-[#2563EB] hover:bg-blue-50/10 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploading ? (
                  <Loader2 className="h-8 w-8 text-[#2563EB] animate-spin" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-slate-300" />
                )}
                <p className="text-xs font-bold text-[#0f172a] mt-1">Upload Photo</p>
                <p className="text-[10px] text-slate-400">JPEG, PNG, WEBP files</p>
              </div>
            )}

            {/* Custom URL Option */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Or provide a custom image URL</label>
              <Input
                placeholder="https://example.com/image.jpg"
                error={errors.image_url?.message}
                {...register("image_url")}
              />
            </div>
          </Card>

          {/* Form Actions Submit buttons */}
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              variant="success"
              loading={isSubmitting || updateMutation.isPending}
              className="w-full bg-[#22C55E] hover:bg-[#16A34A] py-3 rounded-xl shadow-md shadow-green-50"
            >
              Update Recipe
            </Button>
            <Link href={`/recipes/${id}`} className="w-full">
              <Button type="button" variant="outline" className="w-full py-3 rounded-xl border-slate-200">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
