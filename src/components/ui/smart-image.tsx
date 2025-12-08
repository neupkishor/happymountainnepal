import Image, { ImageProps } from 'next/image';
import type { PathType } from '@/lib/types';

interface SmartImageProps extends Omit<ImageProps, 'src'> {
    src: string;
    pathType?: PathType;
    path?: string;
}

/**
 * SmartImage component that handles both absolute and relative image paths
 * - For relative paths: uses the path prop (relative to /public)
 * - For absolute paths: uses the src prop (full URL)
 */
export function SmartImage({ src, pathType = 'absolute', path, ...props }: SmartImageProps) {
    const imageSrc = pathType === 'relative' && path ? path : src;

    return <Image src={imageSrc} {...props} />;
}
