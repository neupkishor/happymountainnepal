import Link from 'next/link';
import Image from 'next/image';
import { destinations } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export function FavoriteDestinations() {
  return (
    <section className="py-16 lg:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/3 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold !font-headline">
              Our Favorite Destinations
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Explore the regions that capture the heart of the Himalayas, each offering a unique adventure.
            </p>
            <Link href="/tours" className='mt-6 inline-block'>
              <Button size="lg">
                Explore All Tours <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
          <div className="lg:w-2/3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {destinations.map((dest, index) => (
                <Link
                  key={dest.name}
                  href={`/tours?region=${dest.name}`}
                  className={`group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                    index === 0 ? 'col-span-2 md:col-span-1 md:row-span-2' : ''
                  } ${
                    index === 1 ? 'md:col-start-2' : ''
                  } ${
                    index === 2 ? 'md:col-start-3' : ''
                  }`}
                >
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    width={600}
                    height={index === 0 ? 800: 400}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={`${dest.name} landscape`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
                    <h3 className="text-xl md:text-2xl font-bold !font-headline">{dest.name}</h3>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {dest.tourCount > 0
                        ? `${dest.tourCount}+ Tour${dest.tourCount > 1 ? 's' : ''}`
                        : 'Coming Soon'}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
