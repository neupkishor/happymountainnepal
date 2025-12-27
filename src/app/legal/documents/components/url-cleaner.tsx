'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Client component that removes the 'verified' query parameter from the URL
 * after successful authentication, keeping the URL clean.
 */
export function UrlCleaner() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check if the verified parameter exists
        if (searchParams.has('verified')) {
            // Remove it by replacing the URL without the parameter
            const newUrl = window.location.pathname;
            router.replace(newUrl);
        }
    }, [searchParams, router]);

    return null; // This component doesn't render anything
}
