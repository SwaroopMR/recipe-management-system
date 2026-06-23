"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recipe_vault_favorites");
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load favorites from localStorage", e);
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to local storage when they change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("recipe_vault_favorites", JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  }, [favorites, isLoaded]);

  const addFavorite = (id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((favId) => favId !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.includes(id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
