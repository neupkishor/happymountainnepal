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
 * Replaces {{basePath}} template variable with actual baseUrl
 */
function replaceBasePath(path: string, baseUrl?: string): string {
    if (!path.includes('{{basePath}}')) {
        return path;
    }

    if (!baseUrl) {
        return path.replace('{{basePath}}', '');
    }

    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return path.replace('{{basePath}}', cleanBaseUrl);
}

/**
 * SmartImage component that handles both absolute and relative image paths
 * - For relative paths: replaces {{basePath}} template with actual baseUrl
 * - For absolute paths: uses the src prop (full URL)
 */
export function SmartImage({ src, pathType = 'absolute', path, ...props }: SmartImageProps) {
    const { profile } = useSiteProfile();

    let imageSrc = src;

    if (pathType === 'relative' && path) {
        // For relative paths, replace {{basePath}} template
        imageSrc = replaceBasePath(path, profile?.baseUrl);
    }

    return <Image src={imageSrc} {...props} />;
}
