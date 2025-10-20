'use client';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { ManagedReview } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewStars } from '@/components/ReviewStars';
import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { getReviewCount, getFiveStarReviews } from '@/lib/db'; // Import getReviewCount and getFiveStarReviews

const REVIEW_TRUNCATE_LENGTH = 150; // Max characters before truncating

export function Testimonials() {
  const firestore = useFirestore();
  const [reviews, setReviews] = useState<ManagedReview[]>([]);
  const [totalReviewCount, setTotalReviewCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!firestore) return;
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        // Fetch total count using the efficient getReviewCount
        const count = await getReviewCount();
        setTotalReviewCount(count);

        // Fetch 10 random 5-star reviews for display on the homepage
        const fetchedFiveStarReviews = await getFiveStarReviews();
        setReviews(fetchedFiveStarReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [firestore]);

  const toggleExpandReview = (reviewId: string) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };
  
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12 items-center">
          <div className="lg:col-span-1 text-center lg:text-left">
            {isLoading ? (
              <Skeleton className="h-12 w-32 mx-auto lg:mx-0 mb-4" />
            ) : (
              <h2 className="text-5xl md:text-6xl font-bold !font-headline text-primary mb-4">
                {totalReviewCount !== null ? `${totalReviewCount}+` : '...'}
              </h2>
            )}
            <p className="text-xl font-semibold text-foreground">
              Reviews from Our Adventurers
            </p>
            <p className="mt-2 text-muted-foreground">
              Real stories from travelers who have explored the Himalayas with us.
            </p>
            <Link href="/reviews" className="mt-6 inline-block">
              <Button size="lg" variant="outline">
                Read All Reviews <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(2)].map((_, i) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews?.map((review) => {
                  const isExpanded = expandedReviews[review.id];
                  const needsTruncation = review.reviewBody.length > REVIEW_TRUNCATE_LENGTH;
                  const displayedReviewBody = needsTruncation && !isExpanded
                    ? `${review.reviewBody.substring(0, REVIEW_TRUNCATE_LENGTH)}...`
                    : review.reviewBody;

                  return (
                    <Card key={review.id} className="flex flex-col">
                      <CardContent className="p-6 flex-grow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.userName}`} />
                              <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{review.userName}</p>
                              {review.userRole && <p className="text-xs text-muted-foreground">{review.userRole}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ReviewStars rating={review.stars} className="h-4 w-4" />
                            <span>({review.stars}/5)</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground italic mt-4">
                          &quot;{displayedReviewBody}&quot;
                        </p>
                        {needsTruncation && (
                          <Button
                            variant="link"
                            onClick={() => toggleExpandReview(review.id)}
                            className="p-0 h-auto mt-2 text-primary"
                          >
                            {isExpanded ? 'Show Less' : 'Read Full Review'}
                          </Button>
                        )}
                        {review.type === 'offSite' && review.originalReviewUrl && (
                          <div className="mt-4">
                            <a 
                                href={review.originalReviewUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center text-sm text-primary hover:underline"
                            >
                                Read from source <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}