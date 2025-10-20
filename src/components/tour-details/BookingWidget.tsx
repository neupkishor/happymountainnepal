"use client";

import { useState } from 'react';
import type { Tour } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link'; // Import Link

interface BookingWidgetProps {
  tour: Tour;
}

export function BookingWidget({ tour }: BookingWidgetProps) {
  const departureDays = tour.departureDates.map(d => d.date instanceof Timestamp ? d.date.toDate() : new Date(d.date));
  const guaranteedDays = tour.departureDates.filter(d => d.guaranteed).map(d => d.date instanceof Timestamp ? d.date.toDate() : new Date(d.date));
  
  const [date, setDate] = useState<Date | undefined>(departureDays.length > 0 ? departureDays[0] : undefined); // Default to undefined if no dates
  const { toast } = useToast();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(tour.id);

  const handleInternalBooking = () => {
    if (!tour.anyDateAvailable && !date) {
      toast({
        variant: 'destructive',
        title: 'Booking Error',
        description: 'Please select a departure date.',
      });
      return;
    }

    toast({
      title: "Booking Submitted!",
      description: "This is a demo. No actual booking has been made.",
    });
  }

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(tour.id);
      toast({ title: "Removed from wishlist!" });
    } else {
      addToWishlist(tour.id);
      toast({ title: "Added to wishlist!" });
    }
  };

  return (
    <Card className="sticky top-24 shadow-lg">
      <CardHeader>
        <CardTitle className="flex justify-between items-baseline">
          <div>
            <span className="text-muted-foreground text-base font-normal">From </span>
            <span className="text-3xl font-bold text-primary">${tour.price}</span>
            <span className="text-muted-foreground text-base font-normal">/person</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tour.bookingType === 'internal' ? (
          <div>
            <h4 className="font-semibold mb-2">Select Departure Date</h4>
            {tour.anyDateAvailable ? (
              <div className="p-4 border rounded-md bg-secondary text-center text-muted-foreground">
                This tour is available on any date.
              </div>
            ) : (
              <>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  modifiers={{
                    departure: departureDays,
                    guaranteed: guaranteedDays
                  }}
                  modifiersStyles={{
                    departure: {
                      border: '2px solid hsl(var(--primary))',
                      color: 'hsl(var(--primary))',
                      fontWeight: 'bold',
                    },
                    guaranteed: {
                      fontWeight: 'bold',
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Dates in green are guaranteed departures.
                </p>
              </>
            )}
            <Button onClick={handleInternalBooking} className="w-full text-lg h-12 mt-4">
              Book Now
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center">
              This tour is booked via an external partner.
            </p>
            <Button asChild className="w-full text-lg h-12">
              <Link href={tour.externalBookingUrl || '#'} target="_blank" rel="noopener noreferrer">
                Book on External Site
              </Link>
            </Button>
          </div>
        )}
        
        <Button onClick={handleWishlistToggle} variant="outline" className="w-full">
          <Heart className={cn('mr-2 h-4 w-4', isWishlisted ? 'text-red-500 fill-current' : '')} />
          {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </Button>
      </CardContent>
    </Card>
  );
}