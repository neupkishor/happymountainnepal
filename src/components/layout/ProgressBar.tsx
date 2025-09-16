
'use client';

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// This component is the key to making NProgress stop after the page has loaded.
function NProgressDone() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}


export function ProgressBar() {
  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    // Inject custom color style for the progress bar
    const style = document.createElement('style');
    style.innerHTML = `
      #nprogress .bar {
        background: hsl(var(--primary)) !important;
        height: 4px !important;
      }
      #nprogress .peg {
        box-shadow: 0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary)) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    }
  }, []);

  return (
    <Suspense fallback={null}>
      <NProgressDone />
    </Suspense>
  );
}
