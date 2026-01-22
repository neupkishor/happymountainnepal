'use client';

import { useEffect } from 'react';
import { useAdminControl } from '@/context/AdminControlContext';

export function AdminPageControl({ editPath }: { editPath: string }) {
    const { setEditUrl } = useAdminControl();

    useEffect(() => {
        setEditUrl(editPath);
        // Only verify on mount/unmount or if editPath changes
        return () => {
            // Don't clear on unmount because checking route change in context handles it.
            // And clearing strictly on unmount might clear what the NEXT page just set if transition overlaps.
            // But typically React unmounts old then mounts new.
            // Context's pathname watcher is safer.
        };
    }, [editPath, setEditUrl]);

    return null;
}
