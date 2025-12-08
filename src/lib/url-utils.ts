import type { FileUpload, PathType } from './types';

/**
 * Replaces {{basePath}} template variable with actual baseUrl
 * @param path - Path that may contain {{basePath}} template
 * @param baseUrl - The base URL to replace the template with
 * @returns Path with template replaced
 */
function replaceBasePath(path: string, baseUrl?: string): string {
    if (!path.includes('{{basePath}}')) {
        return path;
    }

    if (!baseUrl) {
        // If no baseUrl, remove the template variable
        return path.replace('{{basePath}}', '');
    }

    // Remove trailing slash from baseUrl
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return path.replace('{{basePath}}', cleanBaseUrl);
}

/**
 * Constructs a full URL from a file upload based on its pathType
 * @param file - The file upload object
 * @param baseUrl - The base URL from site profile (optional)
 * @returns The full URL to the file
 */
export function getFullUrl(file: FileUpload, baseUrl?: string): string {
    if (file.pathType === 'absolute') {
        return file.url;
    }

    // For relative paths, handle {{basePath}} template
    if (file.pathType === 'relative' && file.path) {
        return replaceBasePath(file.path, baseUrl);
    }

    return file.url;
}

/**
 * Gets the path to use for selection/comparison
 * For relative paths with baseUrl, returns the full URL with {{basePath}} replaced
 * Otherwise returns the appropriate path based on pathType
 */
export function getSelectablePath(file: FileUpload, baseUrl?: string): string {
    return getFullUrl(file, baseUrl);
}
