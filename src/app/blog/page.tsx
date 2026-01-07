import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogContent } from './BlogContent';

function BlogLoadingFallback() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold !font-headline">Travel Journal</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Guides, stories, and practical advice from our adventures in the Himalayas.
        </p>
      </div>
      <div className="max-w-xl mx-auto mb-12">
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-lg" />)}
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold !font-headline">Travel Journal</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Guides, stories, and practical advice from our adventures in the Himalayas.
        </p>
      </div>

      <Suspense fallback={<BlogLoadingFallback />}>
        <BlogContent />
      </Suspense>
    </div>
  );
}
