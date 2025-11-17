'use server';

import { Suspense } from 'react';
import { TourCard } from '@/components/TourCard';
import { CardsGrid } from '@/components/CardsGrid';
import { Mountain } from 'lucide-react';
import { RecommendedTours } from '@/components/RecommendedTours';
import { searchToursAndGenerateContext } from '@/ai/flows/search-tours-flow';

async function SearchResults({ term }: { term: string }) {
  const decodedTerm = decodeURIComponent(term);
  const { tours, context } = await searchToursAndGenerateContext(decodedTerm);

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl md:text-4xl font-bold !font-headline mb-8">
        Results for &quot;{decodedTerm}&quot;
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
                <h2 className="text-xl font-bold !font-headline border-b pb-2">About {decodedTerm}</h2>
                <div 
                    className="prose prose-sm max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: context }}
                />
            </div>
        </aside>
        <main className="lg:col-span-3">
          {tours.length > 0 ? (
            <CardsGrid>
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </CardsGrid>
          ) : (
            <div className="space-y-12">
                <div className="text-center py-16 bg-card rounded-lg">
                    <Mountain className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Tours Found</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                        We couldn&apos;t find any tours matching your search, but here&apos;s some interesting things about this place.
                    </p>
                </div>
                <RecommendedTours />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage({ params }: { params: { term: string } }) {
  return (
    <Suspense fallback={<div className="container mx-auto py-12">Loading search results...</div>}>
      <SearchResults term={params.term} />
    </Suspense>
  )
}
