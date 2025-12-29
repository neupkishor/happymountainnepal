
'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Partner } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export function OurPartners() {
  const firestore = useFirestore();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const autoplay = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
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
          <div className="flex gap-8 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-[0_0_50%] md:flex-[0_0_20%]">
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-8">
              {partners.concat(partners).map((partner, index) => ( // Duplicate for seamless looping
                <div key={`${partner.id}-${index}`} className="flex-[0_0_50%] md:flex-[0_0_20%]">
                  <div className="relative h-32 flex justify-center items-center">
                    <Image
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      fill
                      className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300 rounded-md"
                      data-ai-hint="company logo"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
