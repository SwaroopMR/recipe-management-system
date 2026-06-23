"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChefHat, BookOpen, Star, PlusCircle, ArrowRight, Sparkles, FolderHeart, ShieldCheck, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { name: "Breakfast", icon: "🍳", bg: "bg-blue-50 text-[#2563EB]" },
  { name: "Lunch", icon: "🥪", bg: "bg-green-50 text-[#22C55E]" },
  { name: "Dinner", icon: "🍽️", bg: "bg-blue-50 text-[#2563EB]" },
  { name: "Dessert", icon: "🍰", bg: "bg-green-50 text-[#22C55E]" },
  { name: "Snacks", icon: "🍿", bg: "bg-blue-50 text-[#2563EB]" },
  { name: "Beverages", icon: "🍹", bg: "bg-green-50 text-[#22C55E]" },
  { name: "Vegetarian", icon: "🥗", bg: "bg-blue-50 text-[#2563EB]" },
  { name: "Vegan", icon: "🌱", bg: "bg-green-50 text-[#22C55E]" },
  { name: "Healthy", icon: "🥑", bg: "bg-blue-50 text-[#2563EB]" },
  { name: "Quick Meals", icon: "⏱️", bg: "bg-green-50 text-[#22C55E]" },
  { name: "Traditional", icon: "🍲", bg: "bg-blue-50 text-[#2563EB]" },
  { name: "International", icon: "🌐", bg: "bg-green-50 text-[#22C55E]" },
];

const FEATURES = [
  {
    title: "Dynamic Cataloging",
    desc: "Browse recipes in beautiful Grid or List views. Query the vault instantly by ingredients, tags, or cuisines.",
    icon: BookOpen,
    color: "bg-blue-50 text-[#2563EB]",
  },
  {
    title: "Account-Free Favorites",
    desc: "Save your favorite recipes to your personal collection. Stored locally in your browser without requiring log-in credentials.",
    icon: Star,
    color: "bg-green-50 text-[#22C55E]",
  },
  {
    title: "Custom Collections",
    desc: "Group recipes into thematic lists like 'Chef Picks' or 'Healthy Prep'. Create, rename, and manage custom collections easily.",
    icon: FolderHeart,
    color: "bg-blue-50 text-[#2563EB]",
  },
  {
    title: "Flexible Import & Export",
    desc: "Migrate or back up your entire database to standard JSON or CSV spreadsheets. Export recipes as clean, printable cooking sheets.",
    icon: FileSpreadsheet,
    color: "bg-green-50 text-[#22C55E]",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Soft Background Gradient Blobs */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -z-10" />
        <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-30 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold self-center lg:self-start border border-blue-100 shadow-sm">
              <Sparkles className="h-4 w-4 text-[#2563EB] animate-pulse" />
              Revolutionize Your Kitchen Workspace
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] leading-[1.1] tracking-tight">
              Discover, Organize, and Preserve Your Favorite Recipes
            </h1>
            
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Welcome to <strong>Recipe Vault</strong>, a premium, account-free digital cookbook. Build collections, search ingredients instantly, and export printable guides for your daily culinary journey.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-2">
              <Link href="/recipes" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] gap-2 shadow-lg shadow-blue-100">
                  Explore Recipes
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/recipes/new" className="w-full sm:w-auto">
                <Button size="lg" variant="success" className="w-full sm:w-auto rounded-xl bg-[#22C55E] hover:bg-[#16A34A] gap-2 shadow-lg shadow-green-100">
                  <PlusCircle className="h-5 w-5" />
                  Add Recipe
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Right Media */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#2563EB] to-[#22C55E] opacity-20 blur-xl -z-10" />
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=80"
                alt="Fresh Food Platter"
                className="rounded-3xl shadow-2xl object-cover aspect-square w-full border-4 border-white"
              />

              {/* Floating Badge 1 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="absolute top-8 -left-8 bg-white/95 backdrop-blur shadow-xl rounded-2xl p-4 border border-slate-100 flex items-center gap-3 hidden sm:flex"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-extrabold text-sm">
                  ⏱️
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Quick Meals</p>
                  <p className="text-xs font-extrabold text-[#0F172A]">Under 30 Mins</p>
                </div>
              </motion.div>

              {/* Floating Badge 2 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="absolute bottom-8 -right-8 bg-white/95 backdrop-blur shadow-xl rounded-2xl p-4 border border-slate-100 flex items-center gap-3 hidden sm:flex"
              >
                <div className="h-10 w-10 rounded-xl bg-green-50 text-[#22C55E] flex items-center justify-center text-sm">
                  🥦
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Healthy Choices</p>
                  <p className="text-xs font-extrabold text-[#0F172A]">Vegan & Vegetarian</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-white border-y border-slate-100 py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl font-extrabold text-[#2563EB]">100%</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Free to Use</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-[#22C55E]">No Log-in</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Required to Start</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-[#2563EB]">Instant</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Search & Filters</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-[#22C55E]">Universal</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">JSON/CSV Exports</p>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest">Vault Benefits</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A]">Powerful Cooking Management</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Designed for professional chefs, home cooks, and food enthusiasts alike. Keep your recipes secure and accessible without the weight of signups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 flex items-start gap-5 shadow-sm"
              >
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${feat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">{feat.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="bg-slate-50 border-t border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
            <span className="text-xs font-bold text-[#22C55E] uppercase tracking-widest">Browse Recipes By Type</span>
            <h2 className="text-3xl font-extrabold text-[#0F172A]">Supported Categories</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Find exactly what you want to cook today. Click on any category below to immediately browse matching recipes inside the vault database.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, idx) => (
              <Link key={cat.name} href={`/recipes?category=${cat.name}`}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
                  className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center gap-3 text-center cursor-pointer shadow-sm"
                >
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-xs font-bold text-[#0F172A] tracking-wide">{cat.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#22C55E] flex items-center justify-center text-white font-extrabold text-sm">
              <ChefHat className="h-4.5 w-4.5" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-[#0F172A]">
              Recipe<span className="text-[#2563EB]">Vault</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-bold">
            &copy; {new Date().getFullYear()} Recipe Vault. Handcrafted for modern culinary workspaces.
          </p>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <Link href="/dashboard" className="hover:text-[#2563EB]">Dashboard</Link>
            <Link href="/recipes" className="hover:text-[#2563EB]">Browse</Link>
            <Link href="/favorites" className="hover:text-[#2563EB]">Favorites</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

