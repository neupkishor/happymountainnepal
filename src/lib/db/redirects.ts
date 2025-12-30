
'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { Redirect } from '@/lib/types';
import { logError } from './errors';

export async function getRedirects(): Promise<Redirect[]> {
    if (!firestore) return [];
    try {
        const redirectsRef = collection(firestore, 'redirects');
        const q = query(redirectsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? (data.createdAt as any).toDate().toISOString() : new Date().toISOString()
            } as Redirect;
        });
    } catch (error: any) {
        console.error("Error fetching redirects:", error);
        await logError({ message: `Failed to fetch redirects: ${error.message}`, stack: error.stack, pathname: '/manage/redirects' });
        throw new Error("Could not fetch redirects from the database.");
    }
}

export async function addRedirect(data: Omit<Redirect, 'id' | 'createdAt'>): Promise<string> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = await addDoc(collection(firestore, 'redirects'), {
            ...data,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error: any) {
        console.error("Error adding redirect: ", error);
        await logError({ message: `Failed to add redirect: ${error.message}`, stack: error.stack, pathname: '/manage/redirects', context: { data } });
        throw new Error("Could not add redirect.");
    }
}

export async function deleteRedirect(id: string): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    try {
        await deleteDoc(doc(firestore, 'redirects', id));
    } catch (error: any) {
        console.error("Error deleting redirect: ", error);
        await logError({ message: `Failed to delete redirect ${id}: ${error.message}`, stack: error.stack, pathname: `/manage/redirects`, context: { redirectId: id } });
        throw new Error("Could not delete redirect.");
    }
}
