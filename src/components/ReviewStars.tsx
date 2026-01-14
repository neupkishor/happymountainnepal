'use client';

import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewStarsProps {
  rating: number;
  className?: string;
  starClass?: string;
}

export function ReviewStars({ rating, className, starClass }: ReviewStarsProps) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  const starClassName = cn("h-4 w-4", starClass);

  return (
    <div className={cn("flex items-center gap-0.5 text-amber-500", className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={cn(starClassName, "fill-current")} />
      ))}
      {halfStar && <StarHalf key="half" className={cn(starClassName, "fill-current")} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={cn(starClassName, "text-muted-foreground/50")} />
      ))}
    </div>
  );
}
