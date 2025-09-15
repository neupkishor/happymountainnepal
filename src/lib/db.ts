
'use server';

import type { CustomizeTripInput } from "@/ai/flows/customize-trip-flow";
import { firestore } from './firebase'; // Your initialized Firebase app
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

export interface Inquiry {
  id: string;
  conversation: CustomizeTripInput;
  createdAt: Timestamp;
}

/**
 * Saves a new trip inquiry conversation to the 'inquiries' collection in Firestore.
 * 
 * @param conversation The conversation object from the trip customization flow.
 * @returns The ID of the newly created document in Firestore.
 */
export async function saveInquiry(conversation: CustomizeTripInput): Promise<string> {
  try {
    const docRef = await addDoc(collection(firestore, 'inquiries'), {
      conversation,
      createdAt: serverTimestamp(),
    });
    console.log("Inquiry saved with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("Could not save inquiry to the database.");
  }
}


/**
 * Fetches all trip inquiries from the 'inquiries' collection in Firestore, ordered by creation date.
 * 
 * @returns A promise that resolves to an array of inquiry objects.
 */
export async function getInquiries(): Promise<Inquiry[]> {
  try {
    const inquiriesRef = collection(firestore, 'inquiries');
    const q = query(inquiriesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Inquiry));

  } catch (error) {
    console.error("Error fetching inquiries: ", error);
    throw new Error("Could not fetch inquiries from the database.");
  }
}
