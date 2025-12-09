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

export function useNavigationData() {
    const [data, setData] = useState<NavigationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
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
    }, []);

    return { data, loading, error };
}

export function useHeaderLinks() {
    const { data, loading, error } = useNavigationData();
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
