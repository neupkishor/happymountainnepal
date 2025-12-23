
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { KeyFacts } from '@/components/tour-details/KeyFacts';
import { Itinerary } from '@/components/tour-details/Itinerary';
import { InclusionsExclusions } from '@/components/tour-details/InclusionsExclusions';
import { FaqSection } from '@/components/tour-details/FaqSection';
import { AdditionalInfoSection } from '@/components/tour-details/AdditionalInfoSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PenSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import type { Tour } from '@/lib/types';

type PackageDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

// Helper component for section titles with edit links
const SectionTitle = ({ title, editHref }: { title: string; editHref: string }) => (
  <div className="flex items-center gap-2 mb-6">
    <h2 className="text-2xl font-bold !font-headline">{title}</h2>
    <Link href={editHref}>
      <PenSquare className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
    </Link>
  </div>
);


export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { id } = await params;
  const tour = await getTourById(id);

  if (!tour) {
    notFound();
  }

  const allImages = [tour.mainImage, ...(tour.images || [])].filter(Boolean);

  const getStatusVariant = (status: Tour['status']) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'unpublished': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold !font-headline">{tour.name}</h1>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getStatusVariant(tour.status)}>
              {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
            </Badge>
            <span className="text-sm text-muted-foreground font-mono">{tour.id}</span>
          </div>
        </div>
      </div>

      {allImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {allImages.map((src, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
              <Image src={src} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
              {index === 0 && <Badge variant="secondary" className="absolute top-2 left-2">Main Image</Badge>}
            </div>
          ))}
        </div>
      )}

      <div>
        <SectionTitle title="Key Facts" editHref={`/manage/packages/${tour.id}/basics`} />
        <KeyFacts tour={tour} />
      </div>

      <div>
        <SectionTitle title="Booking &amp; Pricing" editHref={`/manage/packages/${tour.id}/booking`} />
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Base Price</span>
              <span className="font-semibold">${tour.price} USD</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Booking Type</span>
              <Badge variant="outline">{tour.bookingType}</Badge>
            </div>
            {tour.bookingType === 'external' && tour.externalBookingUrl && (
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">External URL</span>
                <a href={tour.externalBookingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-xs">{tour.externalBookingUrl}</a>
              </div>
            )}
            <div>
              <h4 className="font-semibold mb-2">Departure Dates</h4>
              {tour.departureDates && tour.departureDates.length > 0 ? (
                <ul className="space-y-1">
                  {tour.departureDates.map((d, i) => {
                    const date = d.date instanceof Timestamp ? d.date.toDate() : new Date(d.date);
                    return (
                      <li key={i} className="flex justify-between text-sm">
                        <span>{format(date, 'PPP')}</span>
                        <span>${d.price} {d.guaranteed && <Badge variant="default" className="ml-2">Guaranteed</Badge>}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{tour.anyDateAvailable ? "Available any date." : "No specific departure dates."}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {tour.itinerary && tour.itinerary.length > 0 && (
        <div>
          <SectionTitle title="Daily Itinerary" editHref={`/manage/packages/${tour.id}/itinerary`} />
          <Itinerary items={tour.itinerary} />
        </div>
      )}

      {(tour.inclusions && tour.inclusions.length > 0) || (tour.exclusions && tour.exclusions.length > 0) ? (
        <div>
          <SectionTitle title="Inclusions &amp; Exclusions" editHref={`/manage/packages/${tour.id}/inclusions`} />
          <InclusionsExclusions tour={tour} />
        </div>
      ) : null}

      {tour.map && (
        <div>
          <SectionTitle title="Trek Map" editHref={`/manage/packages/${tour.id}/media`} />
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video">
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
            </CardContent>
          </Card>
        </div>
      )}

      {tour.faq && tour.faq.length > 0 && (
        <div>
          <SectionTitle title="Frequently Asked Questions" editHref={`/manage/packages/${tour.id}/faq`} />
          <FaqSection faq={tour.faq} />
        </div>
      )}

      {tour.additionalInfoSections && tour.additionalInfoSections.length > 0 && (
        <div>
          <SectionTitle title="Additional Information" editHref={`/manage/packages/${tour.id}/info`} />
          <AdditionalInfoSection sections={tour.additionalInfoSections} />
        </div>
      )}

    </div>
  );
}
