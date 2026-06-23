import React from "react";
import { BookOpen, Tag, Clock, Calendar, Sparkles, Flame } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Button } from "./ui/button";

interface DashboardMetricsProps {
  recipes: any[];
  onTriggerRandom: () => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  recipes,
  onTriggerRandom,
}) => {
  // 1. Calculate general stats
  const totalRecipes = recipes.length;
  
  const categoriesSet = new Set(recipes.map((r) => r.category).filter(Boolean));
  const categoriesCount = categoriesSet.size;

  const totalPrepTime = recipes.reduce((sum, r) => sum + (r.preparation_time || 0), 0);
  const avgPrepTime = totalRecipes > 0 ? Math.round(totalPrepTime / totalRecipes) : 0;

  // 2. Extract popular categories count
  const categoryCounts: { [key: string]: number } = {};
  recipes.forEach((r) => {
    if (r.category) {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    }
  });

  const popularCategories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 3. Newest recipe
  const newestRecipe = recipes.length > 0 
    ? [...recipes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* KPI Cards Panel */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Recipes */}
        <Card className="bg-white/60">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Recipes</p>
              <h4 className="text-3xl font-extrabold text-[#0F172A] mt-1">{totalRecipes}</h4>
            </div>
          </CardContent>
        </Card>

        {/* Categories Count */}
        <Card className="bg-white/60">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-50 text-[#22C55E] flex items-center justify-center">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</p>
              <h4 className="text-3xl font-extrabold text-[#0F172A] mt-1">{categoriesCount}</h4>
            </div>
          </CardContent>
        </Card>

        {/* Average Prep Time */}
        <Card className="bg-white/60">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Prep Time</p>
              <h4 className="text-3xl font-extrabold text-[#0F172A] mt-1">{avgPrepTime} <span className="text-sm font-semibold text-slate-400">mins</span></h4>
            </div>
          </CardContent>
        </Card>

        {/* Popular Categories Progress Bars */}
        <Card className="sm:col-span-3 bg-white/60 p-6">
          <h3 className="text-base font-bold text-[#0F172A] mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#2563EB]" />
            Popular Categories
          </h3>
          {popularCategories.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Add recipes to see popular categories!</p>
          ) : (
            <div className="space-y-4">
              {popularCategories.map((cat, idx) => {
                const percentage = totalRecipes > 0 ? (cat.count / totalRecipes) * 100 : 0;
                return (
                  <div key={cat.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm font-bold text-[#0F172A]">
                      <span>{cat.name}</span>
                      <span className="text-[#2563EB]">{cat.count} {cat.count === 1 ? "recipe" : "recipes"} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#22C55E]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Newest and Random Selection Widgets */}
      <div className="flex flex-col gap-6">
        {/* Newest Recipe Card */}
        <Card className="bg-white/60 p-6 flex-1 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#22C55E]" />
              Newest Addition
            </h3>
            {newestRecipe ? (
              <div className="flex flex-col gap-2">
                {newestRecipe.image_url && (
                  <img
                    src={newestRecipe.image_url}
                    alt={newestRecipe.name}
                    className="w-full h-32 object-cover rounded-xl shadow-sm border border-slate-100"
                  />
                )}
                <h4 className="text-sm font-extrabold text-[#0F172A] mt-1 line-clamp-1">{newestRecipe.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {newestRecipe.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-50 text-[#2563EB] rounded-full uppercase">
                    {newestRecipe.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {newestRecipe.cuisine}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No recipes in the vault yet.</p>
            )}
          </div>

          {newestRecipe && (
            <Link href={`/recipes/${newestRecipe.id}`} className="w-full">
              <Button size="sm" className="w-full text-xs py-2 rounded-xl">
                View Details
              </Button>
            </Link>
          )}
        </Card>

        {/* Random Generator Widget */}
        <Card className="bg-gradient-to-br from-[#2563EB]/5 to-[#22C55E]/5 border border-blue-100/60 p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#22C55E] text-white flex items-center justify-center">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <h3 className="text-base font-extrabold text-[#0F172A] mt-2">What to cook?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Stuck deciding? Let the Recipe Vault generator pick a random recipe for you with full stats.
            </p>
          </div>
          <Button
            variant="success"
            size="sm"
            onClick={onTriggerRandom}
            className="w-full text-xs py-2 bg-[#22C55E] hover:bg-[#16A34A] rounded-xl"
            disabled={totalRecipes === 0}
          >
            Surprise Me
          </Button>
        </Card>
      </div>
    </div>
  );
};
