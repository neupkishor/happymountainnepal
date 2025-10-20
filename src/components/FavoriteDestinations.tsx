
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import type { Destination } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { slugify } from '@/lib/utils';

export function FavoriteDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    async function fetchDestinations() {
      if (!firestore) return;
      
      setLoading(true);
      const packagesSnapshot = await getDocs(query(collection(firestore, 'packages')));
      const packages = packagesSnapshot.docs.map(doc => doc.data() as { region: string });

      const regionCounts = packages.reduce((acc, tour) => {
          if (tour.region) {
              acc[tour.region] = (acc[tour.region] || 0) + 1;
          }
          return acc;
      }, {} as Record<string, number>);

      const sortedRegions = Object.entries(regionCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({
              name,
              tourCount: count,
              image: `https://picsum.photos/seed/dest-${slugify(name)}/${name === 'Everest' ? '600/600' : '600/300'}`
          }));

      const defaultDests = ['Everest', 'Annapurna', 'Langtang', 'Manaslu', 'Gokyo'];
      for (const destName of defaultDests) {
          if (!sortedRegions.some(r => r.name === destName) && sortedRegions.length < 5) {
              sortedRegions.push({
                  name: destName,
                  tourCount: 0,
                  image: `https://picsum.photos/seed/dest-${slugify(destName)}/600/300`
              });
          }
      }
      
      // A bit of hardcoded logic to ensure Everest is the big one if it exists
      const everestIndex = sortedRegions.findIndex(d => d.name === 'Everest');
      if (everestIndex > 0) {
        const everest = sortedRegions[everestIndex];
        sortedRegions.splice(everestIndex, 1);
        sortedRegions.unshift(everest);
      }
      
      setDestinations(sortedRegions.slice(0, 5));
      setLoading(false);
    }

    fetchDestinations();
  }, [firestore]);

  if (loading) {
    return (
        <section className="py-16 lg:py-24 relative overflow-hidden">
         <div className="container mx-auto relative">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
                <div className="lg:w-1/3 text-center lg:text-left">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-4 w-full mt-4" />
                    <Skeleton className="h-4 w-5/6 mt-2" />
                    <Skeleton className="h-12 w-48 mt-6" />
                </div>
                <div className="lg:w-2/3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        <Skeleton className="h-96 col-span-2 md:col-span-1 md:row-span-2 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                    </div>
                </div>
            </div>
         </div>
        </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="container mx-auto relative">
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
                    height={index === 0 ? 600: 300}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={`${dest.name} landscape`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
                    <h3 className="text-xl md:text-2xl font-bold !font-headline">{dest.name}</h3>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {dest.tourCount > 0
                        ? `${dest.tourCount} Tour${dest.tourCount > 1 ? 's' : ''}`
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
