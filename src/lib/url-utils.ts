import type { FileUpload, PathType } from './types';

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

    // For relative paths, construct full URL using baseUrl
    if (file.pathType === 'relative' && file.path) {
        if (!baseUrl) {
            return file.path; // Fallback to relative path if no baseUrl
        }

        // Remove trailing slash from baseUrl and ensure path starts with /
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanPath = file.path.startsWith('/') ? file.path : `/${file.path}`;

        return `${cleanBaseUrl}${cleanPath}`;
    }

    return file.url;
}

/**
 * Gets the path to use for selection/comparison
 * For relative paths with baseUrl, returns the full URL
 * Otherwise returns the appropriate path based on pathType
 */
export function getSelectablePath(file: FileUpload, baseUrl?: string): string {
    return getFullUrl(file, baseUrl);
}
