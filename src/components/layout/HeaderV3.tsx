'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mountain, Search, User, Menu, X, ChevronDown, ChevronRight, LogIn, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderV3Nav, type NavLink } from './HeaderV3Nav';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@/firebase';
import { useSiteProfile } from '@/hooks/use-site-profile';

// This data would likely come from a CMS or a shared data file in a real app
const navLinks: NavLink[] = [
  {
    title: 'Activities',
    children: [
      { title: 'Trekking', href: '/tours?type=trek', description: 'Journey through stunning mountain trails.' },
      { title: 'Tour', href: '/tours?type=tour', description: 'Explore cultural and natural heritage sites.' },
      { title: 'Climbing', href: '/tours?type=expedition', description: 'Challenge yourself with peak climbing adventures.' },
      { title: 'Jungle Safari', href: '/tours?type=safari', description: 'Discover wildlife in lush national parks.' },
    ],
  },
  {
    title: 'Destinations',
    children: [
      {
        title: 'Nepal',
        href: '/tours?region=Nepal',
        description: "Home to the world's highest peak.",
      },
      {
        title: 'Tibet',
        href: '/tours?region=Tibet',
        description: 'The roof of the world.',
      },
      {
        title: 'Bhutan',
        href: '/tours?region=Bhutan',
        description: 'The last Himalayan kingdom.',
      },
      {
        title: 'India',
        href: '/tours?region=India',
        description: 'Diverse landscapes from Himalayas to the sea.',
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
            title: 'Reviews',
            href: '/reviews',
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


function MobileMenuList({ setMenuOpen }: { setMenuOpen: (open: boolean) => void }) {
  const [openSubMenu, setOpenSubMenu] = React.useState<string | null>(null);

  const toggleSubMenu = (title: string) => {
    setOpenSubMenu(prev => (prev === title ? null : title));
  };

  const renderLinks = (links: NavLink[], level = 0): React.ReactNode => {
    return links.map(link => {
      if (link.children) {
        const isOpen = openSubMenu === link.title;
        return (
          <div key={link.title} className="text-lg border-b border-border/40 last:border-0">
            <button
              className="flex items-center justify-between w-full py-4 text-left group"
              onClick={() => toggleSubMenu(link.title)}
            >
              <span className={cn("font-headline text-lg font-medium transition-colors", isOpen ? "text-primary" : "text-foreground")}>{link.title}</span>
              <ChevronDown className={cn("h-5 w-5 transition-transform duration-300 text-muted-foreground group-hover:text-primary", isOpen && "rotate-180 text-primary")} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 pl-4 space-y-1 border-l-2 border-primary/20 ml-2">
                    {renderLinks(link.children, level + 1)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }
      return (
        <Link
          key={link.href}
          href={link.href!}
          className="block py-4 text-lg font-medium border-b border-border/40 last:border-0 hover:text-primary transition-colors"
          onClick={() => setMenuOpen(false)}
        >
          {link.title}
        </Link>
      );
    });
  }

  return (
    <div className="flex flex-col h-full bg-background px-6 pt-4 pb-20 overflow-y-auto">
      <nav className="flex flex-col w-full max-w-lg mx-auto">
        {renderLinks(navLinks)}
        <div className="mt-8 pt-8 border-t space-y-4">
          <Button variant="ghost" className="w-full justify-start text-lg h-12" asChild>
            <Link href="/login" onClick={() => setMenuOpen(false)}><LogIn className="mr-3 h-5 w-5" /> Login</Link>
          </Button>
          <Button className="w-full justify-start text-lg h-12" asChild>
            <Link href="/signup" onClick={() => setMenuOpen(false)}><User className="mr-3 h-5 w-5" /> Sign Up</Link>
          </Button>
        </div>
      </nav>
    </div>
  );
}

const hasChildren = (item: NavLink): item is Required<Pick<NavLink, 'children'>> & NavLink => {
  return Array.isArray(item.children) && item.children.length > 0;
}

export function HeaderV3() {
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const [activeSubMenu, setActiveSubMenu] = React.useState<NavLink | null>(null);
  const { user, isUserLoading } = useUser();
  const { profile } = useSiteProfile();

  React.useEffect(() => {
    const chatbot = document.getElementById('chatbot-container');
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      if (chatbot) chatbot.style.display = 'none';
    } else {
      document.body.style.overflow = '';
      if (chatbot) chatbot.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (chatbot) chatbot.style.display = '';
    };
  }, [isMenuOpen]);

  const handleMouseEnter = (item: NavLink) => {
    if (hasChildren(item)) {
      setActiveSubMenu(item);
    } else {
      setActiveSubMenu(null);
    }
  };

  const handleMouseLeave = () => {
    setActiveSubMenu(null);
  };

  const contactColumn: NavLink = {
    title: 'Get In Touch',
    description: 'We are here to help you plan your adventure.',
    children: [
      {
        title: 'Call Us',
        href: `tel:${profile?.phone || ''}`,
        description: profile?.phone || 'Loading...',
        icon: Phone
      },
      {
        title: 'Email Us',
        href: `mailto:${profile?.contactEmail || ''}`,
        description: profile?.contactEmail || 'Loading...',
        icon: Mail
      },
      {
        title: 'Find Us',
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile?.address || '')}`,
        description: profile?.address || 'Loading...',
        icon: MapPin,
        target: '_blank'
      },
    ]
  };

  const aboutMenu = navLinks.find(link => link.title === 'About');
  const aboutMenuWithContact = aboutMenu ? {
    ...aboutMenu,
    children: [...(aboutMenu.children || []), contactColumn]
  } : null;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-40 w-full bg-background border-b transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isMenuOpen ? "h-screen" : "h-16"
        )}
        onMouseLeave={handleMouseLeave}
      >
        <div className="container flex h-16 items-center justify-between relative z-50 bg-background">

          {/* Left aligned logo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setMenuOpen(false)}>
              <Image src="https://neupgroup.com/content/p3happymountainnepal/logo.png" alt="Happy Mountain Nepal Logo" width={24} height={24} className="h-6 w-6 object-contain" />
              <span className="font-bold font-headline">Happy Mountain Nepal</span>
            </Link>
          </div>

          {/* Centered Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center px-4">
            <HeaderV3Nav links={navLinks} onLinkHover={handleMouseEnter} />
          </div>

          {/* Right aligned section */}
          <div className="flex items-center justify-end gap-2">

            {/* Desktop Only Icons/Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {isUserLoading ? (
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
              ) : user ? (
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/profile">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Profile</span>
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Only Burger (With Morphing Animation) */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMenuOpen(!isMenuOpen)}
                className="relative overflow-hidden border-none shadow-none hover:bg-transparent"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="open"
                      initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Content (Expandable) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "calc(100vh - 4rem)", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="md:hidden overflow-hidden bg-background border-t absolute top-16 left-0 w-full"
            >
              <MobileMenuList setMenuOpen={setMenuOpen} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeSubMenu && !isMenuOpen && (
            <motion.div
              className="fixed top-16 w-screen bg-background shadow-lg border-t left-0 hidden md:block"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="container mx-auto py-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSubMenu.title}
                    layout
                    className="grid grid-cols-4 gap-8"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(activeSubMenu.title === 'About' && aboutMenuWithContact ? aboutMenuWithContact.children : activeSubMenu.children)?.map(child => (
                      <div key={child.title}>
                        {hasChildren(child) ? (
                          <>
                            <div className="font-headline text-lg font-semibold text-foreground mb-3">{child.title}</div>
                            <ul className="space-y-2">
                              {child.children?.map(subItem => (
                                <li key={subItem.title}>
                                  <Link href={subItem.href || '#'} target={subItem.target} className="group flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
                                    {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                                    <span>{subItem.title}</span>
                                    {subItem.target !== '_blank' && <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <Link href={child.href || '#'} className="group block">
                            <p className="font-headline text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{child.title}</p>
                            {child.description && <p className="text-sm text-muted-foreground mt-1">{child.description}</p>}
                          </Link>
                        )}
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
