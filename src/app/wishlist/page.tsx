"use client";

import { useWishlist } from '@/context/WishlistContext';
import { tours } from '@/lib/data';
import { TourCard } from '@/components/TourCard';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const wishlistedTours = tours.filter(tour => wishlist.includes(tour.id));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold !font-headline">Your Wishlist</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Your saved adventures for future planning.
        </p>
      </div>

      {wishlistedTours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistedTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Your Wishlist is Empty</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse our tours and click the heart icon to save your favorites.
          </p>
          <Link href="/tours" className="mt-6 inline-block">
            <Button>Explore Tours</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
