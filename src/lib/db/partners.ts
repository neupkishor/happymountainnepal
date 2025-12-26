
'use server';

import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { Partner } from '@/lib/types';
import { logError } from './errors';

async function getDocById<T>(collectionName: string, id: string): Promise<T | null> {
    if (!firestore) return null;
    const docRef = doc(firestore, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
}

export async function addPartner(data: Omit<Partner, 'id'>) {
    if (!firestore) throw new Error("Database not available.");
    await addDoc(collection(firestore, 'partners'), data);
}

export async function updatePartner(id: string, data: Omit<Partner, 'id'>) {
    if (!firestore) throw new Error("Database not available.");
    const docRef = doc(firestore, 'partners', id);
    await updateDoc(docRef, data);
}

export async function deletePartner(id: string) {
    if (!firestore) throw new Error("Database not available.");
    await deleteDoc(doc(firestore, 'partners', id));
}

export async function getPartnerById(id: string): Promise<Partner | null> {
    return getDocById<Partner>('partners', id);
}
