
'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Partner } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from './ui/card';

export function OurPartners() {
  const firestore = useFirestore();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const autoplay = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [
    autoplay.current,
  ]);

  useEffect(() => {
    if (!firestore) return;

    const fetchPartners = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(firestore, 'partners'));
        const partnersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Partner));
        setPartners(partnersData);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, [firestore]);

  return (
    <section className="py-16 lg:py-24 bg-secondary/50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold !font-headline">Our Partners & Affiliations</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            We are proud to be associated with leading organizations in the tourism industry, ensuring the highest standards of service.
          </p>
        </div>

        {isLoading ? (
          <div className="flex gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-[0_0_80%] sm:flex-[0_0_40%] md:flex-[0_0_33.33%] lg:flex-[0_0_20%]">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Skeleton className="h-32 w-32 rounded-lg mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-1/2 mx-auto mt-1" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {partners.concat(partners).map((partner, index) => (
                <div key={`${partner.id}-${index}`} className="flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_23%]">
                  <Card className="h-full w-full group">
                    <CardContent className="p-6 text-center flex flex-col items-center h-full">
                      <div className="relative h-32 w-32 mb-4 bg-background/50 rounded-lg flex items-center justify-center p-4">
                        <Image
                          src={partner.logo}
                          alt={`${partner.name} logo`}
                          fill
                          className="object-contain rounded-md transition-transform duration-300 group-hover:scale-105"
                          data-ai-hint="company logo"
                        />
                      </div>
                      <h3 className="font-semibold text-lg">{partner.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 flex-grow">
                        {partner.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
