
'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { CustomizeTripInput } from "@/ai/flows/customize-trip-flow";
import { logError } from './errors';

export interface Inquiry {
    id: string;
    conversation: CustomizeTripInput;
    createdAt: Timestamp;
}

export interface ContactInquiry {
    page: string;
    temporary_id: string;
    data: { name: string; email: string; subject: string; message: string; };
}

export async function saveInquiry(conversation: CustomizeTripInput): Promise<string> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = await addDoc(collection(firestore, 'inquiries'), {
            conversation,
            type: 'customization',
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error: any) {
        console.error("Error adding document: ", error);
        await logError({ message: `Failed to save inquiry: ${error.message}`, stack: error.stack, pathname: '/customize', context: { conversation } });
        throw new Error("Could not save inquiry to the database.");
    }
}

export async function saveContactInquiry(inquiryData: ContactInquiry): Promise<string> {
    if (!firestore) {
        throw new Error("Database not available.");
    }
    try {
        const docRef = await addDoc(collection(firestore, 'inquiries'), {
            ...inquiryData,
            type: 'contact',
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error: any) {
        console.error("[DB saveContactInquiry] Error saving contact inquiry: ", error);
        await logError({ message: `Failed to save contact inquiry: ${error.message}`, stack: error.stack, pathname: inquiryData.page, context: { inquiryData } });
        throw new Error("Could not save contact inquiry to the database.");
    }
}

export async function getInquiries(): Promise<Inquiry[]> {
    if (!firestore) return [];
    try {
        const inquiriesRef = collection(firestore, 'inquiries');
        const q = query(inquiriesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Inquiry));
    } catch (error: any) {
        console.error("Error fetching inquiries: ", error);
        await logError({ message: `Failed to fetch inquiries: ${error.message}`, stack: error.stack, pathname: '/manage/inquiries' });
        throw new Error("Could not fetch inquiries from the database.");
    }
}
