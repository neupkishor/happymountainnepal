
'use client';

import NextLink from 'next/link';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof NextLink> & {
    children: React.ReactNode;
    className?: string;
}

export const Link = ({ href, className, children, ...props }: LinkProps) => {

  return (
    <NextLink href={href} className={cn('hover:text-primary', className)} {...props}>
      {children}
    </NextLink>
  );
};
