'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';
import type { SiteProfile } from '@/lib/types';

export function ConditionalFooter({ initialProfile }: { initialProfile?: SiteProfile | null }) {
    const pathname = usePathname();

    // Hide footer on /manage pages
    if (pathname.startsWith('/manage')) {
        return null;
    }

    return <Footer initialProfile={initialProfile} />;
}
