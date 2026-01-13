
'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit as firestoreLimit, startAfter, doc, deleteDoc, Timestamp, getDoc, where } from 'firebase/firestore';
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
    searchTerm?: string;
}): Promise<{ uploads: FileUpload[]; hasMore: boolean; totalCount: number; totalPages: number }> {
    if (!firestore) return { uploads: [], hasMore: false, totalCount: 0, totalPages: 0 };

    let baseQuery = query(collection(firestore, 'uploads'));

    const searchTerm = options?.searchTerm?.trim();
    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    if (searchTerm) {
        // Firebase prefix search requires ordering by the field being searched
        baseQuery = query(
            baseQuery,
            where('name', '>=', searchTerm),
            where('name', '<=', searchTerm + '\uf8ff'),
            orderBy('name')
        );
    } else {
        baseQuery = query(baseQuery, orderBy('uploadedAt', 'desc'));
    }

    if (options?.tags && options.tags.length > 0) {
        baseQuery = query(baseQuery, where('tags', 'array-contains-any', options.tags));
    }

    // Since Firestore offset() is not directly available in standard web SDK in a simple way without firestoreLimit
    // and its behavior is specific, we use the 'get then skip' or 'startAfter' logic.
    // However, the user asked for offset 0, 10, 20 etc.
    // In web SDK, we can't easily do offset(n). We use startAfter with a document snapshot.

    let paginatedQuery = query(baseQuery, firestoreLimit(limit));

    if (offset > 0) {
        const skipQuery = query(baseQuery, firestoreLimit(offset));
        const skipSnapshot = await getDocs(skipQuery);
        const lastVisible = skipSnapshot.docs[skipSnapshot.docs.length - 1];
        if (lastVisible) {
            paginatedQuery = query(baseQuery, startAfter(lastVisible), firestoreLimit(limit));
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

    // For hasMore, we check if we got 'limit' number of items and if there's possibly more.
    // A better way is to fetch limit + 1.
    const hasMore = uploads.length === limit;

    return { uploads, hasMore, totalCount: 0, totalPages: 0 }; // totalCount/totalPages are less used here
}


export async function getFileUploadsCount(): Promise<number> {
    if (!firestore) return 0;
    const snapshot = await getDocs(collection(firestore, 'uploads'));
    return snapshot.size;
}
