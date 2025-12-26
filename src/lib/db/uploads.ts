
'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit as firestoreLimit, startAfter, doc, deleteDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { FileUpload, UploadCategory } from '@/lib/types';
import { logError } from './errors';

export async function logFileUpload(data: Omit<FileUpload, 'id' | 'uploadedOn'>): Promise<void> {
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

export async function addExternalMediaLink(url: string, uploadedBy: string): Promise<string> {
    if (!firestore) throw new Error("Database not available.");
    const urlParts = url.split('/');
    const name = urlParts[urlParts.length - 1] || 'external-media';
    const extension = name.split('.').pop()?.toLowerCase();
    let type = 'application/octet-stream';
    if (extension) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        if (imageExtensions.includes(extension)) type = `image/${extension}`;
    }
    const docRef = await addDoc(collection(firestore, 'uploads'), {
        url, name, type, size: 0, location: 'HotLinked', meta: [],
        uploadedOn: new Date().toISOString(), uploadedAt: serverTimestamp(),
        uploadedBy, category: 'general' as UploadCategory, createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getFileUploads(options?: {
    limit?: number;
    category?: UploadCategory;
    lastDocId?: string | null;
}): Promise<{ uploads: FileUpload[]; hasMore: boolean; totalCount?: number }> {
    if (!firestore) return { uploads: [], hasMore: false };
    
    let q = query(collection(firestore, 'uploads'), orderBy('uploadedAt', 'desc'));
    if (options?.category) {
        q = query(q, where('category', '==', options.category));
    }
    
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
            name: data.name || data.fileName || 'Untitled',
            caption: data.caption || '',
            type: data.type || data.fileType || 'application/octet-stream',
            category: data.category || 'general',
            size: data.size || data.fileSize || 0,
            location: data.location || (data.uploadSource === 'NeupCDN' ? 'NeupCDN' : (data.pathType === 'absolute' ? 'HotLinked' : 'Local')),
            meta: Array.isArray(data.meta) ? data.meta : (data.metaInformation ? [data.metaInformation] : []),
            uploadedOn: data.uploadedOn || (data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate().toISOString() : new Date().toISOString()),
            uploadedBy: data.uploadedBy || data.userId || 'Unknown',
            url: data.url || ''
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
