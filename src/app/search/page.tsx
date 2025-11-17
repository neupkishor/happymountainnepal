
"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore'; // Added where
import type { Tour } from '@/lib/types';
import { TourCard } from '@/components/TourCard';
import { CardsGrid } from '@/components/CardsGrid';
import { Mountain, Search as SearchIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RecommendedTours } from '@/components/RecommendedTours'; // Import the new component

function SearchComponent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [submittedTerm, setSubmittedTerm] = useState(initialQuery);
  
  const firestore = useFirestore();
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;
    const fetchTours = async () => {
      setLoading(true);
      const q = query(collection(firestore, 'packages'), where('status', '==', 'published')); // Filter by published status
      const querySnapshot = await getDocs(q);
      const tours = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour));
      setAllTours(tours);
      setLoading(false);
    };
    fetchTours();
  }, [firestore]);

  useEffect(() => {
    setSearchTerm(initialQuery);
    setSubmittedTerm(initialQuery);
  }, [initialQuery]);

  const filteredTours = useMemo(() => {
    if (!submittedTerm || !allTours) return [];
    return allTours.filter((tour: Tour) => {
      return tour.name.toLowerCase().includes(submittedTerm.toLowerCase());
    });
  }, [submittedTerm, allTours]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSubmittedTerm(searchTerm);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold !font-headline text-center mb-6">Search Our Tours</h1>
        <form onSubmit={handleSearch} className="relative w-full">
            <Input
              type="text"
              placeholder="Search for tours, e.g., 'Everest'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/90 text-foreground placeholder:text-muted-foreground w-full rounded-full py-6 pl-6 pr-16 border-2 border-primary/50 focus:border-primary focus:ring-primary/20 focus:ring-4 transition-all"
            />
            <Button type="submit" size="icon" disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SearchIcon className="h-5 w-5" />
              )}
              <span className="sr-only">Search</span>
            </Button>
        </form>
      </div>
      
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading tours...</p>
        </div>
      ) : submittedTerm ? (
        <div>
            <h2 className="text-2xl font-bold !font-headline mb-8">
                Results for &quot;{submittedTerm}&quot; ({filteredTours.length})
            </h2>
            {filteredTours.length > 0 ? (
                <CardsGrid>
                {filteredTours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                ))}
                </CardsGrid>
            ) : (
                <div className="text-center py-16 bg-card rounded-lg">
                <Mountain className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Tours Found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    We couldn't find any tours matching your search. Please try a different term.
                </p>
                </div>
            )}
        </div>
      ) : (
        <RecommendedTours />
      )}
    </div>
  );
}


export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchComponent />
    </Suspense>
  )
}
