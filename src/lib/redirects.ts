
'use server';

import { readBaseFile, writeBaseFile } from '@/lib/base';
import type { Redirect } from './types';

const REDIRECTS_FILE_NAME = 'redirects.json';

export async function getRedirects(): Promise<Redirect[]> {
    try {
        const redirects = await readBaseFile(REDIRECTS_FILE_NAME);
        return Array.isArray(redirects) ? redirects : [];
    } catch (error: any) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return []; // File doesn't exist, return empty array
        }
        console.error("Error reading redirects:", error);
        return [];
    }
}

export async function addRedirect(data: Omit<Redirect, 'id' | 'createdAt'>): Promise<string> {
    try {
        const redirects = await getRedirects();
        const newRedirect: Redirect = {
            ...data,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };

        redirects.push(newRedirect);
        await writeBaseFile(REDIRECTS_FILE_NAME, redirects);

        return newRedirect.id;
    } catch (error: any) {
        console.error("Error adding redirect:", error);
        throw new Error("Could not add redirect.");
    }
}

export async function deleteRedirect(id: string): Promise<void> {
    try {
        const redirects = await getRedirects();
        const filteredRedirects = redirects.filter(r => r.id !== id);
        await writeBaseFile(REDIRECTS_FILE_NAME, filteredRedirects);
    } catch (error: any) {
        console.error("Error deleting redirect:", error);
        throw new Error("Could not delete redirect.");
    }
}
