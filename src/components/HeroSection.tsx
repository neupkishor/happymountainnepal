"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/context/SearchContext';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

export function HeroSection() {
  const { isSearchActive, setIsSearchActive } = useSearch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchActive) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSearchActive]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/tours?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchActive(false); // Reset search state after search
    }
  };

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

        {isSearchActive ? (
          <form onSubmit={handleSearch} className="flex max-w-lg mx-auto gap-2 animate-fade-in-up">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search for tours, e.g., 'Everest'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/90 text-foreground placeholder:text-muted-foreground flex-grow"
            />
            <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </form>
        ) : (
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
        )}
      </div>
    </section>
  );
}
