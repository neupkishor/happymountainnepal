
'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { SiteError } from '@/lib/types';

async function getDocById<T>(collectionName: string, id: string): Promise<T | null> {
    if (!firestore) return null;
    const docRef = doc(firestore, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
}

export async function logError(errorData: Omit<SiteError, 'id' | 'createdAt'>): Promise<void> {
    if (!firestore) {
        console.error("Firestore is not initialized. Cannot log error.");
        return;
    }
    try {
        await addDoc(collection(firestore, 'errors'), {
            ...errorData,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to log error to Firestore:', error);
    }
}

export async function getErrors(): Promise<SiteError[]> {
    if (!firestore) return [];
    try {
        const errorsRef = collection(firestore, 'errors');
        const q = query(errorsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SiteError));
    } catch (error: any) {
        console.error("Error fetching errors:", error);
        await logError({ message: `Failed to fetch errors: ${error.message}`, stack: error.stack, pathname: '/manage/site/errors' });
        throw new Error("Could not fetch errors from the database.");
    }
}

export async function getErrorById(id: string): Promise<SiteError | null> {
    return getDocById<SiteError>('errors', id);
}
