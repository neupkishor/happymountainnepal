
'use client';

import NextLink from 'next/link';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';
import NProgress from 'nprogress';
import { usePathname } from 'next/navigation';

type LinkProps = ComponentProps<typeof NextLink> & {
    children: React.ReactNode;
    className?: string;
}

export const Link = ({ href, className, children, ...props }: LinkProps) => {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const currentPath = pathname;
    const newPath = href.toString();
    
    // Check for new tab clicks
    if (props.target === '_blank' || e.ctrlKey || e.metaKey) {
      return;
    }

    // Check for anchor links or links to the same page
    if (newPath.startsWith('#') || newPath === currentPath) {
      return;
    }

    NProgress.start();
  };

  return (
    <NextLink href={href} className={cn('hover:text-primary', className)} onClick={handleClick} {...props}>
      {children}
    </NextLink>
  );
};
