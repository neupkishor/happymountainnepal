import Link from 'next/link';
import { Button } from './ui/button';
import { Mail } from 'lucide-react';

export function ContactSection() {
  return (
    <section className="bg-primary text-primary-foreground py-16 lg:py-24">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold !font-headline">
          Have Questions?
        </h2>
        <p className="mt-4 text-lg text-primary-foreground/90 max-w-2xl mx-auto">
          Our team of experts is here to help you plan your perfect Himalayan adventure. Reach out to us with any questions or for a custom itinerary.
        </p>
        <Link href="/contact" className="mt-8 inline-block">
          <Button size="lg" variant="secondary" className="text-lg">
            <Mail className="mr-2 h-5 w-5" />
            Contact Us
          </Button>
        </Link>
      </div>
    </section>
  );
}
