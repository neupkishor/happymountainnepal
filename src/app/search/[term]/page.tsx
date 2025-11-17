

import { Suspense } from 'react';
import { TourCard } from '@/components/TourCard';
import { CardsGrid } from '@/components/CardsGrid';
import { Mountain } from 'lucide-react';
import { RecommendedTours } from '@/components/RecommendedTours';
import { searchTours } from '@/ai/flows/search-tours-flow';
import { SearchForm } from '@/components/SearchForm';

async function SearchResults({ term }: { term: string }) {
  const decodedTerm = decodeURIComponent(term);
  const { tours } = await searchTours(decodedTerm);

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold !font-headline text-center mb-6">
            Search Results for &quot;{decodedTerm}&quot;
        </h1>
        <SearchForm initialTerm={decodedTerm} />
      </div>
      
      {tours.length > 0 ? (
        <CardsGrid>
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </CardsGrid>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg">
            <Mountain className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Tours Found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                We couldn&apos;t find any tours matching your search for &quot;{decodedTerm}&quot;.
            </p>
        </div>
      )}

      {/* Recommendations on No Results */}
      {tours.length === 0 && (
        <div className="mt-16">
            <RecommendedTours />
        </div>
      )}
    </div>
  );
}

export default function SearchTermPage({ params }: { params: { term: string } }) {
  return (
    <Suspense fallback={<div className="container mx-auto py-12">Loading search results...</div>}>
      <SearchResults term={params.term} />
    </Suspense>
  )
}
