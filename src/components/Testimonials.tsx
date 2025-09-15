import { tours } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewStars } from '@/components/ReviewStars';
import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

export function Testimonials() {
  // Get first 3 reviews from all tours
  const allReviews = tours.flatMap(tour => tour.reviews).slice(0, 3);

  return (
    <section className="py-16 lg:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold !font-headline">What Our Adventurers Say</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Real stories from travelers who have explored the Himalayas with us.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allReviews.map((review, index) => (
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
