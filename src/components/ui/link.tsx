
'use client';

import NextLink from 'next/link';
import NProgress from 'nprogress';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof NextLink> & {
    children: React.ReactNode;
    className?: string;
}

export const Link = ({ href, className, children, ...props }: LinkProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Check for modifier keys
    if (e.ctrlKey || e.metaKey) {
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
