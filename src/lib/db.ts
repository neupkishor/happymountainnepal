
'use client';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp, doc, setDoc, where, getDoc, collectionGroup, limit, updateDoc, deleteDoc } from 'firebase/firestore';
import { firebaseConfig } from "@/firebase/config";
import type { CustomizeTripInput } from "@/ai/flows/customize-trip-flow";
import type { Account, Activity, Tour, BlogPost, TeamMember, Destination, Partner, Review, SiteError, MediaUpload } from './types';
import { notFound } from "next/navigation";
import { slugify } from "./utils";
import { firestore } from './firebase-server';


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


export async function createTour(): Promise<string | null> {
    if (!firestore) {
        console.error("Firestore is not initialized.");
        return null;
    }
    try {
        const newTourData = {
            name: 'New Untitled Package',
            slug: `new-untitled-package-${Date.now()}`,
            description: '',
            region: '',
            type: 'Trek',
            difficulty: 'Moderate',
            duration: 0,
            price: 0,
            mainImage: 'https://picsum.photos/seed/placeholder/1200/800',
            images: [],
            itinerary: [],
            inclusions: [],
            exclusions: [],
            departureDates: [],
            mapImage: 'https://picsum.photos/seed/map-placeholder/800/600',
            reviews: [],
        };
        const docRef = await addDoc(collection(firestore, 'tours'), newTourData);
        return docRef.id;
    } catch (error) {
        console.error("Error creating new tour: ", error);
        return null;
    }
}

export async function updateTour(id: string, data: Partial<Omit<Tour, 'id' | 'slug'>>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'tours', id);
        
        let finalData: Partial<Omit<Tour, 'id'>> = {...data};

        // If name is being updated, regenerate slug
        if (data.name) {
            finalData.slug = slugify(data.name);
        }

        await updateDoc(docRef, finalData);
    } catch (error) {
        console.error("Error updating tour: ", error);
        throw new Error("Could not update tour.");
    }
}

export async function deleteTour(id: string) {
    if (!firestore) throw new Error("Database not available.");
    try {
        await deleteDoc(doc(firestore, 'tours', id));
    } catch (error) {
        console.error("Error deleting tour: ", error);
        throw new Error("Could not delete tour.");
    }
}


export async function createBlogPost(): Promise<string | null> {
    if (!firestore) return null;
    try {
        const newPost = {
            title: 'New Untitled Post',
            slug: `new-untitled-post-${Date.now()}`,
            content: '<p>Start writing your amazing blog post here...</p>',
            excerpt: '',
            author: 'Admin',
            date: serverTimestamp(),
            image: 'https://picsum.photos/seed/blog-placeholder/800/500',
            status: 'draft',
            metaInformation: '',
        };
        const docRef = await addDoc(collection(firestore, 'blogPosts'), newPost);
        return docRef.id;
    } catch (e) {
        console.error("Error creating blog post", e);
        return null;
    }
}

export async function updateBlogPost(id: string, data: Partial<Omit<BlogPost, 'id' | 'slug'>>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'blogPosts', id);
        let finalData: Partial<Omit<BlogPost, 'id'>> = {...data};

        if(data.title) {
            finalData.slug = slugify(data.title);
        }
        
        await updateDoc(docRef, finalData);
    } catch (e) {
        console.error("Error updating blog post", e);
        throw new Error("Could not update blog post.");
    }
}

export async function deleteBlogPost(id: string) {
    if (!firestore) throw new Error("Database not available.");
    try {
        await deleteDoc(doc(firestore, 'blogPosts', id));
    } catch (e) {
        console.error("Error deleting blog post", e);
        throw new Error("Could not delete blog post.");
    }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
    return getDocById<BlogPost>('blogPosts', id);
}

export async function addTeamMember(data: Omit<TeamMember, 'id' | 'slug'>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const slug = slugify(data.name);
        const newMember = { ...data, slug };
        await addDoc(collection(firestore, 'teamMembers'), newMember);
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
    } catch (error) {
        console.error("Error updating team member: ", error);
        throw new Error("Could not update team member.");
    }
}

export async function deleteTeamMember(id: string) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'teamMembers', id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting team member: ", error);
        throw new Error("Could not delete team member.");
    }
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
    return getDocById<TeamMember>('teamMembers', id);
}

export async function addPartner(data: Omit<Partner, 'id'>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        await addDoc(collection(firestore, 'partners'), data);
    } catch (error) {
        console.error("Error adding partner: ", error);
        throw new Error("Could not add partner.");
    }
}

export async function updatePartner(id: string, data: Omit<Partner, 'id'>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'partners', id);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error("Error updating partner: ", error);
        throw new Error("Could not update partner.");
    }
}

export async function deletePartner(id: string) {
    if (!firestore) throw new Error("Database not available.");
    try {
        await deleteDoc(doc(firestore, 'partners', id));
    } catch (error) {
        console.error("Error deleting partner: ", error);
        throw new Error("Could not delete partner.");
    }
}

export async function getPartnerById(id: string): Promise<Partner | null> {
    return getDocById<Partner>('partners', id);
}

// Error Logging
export async function logError(errorData: Omit<SiteError, 'id' | 'createdAt'>): Promise<void> {
    if (!firestore) {
        console.error("Firestore is not initialized. Cannot log error.");
        return;
    }
    try {
        await addDoc(collection(firestore, 'errors'), {
            ...errorData,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to log error to Firestore:', error);
    }
}

export async function getErrors(): Promise<SiteError[]> {
    if (!firestore) return [];
    try {
        const errorsRef = collection(firestore, 'errors');
        const q = query(errorsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SiteError));
    } catch (error) {
        console.error("Error fetching errors:", error);
        throw new Error("Could not fetch errors from the database.");
    }
}

export async function getErrorById(id: string): Promise<SiteError | null> {
    return getDocById<SiteError>('errors', id);
}


// Media Upload Logging
export async function logMediaUpload(data: Omit<MediaUpload, 'id' | 'uploadedAt'>): Promise<void> {
  if (!firestore) {
    console.error("Firestore is not initialized. Cannot log media upload.");
    return;
  }
  try {
    await addDoc(collection(firestore, 'media'), {
      ...data,
      uploadedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log media upload to Firestore:', error);
    // Don't throw, as the primary goal (upload) was successful.
  }
}
