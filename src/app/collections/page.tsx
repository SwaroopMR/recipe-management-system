"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input, Textarea } from "@/components/ui/input";
import { FolderHeart, PlusCircle, Folder, Calendar, Trash2, Edit, X, ArrowRight, FolderOpen, AlertCircle, Clock, Utensils } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CollectionsPage() {
  const queryClient = useQueryClient();

  // Selected collection detail view state
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  // Dialog Modals State
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Form inputs state
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");

  // 1. Fetch all collections list
  const { data: collections = [], isLoading: collectionsLoading } = useQuery<any[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await fetch("/api/collections");
      if (!res.ok) throw new Error("Failed to fetch collections");
      return res.json();
    },
  });

  // 2. Fetch active collection details and associated recipes
  const { data: activeCollection, isLoading: activeLoading } = useQuery<any>({
    queryKey: ["collection-details", activeCollectionId],
    queryFn: async () => {
      const res = await fetch(`/api/collections/${activeCollectionId}`);
      if (!res.ok) throw new Error("Failed to fetch collection details");
      return res.json();
    },
    enabled: !!activeCollectionId,
  });

  // Create Collection Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput, description: descInput }),
      });
      if (!res.ok) throw new Error("Failed to create collection");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Collection "${data.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setCreateOpen(false);
      setNameInput("");
      setDescInput("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create collection");
    },
  });

  // Update Collection Mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/collections/${activeCollectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput, description: descInput }),
      });
      if (!res.ok) throw new Error("Failed to update collection");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Collection details updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collection-details", activeCollectionId] });
      setEditOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update collection");
    },
  });

  // Delete Collection Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/collections/${activeCollectionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete collection");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Collection deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setActiveCollectionId(null);
      setDeleteOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete collection");
    },
  });

  // Remove Recipe relation Mutation
  const removeRecipeMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      const res = await fetch(`/api/collections/${activeCollectionId}/recipes?recipeId=${recipeId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove recipe from collection");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Recipe removed from this collection");
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collection-details", activeCollectionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to remove recipe");
    },
  });

  // Triggers
  const openEditModal = () => {
    if (!activeCollection) return;
    setNameInput(activeCollection.name);
    setDescInput(activeCollection.description || "");
    setEditOpen(true);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <FolderHeart className="h-8 w-8 text-[#2563EB]" />
            Recipe Collections
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize your cooking catalog into beautiful folders such as Chef Picks or Quick Meals.
          </p>
        </div>
        <Button
          onClick={() => {
            setNameInput("");
            setDescInput("");
            setCreateOpen(true);
          }}
          className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] gap-2 shadow-md shadow-blue-100 py-2.5"
        >
          <PlusCircle className="h-5 w-5" />
          Create Collection
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Collections List */}
        <div className={`${activeCollectionId ? "lg:col-span-5" : "lg:col-span-12"} flex flex-col gap-4`}>
          {collectionsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          ) : collections.length === 0 ? (
            /* Empty collections state */
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center gap-5 shadow-sm max-w-md mx-auto w-full my-6">
              <Folder className="h-12 w-12 text-[#2563EB]" />
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-[#0F172A]">No Custom Folders Available</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Group your recipes by folders to organize meal plans. Try creating one!
                </p>
              </div>
            </div>
          ) : (
            /* Grid display list of collections folders */
            <div className={`grid grid-cols-1 ${activeCollectionId ? "sm:grid-cols-1 gap-4" : "sm:grid-cols-2 md:grid-cols-3 gap-6"} w-full`}>
              {collections.map((col) => {
                const isActive = activeCollectionId === col.id;
                return (
                  <div
                    key={col.id}
                    onClick={() => setActiveCollectionId(col.id)}
                    className={`border rounded-2xl p-6 cursor-pointer transition-all flex flex-col justify-between h-40 ${
                      isActive
                        ? "bg-blue-50/50 border-[#2563EB] shadow-md shadow-blue-100/45"
                        : "bg-white border-slate-100 hover:border-[#2563EB]/40 hover:shadow-lg shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Folder className={`h-8 w-8 ${isActive ? "text-[#2563EB]" : "text-slate-400"}`} />
                        <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${
                          isActive ? "bg-[#2563EB] text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                          {col.recipe_count || 0} {col.recipe_count === 1 ? "recipe" : "recipes"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#0F172A] mt-4 line-clamp-1">{col.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1 leading-relaxed">{col.description || "No description."}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Active Collection Details Panel */}
        {activeCollectionId && (
          <div className="lg:col-span-7 flex flex-col gap-6 animate-in slide-in-from-right duration-300">
            {activeLoading ? (
              <Card className="bg-white p-6 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </Card>
            ) : !activeCollection ? (
              <Card className="bg-white p-6 text-center text-slate-400">
                Failed to load details.
              </Card>
            ) : (
              <Card className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                {/* Header detail */}
                <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-[#2563EB] text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-100">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">{activeCollection.name}</h2>
                        <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          Created on {new Date(activeCollection.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Manage collection details buttons */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={openEditModal}
                        className="p-2 rounded-lg text-slate-500 hover:text-[#2563EB] hover:bg-white"
                        title="Edit Collection Details"
                      >
                        <Edit className="h-4.5 w-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteOpen(true)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                        title="Delete Collection Folder"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveCollectionId(null)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white"
                        title="Close details pane"
                      >
                        <X className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                  {activeCollection.description && (
                    <p className="text-xs font-medium text-slate-500 leading-relaxed pl-13">
                      {activeCollection.description}
                    </p>
                  )}
                </div>

                {/* Recipes list inside this collection */}
                <div className="p-6 md:p-8 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recipes inside this folder</h3>
                  {activeCollection.recipes.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
                      <p className="text-xs font-semibold text-slate-400">
                        This collection is empty. Go to any recipe details page and click "Save to Collection" to populate this folder.
                      </p>
                      <Link href="/recipes">
                        <Button size="sm" variant="outline" className="rounded-xl text-xs py-2">
                          Browse Recipes
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                      {activeCollection.recipes.map((recipe: any) => (
                        <div
                          key={recipe.id}
                          className="border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-4 hover:border-[#2563EB]/20 bg-slate-50/20 hover:bg-white transition-all shadow-sm group"
                        >
                          <Link href={`/recipes/${recipe.id}`} className="flex items-center gap-3 flex-1 overflow-hidden">
                            {recipe.image_url ? (
                              <img
                                src={recipe.image_url}
                                alt={recipe.name}
                                className="w-12 h-12 object-cover rounded-lg border border-slate-100"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                                <Folder className="h-5 w-5" />
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <h4 className="text-sm font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#2563EB] transition-colors">
                                {recipe.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 flex items-center gap-2">
                                <span>{recipe.category}</span>
                                <span>•</span>
                                <span>{recipe.cuisine}</span>
                              </p>
                            </div>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRecipeMutation.mutate(recipe.id)}
                            disabled={removeRecipeMutation.isPending}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 h-auto rounded-lg"
                            title="Remove from collection"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* CREATE COLLECTION MODAL */}
      <Dialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Collection"
        description="Build a new folder to organize recipes."
        footerActions={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => createMutation.mutate()}
              disabled={nameInput.length < 2 || createMutation.isPending}
              className="rounded-xl bg-[#22C55E]"
            >
              Create Folder
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#0F172A] uppercase">Folder Name</label>
            <Input
              placeholder="e.g. Healthy Vegetarian, Christmas Baking"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#0F172A] uppercase">Description</label>
            <Textarea
              placeholder="Give a short overview of what recipes belong in this folder..."
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
            />
          </div>
        </div>
      </Dialog>

      {/* EDIT COLLECTION DETAILS */}
      <Dialog
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Collection Details"
        description="Update collection name and description."
        footerActions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => updateMutation.mutate()}
              disabled={nameInput.length < 2 || updateMutation.isPending}
              className="rounded-xl bg-[#22C55E]"
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#0F172A] uppercase">Folder Name</label>
            <Input
              placeholder="e.g. Healthy Vegetarian, Christmas Baking"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#0F172A] uppercase">Description</label>
            <Textarea
              placeholder="Describe this collection folder contents..."
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
            />
          </div>
        </div>
      </Dialog>

      {/* DELETE COLLECTION MODAL */}
      <Dialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Collection"
        description={`Are you sure you want to delete the collection "${activeCollection?.name}"? The recipes inside this folder will not be deleted, only the folder directory layout will be removed.`}
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
              Delete Folder
            </Button>
          </>
        }
      />
    </div>
  );
}
