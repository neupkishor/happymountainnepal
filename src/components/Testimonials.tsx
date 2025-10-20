
'use client';
import { useFirestore } from '@/firebase';
import { collectionGroup, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { Review } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewStars } from '@/components/ReviewStars';
import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useState, useEffect } from 'react';

export function Testimonials() {
  const firestore = useFirestore();
  const [reviews, setReviews] = useState<(Review & { tourName: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;
    const fetchReviews = async () => {
      setIsLoading(true);
      const reviewsQuery = query(collectionGroup(firestore, 'reviews'), orderBy('date', 'desc'), limit(3));
      const querySnapshot = await getDocs(reviewsQuery);
      const fetchedReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review & { tourName: string }));
      setReviews(fetchedReviews);
      setIsLoading(false);
    };
    fetchReviews();
  }, [firestore]);
  
  return (
    <section className="py-16 lg:py-24 bg-secondary">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold !font-headline">What Our Adventurers Say</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Real stories from travelers who have explored the Himalayas with us.
          </p>
        </div>
        {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className='space-y-2'>
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews?.map((review, index) => (
                <Card key={index} className="flex flex-col">
                <CardContent className="p-6 flex-grow">
                    <div className="flex items-center gap-4 mb-4">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.author}`} />
                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{review.author}</p>
                        <ReviewStars rating={review.rating} />
                    </div>
                    </div>
                    <p className="text-muted-foreground italic">&quot;{review.comment}&quot;</p>
                </CardContent>
                </Card>
            ))}
            </div>
        )}
        <div className="text-center mt-12">
            <Link href="/testimonials">
                <Button size="lg">
                    View All Testimonials <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>
      </div>
    </section>
  );
}
