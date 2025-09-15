"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { tours } from '@/lib/data';
import type { Tour } from '@/lib/types';
import { TourCard } from '@/components/TourCard';
import { Mountain } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [submittedTerm, setSubmittedTerm] = useState(initialQuery);

  useEffect(() => {
    setSearchTerm(initialQuery);
    setSubmittedTerm(initialQuery);
  }, [initialQuery]);
  

  const filteredTours = useMemo(() => {
    if (!submittedTerm) return [];
    return tours.filter((tour: Tour) => {
      return tour.name.toLowerCase().includes(submittedTerm.toLowerCase());
    });
  }, [submittedTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedTerm(searchTerm);
  };

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold !font-headline text-center mb-6">Search Our Tours</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for tours, e.g., 'Everest'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Button type="submit" size="lg">
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
        </form>
      </div>
      
      {submittedTerm && (
        <div>
            <h2 className="text-2xl font-bold !font-headline mb-8">
                Results for &quot;{submittedTerm}&quot; ({filteredTours.length})
            </h2>
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
                    We couldn't find any tours matching your search. Please try a different term.
                </p>
                </div>
            )}
        </div>
      )}
    </div>
  );
}
