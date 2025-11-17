
'use client';

import { SearchForm } from '@/components/SearchForm';
import { RecommendedTours } from '@/components/RecommendedTours';

function SearchPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold !font-headline text-center mb-6">Search Our Tours</h1>
        <SearchForm />
      </div>
      
      <RecommendedTours />
    </div>
  );
}

export default SearchPage;
