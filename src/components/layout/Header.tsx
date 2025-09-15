
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Mountain, Search, User } from "lucide-react";
import type { Destination } from "@/lib/types";
import { destinations } from "@/lib/data";

const aboutLinks: { title: string; href: string; description: string }[] = [
  {
    title: "About Us",
    href: "/about",
    description: "Learn about our story, mission, and values.",
  },
  {
    title: "Our Team",
    href: "/about/teams",
    description: "Meet the experts behind your Himalayan adventure.",
  },
  {
    title: "Testimonials",
    href: "/testimonials",
    description: "Read stories from our happy and satisfied travelers.",
  },
  {
    title: "Legal Documents",
    href: "/legal/documents",
    description: "View our company's legal information and licenses.",
  }
];

const mainNavLinks = [
    { href: "/tours", label: "Tours" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
]

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Happy Mountain
            </span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/tours" legacyBehavior passHref>
                        <NavigationMenuLink
                        className={cn(
                            navigationMenuTriggerStyle(),
                            pathname === "/tours" ? "bg-accent text-accent-foreground" : ""
                        )}
                        >
                        Tours
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Destinations</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {destinations.map((destination) => (
                      <ListItem
                        key={destination.name}
                        title={destination.name}
                        href={`/tours?region=${destination.name}`}
                      >
                       {destination.tourCount > 0 ? `${destination.tourCount}+ tours available` : 'Coming soon'}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>About</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] lg:grid-cols-1">
                    {aboutLinks.map((link) => (
                      <ListItem
                        key={link.title}
                        title={link.title}
                        href={link.href}
                      >
                        {link.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/blog" legacyBehavior passHref>
                        <NavigationMenuLink
                        className={cn(
                            navigationMenuTriggerStyle(),
                            pathname === "/blog" ? "bg-accent text-accent-foreground" : ""
                        )}
                        >
                        Blog
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/contact" legacyBehavior passHref>
                        <NavigationMenuLink
                        className={cn(
                            navigationMenuTriggerStyle(),
                            pathname === "/contact" ? "bg-accent text-accent-foreground" : ""
                        )}
                        >
                        Contact
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 w-full">
            <Link
              href="/"
              className="mb-6 flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Mountain className="mr-2 h-6 w-6 text-primary" />
              <span className="font-bold">Happy Mountain</span>
            </Link>
            <div className="flex flex-col space-y-3">
              {mainNavLinks.map((item) => (
                <MobileLink
                  key={item.href}
                  href={item.href}
                  pathname={pathname}
                  setOpen={setIsMobileMenuOpen}
                >
                  {item.label}
                </MobileLink>
              ))}
                <div className="pl-5">
                    <h3 className="font-semibold text-muted-foreground my-2">Destinations</h3>
                    {destinations.map(item => (
                        <MobileLink key={item.name} href={`/tours?region=${item.name}`} pathname={pathname} setOpen={setIsMobileMenuOpen}>{item.name}</MobileLink>
                    ))}
                </div>
                 <div className="pl-5">
                    <h3 className="font-semibold text-muted-foreground my-2">About</h3>
                    {aboutLinks.map(item => (
                        <MobileLink key={item.href} href={item.href} pathname={pathname} setOpen={setIsMobileMenuOpen}>{item.title}</MobileLink>
                    ))}
                </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center space-x-2 md:hidden">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="font-bold">Happy Mountain</span>
        </Link>


        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";


interface MobileLinkProps {
    href: string;
    children: React.ReactNode;
    pathname: string;
    setOpen: (open: boolean) => void;
}

function MobileLink({ href, children, pathname, setOpen }: MobileLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={cn(
        "text-foreground/70 transition-colors hover:text-foreground",
        pathname === href && "text-foreground font-semibold"
      )}
    >
      {children}
    </Link>
  );
}

    