'use client';
import type { ManagedReview } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewStars } from '@/components/ReviewStars';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';

interface ReviewsProps {
  reviews: ManagedReview[];
  tourId: string;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  allToursMap: Map<string, string>; // Map of tourId -> tourName
}

export function Reviews({ reviews, tourId, isLoading, hasMore, onLoadMore, allToursMap }: ReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return (
        <div>
            <h2 className="text-3xl font-bold !font-headline mb-6">Reviews & Ratings</h2>
            <Card className="bg-card">
                <CardContent className="p-6 text-center text-muted-foreground">
                    No reviews for this tour yet. Be the first to leave one!
                </CardContent>
            </Card>
        </div>
    );
  }

  const averageRating = reviews.reduce((acc, review) => acc + review.stars, 0) / reviews.length;

  return (
    <div>
      <h2 className="text-3xl font-bold !font-headline mb-6">Reviews & Ratings</h2>
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle className="text-2xl !font-headline">
              Overall Rating
            </CardTitle>
            <div className="flex items-center gap-2">
              <ReviewStars rating={averageRating} />
              <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {reviews.map((review) => {
            const dateObject = new Date(review.reviewedOn as string);
            const displayDate = format(dateObject, 'PPP');
            
            let reviewTag = null;
            if (review.type === 'onSite' && review.reviewFor === tourId) {
                reviewTag = <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">For this package</Badge>;
            } else if (review.type === 'onSite' && review.reviewFor && review.reviewFor !== tourId) {
                const otherTourName = allToursMap.get(review.reviewFor);
                reviewTag = (
                    <Link href={`/tours/${review.reviewFor}`} className="hover:underline">
                        <Badge variant="secondary">For: {otherTourName || 'Another Package'}</Badge>
                    </Link>
                );
            } else if (review.type === 'offSite') {
                reviewTag = <Badge variant="outline">Off-site Review</Badge>;
            }

            return (
              <div key={review.id} className="flex gap-4">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.userName}`} />
                  <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{review.userName}</p>
                    {review.userRole && <span className="text-xs text-muted-foreground">({review.userRole})</span>}
                    <span className="text-xs text-muted-foreground">&bull;</span>
                    <p className="text-xs text-muted-foreground">{displayDate}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <ReviewStars rating={review.stars} />
                    {reviewTag}
                  </div>
                  <p className="mt-2 text-muted-foreground">{review.reviewBody}</p>
                  {review.type === 'offSite' && review.originalReviewUrl && (
                    <a 
                        href={review.originalReviewUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center text-sm text-primary hover:underline mt-2"
                    >
                        View Original <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
          {hasMore && (
            <div className="text-center mt-8">
              <Button onClick={onLoadMore} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Show More Reviews'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
