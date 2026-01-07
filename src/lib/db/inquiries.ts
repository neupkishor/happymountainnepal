
'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { CustomizeTripInput } from "@/ai/flows/customize-trip-flow";
import { logError } from './errors';

// This is a union type to represent both kinds of inquiries
export type Inquiry = {
    id: string;
    createdAt: Timestamp | string; // Allow string for serialized version
    type: 'customization' | 'contact' | 'booking';
    page?: string;
    temporary_id?: string;
    // Optional fields depending on type
    conversation?: CustomizeTripInput;
    data?: any; // Generic data field for contact and booking
};


export async function saveInquiry(inquiryData: Omit<Inquiry, 'id' | 'createdAt'>): Promise<string> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = await addDoc(collection(firestore, 'inquiries'), {
            ...inquiryData,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error: any) {
        console.error("[DB saveInquiry] Error saving inquiry: ", error);
        await logError({ 
            message: `Failed to save inquiry of type ${inquiryData.type}: ${error.message}`, 
            stack: error.stack, 
            pathname: inquiryData.page, 
            context: { inquiryData } 
        });
        throw new Error("Could not save inquiry to the database.");
    }
}


export async function getInquiries(): Promise<Inquiry[]> {
    if (!firestore) return [];
    try {
        const inquiriesRef = collection(firestore, 'inquiries');
        const q = query(inquiriesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Serialize Timestamp to string before sending to client
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            } as Inquiry;
        });
    } catch (error: any) {
        console.error("Error fetching inquiries: ", error);
        await logError({ message: `Failed to fetch inquiries: ${error.message}`, stack: error.stack, pathname: '/manage/inquiries' });
        throw new Error("Could not fetch inquiries from the database.");
    }
}
