"use client";

import Link from 'next/link';
import { Mountain, Heart, Menu, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/context/WishlistContext';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/tours', label: 'Tours' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/tools/image-optimizer', label: 'AI Tools', icon: Wrench },
];

function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-4 md:gap-6">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary flex items-center gap-2',
            pathname === link.href ? 'text-primary' : 'text-foreground/80'
          )}
        >
          {link.icon && <link.icon className="h-4 w-4" />}
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
            onClick={() => setIsOpen(false)}
          >
            <Mountain className="h-6 w-6 text-primary" />
            <span className="font-headline">Happy Mountain</span>
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-4 transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.icon && <link.icon className="h-5 w-5" />}
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}


export function Header() {
  const { wishlist } = useWishlist();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center gap-4">
          <div className="md:hidden">
            {isMounted && <MobileNav />}
          </div>
          <Link href="/" className="flex items-center gap-2">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">Happy Mountain Nepal</span>
          </Link>
        </div>

        <div className="hidden md:flex">
          <NavLinks />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isMounted && (
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
          )}
          <Link href="/contact" passHref>
            <Button className="hidden sm:inline-flex bg-accent hover:bg-accent/90 text-accent-foreground">Custom Trip</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
