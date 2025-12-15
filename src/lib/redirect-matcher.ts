import { match } from 'path-to-regexp';

export interface RedirectRule {
    source: string;
    destination: string;
    permanent: boolean;
    id: string;
    createdAt: string;
}

export interface MatchResult {
    destination: string;
    permanent: boolean;
    matched: boolean;
}

/**
 * Converts a pattern with {{variable}} syntax to path-to-regexp format
 * Example: /name/{{name}}/hello -> /name/:name/hello
 */
function convertPatternToPathRegexp(pattern: string): string {
    return pattern.replace(/\{\{([^}]+)\}\}/g, ':$1');
}

/**
 * Replaces variables in destination with actual values from params
 * Example: /trips/{{name}}/world with {name: 'kishor'} -> /trips/kishor/world
 */
function replaceVariables(destination: string, params: Record<string, string | string[]>): string {
    let result = destination;

    for (const [key, value] of Object.entries(params)) {
        // Handle array values (shouldn't happen in our case, but just in case)
        const stringValue = Array.isArray(value) ? value[0] : value;
        // Replace {{key}} with the actual value
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), stringValue);
    }

    return result;
}

/**
 * Attempts to match a pathname against redirect rules
 * Returns the destination URL if a match is found, or null if no match
 */
export function matchRedirect(pathname: string, redirects: RedirectRule[]): MatchResult | null {
    for (const redirect of redirects) {
        try {
            // First try exact match (for backward compatibility)
            if (redirect.source === pathname) {
                return {
                    destination: redirect.destination,
                    permanent: redirect.permanent,
                    matched: true,
                };
            }

            // Try pattern matching
            const pathRegexpPattern = convertPatternToPathRegexp(redirect.source);
            const matcher = match(pathRegexpPattern, { decode: decodeURIComponent });
            const result = matcher(pathname);

            if (result) {
                // Extract parameters from the matched path
                const params = result.params as Record<string, string | string[]>;

                // Replace variables in destination with actual values
                const finalDestination = replaceVariables(redirect.destination, params);

                return {
                    destination: finalDestination,
                    permanent: redirect.permanent,
                    matched: true,
                };
            }
        } catch (error) {
            // If pattern is invalid, skip it and continue
            console.error(`Invalid redirect pattern: ${redirect.source}`, error);
            continue;
        }
    }

    return null;
}

/**
 * Validates a redirect pattern to ensure it's valid
 */
export function validateRedirectPattern(source: string): { valid: boolean; error?: string } {
    try {
        const pathRegexpPattern = convertPatternToPathRegexp(source);
        match(pathRegexpPattern);
        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Invalid pattern'
        };
    }
}
