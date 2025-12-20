
'use client';

import { useState, useEffect } from 'react';

/**
 * Reads a cookie from the browser's document.cookie.
 * This hook is client-side only.
 * @param name The name of the cookie to read.
 * @returns The value of the cookie, or null if not found.
 */
export function useCookie(name: string): string | null {
  const [cookieValue, setCookieValue] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client side after mount
    if (typeof document !== 'undefined') {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        setCookieValue(parts.pop()?.split(';').shift() || null);
      }
    }
  }, [name]);

  return cookieValue;
}
