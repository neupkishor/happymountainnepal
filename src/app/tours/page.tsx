
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Tour } from '@/lib/types';
import { TourCard } from '@/components/TourCard';
import { TourFilters } from '@/components/TourFilters';
import { Mountain } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const allDifficulties = ['Easy', 'Moderate', 'Strenuous', 'Challenging'];

export default function ToursPage() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams.get('region') || '';
  const initialSearch = searchParams.get('search') || '';

  const firestore = useFirestore();
  const packagesQuery = collection(firestore, 'packages');
  const { data: tours, isLoading: loading } = useCollection<Tour>(packagesQuery);

  const [filters, setFilters] = useState({
    search: initialSearch,
    region: initialRegion,
    difficulty: '',
  });

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: initialSearch,
      region: initialRegion,
    }));
  }, [initialRegion, initialSearch]);
  
  const allRegions = useMemo(() => tours ? [...new Set(tours.map(t => t.region))] : [], [tours]);

  const filteredTours = useMemo(() => {
    if (!tours) return [];
    return tours.filter((tour: Tour) => {
      return (
        (filters.search === '' || tour.name.toLowerCase().includes(filters.search.toLowerCase())) &&
        (filters.region === '' || tour.region === filters.region) &&
        (filters.difficulty === '' || tour.difficulty === filters.difficulty)
      );
    });
  }, [filters, tours]);

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
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-8 w-3/4" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTours.length > 0 ? (
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
