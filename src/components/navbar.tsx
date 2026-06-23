"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, BookOpen, Star, FolderHeart, PlusCircle, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "./ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/recipes", label: "Browse", icon: BookOpen },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/collections", label: "Collections", icon: FolderHeart },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exclude navbar styling if we are exactly on the landing page hero state (optional),
  // but a sleek glassmorphic navbar looks excellent everywhere.
  
  return (
    <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-md border-b border-slate-100 no-print transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#22C55E] flex items-center justify-center text-white shadow-md shadow-blue-100 group-hover:scale-105 transition-transform duration-200">
            <ChefHat className="h-5 w-5" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[#0F172A]">
            Recipe<span className="text-[#2563EB]">Vault</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <span className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-[#2563EB]"
                    : "text-slate-600 hover:text-[#0F172A] hover:bg-slate-50"
                }`}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/recipes/new">
            <Button size="sm" className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] gap-1.5 py-2">
              <PlusCircle className="h-4 w-4" />
              Add Recipe
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-[#0F172A] hover:bg-slate-50 transition-colors"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg px-4 py-4 flex flex-col gap-2 animate-in slide-in-from-top duration-200">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <span className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${
                  isActive
                    ? "bg-blue-50 text-[#2563EB]"
                    : "text-slate-600 hover:text-[#0F172A] hover:bg-slate-50"
                }`}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                </span>
              </Link>
            );
          })}
          <hr className="my-2 border-slate-100" />
          <Link href="/recipes/new" onClick={() => setMobileMenuOpen(false)} className="w-full">
            <Button size="md" className="w-full rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] gap-2 py-3">
              <PlusCircle className="h-5 w-5" />
              Add Recipe
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};
export default Navbar;
