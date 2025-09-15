import { tours } from '@/lib/data';
import { TourCard } from './TourCard';
import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

export function FeaturedTours() {
  const featuredTours = tours.slice(0, 3);

  return (
    <section className="py-16 lg:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold !font-headline">Featured Treks & Tours</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Handpicked journeys that promise unforgettable memories and spectacular views.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/tours">
            <Button size="lg" variant="outline">
              View All Tours <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
