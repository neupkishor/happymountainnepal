import Link from 'next/link'; // Not strictly used here but kept imports similar? No, remove unused.
import Image, { ImageProps } from 'next/image';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { resolveUrlTemplates } from '@/lib/url-utils';

interface SmartImageProps extends Omit<ImageProps, 'src'> {
    src: string;
}

/**
 * SmartImage component that handles URL templates like {{neupcdn}} and {{local}}
 */
export function SmartImage({ src, ...props }: SmartImageProps) {
    const { profile } = useSiteProfile();
    const imageSrc = resolveUrlTemplates(src, profile?.basePath);

    return <Image src={imageSrc} {...props} />;
}
