import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewStarsProps {
  rating: number;
  className?: string;
}

export function ReviewStars({ rating, className }: ReviewStarsProps) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-0.5 text-amber-500", className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-5 w-5 fill-current" />
      ))}
      {halfStar && <StarHalf key="half" className="h-5 w-5 fill-current" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-5 w-5 text-muted-foreground/50" />
      ))}
    </div>
  );
}
