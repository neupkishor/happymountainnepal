"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (tourId: string) => void;
  removeFromWishlist: (tourId: string) => void;
  isInWishlist: (tourId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('happy-mountain-wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error("Failed to load wishlist from localStorage", error);
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('happy-mountain-wishlist', JSON.stringify(wishlist));
    } catch (error) {
        console.error("Failed to save wishlist to localStorage", error);
    }
  }, [wishlist]);

  const addToWishlist = (tourId: string) => {
    setWishlist((prev) => {
      if (!prev.includes(tourId)) {
        return [...prev, tourId];
      }
      return prev;
    });
  };

  const removeFromWishlist = (tourId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== tourId));
  };

  const isInWishlist = (tourId: string) => {
    return wishlist.includes(tourId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
