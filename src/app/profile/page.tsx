
"use client";

import { useWishlist } from '@/context/WishlistContext';
import { TourCard } from '@/components/TourCard';
import { Heart, Loader2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import type { Tour } from '@/lib/types';
import { useAuth, useDoc, useFirestore, useUser, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, collection } from 'firebase/firestore';
import type { Account } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { wishlist } = useWishlist();
  const [wishlistedTours, setWishlistedTours] = useState<Tour[]>([]);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const accountRef = user ? doc(firestore, 'accounts', user.uid) : null;
  const { data: account, isLoading: isAccountLoading } = useDoc<Account>(accountRef);

  const packagesQuery = collection(firestore, 'packages');
  const { data: allTours, isLoading: isToursLoading } = useCollection<Tour>(packagesQuery);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  useEffect(() => {
    if (allTours) {
        setWishlistedTours(allTours.filter(tour => wishlist.includes(tour.id)));
    }
  }, [wishlist, allTours]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isUserLoading || isAccountLoading || isToursLoading) {
    return (
        <div className="container mx-auto py-12">
            <div className="mb-12 flex flex-col items-center text-center gap-4">
                 <Skeleton className="h-24 w-24 rounded-full" />
                 <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                 </div>
            </div>
             <h2 className="text-2xl md:text-3xl font-bold !font-headline mb-8 text-center">Your Wishlist</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                ))}
             </div>
        </div>
    );
  }

  if (!user || !account) {
    return null; // Redirect is handled by the effect
  }

  return (
    <div className="container mx-auto py-12">
      <div className="mb-12">
        <div className="flex flex-col items-center text-center gap-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${account.fullName}`} />
                <AvatarFallback>{account.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl md:text-4xl font-bold !font-headline">{account.fullName}</h1>
                <p className="text-muted-foreground">{account.email}</p>
            </div>
             <Button onClick={handleSignOut} variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
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
