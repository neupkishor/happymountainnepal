
'use client';

import { Suspense, useEffect } from 'react';
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
    // Configure NProgress
    NProgress.configure({
      showSpinner: false,
      minimum: 0.1,
      easing: 'ease',
      speed: 500,
      trickleSpeed: 200,
    });

    // Inject custom color style for the progress bar
    const style = document.createElement('style');
    style.innerHTML = `
      #nprogress .bar {
        background: hsl(var(--primary)) !important;
        height: 4px !important;
        z-index: 9999 !important;
      }
      #nprogress .peg {
        box-shadow: 0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary)) !important;
      }
    `;
    document.head.appendChild(style);

    // Start progress on link clicks
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLAnchorElement;
      const targetUrl = target.href;
      const currentUrl = window.location.href;

      // Only start progress if navigating to a different page
      if (targetUrl !== currentUrl && target.target !== '_blank') {
        NProgress.start();
      }
    };

    // Start progress on browser back/forward
    const handlePopState = () => {
      NProgress.start();
    };

    // Attach click listeners to all anchor tags
    const anchorElements = document.querySelectorAll('a[href]');
    anchorElements.forEach((anchor) => {
      anchor.addEventListener('click', handleAnchorClick as EventListener);
    });

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handlePopState);

    // Use MutationObserver to handle dynamically added links
    const observer = new MutationObserver(() => {
      const newAnchors = document.querySelectorAll('a[href]');
      newAnchors.forEach((anchor) => {
        // Remove old listener if exists and add new one
        anchor.removeEventListener('click', handleAnchorClick as EventListener);
        anchor.addEventListener('click', handleAnchorClick as EventListener);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      // Cleanup
      document.head.removeChild(style);
      anchorElements.forEach((anchor) => {
        anchor.removeEventListener('click', handleAnchorClick as EventListener);
      });
      window.removeEventListener('popstate', handlePopState);
      observer.disconnect();
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <NProgressDone />
    </Suspense>
  );
}
