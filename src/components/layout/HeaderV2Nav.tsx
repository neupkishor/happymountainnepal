
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


const renderNavLinks = (links: NavLink[]): React.ReactNode[] => {
    return links.map((link) => {
        if (!hasChildren(link)) {
            return (
                <NavigationMenuPrimitive.Item key={link.href}>
                    <Link href={link.href!} legacyBehavior passHref>
                        <NavigationMenuPrimitive.Link className={navigationMenuTriggerStyle()}>
                            {link.title}
                        </NavigationMenuPrimitive.Link>
                    </Link>
                </NavigationMenuPrimitive.Item>
            );
        }

        const isMegaMenu = link.children.some(child => hasChildren(child));

        if (isMegaMenu) {
             return (
                <NavigationMenuPrimitive.Item key={link.title}>
                    <NavigationMenuPrimitive.Trigger className="group">
                        {link.title}
                        <ChevronDown
                            className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
                            aria-hidden="true"
                        />
                    </NavigationMenuPrimitive.Trigger>
                    <NavigationMenuPrimitive.Content>
                         <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                            {link.children.map((component) => {
                                 if (!hasChildren(component)) {
                                     return (
                                        <ListItem
                                            key={component.title}
                                            title={component.title}
                                            href={component.href}
                                        >
                                            {component.description}
                                        </ListItem>
                                     )
                                 }
                                return (
                                    <li key={component.title} className="row-span-3">
                                        <NavigationMenuPrimitive.Link asChild>
                                            <div className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
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
                            })}
                        </ul>
                    </NavigationMenuPrimitive.Content>
                </NavigationMenuPrimitive.Item>
             )
        }
        
        return (
            <NavigationMenuPrimitive.Item key={link.title}>
                <NavigationMenuPrimitive.Trigger className="group">
                    {link.title}
                    <ChevronDown
                        className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
                        aria-hidden="true"
                    />
                </NavigationMenuPrimitive.Trigger>
                <NavigationMenuPrimitive.Content>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] ">
                        {renderNavLinks(link.children)}
                    </ul>
                </NavigationMenuPrimitive.Content>
            </NavigationMenuPrimitive.Item>
        )
    });
};


export const HeaderV2Nav = ({ links }: HeaderV2NavProps) => {

  const renderLinksRecursive = (links: NavLink[]): React.ReactNode => {
    return links.map(link => {
      if (!link.children?.length) {
        return (
          <NavigationMenuPrimitive.Item key={link.title}>
            <Link href={link.href!} legacyBehavior passHref>
              <NavigationMenuPrimitive.Link className={navigationMenuTriggerStyle()}>
                {link.title}
              </NavigationMenuPrimitive.Link>
            </Link>
          </NavigationMenuPrimitive.Item>
        );
      }
      
      const isMegaMenu = link.children.some(child => !!child.children?.length);

      return (
        <NavigationMenuPrimitive.Item key={link.title}>
          <NavigationMenuPrimitive.Trigger className="group">
            {link.title}
            <ChevronDown
              className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </NavigationMenuPrimitive.Trigger>
          <NavigationMenuPrimitive.Content>
            <ul className={cn(
                "grid gap-3 p-4",
                isMegaMenu ? "w-[600px] grid-cols-[.75fr_1fr]" : "w-[400px] md:w-[500px] md:grid-cols-2"
            )}>
              {isMegaMenu ? (
                  <>
                    <li className="row-span-3">
                       <NavigationMenuPrimitive.Link asChild>
                         <div
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                         >
                           <div className="mb-2 mt-4 text-lg font-medium">
                            {link.title}
                           </div>
                           <p className="text-sm leading-tight text-muted-foreground">
                            {link.description || `Explore all things related to ${link.title}.`}
                           </p>
                         </div>
                       </NavigationMenuPrimitive.Link>
                    </li>
                    <div className='flex flex-col'>
                      {renderLinksRecursive(link.children)}
                    </div>
                  </>
              ) : (
                renderLinksRecursive(link.children)
              )}
            </ul>
            {!isMegaMenu && (
                 <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">
                    {link.children.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
            )}
          </NavigationMenuPrimitive.Content>
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
        {links.map((link) => {
            if (!hasChildren(link)) {
                return (
                    <NavigationMenuPrimitive.Item key={link.href}>
                    <Link href={link.href!} legacyBehavior passHref>
                        <NavigationMenuPrimitive.Link className={navigationMenuTriggerStyle()}>
                        {link.title}
                        </NavigationMenuPrimitive.Link>
                    </Link>
                    </NavigationMenuPrimitive.Item>
                );
            }

            const isMegaMenu = link.children.some(child => hasChildren(child));
            
            return (
                 <NavigationMenuPrimitive.Item key={link.title}>
                    <NavigationMenuPrimitive.Trigger className="group">
                        {link.title}
                        <ChevronDown
                            className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
                            aria-hidden="true"
                        />
                    </NavigationMenuPrimitive.Trigger>
                    <NavigationMenuPrimitive.Content>
                       <ul className={cn(
                            "grid p-4",
                            isMegaMenu ? "w-auto grid-flow-col" : "w-[400px] gap-3 md:w-[500px] md:grid-cols-2 lg:w-[600px]"
                       )}>
                            {isMegaMenu ? link.children.map(col => (
                                <ul key={col.title} className="flex flex-col gap-3 w-[200px]">
                                     <ListItem
                                        key={col.title}
                                        title={col.title}
                                        className="bg-muted/50"
                                     >
                                        {col.description}
                                    </ListItem>
                                    {col.children?.map(item => (
                                        <ListItem key={item.title} title={item.title} href={item.href}>
                                            {item.description}
                                        </ListItem>
                                    ))}
                                </ul>
                            )) : link.children.map(item => (
                                <ListItem key={item.title} title={item.title} href={item.href}>
                                    {item.description}
                                </ListItem>
                            ))}
                        </ul>
                    </NavigationMenuPrimitive.Content>
                 </NavigationMenuPrimitive.Item>
            )
        })}
      </NavigationMenuPrimitive.List>

      <div className="perspective-[2000px] absolute top-full left-0 flex justify-center">
        <NavigationMenuPrimitive.Viewport
          className={cn(
            "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]"
          )}
        />
      </div>
    </NavigationMenuPrimitive.Root>
  );
};


export interface MobileLinkProps {
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
