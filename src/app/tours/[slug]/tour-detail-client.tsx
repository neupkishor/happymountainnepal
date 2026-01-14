
'use client';
import { ImageGallery } from '@/components/tour-details/ImageGallery';
import { KeyFacts } from '@/components/tour-details/KeyFacts';
import { Itinerary } from '@/components/tour-details/Itinerary';
import { BookingWidget } from '@/components/tour-details/BookingWidget';
import { Reviews } from '@/components/tour-details/Reviews';
import { InclusionsExclusions } from '@/components/tour-details/InclusionsExclusions';
import { TourGallery } from '@/components/tour-details/TourGallery';
import { FaqSection } from '@/components/tour-details/FaqSection';
import { AdditionalInfoSection } from '@/components/tour-details/AdditionalInfoSection';
import { GearsSection } from '@/components/tour-details/GearsSection';
import { GuidesSection } from '@/components/tour-details/GuidesSection';
import Image from 'next/image';
import { TourNav } from '@/components/tour-details/TourNav';
import type { Tour, ManagedReview } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { getReviewsForPackage, logError, getAllTourNamesMap, getGeneralReviews } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { Chatbot } from '@/components/Chatbot';
import { getTourChatMessage } from '@/lib/chat-messages';

interface TourDetailClientProps {
  tour: Tour;
  tempUserId: string;
}

const RECENTLY_VIEWED_KEY = 'happy-mountain-recent-tours';
const MAX_RECENTLY_VIEWED = 10;

