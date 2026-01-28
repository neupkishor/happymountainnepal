
'use server';

import { saveUpload, deleteUpload, getUploads, getUploadById, getUploadByUrl } from '@/lib/db/sqlite';
import type { FileUpload } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function logFileUpload(data: Omit<FileUpload, 'id' | 'uploadedAt' | 'createdAt' | 'uploadedOn'>): Promise<void> {
    // Check for existing URL to avoid duplicates
    const existing = getUploadByUrl(data.url);
    if (existing) {
        return;
    }

    const now = new Date().toISOString();
    const id = uuidv4();

    // Convert to the format expected by saveUpload
    const uploadData = {
        id,
        ...data,
        uploadedOn: now, // Simplification: using full ISO string as uploadedOn matches sqlite expectations if updated
        uploadedAt: now,
        createdAt: now,
        size: data.size || 0,
        tags: data.tags || [],
        meta: data.meta || []
    };

    saveUpload(uploadData);
}

export async function deleteFileUpload(id: string): Promise<void> {
    deleteUpload(id);
}

export async function updateFileUpload(id: string, data: Partial<FileUpload>): Promise<void> {
    const existing = getUploadById(id);
    if (!existing) {
        throw new Error(`Upload with id ${id} not found`);
    }

    const updated = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
        tags: data.tags || existing.tags, // specific handling if tags are replaced
        meta: data.meta || existing.meta
    };

    // saveUpload expects specific fields. We construct it carefully from FileUpload type to UploadDB type
    // existing is UploadDB compatible (from getUploadById return), plus our overrides.
    // wait, getUploadById returns object with tags/meta as arrays (parsed). saveUpload expects arrays.
    // So this is compatible.

    // We need to make sure we don't pass extra fields that saveUpload might not handle if type mismatch?
    // saveUpload takes Omit<UploadDB, ...> & { tags: string[], meta: any[] }.
    // UploadDB has id, name, url, uploadedBy, type, size, tags(string), meta(string), uploadedOn, uploadedAt, createdAt.
    // But saveUpload arguments are slightly different (clean arrays).

    // Let's reconstruct the object for saveUpload to be safe
    const toSave = {
        id: updated.id,
        name: updated.name,
        url: updated.url,
        uploadedBy: updated.uploadedBy,
        type: updated.type,
        size: updated.size,
        tags: updated.tags as string[],
        meta: updated.meta as any[],
        uploadedOn: updated.uploadedOn,
        uploadedAt: updated.uploadedAt,
        createdAt: updated.createdAt
    };

    saveUpload(toSave);
}

export async function getFileUploads(options?: {
    limit?: number;
    page?: number;
    tags?: string[];
    lastDocId?: string | null;
    searchTerm?: string;
}): Promise<{ uploads: FileUpload[]; hasMore: boolean; totalCount: number; totalPages: number }> {

    // Map options.searchTerm to options.search (sqlite expects search)
    const result = getUploads({
        limit: options?.limit,
        page: options?.page,
        tags: options?.tags,
        search: options?.searchTerm
    });

    return {
        uploads: result.uploads.map(u => ({
            ...u,
            // mapping back DB fields to FileUpload if needed. DB fields match FileUpload mostly.
            // DB has uploadedAt as string. FileUpload expects string.
            // DB has uploadedOn as string.
            // DB has tags/meta as arrays (parsed in getUploads).
        } as FileUpload)),
        hasMore: result.hasMore,
        totalCount: result.totalCount,
        totalPages: result.totalPages
    };
}


export async function getFileUploadsCount(): Promise<number> {
    const result = getUploads({ limit: 1 }); // We just want the method to run, but wait, getUploads returns totalCount
    // This is inefficient if we only want count. But getUploads computes count.
    // We can add a specialized getCount to sqlite if performance matters, but for now this works.
    return result.totalCount;
}

export async function getFileUpload(id: string): Promise<FileUpload | null> {
    const upload = getUploadById(id);
    if (!upload) return null;
    return upload as unknown as FileUpload; // Types are compatible after parsing JSON in sqlite.ts
}

export async function checkFileUploadByUrl(url: string): Promise<boolean> {
    const upload = getUploadByUrl(url);
    return !!upload;
}
