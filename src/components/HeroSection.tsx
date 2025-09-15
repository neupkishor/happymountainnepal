"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

export function HeroSection() {
  const router = useRouter();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearchActive) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100); // Short delay to allow focus
      return () => clearTimeout(timer);
    }
  }, [isSearchActive]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
      }
    }

    if (isSearchActive) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchActive]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchActive(false); // Reset search state after search
    }
  };

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSearchActive(true);
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

        <div ref={searchContainerRef}>
          {isSearchActive ? (
            <form onSubmit={handleSearch} className="max-w-lg mx-auto animate-fade-in-up relative">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search for tours, e.g., 'Everest'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/90 text-foreground placeholder:text-muted-foreground w-full rounded-full py-6 pl-6 pr-16 border-2 border-primary/50 focus:border-primary focus:ring-primary/20 focus:ring-4 transition-all"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </form>
          ) : (
            <div className="flex gap-4 justify-center animate-fade-in-up">
              <Link href="/tours">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Explore Tours
                </Button>
              </Link>
              <Button size="lg" variant="secondary" onClick={handleSearchClick}>
                  <Search className="h-5 w-5 mr-2" />
                  Search for Experience
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
