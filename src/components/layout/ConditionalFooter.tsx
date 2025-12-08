'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
    const pathname = usePathname();

    // Hide footer on /manage pages
    if (pathname.startsWith('/manage')) {
        return null;
    }

    return <Footer />;
}
