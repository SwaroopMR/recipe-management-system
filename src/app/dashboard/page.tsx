"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardMetrics } from "@/components/dashboard-metrics";
import { RandomRecipeModal } from "@/components/random-recipe-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Utensils, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const [randomModalOpen, setRandomModalOpen] = useState(false);

  // Fetch all recipes to compile stats
  const { data: recipes = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["recipes"],
    queryFn: async () => {
      const res = await fetch("/api/recipes");
      if (!res.ok) {
        throw new Error("Failed to fetch recipes from database");
      }
      return res.json();
    },
  });

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Kitchen Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Real-time analytics and quick insights for your digital cookbook collection.
          </p>
        </div>
        <Link href="/recipes/new" className="self-start md:self-auto">
          <Button className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] gap-2 shadow-md shadow-blue-100 py-2.5">
            <PlusCircle className="h-5 w-5" />
            Add New Recipe
          </Button>
        </Link>
      </div>

      {/* Main Content Loading / Error / Showcase States */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="sm:col-span-3 h-64 w-full rounded-2xl" />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center flex flex-col items-center gap-3">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <h3 className="text-base font-bold text-red-800">Database Connection Failed</h3>
          <p className="text-sm text-red-600">
            Could not fetch cookbook analytics. Please verify your Supabase environment configuration variables.
          </p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center gap-5 shadow-sm max-w-2xl mx-auto w-full my-12">
          <div className="h-16 w-16 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <Utensils className="h-8 w-8" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-[#0F172A]">Your Recipe Vault is Empty</h3>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed">
              Create your very first recipe manually or upload a backup file using our Import tool on the catalog page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/recipes/new">
              <Button className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] gap-2 py-2.5">
                <PlusCircle className="h-4 w-4" />
                Add Your First Recipe
              </Button>
            </Link>
            <Link href="/recipes">
              <Button variant="outline" className="rounded-xl border-slate-200 py-2.5">
                Go to Catalog
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <DashboardMetrics recipes={recipes} onTriggerRandom={() => setRandomModalOpen(true)} />
      )}

      {/* Random selector modal */}
      <RandomRecipeModal isOpen={randomModalOpen} onClose={() => setRandomModalOpen(false)} />
    </div>
  );
}
