
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDown } from 'lucide-react';
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

const hasChildren = (item: NavLink): item is Required<Pick<NavLink, 'children'>> & NavLink => {
    return Array.isArray(item.children) && item.children.length > 0;
}

export const HeaderV2Nav = ({ links }: HeaderV2NavProps) => {
  const pathname = usePathname();

  const renderNavLinks = (links: NavLink[]): React.ReactNode => {
    return links.map((link) => {
      if (hasChildren(link)) {
        return (
          <NavigationMenuPrimitive.Item key={link.title}>
            <NavigationMenuPrimitive.Trigger className={cn(navigationMenuTriggerStyle(), "group")}>
              {link.title}
              <ChevronDown
                className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
                aria-hidden="true"
              />
            </NavigationMenuPrimitive.Trigger>
            <NavigationMenuPrimitive.Content>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {link.children.map((component) => {
                        if (hasChildren(component)) {
                            return (
                                <li key={component.title} className="row-span-3">
                                    <NavigationMenuPrimitive.Link asChild>
                                    <div
                                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                    >
                                        <div className="mb-2 mt-4 text-lg font-medium">
                                        {component.title}
                                        </div>
                                        <p className="text-sm leading-tight text-muted-foreground">
                                        {component.description}
                                        </p>
                                    </div>
                                    </NavigationMenuPrimitive.Link>
                                </li>
                            )
                        }
                        return (
                            <ListItem
                                key={component.title}
                                title={component.title}
                                href={component.href}
                            >
                                {component.description}
                            </ListItem>
                        )
                    })}
              </ul>
            </NavigationMenuPrimitive.Content>
          </NavigationMenuPrimitive.Item>
        );
      }
      return (
        <NavigationMenuPrimitive.Item key={link.href}>
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
        </NavigationMenuPrimitive.Item>
      );
    });
  };

  return (
    <NavigationMenuPrimitive.Root
      delayDuration={0}
      skipDelayDuration={500}
      className="relative z-10 flex max-w-max flex-1 items-center justify-center"
    >
      <NavigationMenuPrimitive.List className="group flex flex-1 list-none items-center justify-center space-x-1">
        {renderNavLinks(links)}
      </NavigationMenuPrimitive.List>

      <div className="perspective-[2000px] absolute top-full flex justify-center">
        <NavigationMenuPrimitive.Viewport
          className={cn(
            "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]"
          )}
        />
      </div>
    </NavigationMenuPrimitive.Root>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuPrimitive.Link asChild>
        <Link
          href={href || ''}
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuPrimitive.Link>
    </li>
  );
});
ListItem.displayName = 'ListItem';


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

