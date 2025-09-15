import type { Tour } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewStars } from '@/components/ReviewStars';
import type { Timestamp } from 'firebase/firestore';

interface ReviewsProps {
  reviews: Tour['reviews'];
}

export function Reviews({ reviews }: ReviewsProps) {
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

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

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
            const displayDate = review.date instanceof Timestamp ? review.date.toDate().toLocaleDateString() : review.date;
            return (
              <div key={review.id} className="flex gap-4">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.author}`} />
                  <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{review.author}</p>
                    <span className="text-xs text-muted-foreground">&bull;</span>
                    <p className="text-xs text-muted-foreground">{displayDate}</p>
                  </div>
                  <ReviewStars rating={review.rating} />
                  <p className="mt-2 text-muted-foreground">{review.comment}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  );
}
