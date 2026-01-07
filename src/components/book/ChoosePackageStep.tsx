
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllPublishedTours } from '@/lib/db';
import type { Tour } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { TourCard } from '@/components/TourCard';
import { CardsGrid } from '../CardsGrid';

export function ChoosePackageStep() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchTours() {
      try {
        const tourList = await getAllPublishedTours();
        setTours(tourList);
      } catch (error) {
        console.error("Failed to fetch tours:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTours();
  }, []);

  const handlePackageSelect = (packageId: string) => {
    router.push(`/book?step=customize&package=${packageId}`);
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold !font-headline">Book Your Custom Trip</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Step 1: Choose your starting adventure.
        </p>
      </div>
      {isLoading ? (
        <CardsGrid>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ))}
        </CardsGrid>
      ) : (
        <CardsGrid>
          {tours.map(tour => (
            <div key={tour.id} onClick={() => handlePackageSelect(tour.id)} className="cursor-pointer">
              <TourCard tour={tour} />
            </div>
          ))}
        </CardsGrid>
      )}
    </div>
  );
}
