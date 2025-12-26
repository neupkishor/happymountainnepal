
'use server';

import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { SiteProfile } from '@/lib/types';
import { logError } from './errors';

async function getDocById<T>(collectionName: string, id: string): Promise<T | null> {
    if (!firestore) return null;
    const docRef = doc(firestore, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
}

const SITE_PROFILE_ID = "happymountainnepal";

export async function getSiteProfile(): Promise<SiteProfile | null> {
    return getDocById<SiteProfile>('profile', SITE_PROFILE_ID);
}

export async function updateSiteProfile(data: Partial<Omit<SiteProfile, 'id'>>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'profile', SITE_PROFILE_ID);
        await setDoc(docRef, data, { merge: true });
    } catch (error: any) {
        console.error("Error updating site profile: ", error);
        await logError({ message: `Failed to update site profile: ${error.message}`, stack: error.stack, pathname: `/manage/profile`, context: { data } });
        throw new Error("Could not update site profile.");
    }
}
