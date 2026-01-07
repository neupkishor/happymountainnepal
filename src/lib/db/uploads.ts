
'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit as firestoreLimit, startAfter, doc, deleteDoc, Timestamp, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { FileUpload } from '@/lib/types';
import { logError } from './errors';

export async function logFileUpload(data: Omit<FileUpload, 'id' | 'uploadedAt' | 'createdAt' | 'uploadedOn'>): Promise<void> {
    if (!firestore) {
        console.error("Firestore is not initialized. Cannot log file upload.");
        return;
    }
    try {
        await addDoc(collection(firestore, 'uploads'), {
            ...data,
            uploadedOn: new Date().toISOString(),
            uploadedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to log file upload to Firestore:', error);
    }
}

export async function deleteFileUpload(id: string): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    await deleteDoc(doc(firestore, 'uploads', id));
}

export async function getFileUploads(options?: {
    limit?: number;
    page?: number;
    tags?: string[];
    lastDocId?: string | null;
}): Promise<{ uploads: FileUpload[]; hasMore: boolean; totalCount: number; totalPages: number }> {
    if (!firestore) return { uploads: [], hasMore: false, totalCount: 0, totalPages: 0 };
    
    let baseQuery = query(collection(firestore, 'uploads'));

    // Count total documents for pagination
    const countSnapshot = await getDocs(baseQuery);
    const totalCount = countSnapshot.size;
    
    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const totalPages = Math.ceil(totalCount / limit);

    let paginatedQuery = query(baseQuery, orderBy('uploadedAt', 'desc'), firestoreLimit(limit));

    if (page > 1) {
        const offset = (page - 1) * limit;
        const cursorQuery = query(collection(firestore, 'uploads'), orderBy('uploadedAt', 'desc'), firestoreLimit(offset));
        const cursorSnapshot = await getDocs(cursorQuery);
        const lastVisible = cursorSnapshot.docs[cursorSnapshot.docs.length - 1];
        if (lastVisible) {
            paginatedQuery = query(paginatedQuery, startAfter(lastVisible));
        }
    }

    const querySnapshot = await getDocs(paginatedQuery);
    const uploads = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name || 'Untitled',
            url: data.url || '',
            uploadedBy: data.uploadedBy || 'Unknown',
            type: data.type || 'application/octet-stream',
            size: data.size || 0,
            tags: data.tags || ['general'],
            meta: data.meta || [],
            uploadedOn: data.uploadedOn || (data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate().toISOString() : new Date().toISOString()),
            uploadedAt: data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate().toISOString() : new Date().toISOString(),
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as FileUpload;
    });

    const hasMore = page < totalPages;

    return { uploads, hasMore, totalCount, totalPages };
}


export async function getFileUploadsCount(): Promise<number> {
    if (!firestore) return 0;
    const snapshot = await getDocs(collection(firestore, 'uploads'));
    return snapshot.size;
}
