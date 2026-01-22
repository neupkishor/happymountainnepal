
'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp, doc, setDoc, deleteDoc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { LegalContent, LegalDocument } from '@/lib/types';
import { logError } from './errors';

async function getDocById<T>(collectionName: string, id: string): Promise<T | null> {
    if (!firestore) return null;
    const docRef = doc(firestore, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
}

export async function getLegalContent(id: 'privacy-policy' | 'terms-of-service'): Promise<LegalContent | null> {
    return getDocById<LegalContent>('legal', id);
}

export async function updateLegalContent(id: 'privacy-policy' | 'terms-of-service', content: string): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    const docRef = doc(firestore, 'legal', id);
    await setDoc(docRef, {
        content: content,
        lastUpdated: serverTimestamp()
    }, { merge: true });
}

export async function getLegalDocuments(): Promise<LegalDocument[]> {
    if (!firestore) return [];
    const docsRef = collection(firestore, 'legalDocuments');
    const q = query(docsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString()
        } as LegalDocument;
    });

    // Sort by orderIndex ascending, then by createdAt descending
    return docs.sort((a, b) => {
        const orderA = a.orderIndex ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.orderIndex ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function getLegalDocumentById(id: string): Promise<LegalDocument | null> {
    if (!firestore) return null;
    const docRef = doc(firestore, 'legalDocuments', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString()
    } as LegalDocument;
}

export async function addLegalDocument(data: Omit<LegalDocument, 'id' | 'createdAt'>): Promise<string> {
    if (!firestore) throw new Error("Database not available.");
    const docRef = await addDoc(collection(firestore, 'legalDocuments'), {
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function deleteLegalDocument(id: string): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    await deleteDoc(doc(firestore, 'legalDocuments', id));
}

export async function updateLegalDocument(id: string, data: Partial<Omit<LegalDocument, 'id' | 'createdAt'>>): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    const docRef = doc(firestore, 'legalDocuments', id);
    await updateDoc(docRef, { ...data });
}

export async function getLegalSettings(): Promise<{ requireEmailProtection: boolean }> {
    if (!firestore) return { requireEmailProtection: true };
    const docRef = doc(firestore, 'settings', 'legal');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as { requireEmailProtection: boolean };
    }
    return { requireEmailProtection: true };
}

export async function updateLegalSettings(settings: { requireEmailProtection: boolean }): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    const docRef = doc(firestore, 'settings', 'legal');
    await setDoc(docRef, settings, { merge: true });
}
export async function updateLegalDocumentsOrder(updates: { id: string, orderIndex: number }[]): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    const batch = writeBatch(firestore);

    updates.forEach(({ id, orderIndex }) => {
        const docRef = doc(firestore, 'legalDocuments', id);
        batch.update(docRef, { orderIndex });
    });

    await batch.commit();
}
