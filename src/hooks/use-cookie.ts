'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Helper to get cookie by name (remains for other potential uses, but not for temp_account)
function getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
}

// Helper to detect if user agent is a bot
function isBot(): boolean {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent;
    const botPatterns = [
        /bot/i, /crawler/i, /spider/i, /crawling/i,
        /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
    ];
    return botPatterns.some(pattern => pattern.test(userAgent));
}

// Log a page view
export async function logPageView(pathname: string) {
    try {
        await fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // The cookieId will be extracted from headers on the server-side via the middleware
                pageAccessed: pathname,
                resourceType: 'page',
                method: 'GET',
                statusCode: 200,
                referrer: document.referrer || undefined,
                userAgent: navigator.userAgent,
                isBot: isBot(),
                metadata: {
                    source: 'client-navigation',
                    screenWidth: window.innerWidth,
                    screenHeight: window.innerHeight,
                },
            }),
        });
    } catch (error) {
        console.error('Failed to log page view:', error);
    }
}

// Component to track page views on client-side navigation
export function PageViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Log page view on client-side navigation
        logPageView(pathname);
    }, [pathname]);

    return null;
}