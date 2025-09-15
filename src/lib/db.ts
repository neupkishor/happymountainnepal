
'use server';

import type { CustomizeTripInput } from "@/ai/flows/customize-trip-flow";
import { firestore } from './firebase'; // Your initialized Firebase app
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp, doc, setDoc, where, getDoc, collectionGroup, limit, updateDoc } from 'firebase/firestore';
import type { Account, Activity, Tour, BlogPost, TeamMember, Destination, Partner, Review } from './types';
import { notFound, redirect } from "next/navigation";
import { slugify } from "./utils";
import { revalidatePath } from "next/cache";


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


async function getCollection<T>(name: string): Promise<T[]> {
  if (!firestore) {
    console.error("Firestore is not initialized.");
    return [];
  }
  try {
    const col = collection(firestore, name);
    const snapshot = await getDocs(col);
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error fetching ${name}:`, error);
    throw new Error(`Could not fetch ${name} from the database.`);
  }
}

async function getDocBySlug<T>(collectionName: string, slug: string): Promise<T | null> {
  if (!firestore) {
    console.error("Firestore is not initialized.");
    return null;
  }
  try {
    const q = query(collection(firestore, collectionName), where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as T;
  } catch (error) {
    console.error(`Error fetching doc from ${collectionName} with slug ${slug}:`, error);
    throw new Error(`Could not fetch from ${collectionName}.`);
  }
}

async function getDocById<T>(collectionName: string, id: string): Promise<T | null> {
  if (!firestore) {
    console.error("Firestore is not initialized.");
    return null;
  }
  try {
    const docRef = doc(firestore, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return { id: docSnap.id, ...docSnap.data() } as T;
  } catch (error) {
    console.error(`Error fetching doc from ${collectionName} with id ${id}:`, error);
    throw new Error(`Could not fetch from ${collectionName}.`);
  }
}

// Tour Functions
export async function getTours(): Promise<Tour[]> {
    return getCollection<Tour>('tours');
}
export async function getTourBySlug(slug: string) {
    const tour = await getDocBySlug<Tour>('tours', slug);
    if (!tour) notFound();
    return tour;
}
export async function getFeaturedTours(): Promise<Tour[]> {
    return getCollection<Tour>('tours'); // In a real app, this would be a query for featured tours.
}

// Blog Post Functions
export async function getBlogPosts(): Promise<BlogPost[]> {
    return getCollection<BlogPost>('blogPosts');
}
export async function getBlogPostBySlug(slug: string) {
    const post = await getDocBySlug<BlogPost>('blogPosts', slug);
    if (!post) notFound();
    return post;
};
export async function getRecentBlogPosts(): Promise<BlogPost[]> {
    return getCollection<BlogPost>('blogPosts');
}

// Team Member Functions
export async function getTeamMembers(): Promise<TeamMember[]> {
    return getCollection<TeamMember>('teamMembers');
}
export async function getTeamMemberBySlug(slug: string) {
    const member = await getDocBySlug<TeamMember>('teamMembers', slug);
if (!member) notFound();
    return member;
}
export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
    return getDocById<TeamMember>('teamMembers', id);
}

export async function addTeamMember(data: Omit<TeamMember, 'id' | 'slug'>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const slug = slugify(data.name);
        const newMember = { ...data, slug };
        const docRef = await addDoc(collection(firestore, 'teamMembers'), newMember);
        revalidatePath('/manage/team');
        revalidatePath('/about/teams');
        redirect(`/manage/team`);
    } catch (error) {
        console.error("Error adding team member: ", error);
        throw new Error("Could not add team member.");
    }
}

export async function updateTeamMember(id: string, data: Omit<TeamMember, 'id'| 'slug'>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const slug = slugify(data.name);
        const updatedMember = { ...data, slug };
        const docRef = doc(firestore, 'teamMembers', id);
        await updateDoc(docRef, updatedMember);
        revalidatePath('/manage/team');
        revalidatePath(`/manage/team/${id}/edit`);
        revalidatePath('/about/teams');
        redirect(`/manage/team`);
    } catch (error) {
        console.error("Error updating team member: ", error);
        throw new Error("Could not update team member.");
    }
}

// Destination Functions
export async function getDestinations(): Promise<Destination[]> {
    return getCollection<Destination>('destinations');
}

// Partner Functions
export async function getPartners(): Promise<Partner[]> {
    return getCollection<Partner>('partners');
}

// Review Functions
export async function getAllReviews(): Promise<(Review & { tourName: string })[]> {
  if (!firestore) return [];
  const reviewsGroup = collectionGroup(firestore, 'reviews');
  const snapshot = await getDocs(reviewsGroup);
  const reviews = [];
  for (const doc of snapshot.docs) {
    const reviewData = doc.data() as Review;
    const tourRef = doc.ref.parent.parent;
    if (tourRef) {
      const tourSnap = await getDoc(tourRef);
      if (tourSnap.exists()) {
        reviews.push({ ...reviewData, tourName: tourSnap.data().name });
      }
    }
  }
  return reviews;
}
