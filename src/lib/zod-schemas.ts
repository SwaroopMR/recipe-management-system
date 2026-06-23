import { z } from "zod";

export const recipeSchema = z.object({
  name: z.string().min(2, "Recipe name must be at least 2 characters long"),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional().default(""),
  ingredients: z.array(z.string().min(1, "Ingredient cannot be empty")).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string().min(1, "Instruction step cannot be empty")).min(1, "At least one instruction step is required"),
  preparation_time: z.number().int().nonnegative("Preparation time must be 0 or greater"),
  cooking_time: z.number().int().nonnegative("Cooking time must be 0 or greater"),
  servings: z.number().int().positive("Servings must be at least 1"),
  category: z.enum([
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
  ], {
    message: "Please select a valid category",
  }),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    message: "Please select a difficulty level",
  }),
  cuisine: z.string().min(2, "Cuisine must be at least 2 characters long"),
  image_url: z.string().url("Invalid image URL").or(z.string().length(0)).optional().default(""),
  tags: z.array(z.string()).optional().default([]),
});

export type RecipeInput = z.infer<typeof recipeSchema>;

export const collectionSchema = z.object({
  name: z.string().min(2, "Collection name must be at least 2 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().default(""),
});

export type CollectionInput = z.infer<typeof collectionSchema>;
