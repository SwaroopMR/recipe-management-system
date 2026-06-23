"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recipeSchema, RecipeInput } from "@/lib/zod-schemas";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
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

export default function AddRecipePage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Set up React Hook Form with Zod schema resolver
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecipeInput>({
    resolver: zodResolver(recipeSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      ingredients: [""],
      instructions: [""],
      preparation_time: 15,
      cooking_time: 20,
      servings: 2,
      category: "Healthy",
      difficulty: "Medium",
      cuisine: "",
      image_url: "",
      tags: [],
    },
  });

  const imageUrl = watch("image_url");

  // Dynamic lists handlers
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [tagInput, setTagInput] = useState("");

  const handleAddIngredient = () => {
    setIngredients((prev) => [...prev, ""]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length === 1) return;
    setIngredients((prev) => prev.filter((_, idx) => idx !== index));
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
    setInstructions((prev) => prev.filter((_, idx) => idx !== index));
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

  const onSubmit = async (data: RecipeInput) => {
    // Process tags
    const processedTags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    
    data.tags = processedTags;

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to create recipe");
      }

      toast.success(`Successfully saved "${resData.name}" recipe!`);
      router.push(`/recipes/${resData.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save recipe. Please check inputs.");
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6">
      {/* Back button */}
      <div>
        <Link href="/recipes" className="flex items-center gap-1.5 text-slate-500 hover:text-[#0F172A] font-bold text-sm">
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Catalog
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Create Recipe</h1>
        <p className="text-sm text-slate-500 mt-1">
          Store a new gourmet entry into your Recipe Vault catalog.
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
                    placeholder={`e.g. ${idx === 0 ? "2 lbs Salmon Fillets" : idx === 1 ? "3 cloves Garlic, minced" : "Ingredient line"}`}
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
              loading={isSubmitting}
              className="w-full bg-[#22C55E] hover:bg-[#16A34A] py-3 rounded-xl shadow-md shadow-green-50"
            >
              Save Recipe Vault
            </Button>
            <Link href="/recipes" className="w-full">
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
