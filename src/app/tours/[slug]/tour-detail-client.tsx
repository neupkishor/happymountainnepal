'use client';
import { ImageGallery } from '@/components/tour-details/ImageGallery';
import { KeyFacts } from '@/components/tour-details/KeyFacts';
import { Itinerary } from '@/components/tour-details/Itinerary';
import { BookingWidget } from '@/components/tour-details/BookingWidget';
import { Reviews } from '@/components/tour-details/Reviews';
import { InclusionsExclusions } from '@/components/tour-details/InclusionsExclusions';
import { TourGallery } from '@/components/tour-details/TourGallery';
import { FaqSection } from '@/components/tour-details/FaqSection';
import { AdditionalInfoSection } from '@/components/tour-details/AdditionalInfoSection'; // New import
import Image from 'next/image';
import { TourNav } from '@/components/tour-details/TourNav';
import type { Tour, ManagedReview } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useCallback } from 'react';
import { getReviewsForPackage, logError, getAllTourNamesMap } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';

interface TourDetailClientProps {
  tour: Tour;
}

export default function TourDetailClient({ tour }: TourDetailClientProps) {
  const [displayedReviews, setDisplayedReviews] = useState<ManagedReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [lastReviewDocId, setLastReviewDocId] = useState<string | null>(null);
  const [allToursMap, setAllToursMap] = useState<Map<string, string>>(new Map());
  const { toast } = useToast();
  const pathname = usePathname();

  const fetchReviews = useCallback(async (isInitialLoad: boolean = false) => {
    setIsLoadingReviews(true);
    try {
      const packageReviewsResult = await getReviewsForPackage(tour.id, lastReviewDocId);
      
      setDisplayedReviews(prev => isInitialLoad ? packageReviewsResult.reviews : [...prev, ...packageReviewsResult.reviews]);
      setLastReviewDocId(packageReviewsResult.lastDocId);
      setHasMoreReviews(packageReviewsResult.hasMore);

    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      logError({ message: `Failed to fetch reviews for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id } });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load reviews. Please try again.',
      });
    } finally {
      setIsLoadingReviews(false);
    }
  }, [tour.id, lastReviewDocId, pathname, toast]);

  useEffect(() => {
    setDisplayedReviews([]);
    setLastReviewDocId(null);
    setHasMoreReviews(true);
    fetchReviews(true);

    const fetchAllTourNames = async () => {
      const map = await getAllTourNamesMap();
      setAllToursMap(map);
    };
    fetchAllTourNames();
  }, [tour.id]);

  const handleLoadMore = () => {
    if (hasMoreReviews && !isLoadingReviews) {
      fetchReviews();
    }
  };

  const averageRating = displayedReviews.length > 0 
    ? (displayedReviews.reduce((acc, review) => acc + review.stars, 0) / displayedReviews.length) 
    : 0;

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": tour.name,
    "description": tour.description,
    "image": tour.mainImage,
    "url": `https://happymountainnepal.com/tours/${tour.slug}`,
    "brand": {
      "@type": "Brand",
      "name": "Happy Mountain Nepal"
    },
    ...(tour.reviews.length > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": averageRating.toFixed(1),
        "reviewCount": tour.reviews.length
      }
    }),
    "offers": {
      "@type": "Offer",
      "price": tour.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": `https://happymountainnepal.com/tours/${tour.slug}`
    }
  };

  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <ImageGallery images={tour.images} mainImage={tour.mainImage} tourName={tour.name} />
      
      <TourNav />

      <div className="container mx-auto py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            <header>
              <h1 className="text-4xl md:text-5xl font-bold !font-headline text-primary">{tour.name}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{tour.description}</p>
            </header>

            <div className="lg:hidden my-8">
              <BookingWidget tour={tour} />
            </div>
            
            <section id="key-facts" className="scroll-m-32">
                <KeyFacts tour={tour} />
            </section>
            <section id="itinerary" className="scroll-m-32">
                <Itinerary items={tour.itinerary} />
            </section>
            <section id="inclusions" className="scroll-m-32">
                <InclusionsExclusions tour={tour} />
            </section>
            
            {tour.map && (
              <section id="map" className="scroll-m-32">
                <h2 className="text-3xl font-bold !font-headline mb-6">Trek Map</h2>
                <div className="bg-card p-4 rounded-lg shadow-sm aspect-video">
                  <iframe
                    src={tour.map}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map for ${tour.name}`}
                    className="rounded-md"
                  ></iframe>
                </div>
              </section>
            )}

            {tour.images && tour.images.length > 0 && (
              <section id="gallery" className="scroll-m-32">
                <TourGallery images={tour.images} tourName={tour.name} />
              </section>
            )}

            {tour.faq && tour.faq.length > 0 && (
              <section id="faq" className="scroll-m-32">
                <FaqSection faq={tour.faq} />
              </section>
            )}

            <section id="reviews" className="scroll-m-32">
                <Reviews 
                    reviews={displayedReviews} 
                    tourId={tour.id}
                    isLoading={isLoadingReviews}
                    hasMore={hasMoreReviews}
                    onLoadMore={handleLoadMore}
                    allToursMap={allToursMap}
                />
            </section>

            {tour.additionalInfoSections && tour.additionalInfoSections.length > 0 && (
              <section id="additional-info" className="scroll-m-32">
                <AdditionalInfoSection sections={tour.additionalInfoSections} />
              </section>
            )}
          </div>

          <aside className="lg:col-span-1 mt-12 lg:mt-0 hidden lg:block">
            <div className="sticky top-28">
              <BookingWidget tour={tour} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
