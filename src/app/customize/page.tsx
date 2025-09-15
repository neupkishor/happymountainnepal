import { ContactForm } from '@/components/ContactForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CustomizePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold !font-headline">Customize Your Dream Trip</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Have a specific adventure in mind? Let us know your plans, and we&apos;ll help you create the perfect itinerary. Fill out the form below to get started.
          </p>
        </div>

        <ContactForm />

        <div className="text-center mt-12">
          <p className="text-muted-foreground">Prefer to see our standard packages?</p>
          <Link href="/tours" className='mt-2 inline-block'>
            <Button variant="outline">Explore All Tours</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
