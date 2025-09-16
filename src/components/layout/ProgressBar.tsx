
'use client';

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

function NProgressDone() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}

// This component is the key to making NProgress work with the App Router
function NavigationEvents() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isInitialRender = useRef(true);

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }

        // The `nprogress.done()` will be called by the `NProgressDone` component.
        // We only need to call `nprogress.start()` here.
        NProgress.start();

        return () => {
            // In case the component unmounts before navigation completes.
            if (NProgress.isStarted()) {
                NProgress.done();
            }
        };
    }, [pathname, searchParams]);
    
    return null;
}


export function ProgressBar() {
  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    // Inject custom color style
    const style = document.createElement('style');
    style.innerHTML = `
      #nprogress .bar {
        background: hsl(var(--primary)) !important;
        height: 3px !important;
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
      <NavigationEvents />
      <NProgressDone />
    </Suspense>
  );
}
