
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

  const handlePointerEnter = (path: string[]) => {
    setActivePath(path);
  };
  
  const handlePointerLeave = (path: string[]) => {
    setActivePath(prev => prev.slice(0, path.length - 1));
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
              onPointerEnter={() => handlePointerEnter(newPath)}
              onPointerLeave={() => handlePointerLeave(newPath)}
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
  
  const subMenus = React.useMemo(() => {
    const menus = [];
    let currentLevelLinks: NavLink[] | undefined = links;

    for (let i = 0; i < activePath.length; i++) {
        const nodeTitle = activePath[i];
        const node = currentLevelLinks?.find(l => l.title === nodeTitle);
        
        if (node?.children) {
            // Push the children to be rendered in the next column
            menus.push({
                level: i + 1,
                links: node.children,
                path: activePath.slice(0, i + 1)
            });
            currentLevelLinks = node.children;
        } else {
            break; // No more children down this path
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
                  onPointerEnter={() => handlePointerEnter([link.title])}
                  onPointerLeave={() => handlePointerLeave([link.title])}
                  className={cn(navigationMenuTriggerStyle(), 'data-[state=open]:bg-accent/50')}
                >
                  {link.title}
                </NavigationMenuPrimitive.Trigger>
                <NavigationMenuPrimitive.Content 
                  onPointerEnter={() => handlePointerEnter([link.title])}
                  className="w-auto"
                >
                   <div 
                     className="md:w-auto bg-popover text-popover-foreground rounded-lg border shadow-lg"
                   >
                     <div className="flex">
                        {/* The first column is the first item in subMenus */}
                        {subMenus[0] && (
                           <div className="w-64">
                             {renderNavLinks(subMenus[0].links, 1, subMenus[0].path)}
                           </div>
                        )}
                        {/* The second column is the second item */}
                        {subMenus[1] && (
                           <div className="w-64 border-l">
                             {renderNavLinks(subMenus[1].links, 2, subMenus[1].path)}
                           </div>
                        )}
                         {/* The third column is the third item */}
                        {subMenus[2] && (
                           <div className="w-64 border-l">
                             {renderNavLinks(subMenus[2].links, 3, subMenus[2].path)}
                           </div>
                        )}
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
                  onPointerEnter={() => setActivePath([])}
                >
                  {link.title}
                </NavigationMenuPrimitive.Link>
              </Link>
            )}
          </NavigationMenuPrimitive.Item>
        ))}
      </NavigationMenuPrimitive.List>

       <div className="absolute left-0 top-full mt-2 flex w-full justify-center">
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
