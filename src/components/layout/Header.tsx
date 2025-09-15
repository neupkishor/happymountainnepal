"use client";

import Link from 'next/link';
import { Mountain, Heart, Menu, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/context/WishlistContext';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from 'react';

const navLinks = [
  { href: '/tours', label: 'Tours' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/tools/image-optimizer', label: 'AI Tools', icon: Wrench },
];

export function Header() {
  const { wishlist } = useWishlist();
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavLinksComponent = ({ isMobile }: { isMobile: boolean }) => (
    <nav className={`flex items-center gap-4 ${isMobile ? 'flex-col items-start' : 'hidden md:flex'}`}>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
            pathname === link.href ? 'text-primary' : 'text-foreground/80'
          }`}
          onClick={() => isMobile && setMobileMenuOpen(false)}
        >
          {link.icon && <link.icon className="h-4 w-4" />}
          {link.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <Mountain className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block font-headline">Trek Explorer</span>
        </Link>
        
        <div className="flex-1">
          <NavLinksComponent isMobile={false} />
        </div>

        <div className="flex items-center gap-2">
          <Link href="/wishlist" passHref>
            <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                  {wishlist.length}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/contact" passHref>
            <Button className="hidden sm:inline-flex bg-accent hover:bg-accent/90 text-accent-foreground">Custom Trip</Button>
          </Link>
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col p-6">
                <Link href="/" className="mb-8 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Mountain className="h-6 w-6 text-primary" />
                  <span className="font-bold font-headline">Trek Explorer</span>
                </Link>
                <div className="flex flex-col gap-4">
                  <NavLinksComponent isMobile={true} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
