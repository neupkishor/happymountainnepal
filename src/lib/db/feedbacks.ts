'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import { logError } from './errors';

export type FeedbackEntry = {
    id: string;
    type: 'task' | 'discussion';
    title?: string;
    description: string;
    status?: 'open' | 'in-progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    deadline?: string; // ISO string 
    createdAt: string; // ISO string
    createdBy?: string;
    parentId?: string | null; // For threading
    mentions?: string[]; // Array of user IDs or names mentioned
};

export type Feedback = {
    id: string;
    createdAt: Timestamp | string;
    title: string;
    description?: string;
    deadline?: Timestamp | string;
    status?: 'open' | 'in-progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    issuedTo?: string[]; // Array of team member IDs
    entries: FeedbackEntry[]; // Unified list of subtasks and discussions
};

export async function saveFeedback(feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'entries'>): Promise<string> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = await addDoc(collection(firestore, 'feedbacks'), {
            ...feedbackData,
            createdAt: serverTimestamp(),
            entries: [],
            status: feedbackData.status || 'open',
            priority: feedbackData.priority || 'medium',
            issuedTo: feedbackData.issuedTo || [],
        });
        return docRef.id;
    } catch (error: any) {
        console.error("[DB saveFeedback] Error saving feedback: ", error);
        await logError({
            message: `Failed to save feedback: ${error.message}`,
            stack: error.stack,
            pathname: 'manage/feedbacks',
            context: { feedbackData }
        });
        throw new Error("Could not save feedback to the database.");
    }
}

export async function getFeedbacks(limitCount: number = 10): Promise<Feedback[]> {
    if (!firestore) return [];
    try {
        const feedbacksRef = collection(firestore, 'feedbacks');
        const q = query(feedbacksRef, orderBy('createdAt', 'desc'), limit(limitCount));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
                deadline: data.deadline ? (data.deadline as Timestamp)?.toDate().toISOString() : undefined,
                entries: data.entries || [],
                issuedTo: data.issuedTo || [],
            } as Feedback;
        });
    } catch (error: any) {
        console.error("Error fetching feedbacks: ", error);
        await logError({ message: `Failed to fetch feedbacks: ${error.message}`, stack: error.stack, pathname: '/manage/feedbacks' });
        throw new Error("Could not fetch feedbacks from the database.");
    }
}

export async function getFeedback(id: string): Promise<Feedback | null> {
    if (!firestore) return null;
    try {
        const docRef = doc(firestore, 'feedbacks', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
                deadline: data.deadline ? (data.deadline as Timestamp)?.toDate().toISOString() : undefined,
                entries: data.entries || [],
                issuedTo: data.issuedTo || [],
            } as Feedback;
        } else {
            return null;
        }
    } catch (error: any) {
        console.error(`Error fetching feedback ${id}: `, error);
        await logError({ message: `Failed to fetch feedback ${id}: ${error.message}`, stack: error.stack, pathname: `/manage/feedbacks/${id}` });
        throw new Error("Could not fetch feedback details.");
    }
}

export async function updateFeedback(id: string, updateData: Partial<Feedback>): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'feedbacks', id);

        if (updateData.deadline && typeof updateData.deadline === 'string') {
            updateData.deadline = Timestamp.fromDate(new Date(updateData.deadline));
        }

        delete (updateData as any).createdAt;
        delete (updateData as any).id;

        await updateDoc(docRef, updateData);
    } catch (error: any) {
        console.error(`Error updating feedback ${id}: `, error);
        await logError({
            message: `Failed to update feedback ${id}: ${error.message}`,
            stack: error.stack,
            pathname: `/manage/feedbacks/${id}`,
            context: { updateData }
        });
        throw new Error("Could not update feedback.");
    }
}

export async function addFeedbackEntry(id: string, entry: FeedbackEntry): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'feedbacks', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) throw new Error("Feedback not found");

        const currentEntries = docSnap.data().entries || [];
        const newEntries = [...currentEntries, entry];

        await updateDoc(docRef, { entries: newEntries });
    } catch (error: any) {
        console.error(`Error adding entry to feedback ${id}: `, error);
        throw error;
    }
}

export async function updateFeedbackEntry(feedbackId: string, entryId: string, updates: Partial<FeedbackEntry>): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'feedbacks', feedbackId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) throw new Error("Feedback not found");

        const currentEntries = docSnap.data().entries || [];
        const newEntries = currentEntries.map((e: FeedbackEntry) =>
            e.id === entryId ? { ...e, ...updates } : e
        );

        await updateDoc(docRef, { entries: newEntries });
    } catch (error: any) {
        console.error(`Error updating entry in feedback ${feedbackId}: `, error);
        throw error;
    }
}