export default function TourDetailClient({ tour, tempUserId }: TourDetailClientProps) {
  const [displayedReviews, setDisplayedReviews] = useState<ManagedReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [hasMorePackageReviews, setHasMorePackageReviews] = useState(true);
  const [hasMoreGeneralReviews, setHasMoreGeneralReviews] = useState(true);
  const [lastPackageReviewDocId, setLastPackageReviewDocId] = useState<string | null>(null);
  const [lastGeneralReviewDocId, setLastGeneralReviewDocId] = useState<string | null>(null);
  const [allToursMap, setAllToursMap] = useState<Map<string, string>>(new Map());
  const { toast } = useToast();
  const pathname = usePathname();

  // Log recently viewed tour
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let recentlyViewed: string[] = stored ? JSON.parse(stored) : [];

      recentlyViewed = recentlyViewed.filter(id => id !== tour.id);
      recentlyViewed.unshift(tour.id);

      const updatedRecentlyViewed = recentlyViewed.slice(0, MAX_RECENTLY_VIEWED);

      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updatedRecentlyViewed));
    } catch (error) {
      console.error("Failed to update recently viewed tours in localStorage", error);
    }
  }, [tour.id]);

  const fetchReviews = useCallback(async (isInitialLoad: boolean = false) => {
    setIsLoadingReviews(true);
    try {
      if (isInitialLoad) {
        // Use reviews directly embedded in the tour object
        // Map to ManagedReview structure if necessary, though Review and ManagedReview are similar.
        // Review type: { id, author, comment, rating, date, globalId? }
        // ManagedReview type: { id, userName, reviewBody, stars, reviewedOn, ... }
        // We need to transform Tour Review -> ManagedReview format for the Reviews component
        const localReviews = (tour.reviews || []).map(r => ({
          id: r.id,
          type: 'onSite', // Defaulting since it's local
          userName: r.author,
          reviewBody: r.comment,
          stars: r.rating as 1 | 2 | 3 | 4 | 5,
          reviewedOn: r.date,
          reviewFor: tour.id
        } as ManagedReview));

        if (localReviews.length > 0) {
          setDisplayedReviews(localReviews);
          setHasMorePackageReviews(false); // Local reviews are all loaded at once
          setHasMoreGeneralReviews(false);
        } else {
          // If no local reviews, fallback to general reviews? Or valid to show empty?
          // Previous logic fell back to general reviews. Let's keep that behavior if requested, 
          // BUT the prompt says "i don't the reviews we're fetching on the reviews page is directly from the reviews key in the package. we're still looking for reviews on the reviews collection directly. make the change."
          // This phrasing is slightly ambiguous: "I don't [think/want/like] the reviews... is directly from the reviews key... we're still looking for reviews on the reviews collection directly."
          // WAIT. The prompt likely means: "I DO NOT WANT the reviews to be fetched from the reviews collection. I WANT them to be from the reviews key in the package."
          // OR "I don't [see that] the reviews... [are] directly from the reviews key... we're still looking [at the collection]. Make the change [to use the key]."
          // Context: I just implemented the reviews key management.
          // So, I should switch to using tour.reviews.

          // If empty, maybe fetch general?
          if (localReviews.length === 0) {
            const generalReviewsResult = await getGeneralReviews(tour.id, null);
            setDisplayedReviews(generalReviewsResult.reviews);
            setLastGeneralReviewDocId(generalReviewsResult.lastDocId);
            setHasMoreGeneralReviews(generalReviewsResult.hasMore);
          }
        }
      } else {
        // Load more logic... 
        // If we started with local reviews (tour.reviews), we probably don't have "more" of them since they are all in the object.
        // So only general reviews would be "more".
        if (hasMoreGeneralReviews) {
          const generalReviewsResult = await getGeneralReviews(tour.id, lastGeneralReviewDocId);
          setDisplayedReviews(prev => [...prev, ...generalReviewsResult.reviews]);
          setLastGeneralReviewDocId(generalReviewsResult.lastDocId);
          setHasMoreGeneralReviews(generalReviewsResult.hasMore);
        }
      }
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      // logError...
    } finally {
      setIsLoadingReviews(false);
    }
  }, [tour.id, tour.reviews, lastGeneralReviewDocId, hasMoreGeneralReviews, pathname, toast]);

  useEffect(() => {
    // Reset state
    // setDisplayedReviews([]); // Don't allow empty flash if we have data
    setLastPackageReviewDocId(null);
    setLastGeneralReviewDocId(null);
    setHasMorePackageReviews(false); // Default to false since we load from props
    setHasMoreGeneralReviews(true);

    fetchReviews(true);

    const fetchAllTourNames = async () => {
      const map = await getAllTourNamesMap();
      setAllToursMap(map);
    };
    fetchAllTourNames();
  }, [tour.id, fetchReviews]);

  const handleLoadMore = () => {
    if ((hasMorePackageReviews || hasMoreGeneralReviews) && !isLoadingReviews) {
      fetchReviews();
    }
  };

  const hasAnyMoreReviews = hasMorePackageReviews || hasMoreGeneralReviews;

  const averageRating = displayedReviews.length > 0
    ? (displayedReviews.reduce((acc, review) => acc + review.stars, 0) / displayedReviews.length)
    : 0;

  const itineraryItems = tour.itinerary?.map(item => ({
    "@type": "ListItem",
    "position": item.day,
    "name": item.title,
    "description": item.description,
  }));

  const faqItems = tour.faq?.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }));

  const currentYear = new Date().getFullYear();
  const priceValidUntil = `${currentYear}-12-31`;

  const jsonLdSchema: any[] = [{
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": tour.name,
    "description": tour.description,
    "image": tour.mainImage.url,
    "url": `https://happymountainnepal.com/tours/${tour.slug}`,
    "provider": {
      "@type": "Organization",
      "name": "Happy Mountain Nepal",
      "url": "https://happymountainnepal.com",
      "logo": "https://cdn.neupgroup.com/p3happymountainnepal/logo.png"
    },
    ...(averageRating > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": averageRating.toFixed(1),
        "reviewCount": displayedReviews.length
      }
    }),
    "offers": {
      "@type": "Offer",
      "price": tour.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": `https://happymountainnepal.com/tours/${tour.slug}`,
      "priceValidUntil": priceValidUntil,
    },
    ...(itineraryItems && itineraryItems.length > 0 && {
      "itinerary": {
        "@type": "ItemList",
        "itemListElement": itineraryItems
      }
    }),
  }];

  if (faqItems && faqItems.length > 0) {
    jsonLdSchema.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems
    });
  }

  const chatMessages = useMemo(() => getTourChatMessage(tour.name), [tour.name]);

  return (
    <>
      <div className="bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
        <ImageGallery images={tour.images} mainImage={tour.mainImage} tourName={tour.name} />

        <TourNav tour={tour} reviews={displayedReviews} />

        <div className="container mx-auto py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">

            <div className="lg:col-span-2 space-y-12">
              <header>
                <h1 className="text-4xl md:text-5xl font-bold !font-headline text-primary">{tour.name}</h1>
                <div
                  className="mt-4 text-lg text-muted-foreground [&_p]:mb-4 last:[&_p]:mb-0"
                  dangerouslySetInnerHTML={{ __html: tour.description }}
                />
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
                  hasMore={hasAnyMoreReviews}
                  onLoadMore={handleLoadMore}
                  allToursMap={allToursMap}
                />
              </section>

              {tour.gears && tour.gears.length > 0 && (
                <section id="gears" className="scroll-m-32">
                  <GearsSection gears={tour.gears} />
                </section>
              )}

              {tour.additionalInfoSections && tour.additionalInfoSections.length > 0 && (
                <section id="additional-info" className="scroll-m-32">
                  <AdditionalInfoSection sections={tour.additionalInfoSections} />
                </section>
              )}

              {tour.guides && tour.guides.length > 0 && (
                <section id="guides" className="scroll-m-32">
                  <GuidesSection guides={tour.guides} />
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
      <Chatbot
        prefilledWhatsapp={chatMessages.whatsapp}
        prefilledEmail={chatMessages.email}
        tempUserId={tempUserId}
      />
    </>
  );
}
