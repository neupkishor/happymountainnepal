
"use client";

import Link from 'next/link';
import { Mountain, Menu, User, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  ListItem
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';


const mainNavLinks = [
  { href: '/tours', label: 'Tours' },
  { href: '/about', label: 'About Us' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

function NavLinks() {
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/tours" passHref asChild>
            <NavigationMenuLink className={cn(
              navigationMenuTriggerStyle(),
              pathname === "/tours" ? 'bg-accent/50' : ''
            )}>
              Tours
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
            <NavigationMenuTrigger>Destinations</NavigationMenuTrigger>
            <NavigationMenuContent>
               <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-3">
                <li className="space-y-3">
                  <h4 className="font-medium leading-none text-primary">Nepal</h4>
                  <ListItem href="/tours?region=Nepal" title="All Nepal Treks">
                    Explore the heart of the Himalayas.
                  </ListItem>
                  <ListItem href="/tours/kathmandu" title="Kathmandu">
                    The vibrant capital city.
                  </ListItem>
                   <ListItem href="/tours/pashupati" title="Pashupatinath">
                    Sacred Hindu temple complex.
                  </ListItem>
                  <ListItem href="/tours/swyambhunath" title="Swayambhunath">
                    The iconic Monkey Temple.
                  </ListItem>
                </li>
                <li className="space-y-3">
                  <h4 className="font-medium leading-none text-primary">Bhutan</h4>
                   <ListItem href="/tours?region=Bhutan" title="Whole Country Trip">
                    Discover the Land of the Thunder Dragon.
                  </ListItem>
                </li>
                 <li className="space-y-3">
                  <h4 className="font-medium leading-none text-primary">Tibet</h4>
                   <ListItem href="/tours?region=Tibet" title="Tibet Tours">
                    Journey to the roof of the world.
                  </ListItem>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

         <NavigationMenuItem>
            <NavigationMenuTrigger className={cn((pathname.startsWith('/about') || pathname === '/testimonials') ? 'bg-accent/50' : '')}>About</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] grid-cols-1">
                <ListItem href="/about" title="About Us">
                  Learn about our story and mission.
                </ListItem>
                <ListItem href="/about/teams" title="Our Team">
                  Meet the experts behind your adventure.
                </ListItem>
                <ListItem href="/testimonials" title="Testimonials">
                  Read stories from our happy travelers.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

        <NavigationMenuItem>
           <Link href="/blog" passHref asChild>
             <NavigationMenuLink className={cn(
              navigationMenuTriggerStyle(),
              pathname.startsWith('/blog') ? 'bg-accent/50' : ''
            )}>
              Blog
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/contact" passHref asChild>
            <NavigationMenuLink className={cn(
              navigationMenuTriggerStyle(),
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const allLinks = [
    { title: "Home", href: "/" },
    ...mainNavLinks,
    { title: "Profile", href: "/profile" },
    { title: "Search", href: "/search" },
  ];

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="z-50 md:hidden">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/95 backdrop-blur-sm md:hidden",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="container h-full pt-20">
          <nav className="flex flex-col h-full items-center justify-center gap-6">
            {allLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-3xl font-headline text-muted-foreground transition-all duration-300 hover:text-primary",
                   isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
                  pathname === link.href ? "text-primary" : ""
                )}
                style={{ transitionDelay: `${isOpen ? index * 75 + 100 : 0}ms` }}
              >
                {link.label ?? link.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}


export function Header() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        
        {/* Left side: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline hidden sm:inline-block">Happy Mountain Nepal</span>
             <span className="font-bold font-headline sm:hidden">HMN</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden flex-1 justify-center md:flex">
          <NavLinks />
        </div>

        {/* Right side: Icons & Mobile Nav */}
        <div className="flex flex-1 items-center justify-end gap-2">
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
              <MobileNav />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
