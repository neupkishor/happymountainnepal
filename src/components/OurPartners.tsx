'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Partner } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

export function OurPartners() {
  const firestore = useFirestore();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <section className="py-16 lg:py-24">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold !font-headline">Our Partners & Affiliations</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            We are proud to be associated with leading organizations in the tourism industry and government bodies, ensuring the highest standards of service and credibility.
          </p>
        </div>
        {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center">
                        <Skeleton className="h-32 w-full mb-4" />
                        <Skeleton className="h-6 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                    </div>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {partners?.map(partner => (
                <div key={partner.id} className="text-center">
                <div className="bg-card p-8 rounded-lg flex justify-center items-center relative aspect-square mb-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    fill
                    className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    data-ai-hint="company logo"
                    />
                </div>
                <h3 className="font-semibold text-lg">{partner.name}</h3>
                <p className="text-sm text-muted-foreground">{partner.description}</p>
                </div>
            ))}
            </div>
        )}
      </div>
    </section>
  );
}