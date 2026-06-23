import React from "react";
import { Search, Grid, List, SlidersHorizontal, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface RecipeFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  difficulty: string;
  setDifficulty: (val: string) => void;
  cuisine: string;
  setCuisine: (val: string) => void;
  maxPrepTime: number | "";
  setMaxPrepTime: (val: number | "") => void;
  maxCookTime: number | "";
  setMaxCookTime: (val: number | "") => void;
  viewMode: "grid" | "list";
  setViewMode: (val: "grid" | "list") => void;
  onTriggerRandom: () => void;
  availableCuisines: string[];
}

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

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  search,
  setSearch,
  category,
  setCategory,
  difficulty,
  setDifficulty,
  cuisine,
  setCuisine,
  maxPrepTime,
  setMaxPrepTime,
  maxCookTime,
  setMaxCookTime,
  viewMode,
  setViewMode,
  onTriggerRandom,
  availableCuisines,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setDifficulty("");
    setCuisine("");
    setMaxPrepTime("");
    setMaxCookTime("");
  };

  const hasActiveFilters =
    search || category || difficulty || cuisine || maxPrepTime !== "" || maxCookTime !== "";

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Search Input Bar & View Toggles */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        {/* Keyword Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ingredients, categories, tags, or cuisine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] shadow-sm transition-all duration-200"
          />
        </div>

        {/* Buttons and view modes */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-2xl border-slate-200 ${showFilters ? "bg-blue-50 border-blue-200 text-[#2563EB]" : ""}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-[#2563EB] text-white rounded-full">
                Active
              </span>
            )}
          </Button>

          <Button
            variant="success"
            onClick={onTriggerRandom}
            className="rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-white gap-2"
          >
            <Sparkles className="h-4 w-4 fill-white/20 animate-pulse" />
            Surprise Me!
          </Button>

          <div className="h-10 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Grid/List toggler */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-white text-[#2563EB] shadow-sm"
                  : "text-slate-500 hover:text-[#0F172A]"
              }`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-white text-[#2563EB] shadow-sm"
                  : "text-slate-500 hover:text-[#0F172A]"
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filter Panel Drawer */}
      {showFilters && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 relative overflow-hidden transition-all duration-300">
          {/* Category Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB]"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB]"
            >
              <option value="">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Cuisine Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cuisine</label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB]"
            >
              <option value="">All Cuisines</option>
              {availableCuisines.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Preparation Time Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Prep Time</label>
              <span className="text-xs font-semibold text-[#2563EB]">
                {maxPrepTime !== "" ? `${maxPrepTime} mins` : "Any"}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={maxPrepTime === "" ? 180 : maxPrepTime}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setMaxPrepTime(val === 180 ? "" : val);
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
          </div>

          {/* Cooking Time Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Cooking Time</label>
              <span className="text-xs font-semibold text-[#2563EB]">
                {maxCookTime !== "" ? `${maxCookTime} mins` : "Any"}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="240"
              step="5"
              value={maxCookTime === "" ? 240 : maxCookTime}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setMaxCookTime(val === 240 ? "" : val);
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
          </div>

          {/* Reset Filters Option */}
          {hasActiveFilters && (
            <div className="col-span-full flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-slate-500 border-slate-200 text-xs py-1 rounded-xl"
              >
                <RotateCcw className="h-3 w.5" />
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
