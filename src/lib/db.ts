

'use server';

import type { CustomizeTripInput } from "@/ai/flows/customize-trip-flow";
import { firestore } from './firebase'; // Your initialized Firebase app
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp, doc, setDoc, where, getDoc, collectionGroup, limit, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Account, Activity, Tour, BlogPost, TeamMember, Destination, Partner, Review, SiteError, MediaUpload } from './types';
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


async function getCollectionData<T>(name: string, filters: { key: string, op: '==' | '!=' | '<' | '<=' | '>' | '>=', value: any }[] = []): Promise<T[]> {
  if (!firestore) {
    console.error("Firestore is not initialized.");
    return [];
  }
  try {
    let q = query(collection(firestore, name));
    if (filters.length > 0) {
        filters.forEach(f => {
            q = query(q, where(f.key, f.op, f.value));
        })
    }
    
    const snapshot = await getDocs(q);
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
    return getCollectionData<Tour>('tours');
}
export async function getTourBySlug(slug: string) {
    const tour = await getDocBySlug<Tour>('tours', slug);
    if (!tour) notFound();
    return tour;
}
export async function getTourById(id: string): Promise<Tour | null> {
    return getDocById<Tour>('tours', id);
}

export async function getFeaturedTours(): Promise<Tour[]> {
    return getCollectionData<Tour>('tours'); // In a real app, this would be a query for featured tours.
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
        revalidatePath('/manage/packages');
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
        revalidatePath('/manage/packages');
        revalidatePath(`/manage/packages/${id}/edit`);
        revalidatePath(`/tours/${finalData.slug || ''}`);
        revalidatePath('/tours');

    } catch (error) {
        console.error("Error updating tour: ", error);
        throw new Error("Could not update tour.");
    }
}

export async function deleteTour(id: string) {
    if (!firestore) throw new Error("Database not available.");
    try {
        await deleteDoc(doc(firestore, 'tours', id));
        revalidatePath('/manage/packages');
        revalidatePath('/tours');
    } catch (error) {
        console.error("Error deleting tour: ", error);
        throw new Error("Could not delete tour.");
    }
}

// Blog Post Functions
export async function getBlogPosts(): Promise<BlogPost[]> {
    return getCollectionData<BlogPost>('blogPosts', [{ key: 'status', op: '==', value: 'published'}]);
}
export async function getAllBlogPosts(): Promise<BlogPost[]> {
    return getCollectionData<BlogPost>('blogPosts');
}
export async function getBlogPostBySlug(slug: string) {
    const post = await getDocBySlug<BlogPost>('blogPosts', slug);
    if (!post || post.status !== 'published') notFound();
    return post;
};
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
    return getDocById<BlogPost>('blogPosts', id);
}

export async function getRecentBlogPosts(): Promise<BlogPost[]> {
    return getCollectionData<BlogPost>('blogPosts', [{ key: 'status', op: '==', value: 'published'}]);
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
        revalidatePath('/manage/blogs');
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
        revalidatePath('/manage/blogs');
        revalidatePath(`/manage/blogs/${id}/edit`);
        revalidatePath(`/blogs/${finalData.slug || ''}`);
        revalidatePath('/blogs');

    } catch (e) {
        console.error("Error updating blog post", e);
        throw new Error("Could not update blog post.");
    }
}

export async function deleteBlogPost(id: string) {
    if (!firestore) throw new Error("Database not available.");
    try {
        await deleteDoc(doc(firestore, 'blogPosts', id));
        revalidatePath('/manage/blogs');
        revalidatePath('/blogs');
    } catch (e) {
        console.error("Error deleting blog post", e);
        throw new Error("Could not delete blog post.");
    }
}


// Team Member Functions
export async function getTeamMembers(): Promise<TeamMember[]> {
    return getCollectionData<TeamMember>('teamMembers');
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
        await addDoc(collection(firestore, 'teamMembers'), newMember);
        revalidatePath('/manage/team');
        revalidatePath('/about/teams');
    } catch (error) {
        console.error("Error adding team member: ", error);
        throw new Error("Could not add team member.");
    }
    redirect(`/manage/team`);
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
    } catch (error) {
        console.error("Error updating team member: ", error);
        throw new Error("Could not update team member.");
    }
    redirect(`/manage/team`);
}

