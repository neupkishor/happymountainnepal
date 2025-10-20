
'use client';
import { ImageGallery } from '@/components/tour-details/ImageGallery';
import { KeyFacts } from '@/components/tour-details/KeyFacts';
import { Itinerary } from '@/components/tour-details/Itinerary';
import { BookingWidget } from '@/components/tour-details/BookingWidget';
import { Reviews } from '@/components/tour-details/Reviews';
import { InclusionsExclusions } from '@/components/tour-details/InclusionsExclusions';
import Image from 'next/image';
import { TourNav } from '@/components/tour-details/TourNav';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Tour } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type TourDetailPageProps = {
  params: {
    slug: string;
  };
};

export default function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = params;
  const firestore = useFirestore();

  const tourQuery = query(collection(firestore, 'packages'), where('slug', '==', slug));
  const { data: tours, isLoading } = useCollection<Tour>(tourQuery);
  const tour = useMemo(() => tours?.[0], [tours]);

  if (isLoading || !tour) {
    return (
         <div className="bg-background">
            <Skeleton className="h-[40vh] md:h-[60vh] w-full" />
            <div className="container mx-auto py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
                    <div className="lg:col-span-2 space-y-12">
                         <Skeleton className="h-12 w-3/4" />
                         <Skeleton className="h-6 w-full" />
                         <Skeleton className="h-6 w-5/6" />
                    </div>
                </div>
            </div>
         </div>
    );
  }

  return (
    <div className="bg-background">
      <ImageGallery images={tour.images} mainImage={tour.mainImage} tourName={tour.name} />
      
      <TourNav />

      <div className="container mx-auto py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            <header>
              <h1 className="text-4xl md:text-5xl font-bold !font-headline text-primary">{tour.name}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{tour.description}</p>
            </header>

            {/* Booking Widget for mobile */}
            <div className="lg:hidden my-8">
              <BookingWidget tour={tour} />
            </div>
            
            <section id="key-facts" className="scroll-m-20">
                <KeyFacts tour={tour} />
            </section>
            <section id="itinerary" className="scroll-m-20">
                <Itinerary items={tour.itinerary} />
            </section>
            <section id="inclusions" className="scroll-m-20">
                <InclusionsExclusions tour={tour} />
            </section>
            
            <section id="map" className="scroll-m-20">
              <h2 className="text-3xl font-bold !font-headline mb-6">Trek Map</h2>
              <div className="bg-card p-4 rounded-lg shadow-sm">
                <Image src={tour.mapImage} alt={`Map for ${tour.name}`} width={800} height={600} className="w-full rounded-md" data-ai-hint="map illustration" />
              </div>
            </section>

            <section id="reviews" className="scroll-m-20">
                <Reviews reviews={tour.reviews} />
            </section>
          </div>

          {/* Sidebar for Desktop */}
          <aside className="lg:col-span-1 mt-12 lg:mt-0 hidden lg:block">
            <BookingWidget tour={tour} />
          </aside>
        </div>
      </div>
    </div>
  );
}
