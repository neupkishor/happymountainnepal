'use client';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function NavigationEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
 
  useEffect(() => {
    const url = `${pathname}?${searchParams}`
    console.log(url)
    // You can now use the url variable for whatever purpose you need.
    // For example, you can send it to an analytics service.
  }, [pathname, searchParams])
 
  return null
}

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <ProgressBar
        height="4px"
        color="hsl(var(--primary))"
        options={{ showSpinner: false }}
        shallowRouting
      />
      <Suspense fallback={null}>
        <NavigationEvents />
      </Suspense>
    </>
  );
};
