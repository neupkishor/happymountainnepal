
'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { Skeleton } from './ui/skeleton';

export function ContactSection() {
  const { profile, isLoading } = useSiteProfile();

  const address = profile?.address || 'Thamel, Kathmandu, Nepal';
  const phone = profile?.phone || '+977 984-3725521';
  const email = profile?.contactEmail || 'info@happymountainnepal.com';

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold !font-headline">
          Ready to Start Your Adventure?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Contact us today to get a free consultation or to book your dream trip to the Himalayas.
        </p>

        {isLoading ? (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        ) : (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="flex flex-col items-center gap-2">
                    <MapPin className="h-8 w-8 text-primary" />
                    <h3 className="font-semibold">Our Office</h3>
                    <p className="text-muted-foreground">{address}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Phone className="h-8 w-8 text-primary" />
                    <h3 className="font-semibold">Call Us</h3>
                    <a href={`tel:${phone}`} className="text-muted-foreground hover:text-primary">{phone}</a>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Mail className="h-8 w-8 text-primary" />
                    <h3 className="font-semibold">Email Us</h3>
                    <a href={`mailto:${email}`} className="text-muted-foreground hover:text-primary">{email}</a>
                </div>
            </div>
        )}

        <Link href="/contact" className="mt-12 inline-block">
          <Button size="lg" className="text-lg">
            Send a Message
          </Button>
        </Link>
      </div>
    </section>
  );
}
