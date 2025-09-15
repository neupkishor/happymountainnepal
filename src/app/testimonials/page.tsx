import { getAllReviews } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewStars } from '@/components/ReviewStars';
import type { Timestamp } from 'firebase/firestore';

export default async function TestimonialsPage() {
  const allReviews = await getAllReviews();

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold !font-headline">What Our Adventurers Say</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Real stories from travelers who have explored the Himalayas with us.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allReviews.map((review, index) => (
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
    </div>
  );
}
