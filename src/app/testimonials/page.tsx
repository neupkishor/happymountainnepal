
'use client';
import { useCollection, useFirestore } from '@/firebase';
import { collectionGroup, query, orderBy } from 'firebase/firestore';
import type { Review } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewStars } from '@/components/ReviewStars';
import type { Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function TestimonialsPage() {
  const firestore = useFirestore();
  const reviewsQuery = query(collectionGroup(firestore, 'reviews'), orderBy('date', 'desc'));
  const { data: allReviews, isLoading } = useCollection<(Review & { tourName: string })>(reviewsQuery);

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold !font-headline">What Our Adventurers Say</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Real stories from travelers who have explored the Himalayas with us.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
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
            {allReviews?.map((review, index) => (
            <Card key={`${review.id}-${index}`} className="flex flex-col">
                <CardContent className="p-6 flex-grow">
                <div className="flex items-center gap-4 mb-4">
                    <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.author}`} />
                    <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                    <p className="font-semibold">{review.author}</p>
                    <p className="text-xs text-muted-foreground">on {review.tourName}</p>
                    </div>
                </div>
                <ReviewStars rating={review.rating} />
                <p className="text-muted-foreground italic mt-4">&quot;{review.comment}&quot;</p>
                </CardContent>
            </Card>
            ))}
        </div>
      )}
    </div>
  );
}
