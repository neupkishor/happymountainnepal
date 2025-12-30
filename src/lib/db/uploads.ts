
'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit as firestoreLimit, startAfter, doc, deleteDoc, Timestamp } from 'firebase/firestore';
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
    tags?: string[];
    lastDocId?: string | null;
}): Promise<{ uploads: FileUpload[]; hasMore: boolean; totalCount?: number }> {
    if (!firestore) return { uploads: [], hasMore: false };
    
    let q = query(collection(firestore, 'uploads'), orderBy('uploadedAt', 'desc'));
    
    if (options?.lastDocId) {
        const lastDoc = await getDoc(doc(firestore, 'uploads', options.lastDocId));
        if (lastDoc.exists()) {
            q = query(q, startAfter(lastDoc));
        }
    }
    
    const limit = options?.limit || 10;
    q = query(q, firestoreLimit(limit + 1));

    const querySnapshot = await getDocs(q);
    const uploads = querySnapshot.docs.slice(0, limit).map(doc => {
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
            // Convert timestamps to ISO strings
            uploadedAt: data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate().toISOString() : new Date().toISOString(),
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as FileUpload;
    });

    const hasMore = querySnapshot.docs.length > limit;

    return { uploads, hasMore };
}

export async function getFileUploadsCount(): Promise<number> {
    if (!firestore) return 0;
    const snapshot = await getDocs(collection(firestore, 'uploads'));
    return snapshot.size;
}
