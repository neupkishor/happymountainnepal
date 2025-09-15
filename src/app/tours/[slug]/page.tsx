import { tours } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ImageGallery } from '@/components/tour-details/ImageGallery';
import { KeyFacts } from '@/components/tour-details/KeyFacts';
import { Itinerary } from '@/components/tour-details/Itinerary';
import { BookingWidget } from '@/components/tour-details/BookingWidget';
import { Reviews } from '@/components/tour-details/Reviews';
import { InclusionsExclusions } from '@/components/tour-details/InclusionsExclusions';
import Image from 'next/image';
import { TourNav } from '@/components/tour-details/TourNav';

type TourDetailPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  return tours.map(tour => ({
    slug: tour.slug,
  }));
}

export default function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = params;
  const tour = tours.find((t) => t.slug === slug);

  if (!tour) {
    notFound();
  }

  return (
    <div className="bg-background">
      <ImageGallery images={tour.images} mainImage={tour.mainImage} tourName={tour.name} />
      
      <TourNav />

      <div className="container mx-auto px-4 py-8 lg:py-12">
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
