
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

type PackageDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  const getStatusVariant = (status: Tour['status']) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'unpublished': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold !font-headline">{tour.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getStatusVariant(tour.status)}>
              {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
            </Badge>
            <span className="text-sm text-muted-foreground font-mono">{tour.id}</span>
          </div>
        </div>
        <Button asChild>
          <Link href={`/manage/packages/${tour.id}/edit/basic-info`}>
            <PenSquare className="mr-2 h-4 w-4" />
            Edit Package
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Main Image</CardTitle>
        </CardHeader>
        <CardContent>
          {tour.mainImage ? (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image src={tour.mainImage} alt={tour.name} fill className="object-cover" />
            </div>
          ) : (
            <p className="text-muted-foreground">No main image set.</p>
          )}
        </CardContent>
      </Card>
      
      <KeyFacts tour={tour} />

      <Card>
          <CardHeader>
              <CardTitle>Booking & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

      <Itinerary items={tour.itinerary} />
      <InclusionsExclusions tour={tour} />
      
      {tour.map && (
        <Card>
            <CardHeader><CardTitle>Map</CardTitle></CardHeader>
            <CardContent>
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
      )}
      
       {tour.images && tour.images.length > 0 && (
         <Card>
            <CardHeader><CardTitle>Gallery</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                 {tour.images.map((src, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <Image src={src} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
                    </div>
                ))}
            </CardContent>
        </Card>
       )}
       
       <FaqSection faq={tour.faq} />
       <AdditionalInfoSection sections={tour.additionalInfoSections} />

    </div>
  );
}
