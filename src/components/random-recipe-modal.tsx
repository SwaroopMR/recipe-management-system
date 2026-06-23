import React, { useState, useEffect } from "react";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Utensils, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RandomRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLLING_NAMES = [
  "Spicy Garlic Shrimp Scampi",
  "Creamy Tuscan Chicken Pasta",
  "Fluffy Blueberry Buttermilk Pancakes",
  "Ultimate Triple Cheese Pizza",
  "Classic French Onion Soup",
  "Decadent Chocolate Lava Cake",
  "Crispy Avocado Quinoa Salad",
  "Zesty Lemon Butter Salmon",
  "Traditional Beef Bourguignon",
  "Slow Cooked Pork Carnitas Tacos",
  "Sweet Mango Sticky Rice",
  "Authentic Pad Thai noodles"
];

export const RandomRecipeModal: React.FC<RandomRecipeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [rollingIndex, setRollingIndex] = useState(0);

  // Trigger random recipe fetch and slot machine rolling when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setRecipe(null);
    setError(null);

    // 1. Slot machine roll effect
    const rollInterval = setInterval(() => {
      setRollingIndex((prev) => (prev + 1) % ROLLING_NAMES.length);
    }, 120);

    // 2. Fetch the random recipe
    const startFetch = async () => {
      const startTime = Date.now();
      try {
        const response = await fetch("/api/recipes/random");
        const data = await response.json();
        
        // Ensure the rolling animation runs for at least 1500ms for a stunning UX
        const duration = Date.now() - startTime;
        const delay = Math.max(0, 1500 - duration);

        await new Promise((resolve) => setTimeout(resolve, delay));

        if (!response.ok) {
          throw new Error(data?.error || "Failed to fetch a random recipe");
        }
        if (!data) {
          throw new Error("No recipe data returned from the server.");
        }
        setRecipe(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        clearInterval(rollInterval);
        setLoading(false);
      }
    };

    startFetch();

    return () => {
      clearInterval(rollInterval);
    };
  }, [isOpen]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Random Recipe Vault Generator"
      description="Let the culinary gods decide what you cook today!"
    >
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-[#22C55E] animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-[#22C55E] animate-bounce" />
              </div>
              <div className="h-12 overflow-hidden flex items-center justify-center px-4">
                <motion.p
                  key={rollingIndex}
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -25, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="text-lg font-bold text-[#2563EB]"
                >
                  {ROLLING_NAMES[rollingIndex]}
                </motion.p>
              </div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Searching the vault...
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">{error}</p>
              <Button size="sm" onClick={() => onClose()}>
                Close
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="w-full flex flex-col items-center text-center gap-4"
            >
              {recipe && (
                <>
                  {/* Loaded Recipe Card Showcase */}
                  <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden p-5 flex flex-col items-center gap-4">
                    {recipe.image_url && (
                      <img
                        src={recipe.image_url}
                        alt={recipe.name}
                        className="w-full h-44 object-cover rounded-xl shadow-sm"
                      />
                    )}
                    <div className="flex flex-col gap-1 items-center">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-[#2563EB] rounded-full uppercase tracking-wider">
                          {recipe.category}
                        </span>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${
                          recipe.difficulty === "Easy"
                            ? "bg-green-50 text-[#22C55E]"
                            : recipe.difficulty === "Medium"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-600"
                        }`}>
                          {recipe.difficulty}
                        </span>
                      </div>
                      <h4 className="text-xl font-extrabold text-[#0F172A] mt-2">{recipe.name}</h4>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1 px-4 leading-relaxed">
                        {recipe.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-slate-500 text-xs font-bold pt-2 border-t border-slate-200/60 w-full">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-[#2563EB]" />
                        {(recipe.preparation_time || 0) + (recipe.cooking_time || 0)} mins
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Utensils className="h-4 w-4 text-[#22C55E]" />
                        {recipe.cuisine}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full mt-2">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
                      Cancel
                    </Button>
                    <Link href={`/recipes/${recipe.id}`} className="flex-1" onClick={onClose}>
                      <Button variant="success" className="w-full rounded-xl bg-[#22C55E] hover:bg-[#16A34A] gap-2">
                        View Recipe
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Dialog>
  );
};
