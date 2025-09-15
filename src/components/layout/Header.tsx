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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  ListItem
} from "@/components/ui/navigation-menu";


const mainNavLinks = [
  { href: '/tours', label: 'Tours' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

function NavLinks() {
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/tours" legacyBehavior passHref>
            <NavigationMenuLink className={cn(
              'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
              pathname === "/tours" ? 'bg-accent/50' : ''
            )}>
              Tours
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
            <NavigationMenuTrigger>Destinations</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      <Mountain className="h-6 w-6" />
                      <div className="mb-2 mt-4 text-lg font-medium">
                        Happy Mountain Nepal
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Your gateway to Himalayan adventures.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/tours?region=Nepal" title="Nepal">
                  Explore the heart of the Himalayas.
                </ListItem>
                 <ListItem href="/tours?region=Bhutan" title="Bhutan">
                  Discover the Land of the Thunder Dragon.
                </ListItem>
                 <ListItem href="/tours?region=Tibet" title="Tibet">
                  Journey to the roof of the world.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

         <NavigationMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
                (pathname.startsWith('/about') || pathname === '/testimonials') ? 'bg-accent/50' : ''
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
        </NavigationMenuItem>

        <NavigationMenuItem>
           <Link href="/blog" legacyBehavior passHref>
             <NavigationMenuLink className={cn(
              'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
              pathname.startsWith('/blog') ? 'bg-accent/50' : ''
            )}>
              Blog
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/contact" legacyBehavior passHref>
            <NavigationMenuLink className={cn(
              'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
              pathname === "/contact" ? 'bg-accent/50' : ''
            )}>
              Contact
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
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
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-lg">
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
