// src/lib/firestore-redirects.ts
import { firestore } from '@/lib/firebase-server';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import type { RedirectRule } from './redirect-matcher';

const REDIRECTS_COLLECTION = 'redirects';

/**
 * Get all redirects from Firestore
 */
export async function getRedirectsFromFirestore(): Promise<RedirectRule[]> {
    try {
        const redirectsRef = collection(firestore, REDIRECTS_COLLECTION);
        const q = query(redirectsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as RedirectRule[];
    } catch (error) {
        console.error('Error fetching redirects from Firestore:', error);
        return [];
    }
}

/**
 * Add a new redirect to Firestore
 */
export async function addRedirectToFirestore(redirect: Omit<RedirectRule, 'id' | 'createdAt'>): Promise<string> {
    const redirectsRef = collection(firestore, REDIRECTS_COLLECTION);
    const docRef = await addDoc(redirectsRef, {
        ...redirect,
        createdAt: new Date().toISOString(),
    });
    return docRef.id;
}

/**
 * Delete a redirect from Firestore
 */
export async function deleteRedirectFromFirestore(id: string): Promise<void> {
    const docRef = doc(firestore, REDIRECTS_COLLECTION, id);
    await deleteDoc(docRef);
}
