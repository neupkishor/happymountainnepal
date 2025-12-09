'use client';

import { useCallback } from 'react';
import NProgress from 'nprogress';

/**
 * Custom hook for programmatic control of NProgress
 * Useful for form submissions, API calls, or any async operations
 * 
 * @example
 * const { start, done, set } = useNProgress();
 * 
 * const handleSubmit = async () => {
 *   start();
 *   try {
 *     await submitForm();
 *   } finally {
 *     done();
 *   }
 * };
 */
export function useNProgress() {
    const start = useCallback(() => {
        NProgress.start();
    }, []);

    const done = useCallback(() => {
        NProgress.done();
    }, []);

    const set = useCallback((n: number) => {
        NProgress.set(n);
    }, []);

    const inc = useCallback((amount?: number) => {
        NProgress.inc(amount);
    }, []);

    const remove = useCallback(() => {
        NProgress.remove();
    }, []);

    return {
        start,
        done,
        set,
        inc,
        remove,
    };
}
