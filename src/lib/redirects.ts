'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { Redirect } from './types';

const REDIRECTS_FILE_PATH = path.join(process.cwd(), 'src', 'redirects.json');

export async function getRedirects(): Promise<Redirect[]> {
    try {
        const fileContent = await fs.readFile(REDIRECTS_FILE_PATH, 'utf-8');
        const redirects = JSON.parse(fileContent);
        return redirects;
    } catch (error: any) {
        console.error("Error reading redirects:", error);
        // If file doesn't exist or is invalid, return empty array
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
        await fs.writeFile(REDIRECTS_FILE_PATH, JSON.stringify(redirects, null, 2), 'utf-8');

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
        await fs.writeFile(REDIRECTS_FILE_PATH, JSON.stringify(filteredRedirects, null, 2), 'utf-8');
    } catch (error: any) {
        console.error("Error deleting redirect:", error);
        throw new Error("Could not delete redirect.");
    }
}
