'use server';

import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { GearItem } from '@/lib/types';

/**
 * Fetches all global gears from the 'gears' collection.
 */
export async function getGears(): Promise<GearItem[]> {
    if (!firestore) return [];
    try {
        const q = query(collection(firestore, 'gears'), orderBy('name'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GearItem));
    } catch (error) {
        console.error("Error fetching gears:", error);
        return [];
    }
}

/**
 * Creates a new global gear item.
 */
export async function createGear(data: Omit<GearItem, 'id'>): Promise<string | null> {
    if (!firestore) return null;
    try {
        const docRef = await addDoc(collection(firestore, 'gears'), data);
        return docRef.id;
    } catch (error) {
        console.error("Error creating gear:", error);
        return null;
    }
}

/**
 * Updates an existing global gear item.
 */
export async function updateGear(id: string, data: Partial<Omit<GearItem, 'id'>>) {
    if (!firestore) throw new Error("Database not available.");
    const docRef = doc(firestore, 'gears', id);
    await updateDoc(docRef, data);
}

/**
 * Deletes a global gear item.
 */
export async function deleteGear(id: string) {
    if (!firestore) throw new Error("Database not available.");
    await deleteDoc(doc(firestore, 'gears', id));
}
