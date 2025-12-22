import type { FileUpload } from './types';

const NEUPCDN_BASE = 'https://neupgroup.com';
const DEFAULT_LOCAL_BASE = 'https://neupgroup.com';

/**
 * Replaces template variables in URL
 * @param url - URL that may contain {{neupcdn}} or {{local}} templates
 * @param basePath - The base path to replace {{local}} with
 * @returns Resolved URL
 */
export function resolveUrlTemplates(url: string, basePath?: string): string {
    if (!url) return '';

    let resolved = url;

    // Replace {{neupcdn}}
    if (resolved.includes('{{neupcdn}}')) {
        resolved = resolved.replace('{{neupcdn}}', NEUPCDN_BASE);
    }

    // Replace {{local}}
    // Also support old {{basePath}} for backward compatibility if data exists
    if (resolved.includes('{{local}}') || resolved.includes('{{basePath}}')) {
        const effectiveBasePath = basePath || DEFAULT_LOCAL_BASE;
        const cleanBasePath = effectiveBasePath.endsWith('/') ? effectiveBasePath.slice(0, -1) : effectiveBasePath;
        resolved = resolved.replace('{{local}}', cleanBasePath).replace('{{basePath}}', cleanBasePath);
    }

    return resolved;
}

/**
 * Constructs a full URL from a file upload based on its url and templates
 * @param file - The file upload object
 * @param basePath - The base path from site profile (optional/contextual)
 * @returns The full URL to the file
 */
export function getFullUrl(file: FileUpload, basePath?: string): string {
    return resolveUrlTemplates(file.url, basePath);
}

/**
 * Returns the fully resolved URL
 */
export function getSelectablePath(file: FileUpload, basePath?: string): string {
    return getFullUrl(file, basePath);
}
