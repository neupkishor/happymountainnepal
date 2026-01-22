'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type AdminControlContextType = {
    editUrl: string | null;
    setEditUrl: (url: string | null) => void;
};

const AdminControlContext = createContext<AdminControlContextType | undefined>(undefined);

export function AdminControlProvider({ children }: { children: React.ReactNode }) {
    const [editUrl, setEditUrl] = useState<string | null>(null);
    const pathname = usePathname();

    // Reset editUrl on route change ensuring we don't carry over IDs
    useEffect(() => {
        // We don't reset immediately because the new page might set it immediately after.
        // Actually, it's safer to let the new page set it.
        // But if the new page DOESN'T set it, we should clear it.
        // However, the new page's useEffect will run *after* the route change.
        // So we can clear it here.
        // BUT checking purely on pathname change might be racy with the page's setEditUrl?
        // Usually:
        // Path change -> Provider sees change -> setEditUrl(null)
        // Page renders -> Page useEffect -> setEditUrl('/new/path')
        // This order works.
        setEditUrl(null);
    }, [pathname]);

    return (
        <AdminControlContext.Provider value={{ editUrl, setEditUrl }}>
            {children}
        </AdminControlContext.Provider>
    );
}

export function useAdminControl() {
    const context = useContext(AdminControlContext);
    if (context === undefined) {
        throw new Error('useAdminControl must be used within an AdminControlProvider');
    }
    return context;
}
