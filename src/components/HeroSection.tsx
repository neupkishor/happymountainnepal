import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
      <Image
        src="https://picsum.photos/seed/everest-hero/1600/900"
        alt="Majestic mountain range at sunrise"
        fill
        className="object-cover"
        priority
        data-ai-hint="mountain sunrise"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 p-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold !font-headline mb-4 animate-fade-in-down">
          Discover Your Next Adventure
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fade-in-up">
          Explore breathtaking treks and cultural tours in the heart of the Himalayas. Unforgettable journeys await.
        </p>
        <div className="flex gap-4 justify-center animate-fade-in-up">
          <Link href="/tours">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Explore Tours
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="secondary">
              Plan a Custom Trip
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
