
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Mountain, Search, User, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderV3Nav, type NavLink } from './HeaderV3Nav';
import { cn } from '@/lib/utils';

// This data would likely come from a CMS or a shared data file in a real app
const navLinks: NavLink[] = [
  { href: '/tours', title: 'Tours' },
  {
    title: 'Destinations',
    children: [
      {
        title: 'Everest',
        href: '/tours?region=Everest',
        description: "Home to the world's highest peak.",
      },
      {
        title: 'Annapurna',
        href: '/tours?region=Annapurna',
        description: 'Diverse treks with stunning views.',
      },
      {
        title: 'Langtang',
        href: '/tours?region=Langtang',
        description: 'Accessible treks near Kathmandu.',
      },
       {
        title: 'Manaslu',
        href: '/tours?region=Manaslu',
        description: 'A less-crowded alternative to Annapurna.',
      },
    ],
  },
  {
    title: 'About',
    children: [
      {
        title: 'Company',
        description: 'Our story and team.',
        children: [
          {
            title: 'About Us',
            href: '/about',
            description: 'Learn about our mission and values.',
          },
          {
            title: 'Our Team',
            href: '/about/teams',
            description: 'Meet the experts behind your adventure.',
          },
        ],
      },
      {
        title: 'Community',
        description: 'Stories and feedback.',
        children: [
          {
            title: 'Testimonials',
            href: '/testimonials',
            description: 'Read stories from our happy travelers.',
          },
          {
            title: 'Blog',
            href: '/blog',
            description: 'Guides, stories, and advice.',
          },
        ],
      },
       {
        title: 'Legal',
        description: 'Policies and documents.',
        children: [
            {
                title: 'Documents',
                href: '/legal/documents',
                description: "View our company's legal licenses."
            },
            {
                title: 'Terms & Conditions',
                href: '/legal/terms',
                description: 'Read our terms and conditions.'
            },
            {
                title: 'Privacy Policy',
                href: '/legal/privacy',
                description: 'Our commitment to your privacy.'
            }
        ]
      },
    ],
  },
  { href: '/contact', title: 'Contact' },
  { href: '/search', title: 'Search' },
];

function MobileNav({ setMenuOpen }: { setMenuOpen: (open: boolean) => void }) {
    const [openSubMenu, setOpenSubMenu] = React.useState<string | null>(null);

    const toggleSubMenu = (title: string) => {
        setOpenSubMenu(prev => (prev === title ? null : title));
    };

    const renderLinks = (links: NavLink[], level = 0): React.ReactNode => {
        return links.map(link => {
            if (link.children) {
                const isOpen = openSubMenu === link.title;
                return (
                    <div key={link.title} className="text-lg">
                        <button
                            className="flex items-center justify-between w-full py-3"
                            onClick={() => toggleSubMenu(link.title)}
                        >
                            <span>{link.title}</span>
                            <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
                        </button>
                        <div
                            className={cn(
                                "grid transition-all duration-300 ease-in-out overflow-hidden",
                                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                            )}
                        >
                            <div className="min-h-0 pl-4 border-l">
                                {renderLinks(link.children, level + 1)}
                            </div>
                        </div>
                    </div>
                );
            }
            return (
                 <Link
                    key={link.href}
                    href={link.href!}
                    className="block py-3 text-lg"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.title}
                  </Link>
            );
        });
    }

    return (
        <div className="fixed inset-0 bg-background z-50 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <Link href="/" className="font-bold text-xl" onClick={() => setMenuOpen(false)}>
                    Happy Mountain
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
                    <X className="h-6 w-6" />
                </Button>
            </div>
            <div className="flex-grow overflow-y-auto -mr-6 pr-6">
                <nav className="flex flex-col divide-y">
                    {renderLinks(navLinks)}
                </nav>
            </div>
        </div>
    );
}


export function HeaderV3() {
  const [isMenuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);
  
  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
                 <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)}>
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open Menu</span>
                 </Button>
            </div>

            {/* Left aligned logo */}
            <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2 md:mr-6">
                    <Mountain className="h-6 w-6 text-primary" />
                    <span className="font-bold hidden sm:inline-block">Happy Mountain</span>
                </Link>
            </div>

            {/* Centered Desktop Navigation */}
            <div className="hidden md:flex flex-1 justify-center">
                <HeaderV3Nav links={navLinks} />
            </div>

            {/* Right aligned icons */}
            <div className="flex items-center justify-end md:w-auto w-full md:flex-none">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/profile">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Profile</span>
                    </Link>
                </Button>
                 <Button variant="ghost" size="icon" asChild className="md:hidden">
                    <Link href="/search">
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Link>
                </Button>
            </div>
        </div>
      </header>

      {/* Mobile Navigation Panel */}
      {isMenuOpen && <MobileNav setMenuOpen={setMenuOpen} />}
    </>
  );
}
