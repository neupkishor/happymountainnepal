'use client';

import Image, { ImageProps } from 'next/image';
import type { PathType } from '@/lib/types';
import { useSiteProfile } from '@/hooks/use-site-profile';

interface SmartImageProps extends Omit<ImageProps, 'src'> {
    src: string;
    pathType?: PathType;
    path?: string;
}

/**
 * SmartImage component that handles both absolute and relative image paths
 * - For relative paths: uses baseUrl from site profile + path
 * - For absolute paths: uses the src prop (full URL)
 */
export function SmartImage({ src, pathType = 'absolute', path, ...props }: SmartImageProps) {
    const { profile } = useSiteProfile();

    let imageSrc = src;

    if (pathType === 'relative' && path) {
        // For relative paths, construct full URL using baseUrl
        const baseUrl = profile?.baseUrl || '';
        // Remove trailing slash from baseUrl and leading slash from path if both exist
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        imageSrc = baseUrl ? `${cleanBaseUrl}${cleanPath}` : path;
    }

    return <Image src={imageSrc} {...props} />;
}