export async function deleteTeamMember(id: string) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'teamMembers', id);
        await deleteDoc(docRef);
        revalidatePath('/manage/team');
        revalidatePath('/about/teams');
    } catch (error) {
        console.error("Error deleting team member: ", error);
        throw new Error("Could not delete team member.");
    }
}

// Destination Functions
export async function getDestinations(): Promise<Destination[]> {
    const tours = await getTours();
    if (!tours.length) {
        return [
            { name: 'Everest', image: 'https://picsum.photos/seed/dest-everest/600/600', tourCount: 0},
            { name: 'Annapurna', image: 'https://picsum.photos/seed/dest-annapurna/600/300', tourCount: 0},
            { name: 'Langtang', image: 'https://picsum.photos/seed/dest-langtang/600/300', tourCount: 0},
        ];
    }
    const regionCounts = tours.reduce((acc, tour) => {
        if(tour.region) {
            acc[tour.region] = (acc[tour.region] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const sortedRegions = Object.entries(regionCounts)
        .sort(([,a],[,b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => ({
            name,
            tourCount: count,
            image: `https://picsum.photos/seed/dest-${slugify(name)}/${name === 'Everest' ? '600/600' : '600/300'}`
        }));
    
    // Ensure we always have at least a few default destinations if there aren't enough tours.
    const defaultDests = ['Everest', 'Annapurna', 'Langtang'];
    for(const destName of defaultDests) {
        if(!sortedRegions.some(r => r.name === destName) && sortedRegions.length < 3) {
            sortedRegions.push({
                 name: destName,
                 tourCount: 0,
                 image: `https://picsum.photos/seed/dest-${slugify(destName)}/600/300`
            })
        }
    }

    return sortedRegions;
}


// Partner Functions
export async function getPartners(): Promise<Partner[]> {
    return getCollectionData<Partner>('partners');
}

export async function getPartnerById(id: string): Promise<Partner | null> {
    return getDocById<Partner>('partners', id);
}

export async function addPartner(data: Omit<Partner, 'id'>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        await addDoc(collection(firestore, 'partners'), data);
        revalidatePath('/manage/partners');
        revalidatePath('/#partners');
    } catch (error) {
        console.error("Error adding partner: ", error);
        throw new Error("Could not add partner.");
    }
    redirect(`/manage/partners`);
}

export async function updatePartner(id: string, data: Omit<Partner, 'id'>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'partners', id);
        await updateDoc(docRef, data);
        revalidatePath('/manage/partners');
        revalidatePath(`/manage/partners/${id}/edit`);
        revalidatePath('/#partners');
    } catch (error) {
        console.error("Error updating partner: ", error);
        throw new Error("Could not update partner.");
    }
    redirect(`/manage/partners`);
}

export async function deletePartner(id: string) {
    if (!firestore) throw new Error("Database not available.");
    try {
        await deleteDoc(doc(firestore, 'partners', id));
        revalidatePath('/manage/partners');
        revalidatePath('/#partners');
    } catch (error) {
        console.error("Error deleting partner: ", error);
        throw new Error("Could not delete partner.");
    }
}


// Review Functions
export async function getAllReviews(): Promise<(Review & { tourName: string })[]> {
  if (!firestore) return [];
  const q = query(collectionGroup(firestore, 'reviews'));
  const snapshot = await getDocs(q);
  const reviews = [];
  for (const doc of snapshot.docs) {
    const reviewData = doc.data() as Review;
    const tourRef = doc.ref.parent.parent;
    if (tourRef) {
      const tourSnap = await getDoc(tourRef);
      if (tourSnap.exists()) {
        reviews.push({ ...reviewData, id: doc.id, tourName: tourSnap.data().name });
      }
    }
  }
  
  // Sort in application code
  return reviews.sort((a, b) => {
    const dateA = a.date instanceof Timestamp ? a.date.toMillis() : new Date(a.date).getTime();
    const dateB = b.date instanceof Timestamp ? b.date.toMillis() : new Date(b.date).getTime();
    return dateB - dateA;
  });
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

export async function getMediaUploads(): Promise<MediaUpload[]> {
  if (!firestore) return [];
  try {
    const mediaRef = collection(firestore, 'media');
    const q = query(mediaRef, orderBy('uploadedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaUpload));
  } catch (error) {
    console.error("Error fetching media uploads:", error);
    throw new Error("Could not fetch media uploads from the database.");
  }
}
