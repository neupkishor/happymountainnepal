"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { tours } from '@/lib/data';
import type { Tour } from '@/lib/types';
import { TourCard } from '@/components/TourCard';
import { TourFilters } from '@/components/TourFilters';
import { Mountain } from 'lucide-react';

const allRegions = [...new Set(tours.map(t => t.region))];
const allDifficulties = ['Easy', 'Moderate', 'Strenuous', 'Challenging'];

export default function ToursPage() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams.get('region') || '';
  const initialSearch = searchParams.get('search') || '';

  const [filters, setFilters] = useState({
    search: initialSearch,
    region: initialRegion,
    difficulty: '',
  });

  useEffect(() => {
    setFilters({
      search: initialSearch,
      region: initialRegion,
      difficulty: '',
    });
  }, [initialRegion, initialSearch]);
  

  const filteredTours = useMemo(() => {
    return tours.filter((tour: Tour) => {
      return (
        (filters.search === '' || tour.name.toLowerCase().includes(filters.search.toLowerCase())) &&
        (filters.region === '' || tour.region === filters.region) &&
        (filters.difficulty === '' || tour.difficulty === filters.difficulty)
      );
    });
  }, [filters]);

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold !font-headline">Find Your Perfect Trek</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Browse our collection of curated Himalayan adventures.
        </p>
      </div>

      <TourFilters 
        filters={filters} 
        setFilters={setFilters} 
        regions={allRegions} 
        difficulties={allDifficulties} 
      />
      
      {filteredTours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg">
          <Mountain className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Tours Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}
    </div>
  );
}
