
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

export interface NavLink {
  title: string;
  href?: string;
  description?: string;
  children?: NavLink[];
}

interface HeaderV2NavProps {
  links: NavLink[];
}

export const HeaderV2Nav = ({ links }: HeaderV2NavProps) => {
  const [activePath, setActivePath] = React.useState<string[]>([]);
  const pathname = usePathname();

  const handlePointerEnter = (path: string[], disabled: boolean) => {
    if (disabled) return;
    setActivePath(path);
  };

  const handlePointerLeave = () => {
    // Optional: Keep the menu open if you want a "sticky" hover behavior
    // For now, we'll let it close.
  };

  const renderNavLinks = (
    currentLinks: NavLink[],
    level: number,
    currentPath: string[]
  ) => {
    return (
      <div className="flex flex-col space-y-1 p-2">
        {currentLinks.map((link, index) => {
          const newPath = [...currentPath, link.title];
          const isActive = activePath[level] === link.title;
          const hasChildren = link.children && link.children.length > 0;

          return (
            <NavigationMenuPrimitive.Item 
              key={index} 
              value={link.title}
              className={cn(
                'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors w-full text-left',
                'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                isActive && 'bg-accent/50'
              )}
              onPointerEnter={() => handlePointerEnter(newPath, false)}
            >
              <Link href={link.href || '#'} className="w-full h-full">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium leading-none">{link.title}</div>
                    {link.description && (
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                        {link.description}
                      </p>
                    )}
                  </div>
                  {hasChildren && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              </Link>
            </NavigationMenuPrimitive.Item>
          );
        })}
      </div>
    );
  };
  
  const getSubMenu = (path: string[]) => {
      let currentLevel = links;
      for (let i = 0; i < path.length; i++) {
          const nextNode = currentLevel.find(l => l.title === path[i]);
          if (nextNode?.children) {
              currentLevel = nextNode.children;
          } else {
              return null;
          }
      }
      return currentLevel;
  }

  const subMenus = React.useMemo(() => {
    const menus = [];
    let currentLinks: NavLink[] | undefined = links;

    for (let i = 0; i < activePath.length; i++) {
        const activeLinkTitle = activePath[i];
        const activeLink = currentLinks?.find(l => l.title === activeLinkTitle);
        
        if (activeLink?.children) {
            menus.push({ level: i + 2, links: activeLink.children, path: activePath.slice(0, i + 1) });
            currentLinks = activeLink.children;
        } else {
            break; // No more children, stop generating submenus
        }
    }
    return menus;
  }, [activePath, links]);


  return (
    <NavigationMenuPrimitive.Root 
        delayDuration={0}
        onMouseLeave={() => setActivePath([])}
        className="relative flex max-w-max flex-1 items-center justify-center"
    >
      <NavigationMenuPrimitive.List className="group flex flex-1 list-none items-center justify-center space-x-1">
        {links.map((link) => (
          <NavigationMenuPrimitive.Item key={link.title}>
            {link.children ? (
              <>
                <NavigationMenuPrimitive.Trigger
                  onPointerEnter={() => handlePointerEnter([link.title], false)}
                  className={cn(navigationMenuTriggerStyle(), 'data-[state=open]:bg-accent/50')}
                >
                  {link.title}
                </NavigationMenuPrimitive.Trigger>
                <NavigationMenuPrimitive.Content className="absolute top-0 left-0 w-full pt-10">
                   <div 
                     onPointerLeave={() => handlePointerEnter([link.title], false)}
                     className="md:w-auto bg-popover text-popover-foreground rounded-lg border shadow-lg"
                   >
                     <div className="flex">
                        <div className="w-64">
                            {renderNavLinks(link.children, 1, [link.title])}
                        </div>

                        {subMenus.map((subMenu) => {
                            if (subMenu.path.length >= 3) return null;
                            return (
                                <div key={subMenu.level} className="w-64 border-l">
                                    {renderNavLinks(subMenu.links, subMenu.level, subMenu.path)}
                                </div>
                            )
                        })}
                     </div>
                   </div>
                </NavigationMenuPrimitive.Content>
              </>
            ) : (
              <Link href={link.href!} legacyBehavior passHref>
                <NavigationMenuPrimitive.Link
                  className={cn(
                    navigationMenuTriggerStyle(),
                    pathname === link.href && 'bg-accent/50'
                  )}
                >
                  {link.title}
                </NavigationMenuPrimitive.Link>
              </Link>
            )}
          </NavigationMenuPrimitive.Item>
        ))}
      </NavigationMenuPrimitive.List>

       <div className="absolute left-0 top-full flex justify-center">
            <NavigationMenuPrimitive.Viewport />
        </div>
    </NavigationMenuPrimitive.Root>
  );
};


interface MobileLinkProps {
    href: string;
    children: React.ReactNode;
    pathname: string;
    setOpen: (open: boolean) => void;
}

export function MobileNavLink({ href, children, pathname, setOpen }: MobileLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={cn(
        "text-foreground/70 transition-colors hover:text-foreground px-4 py-2 rounded-md",
        pathname === href && "text-foreground font-semibold bg-accent/80"
      )}
    >
      {children}
    </Link>
  );
}
