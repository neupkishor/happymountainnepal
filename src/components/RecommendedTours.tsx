'use client';
import { useState, useEffect, useMemo } from 'react';
import type { Tour } from '@/lib/types';
import { useWishlist } from '@/context/WishlistContext';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { MinimalTourCard } from './MinimalTourCard';
import { Skeleton } from './ui/skeleton';
import { Heart } from 'lucide-react';

const RECENTLY_VIEWED_KEY = 'happy-mountain-recent-tours';
const DISPLAY_COUNT = 4;

export function RecommendedTours() {
  const { wishlist } = useWishlist();
  const firestore = useFirestore();

  const [recommendedTours, setRecommendedTours] = useState<Tour[]>([]);
  const [recommendationType, setRecommendationType] = useState<'wishlist' | 'recent' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!firestore) return;
      setIsLoading(true);

      const allToursQuery = query(collection(firestore, 'packages'), where('status', '==', 'published'));
      const allToursSnapshot = await getDocs(allToursQuery);
      const allTours = allToursSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour));
      
      const toursMap = new Map(allTours.map(tour => [tour.id, tour]));
      
      // 1. Prioritize Wishlist
      if (wishlist.length > 0) {
        const toursFromWishlist = wishlist
          .map(id => toursMap.get(id))
          .filter((tour): tour is Tour => !!tour)
          .slice(0, DISPLAY_COUNT);
        
        if (toursFromWishlist.length > 0) {
          setRecommendedTours(toursFromWishlist);
          setRecommendationType('wishlist');
          setIsLoading(false);
          return;
        }
      }
      
      // 2. Fallback to Recently Viewed
      const recentlyViewedIds: string[] = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
      if (recentlyViewedIds.length > 0) {
        const toursFromHistory = recentlyViewedIds
          .map(id => toursMap.get(id))
          .filter((tour): tour is Tour => !!tour)
          .slice(0, DISPLAY_COUNT);

        if (toursFromHistory.length > 0) {
          setRecommendedTours(toursFromHistory);
          setRecommendationType('recent');
          setIsLoading(false);
          return;
        }
      }

      // 3. Fallback to just some random tours if nothing else
      setRecommendedTours(allTours.slice(0, DISPLAY_COUNT));
      setRecommendationType(null); // No specific recommendation
      setIsLoading(false);
    }
    
    fetchRecommendations();

  }, [firestore, wishlist]);

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24">
        <div className="container mx-auto">
          <Skeleton className="h-10 w-1/3 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recommendedTours.length === 0) {
    return null; // Don't render the section if there's nothing to show
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold !font-headline">You Might Like These</h2>
          {recommendationType === 'wishlist' && <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Based on your wishlist, check out these adventures!</p>}
          {recommendationType === 'recent' && <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Based on your recent activity, take another look at these trips.</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedTours.map((tour) => (
            <MinimalTourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </section>
  );
}