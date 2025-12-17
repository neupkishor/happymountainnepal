// src/lib/get-redirects.ts
import type { RedirectRule } from './redirect-matcher';

/**
 * Get redirects - works in both Edge and Node.js runtime
 * In production/edge, this should fetch from an external source (KV, database, etc.)
 * In development, it can read from the file system via API
 */
export async function getRedirects(origin?: string): Promise<RedirectRule[]> {
    try {
        // If we have an origin, use the API endpoint
        if (origin) {
            const response = await fetch(`${origin}/api/redirects`, {
                next: { revalidate: 60 } // Cache for 60 seconds
            });
            if (response.ok) {
                return await response.json();
            }
        }

        // Fallback to empty array
        return [];
    } catch (error) {
        console.error('Failed to fetch redirects:', error);
        return [];
    }
}
