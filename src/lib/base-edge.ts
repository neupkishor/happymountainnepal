// Edge runtime compatible version - NO Node.js modules

interface Manager {
    username: string;
    password: string;
}

let cachedManagers: Manager[] | null = null;
let lastFetchTimestamp = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

const API_URL = 'https://neupgroup.com/site/bridge/api/v1/manager.json';

/**
 * Fetches manager data from the external API with caching.
 * This function is safe to use in Edge runtime.
 */
export async function getManagerData(): Promise<Manager[]> {
    if (cachedManagers && (Date.now() - lastFetchTimestamp < CACHE_DURATION)) {
        return cachedManagers;
    }

    try {
        const response = await fetch(API_URL, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 60 } // Revalidate every 60 seconds
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch managers: ${response.statusText}`);
        }
        const data = await response.json();
        cachedManagers = (data || []) as Manager[];
        lastFetchTimestamp = Date.now();
        return cachedManagers;
    } catch (error) {
        console.error("Error fetching managers from API:", error);
        // Return stale cache if available, otherwise throw
        if (cachedManagers) return cachedManagers;
        throw error;
    }
}
