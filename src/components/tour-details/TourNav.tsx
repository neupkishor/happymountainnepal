"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '#key-facts', label: 'Key Facts' },
  { href: '#itinerary', label: 'Itinerary' },
  { href: '#inclusions', label: 'Inclusions' },
  { href: '#map', label: 'Map' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#faq', label: 'FAQ' },
  { href: '#additional-info', label: 'More Info' }, // New navigation item
  { href: '#reviews', label: 'Reviews' },
];

export function TourNav() {
  const [isSticky, setIsSticky] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      // Adjust this value based on your ImageGallery height
      const stickyThreshold = window.innerHeight * 0.5; 
      if (window.scrollY > stickyThreshold) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }

      const sections = navItems.map(item => document.getElementById(item.href.substring(1)));
      let currentSection = '';
      
      sections.forEach(section => {
        if (section) {
          const sectionTop = section.offsetTop - 150; // Offset for better accuracy
          if (window.scrollY >= sectionTop) {
            currentSection = section.id;
          }
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={cn(
      "transition-all duration-300 z-40",
      isSticky ? 'sticky top-16 shadow-md' : 'relative'
    )}>
      <div className="bg-secondary/80 backdrop-blur-sm">
        <div className="container mx-auto overflow-x-auto">
          <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 py-2">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                  "block whitespace-nowrap px-3 py-2 text-sm font-medium rounded-md",
                  "transition-colors duration-200 cursor-pointer",
                  activeSection === item.href.substring(1) 
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                )}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}