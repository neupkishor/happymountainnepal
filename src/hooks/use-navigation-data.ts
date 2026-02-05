'use client';

import { useState, useEffect } from 'react';
import type { NavLink } from '@/components/layout/HeaderV3Nav';

interface NavigationData {
    header: {
        links: NavLink[];
    };
    footer: {
        links: any[];
    };
}

export function useNavigationData(initialData?: NavigationData) {
    const [data, setData] = useState<NavigationData | null>(initialData || null);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (initialData) return;

        async function loadData() {
            try {
                const response = await fetch('/api/navigation-components');
                if (!response.ok) {
                    throw new Error('Failed to load navigation data');
                }
                const jsonData = await response.json();
                setData(jsonData);
            } catch (err) {
                setError(err as Error);
                console.error('Error loading navigation data:', err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [initialData]);

    return { data, loading, error };
}

export function useHeaderLinks(initialLinks?: NavLink[]) {
    // If we have initialLinks, we can construct a fake initialData object
    // But useNavigationData expects the full structure.
    // Let's just pass undefined if we only have links, OR we modify useHeaderLinks to not rely on useNavigationData if data is passed.
    
    // Simplest way: if initialLinks provided, return them directly.
    // But we might want the rest of the data eventually.
    
    // Let's refactor:
    // If initialLinks is passed, we use it. If not, we call useNavigationData.
    const { data, loading, error } = useNavigationData();
    
    if (initialLinks) {
        return { links: initialLinks, loading: false, error: null };
    }

    return {
        links: data?.header?.links || [],
        loading,
        error
    };
}

export function useFooterLinks() {
    const { data, loading, error } = useNavigationData();
    return {
        links: data?.footer?.links || [],
        loading,
        error
    };
}
