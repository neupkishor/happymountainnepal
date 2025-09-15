"use client";

import { useWishlist } from '@/context/WishlistContext';
import { tours } from '@/lib/data';
import { TourCard } from '@/components/TourCard';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { wishlist } = useWishlist();
  const wishlistedTours = tours.filter(tour => wishlist.includes(tour.id));
  const userName = "Alex Doe"; // Placeholder name

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex flex-col items-center text-center gap-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName}`} />
                <AvatarFallback>{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl md:text-4xl font-bold !font-headline">{userName}</h1>
                <p className="text-muted-foreground">Welcome back, adventurer!</p>
            </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl md:text-3xl font-bold !font-headline mb-8 text-center">Your Wishlist</h2>
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
    </div>
  );
}
