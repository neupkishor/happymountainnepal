"use client";

import Link from 'next/link';
import { Mountain, Menu, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const mainNavLinks = [
  { href: '/tours', label: 'Tours' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

const aboutSubLinks = [
    { href: '/about/teams', label: 'Our Team' },
    { href: '/testimonials', label: 'Testimonials' },
]

function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4 md:gap-6">
       <Link
          href="/tours"
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === "/tours" ? 'text-primary' : 'text-foreground/80'
          )}
        >
          Tours
        </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <button className={cn(
            'text-sm font-medium transition-colors hover:text-primary flex items-center gap-1',
            (pathname.startsWith('/about') || pathname === '/testimonials') ? 'text-primary' : 'text-foreground/80'
          )}>
                About
            </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild><Link href="/about">About Us</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/about/teams">Our Team</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/testimonials">Testimonials</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link
          href="/blog"
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname.startsWith('/blog') ? 'text-primary' : 'text-foreground/80'
          )}
        >
          Blog
      </Link>
      <Link
          href="/contact"
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === "/contact" ? 'text-primary' : 'text-foreground/80'
          )}
        >
          Contact
      </Link>
    </nav>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
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
          {mainNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-4 transition-colors hover:text-primary",
                pathname.startsWith(link.href) ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}


export function Header() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Mobile Header */}
        <div className="flex w-full items-center justify-between md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Happy Mountain</span>
          </Link>
          {isMounted && <MobileNav />}
        </div>

        {/* Desktop Header */}
        <div className="hidden w-full md:flex md:items-center">
          <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Mountain className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline">Happy Mountain Nepal</span>
              </Link>
          </div>

          <div className="flex-1 flex justify-center">
            <NavLinks />
          </div>

          <div className="flex items-center gap-2">
            {isMounted && (
              <>
                <Link href="/search" passHref>
                  <Button asChild variant="ghost" size="icon" aria-label="Search">
                      <Search className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/profile" passHref>
                  <Button asChild variant="ghost" size="icon" aria-label="Profile">
                      <User className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
