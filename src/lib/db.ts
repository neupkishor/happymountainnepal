
'use server';

import type { CustomizeTripInput } from "@/ai/flows/customize-trip-flow";
import { firestore } from './firebase'; // Your initialized Firebase app
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp, doc, setDoc, where, getDoc } from 'firebase/firestore';
import type { Account, Activity } from './types';

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
    if (!firestore) {
        console.error("Firestore is not initialized.");
        throw new Error("Database not available.");
    }
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
    if (!firestore) {
        console.error("Firestore is not initialized.");
        return [];
    }
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

/**
 * Creates a new account document in Firestore if it doesn't already exist.
 * @param accountId The unique ID for the account.
 * @param ipAddress The user's IP address.
 */
export async function createAccountIfNotExists(accountId: string, ipAddress: string): Promise<void> {
    if (!firestore) {
        console.error("Firestore is not initialized. Cannot create account.");
        return;
    }
  try {
    const accountRef = doc(firestore, 'accounts', accountId);
    const docSnap = await getDoc(accountRef);

    if (!docSnap.exists()) {
      await setDoc(accountRef, {
        id: accountId,
        ipAddress: ipAddress,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error creating account:', error);
    // We don't rethrow here to avoid breaking the user's session for a tracking failure
  }
}

/**
 * Logs a user activity to the 'activity' collection in Firestore.
 * @param activity The activity data to log.
 */
export async function logActivity(activity: Omit<Activity, 'id' | 'activityTime'>): Promise<void> {
    if (!firestore) {
        console.error("Firestore is not initialized. Cannot log activity.");
        return;
    }
  try {
    await addDoc(collection(firestore, 'activity'), {
      ...activity,
      activityTime: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Fetches all accounts from the 'accounts' collection in Firestore.
 * @returns A promise that resolves to an array of Account objects.
 */
export async function getAccounts(): Promise<Account[]> {
    if (!firestore) {
        console.error("Firestore is not initialized.");
        return [];
    }
    try {
        const accountsRef = collection(firestore, 'accounts');
        const q = query(accountsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ipAddress: data.ipAddress,
                createdAt: data.createdAt,
            } as Account;
        });
    } catch (error) {
        console.error("Error fetching accounts: ", error);
        throw new Error("Could not fetch accounts from the database.");
    }
}

/**
 * Fetches activities for a specific account ID.
 * @param accountId The ID of the account to fetch activities for.
 * @returns A promise that resolves to an array of Activity objects.
 */
export async function getActivitiesByAccountId(accountId: string): Promise<Activity[]> {
    if (!firestore) {
        console.error("Firestore is not initialized.");
        return [];
    }
    try {
        const activityRef = collection(firestore, 'activity');
        const q = query(activityRef, where('accountId', '==', accountId), orderBy('activityTime', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                accountId: data.accountId,
                activityName: data.activityName,
                activityInfo: data.activityInfo,
                fromIp: data.fromIp,
                fromLocation: data.fromLocation,
                activityTime: data.activityTime,
            } as Activity;
        });
    } catch (error) {
        console.error(`Error fetching activities for account ${accountId}: `, error);
        throw new Error("Could not fetch activities from the database.");
    }
}
