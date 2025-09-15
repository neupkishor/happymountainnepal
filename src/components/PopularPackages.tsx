import { tours } from '@/lib/data';
import { TourCard } from './TourCard';
import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

export function PopularPackages() {
  // For now, we'll feature the same tours as the featured section.
  // This can be changed later to a different selection logic.
  const popularTours = tours.slice(0, 3);

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold !font-headline">Popular Packages</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Discover our most sought-after adventures, loved by travelers from around the world.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/tours">
            <Button size="lg">
              View All Packages <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
