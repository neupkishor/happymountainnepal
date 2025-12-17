// src/lib/redirect-matcher.ts
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
 * Convert /name/{{name}} -> /name/:name for path-to-regexp
 */
function convertPatternToPathRegexp(pattern: string): string {
    return pattern.replace(/\{\{([^}]+)\}\}/g, ':$1');
}

/**
 * Replace {{variable}} in destination with actual values
 */
function replaceVariables(destination: string, params: Record<string, string>): string {
    let result = destination;
    for (const [key, value] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return result;
}

/**
 * Match a pathname with a pattern using path-to-regexp v8
 */
function matchPattern(pattern: string, pathname: string): Record<string, string> | null {
    try {
        const matchFn = match(pattern, { decode: decodeURIComponent });
        const result = matchFn(pathname);

        if (!result) return null;

        const params: Record<string, string> = {};
        if (result.params && typeof result.params === 'object') {
            for (const [key, value] of Object.entries(result.params)) {
                if (typeof value === 'string') {
                    params[key] = value;
                }
            }
        }

        return params;
    } catch (error) {
        console.error(`Error matching pattern ${pattern}:`, error);
        return null;
    }
}

/**
 * Normalize trailing slash (except root)
 */
function normalizePath(pathname: string): string {
    if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
    return pathname;
}

/**
 * Match a pathname against the redirect rules (pure function - no I/O)
 * @param rawPathname - The pathname to match
 * @param redirects - Array of redirect rules to match against
 */
export function matchRedirect(rawPathname: string, redirects: RedirectRule[]): MatchResult | null {
    const pathname = normalizePath(rawPathname);

    for (const redirect of redirects) {
        try {
            const source = normalizePath(redirect.source);

            // Exact match first
            if (source === pathname) {
                return { destination: redirect.destination, permanent: redirect.permanent, matched: true };
            }

            // Pattern match with variables
            const pathRegexpPattern = convertPatternToPathRegexp(source);
            const params = matchPattern(pathRegexpPattern, pathname);

            if (params) {
                const finalDestination = replaceVariables(redirect.destination, params);
                return { destination: finalDestination, permanent: redirect.permanent, matched: true };
            }
        } catch (error) {
            console.error(`Invalid redirect pattern: ${redirect.source}`, error);
            continue;
        }
    }

    return null;
}

/**
 * Optional: Validate redirect pattern
 */
export function validateRedirectPattern(source: string): { valid: boolean; error?: string } {
    try {
        const pathRegexpPattern = convertPatternToPathRegexp(source);
        match(pathRegexpPattern); // This will throw if pattern is invalid
        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Invalid pattern',
        };
    }
}
