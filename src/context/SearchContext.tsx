"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  isSearchActive: boolean;
  setIsSearchActive: (isActive: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  return (
    <SearchContext.Provider value={{ isSearchActive, setIsSearchActive }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
