'use server';

import type { Redirect } from './types';

export async function getRedirects(): Promise<Redirect[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/redirects`, {
            cache: 'no-store'
        });
        if (!response.ok) {
            throw new Error('Failed to fetch redirects');
        }
        return await response.json();
    } catch (error: any) {
        console.error("Error reading redirects:", error);
        return [];
    }
}

export async function addRedirect(data: Omit<Redirect, 'id' | 'createdAt'>): Promise<string> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/redirects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'add', data }),
        });

        if (!response.ok) {
            throw new Error('Failed to add redirect');
        }

        const result = await response.json();
        return result.id;
    } catch (error: any) {
        console.error("Error adding redirect:", error);
        throw new Error("Could not add redirect.");
    }
}

export async function deleteRedirect(id: string): Promise<void> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/redirects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'delete', id }),
        });

        if (!response.ok) {
            throw new Error('Failed to delete redirect');
        }
    } catch (error: any) {
        console.error("Error deleting redirect:", error);
        throw new Error("Could not delete redirect.");
    }
}
