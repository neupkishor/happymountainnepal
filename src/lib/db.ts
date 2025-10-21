


'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp, doc, setDoc, where, getDoc, collectionGroup, limit as firestoreLimit, updateDoc, deleteDoc, startAfter } from 'firebase/firestore';
import *as firestoreAggregates from 'firebase/firestore'; // Import all as namespace
const { aggregate, count } = firestoreAggregates; // Destructure aggregate and count from the namespace
import type { CustomizeTripInput } from "@/ai/flows/customize-trip-flow";
import type { Account, Activity, Tour, BlogPost, TeamMember, Destination, Partner, Review, SiteError, FileUpload, ManagedReview, OnSiteReview, OffSiteReview, SiteProfile, LegalContent, LegalDocument } from './types';
import { slugify } from "./utils";
import { firestore } from './firebase-server';
// Removed import { errorEmitter } from '@/firebase/error-emitter';
// Removed import { FirestorePermissionError } from '@/firebase/errors';


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
  } catch (error: any) {
    console.error("Error adding document: ", error);
    // Log the error using the server-side logError function
    await logError({ message: `Failed to save inquiry: ${error.message}`, stack: error.stack, pathname: '/customize', context: { conversation } });
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

  } catch (error: any) {
    console.error("Error fetching inquiries: ", error);
    await logError({ message: `Failed to fetch inquiries: ${error.message}`, stack: error.stack, pathname: '/manage/inquiries' });
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
  } catch (error: any) {
    console.error(`Error fetching doc from ${collectionName} with id ${id}:`, error);
    await logError({ message: `Failed to fetch doc ${id} from ${collectionName}: ${error.message}`, stack: error.stack, pathname: `/${collectionName}/${id}` });
    throw new Error(`Could not fetch from ${collectionName}.`);
  }
}

async function getDocBySlug<T>(collectionName: string, slug: string): Promise<T | null> {
  if (!firestore) {
    console.error("Firestore is not initialized.");
    return null;
  }
  try {
    const q = query(collection(firestore, collectionName), where('slug', '==', slug), firestoreLimit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as T;
  } catch (error: any) {
    console.error(`Error fetching doc from ${collectionName} with slug ${slug}:`, error);
    await logError({ message: `Failed to fetch doc with slug ${slug} from ${collectionName}: ${error.message}`, stack: error.stack, pathname: `/${collectionName}/${slug}` });
    throw new Error(`Could not fetch from ${collectionName}.`);
  }
}


export async function createTour(): Promise<string | null> {
    if (!firestore) {
        console.error("Firestore is not initialized.");
        return null;
    }
    const newTourData = {
        name: 'New Untitled Package',
        slug: slugify('New Untitled Package'),
        description: '',
        region: [], // Changed to empty array
        type: 'Trek',
        difficulty: 'Moderate',
        duration: 0,
        price: 0,
        mainImage: '',
        images: [],
        itinerary: [],
        inclusions: [],
        exclusions: [],
        departureDates: [],
        anyDateAvailable: false,
        map: 'https://www.google.com/maps/d/u/0/viewer?mid=1OXiIBghnVbSBVV-aRCScumjB9yz1woY&femb=1&ll=28.371376049324283%2C83.8769916&z=11',
        reviews: [],
        status: 'draft', // Default status for new tours
        faq: [], // Initialize FAQ as an empty array
        additionalInfoSections: [], // Initialize additionalInfoSections as an empty array
        bookingType: 'internal', // Default booking type
        externalBookingUrl: '', // Default empty external booking URL
    };
    try {
        const docRef = await addDoc(collection(firestore, 'packages'), newTourData);
        return docRef.id;
    } catch (error: any) {
        console.error("Error creating new tour: ", error);
        await logError({ message: `Failed to create new tour: ${error.message}`, stack: error.stack, pathname: '/manage/packages/create', context: { newTourData } });
        return null;
    }
}

export async function updateTour(id: string, data: Partial<Omit<Tour, 'id'>>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'packages', id);
        
        let finalData: Partial<Omit<Tour, 'id'>> = {...data};

        if (finalData.departureDates) {
            finalData.departureDates = finalData.departureDates.map(d => ({
                ...d,
                date: d.date instanceof Date ? Timestamp.fromDate(d.date) : d.date
            }));
        }

        await updateDoc(docRef, finalData);
    } catch (error: any) {
        console.error("Error updating tour: ", error);
        await logError({ message: `Failed to update basic info for tour ${id}`, stack: error.stack, pathname: `/manage/packages/${id}/edit`, context: { tourId: id, data } });
        throw new Error("Could not update tour.");
    }
}

export async function deleteTour(id: string) {
    if (!firestore) throw new Error("Database not available.");
    try {
        await deleteDoc(doc(firestore, 'packages', id));
    } catch (error: any) {
        console.error("Error deleting tour: ", error);
        await logError({ message: `Failed to delete tour ${id}: ${error.message}`, stack: error.stack, pathname: `/manage/packages`, context: { tourId: id } });
        throw new Error("Could not delete tour.");
    }
}

export async function checkSlugAvailability(slug: string, excludeTourId?: string): Promise<boolean> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const q = query(collection(firestore, 'packages'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        
        if (excludeTourId) {
            return querySnapshot.docs.every(doc => doc.id === excludeTourId);
        }
        return querySnapshot.empty;
    } catch (error: any) {
        console.error("Error checking slug availability:", error);
        await logError({ message: `Failed to check slug availability for ${slug}: ${error.message}`, stack: error.stack, pathname: `/manage/packages/edit`, context: { slug, excludeTourId } });
        throw new Error("Could not check slug availability.");
    }
}

/**
 * Validates if a tour has all required fields to be published.
 * @param tourId The ID of the tour to validate.
 * @returns A promise that resolves to an array of missing requirements (strings) or true if valid.
 */
export async function validateTourForPublishing(tourId: string): Promise<string[] | true> {
    if (!firestore) throw new Error("Database not available.");

    const tour = await getTourById(tourId);
    if (!tour) {
        return ["Tour not found."];
    }

    const missing: string[] = [];

    if (!tour.name || tour.name.length < 5) missing.push("Name (at least 5 characters)");
    if (!tour.slug || tour.slug.length < 3) missing.push("URL Slug (at least 3 characters)");
    if (!tour.description || tour.description.length < 20) missing.push("Description (at least 20 characters)");
    if (!tour.region || tour.region.length === 0) missing.push("Region (at least one region)"); // Updated validation
    if (!tour.type) missing.push("Activity Type");
    if (!tour.difficulty) missing.push("Difficulty Level");
    if (!tour.duration || tour.duration < 1) missing.push("Duration (at least 1 day)");
    
    // Price and Booking Type validation
    if (!tour.price || tour.price <= 0) missing.push("Base Price (must be positive)");
    if (!tour.bookingType) missing.push("Booking Type");
    if (tour.bookingType === 'external' && (!tour.externalBookingUrl || tour.externalBookingUrl.length === 0)) {
        missing.push("External Booking URL (required for external booking type)");
    }

    if (!tour.mainImage || tour.mainImage.length === 0) missing.push("Main Image");
    if (!tour.map || tour.map.length === 0) missing.push("Map URL");
    
    if (!tour.itinerary || tour.itinerary.length === 0 || tour.itinerary.some(item => !item.day || !item.title || !item.description)) {
        missing.push("Itinerary (at least one complete day)");
    }
    if (!tour.inclusions || tour.inclusions.length === 0 || tour.inclusions.some(item => item.length === 0)) {
        missing.push("Inclusions (at least one item)");
    }
    if (!tour.exclusions || tour.exclusions.length === 0 || tour.exclusions.some(item => item.length === 0)) {
        missing.push("Exclusions (at least one item)");
    }

    // Only require departure dates if 'anyDateAvailable' is false
    if (!tour.anyDateAvailable && (!tour.departureDates || tour.departureDates.length === 0 || tour.departureDates.some(item => !item.date || item.price <= 0))) {
        missing.push("Departure Dates (at least one complete date with price, or 'Any Date Available' must be checked)");
    }

    // FAQ is optional for publishing for now
    // if (!tour.faq || tour.faq.length === 0) missing.push("FAQ (at least one question and answer)");

    return missing.length > 0 ? missing : true;
}


export async function createBlogPost(): Promise<string | null> {
    if (!firestore) return null;
    const newPost = {
        title: 'New Untitled Post',
        slug: `new-untitled-post-${Date.now()}`,
        content: '<p>Start writing your amazing blog post here...</p>',
        excerpt: '',
        author: 'Admin',
        authorPhoto: 'https://picsum.photos/seed/admin-avatar/400/400', // Default author photo
        date: serverTimestamp(),
        image: 'https://picsum.photos/seed/blog-placeholder/800/500',
        status: 'draft',
        metaInformation: '',
    };
    try {
        const docRef = await addDoc(collection(firestore, 'blogPosts'), newPost);
        return docRef.id;
    } catch (e: any) {
        console.error("Error creating blog post", e);
        await logError({ message: `Failed to create blog post: ${e.message}`, stack: e.stack, pathname: '/manage/blog/create', context: { newPost } });
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
    } catch (e: any) {
        console.error("Error updating blog post", e);
        await logError({ message: `Failed to update blog post ${id}: ${e.message}`, stack: e.stack, pathname: `/manage/blog/${id}/edit`, context: { postId: id, data } });
        throw new Error("Could not update blog post.");
    }
}

export async function deleteBlogPost(id: string) {
    if (!firestore) throw new Error("Database not available.");
    try {
        await deleteDoc(doc(firestore, 'blogPosts', id));
    } catch (e: any) {
        console.error("Error deleting blog post", e);
        await logError({ message: `Failed to delete blog post ${id}: ${e.stack}`, stack: e.stack, pathname: `/manage/blog`, context: { postId: id } });
        throw new Error("Could not delete blog post.");
    }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
    return getDocById<BlogPost>('blogPosts', id);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    return getDocBySlug<BlogPost>('blogPosts', slug);
}

export async function addTeamMember(data: Omit<TeamMember, 'id' | 'slug'>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const slug = slugify(data.name);
        const newMember = { ...data, slug };
        await addDoc(collection(firestore, 'teamMembers'), newMember);
    } catch (error: any) {
        console.error("Error adding team member: ", error);
        await logError({ message: `Failed to add team member: ${error.message}`, stack: error.stack, pathname: '/manage/team/create', context: { data } });
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
    } catch (error: any) {
        console.error("Error updating team member: ", error);
        await logError({ message: `Failed to update team member ${id}: ${error.message}`, stack: error.stack, pathname: `/manage/team/${id}/edit`, context: { memberId: id, data } });
        throw new Error("Could not update team member.");
    }
}

export async function deleteTeamMember(id: string) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'teamMembers', id);
        await deleteDoc(docRef);
    } catch (error: any) {
        console.error("Error deleting team member: ", error);
        await logError({ message: `Failed to delete team member ${id}: ${error.message}`, stack: error.stack, pathname: `/manage/team`, context: { memberId: id } });
        throw new Error("Could not delete team member.");
    }
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
    return getDocById<TeamMember>('teamMembers', id);
}

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | null> {
    return getDocBySlug<TeamMember>('teamMembers', slug);
}

export async function addPartner(data: Omit<Partner, 'id'>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        await addDoc(collection(firestore, 'partners'), data);
    } catch (error: any) {
        console.error("Error adding partner: ", error);
        await logError({ message: `Failed to add partner: ${error.message}`, stack: error.stack, pathname: '/manage/partners/create', context: { data } });
        throw new Error("Could not add partner.");
    }
}

export async function updatePartner(id: string, data: Omit<Partner, 'id'>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'partners', id);
        await updateDoc(docRef, data);
    } catch (error: any) {
        console.error("Error updating partner: ", error);
        await logError({ message: `Failed to update partner ${id}: ${error.message}`, stack: error.stack, pathname: `/manage/partners/${id}/edit`, context: { partnerId: id, data } });
        throw new Error("Could not update partner.");
    }
}

export async function deletePartner(id: string) {
    if (!firestore) throw new Error("Database not available.");
    try {
        await deleteDoc(doc(firestore, 'partners', id));
    } catch (error: any) {
        console.error("Error deleting partner: ", error);
        await logError({ message: `Failed to delete partner ${id}: ${error.message}`, stack: error.stack, pathname: `/manage/partners`, context: { partnerId: id } });
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
    } catch (error: any) {
        console.error("Error fetching errors:", error);
        await logError({ message: `Failed to fetch errors: ${error.message}`, stack: error.stack, pathname: '/manage/site/errors' });
        throw new Error("Could not fetch errors from the database.");
    }
}

export async function getErrorById(id: string): Promise<SiteError | null> {
    return getDocById<SiteError>('errors', id);
}


// File Upload Logging
export async function logFileUpload(data: Omit<FileUpload, 'id' | 'uploadedAt'>): Promise<void> {
  if (!firestore) {
    console.error("Firestore is not initialized. Cannot log file upload.");
    return;
  }
  try {
    await addDoc(collection(firestore, 'uploads'), {
      ...data,
      uploadedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log file upload to Firestore:', error);
    // Don't throw, as the primary goal (upload) was successful.
  }
}

export async function getFileUploads(options?: { limit?: number; category?: UploadCategory }): Promise<FileUpload[]> {
    if (!firestore) return [];
    try {
        let q = query(collection(firestore, 'uploads'), orderBy('uploadedAt', 'desc'));

        if (options?.category) {
            q = query(q, where('category', '==', options.category));
        }

        if (options?.limit) {
            q = query(q, firestoreLimit(options.limit));
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                uploadedAt: (data.uploadedAt as Timestamp).toDate().toISOString() // Convert Timestamp to ISO string
            } as FileUpload;
        });

    } catch (error: any) {
        console.error("Error fetching file uploads:", error);
        await logError({ message: `Failed to fetch file uploads: ${error.message}`, stack: error.stack, pathname: '/manage/uploads', context: { options } });
        throw new Error("Could not fetch file uploads from the database.");
    }
}


export async function getTourById(id: string): Promise<Tour | null> {
    return getDocById<Tour>('packages', id);
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
    return getDocBySlug<Tour>('packages', slug);
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
    if (!firestore) return [];
    try {
        const blogPostsRef = collection(firestore, 'blogPosts');
        const q = query(blogPostsRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    } catch (error: any) {
        console.error("Error fetching all blog posts:", error);
        await logError({ message: `Failed to fetch all blog posts: ${error.message}`, stack: error.stack, pathname: '/blog' });
        throw new Error("Could not fetch all blog posts from the database.");
    }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
    if (!firestore) return [];
    try {
        const teamMembersRef = collection(firestore, 'teamMembers');
        const q = query(teamMembersRef);
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
    } catch (error: any) {
        console.error("Error fetching team members:", error);
        await logError({ message: `Failed to fetch team members: ${error.message}`, stack: error.stack, pathname: '/about/teams' });
        throw new Error("Could not fetch team members from the database.");
    }
}

export async function getActivitiesByAccountId(accountId: string): Promise<Activity[]> {
    if (!firestore) {
        console.error("Firestore is not initialized.");
        return [];
    }
    try {
        const activitiesRef = collection(firestore, 'activities');
        const q = query(activitiesRef, where('accountId', '==', accountId), orderBy('activityTime', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
    } catch (error: any) {
        console.error(`Error fetching activities for account ${accountId}:`, error);
        await logError({ message: `Failed to fetch activities for account ${accountId}: ${error.message}`, stack: error.stack, pathname: `/manage/accounts/${accountId}` });
        throw new Error("Could not fetch activities from the database.");
    }
}

export async function getDestinations(): Promise<Destination[]> {
    if (!firestore) {
        console.error("Firestore is not initialized.");
        return [];
    }
    try {
        const packagesSnapshot = await getDocs(query(collection(firestore, 'packages'), where('status', '==', 'published')));
        const packages = packagesSnapshot.docs.map(doc => doc.data() as Tour); // Cast to Tour to get region as string[]

        const regionCounts = packages.reduce((acc, tour) => {
            if (tour.region && Array.isArray(tour.region)) { // Ensure region is an array
                tour.region.forEach(r => {
                    const regionName = r.trim();
                    if (regionName) {
                        acc[regionName] = (acc[regionName] || 0) + 1;
                    }
                });
            }
            return acc;
        }, {} as Record<string, number>);

        const sortedRegions = Object.entries(regionCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({
                name,
                tourCount: count,
                image: `https://picsum.photos/seed/dest-${slugify(name)}/${name === 'Everest' ? '600/600' : '600/300'}`
            }));

        const defaultDests = ['Everest', 'Annapurna', 'Langtang', 'Manaslu', 'Gokyo'];
        for (const destName of defaultDests) {
            if (!sortedRegions.some(r => r.name === destName) && sortedRegions.length < 5) {
                sortedRegions.push({
                    name: destName,
                    tourCount: 0,
                    image: `https://picsum.photos/seed/dest-${slugify(destName)}/600/300`
                });
            }
        }
        
        const everestIndex = sortedRegions.findIndex(d => d.name === 'Everest');
        if (everestIndex > 0) {
          const everest = sortedRegions[everestIndex];
          sortedRegions.splice(everestIndex, 1);
          sortedRegions.unshift(everest);
        }
        
        return sortedRegions.slice(0, 5);
    } catch (error: any) {
        console.error("Error fetching destinations:", error);
        await logError({ message: `Failed to fetch destinations: ${error.message}`, stack: error.stack, pathname: '/' });
        throw new Error("Could not fetch destinations from the database.");
    }
}

// --- Review Management Functions ---

export async function addReview(data: Omit<ManagedReview, 'id' | 'reviewedOn'>): Promise<string> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = await addDoc(collection(firestore, 'reviews'), {
            ...data,
            reviewedOn: Timestamp.fromDate(new Date(data.reviewedOn as any)),
        });
        return docRef.id;
    } catch (error: any) {
        console.error("Error adding review: ", error);
        await logError({ message: `Failed to add review: ${error.message}`, stack: error.stack, pathname: '/manage/reviews/create', context: { data } });
        throw new Error("Could not add review.");
    }
}

export async function updateReview(id: string, data: Partial<Omit<ManagedReview, 'id'>>): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'reviews', id);
        const updateData: Partial<Omit<ManagedReview, 'id'>> = { ...data };
        if (updateData.reviewedOn && updateData.reviewedOn instanceof Date) {
            updateData.reviewedOn = Timestamp.fromDate(updateData.reviewedOn);
        }
        await updateDoc(docRef, updateData);
    } catch (error: any) {
        console.error("Error updating review: ", error);
        await logError({ message: `Failed to update review ${id}: ${error.message}`, stack: error.stack, pathname: `/manage/reviews/${id}/edit`, context: { reviewId: id, data } });
        throw new Error("Could not update review.");
    }
}

export async function deleteReview(id: string): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    try {
        await deleteDoc(doc(firestore, 'reviews', id));
    } catch (error: any) {
        console.error("Error deleting review: ", error);
        await logError({ message: `Failed to delete review ${id}: ${error.message}`, stack: error.stack, pathname: `/manage/reviews`, context: { reviewId: id } });
        throw new Error("Could not delete review.");
    }
}

export async function getReviewById(id: string): Promise<ManagedReview | null> {
    return getDocById<ManagedReview>('reviews', id);
}

export async function getAllReviews(): Promise<ManagedReview[]> {
    if (!firestore) return [];
    try {
        const reviewsRef = collection(firestore, 'reviews');
        const q = query(reviewsRef, orderBy('reviewedOn', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data() as ManagedReview;
            return {
                ...data,
                id: doc.id,
                reviewedOn: (data.reviewedOn as Timestamp).toDate().toISOString()
            } as ManagedReview;
        });
    } catch (error: any) {
        console.error("Error fetching all reviews:", error);
        await logError({ message: `Failed to fetch all reviews: ${error.message}`, stack: error.stack, pathname: '/manage/reviews' });
        throw new Error("Could not fetch all reviews from the database.");
    }
}

/**
 * Fetches up to 10 recent 5-star reviews from the 'reviews' collection.
 * @returns A promise that resolves to an array of ManagedReview objects.
 */
export async function getFiveStarReviews(): Promise<ManagedReview[]> {
    if (!firestore) {
        console.error("Firestore is not initialized. Cannot get 5-star reviews.");
        return [];
    }
    try {
        const reviewsRef = collection(firestore, 'reviews');
        const q = query(
            reviewsRef,
            where('stars', '==', 5),
            orderBy('reviewedOn', 'desc'),
            firestoreLimit(10)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data() as ManagedReview;
            return {
                ...data,
                id: doc.id,
                reviewedOn: (data.reviewedOn as Timestamp).toDate().toISOString()
            } as ManagedReview;
        });
    } catch (error: any) {
        console.error("Error fetching 5-star reviews:", error);
        await logError({ message: `Failed to fetch 5-star reviews: ${error.message}`, stack: error.stack, pathname: '/' });
        throw new Error("Could not fetch 5-star reviews from the database.");
    }
}


export async function getAllToursForSelect(): Promise<{ id: string; name: string; slug: string }[]> {
    if (!firestore) return [];
    try {
        const packagesRef = collection(firestore, 'packages');
        const q = query(packagesRef, orderBy('name'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                slug: data.slug,
            };
        });
    } catch (error: any) {
        console.error("Error fetching tours for select:", error);
        await logError({ message: `Failed to fetch tours for select: ${error.message}`, stack: error.stack, pathname: '/manage/reviews/create' });
        throw new Error("Could not fetch tours for select from the database.");
    }
}

// New functions for fetching reviews on tour detail page
interface PaginatedReviewsResult {
    reviews: ManagedReview[];
    lastDocId: string | null;
    hasMore: boolean;
}

const REVIEWS_PER_PAGE = 5;

export async function getReviewsForPackage(packageId: string, lastDocId?: string | null): Promise<PaginatedReviewsResult> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const reviewsRef = collection(firestore, 'reviews');
        let q = query(
            reviewsRef,
            where('reviewFor', '==', packageId),
            orderBy('reviewedOn', 'desc'),
            firestoreLimit(REVIEWS_PER_PAGE + 1) // Fetch one extra to check if there's more
        );

        if (lastDocId) {
            const lastDocSnapshot = await getDoc(doc(firestore, 'reviews', lastDocId));
            if (lastDocSnapshot.exists()) {
                q = query(q, startAfter(lastDocSnapshot));
            }
        }

        const querySnapshot = await getDocs(q);
        const fetchedReviews = querySnapshot.docs.map(doc => {
            const data = doc.data() as ManagedReview;
            return {
                ...data,
                id: doc.id,
                reviewedOn: (data.reviewedOn as Timestamp).toDate().toISOString()
            } as ManagedReview;
        });

        const hasMore = fetchedReviews.length > REVIEWS_PER_PAGE;
        const reviewsToReturn = hasMore ? fetchedReviews.slice(0, REVIEWS_PER_PAGE) : fetchedReviews;
        const newLastDocId = reviewsToReturn.length > 0 ? reviewsToReturn[reviewsToReturn.length - 1].id : null;

        return {
            reviews: reviewsToReturn,
            lastDocId: newLastDocId,
            hasMore: hasMore,
        };
    } catch (error: any) {
        console.error(`Error fetching reviews for package ${packageId}: ${error.message}`, error);
        await logError({ message: `Failed to fetch reviews for package ${packageId}: ${error.message}`, stack: error.stack, pathname: `/tours/${packageId}`, context: { packageId, lastDocId } });
        throw new Error("Could not fetch package reviews from the database.");
    }
}

export async function getGeneralReviews(excludePackageId: string, lastDocId?: string | null): Promise<PaginatedReviewsResult> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const reviewsRef = collection(firestore, 'reviews');
        let q = query(
            reviewsRef,
            where('reviewFor', '!=', excludePackageId), // Exclude reviews for the current package
            orderBy('reviewFor'), // Firestore requires an orderBy on the field used in '!='
            orderBy('reviewedOn', 'desc'),
            firestoreLimit(REVIEWS_PER_PAGE + 1)
        );

        if (lastDocId) {
            const lastDocSnapshot = await getDoc(doc(firestore, 'reviews', lastDocId));
            if (lastDocSnapshot.exists()) {
                q = query(q, startAfter(lastDocSnapshot));
            }
        }

        const querySnapshot = await getDocs(q);
        const fetchedReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManagedReview));

        const hasMore = fetchedReviews.length > REVIEWS_PER_PAGE;
        const reviewsToReturn = hasMore ? fetchedReviews.slice(0, REVIEWS_PER_PAGE) : fetchedReviews;
        const newLastDocId = reviewsToReturn.length > 0 ? reviewsToReturn[reviewsToReturn.length - 1].id : null;

        return {
            reviews: reviewsToReturn,
            lastDocId: newLastDocId,
            hasMore: hasMore,
        };
    } catch (error: any) {
        console.error(`Error fetching general reviews (excluding ${excludePackageId}): ${error.message}`, error);
        await logError({ message: `Failed to fetch general reviews (excluding ${excludePackageId}): ${error.message}`, stack: error.stack, pathname: `/tours/${excludePackageId}`, context: { excludePackageId, lastDocId } });
        throw new Error("Could not fetch general reviews from the database.");
    }
}

export async function getTourNameById(tourId: string): Promise<string | null> {
    if (!firestore) return null;
    try {
        const tourDoc = await getDoc(doc(firestore, 'packages', tourId));
        if (tourDoc.exists()) {
            return (tourDoc.data() as Tour).name;
        }
        return null;
    } catch (error: any) {
        console.error(`Error fetching tour name for ID ${tourId}: ${error.message}`, error);
        await logError({ message: `Failed to fetch tour name for ID ${tourId}: ${error.message}`, stack: error.stack, pathname: `/tours/${tourId}` });
        return null;
    }
}

export async function getAllTourNamesMap(): Promise<Map<string, string>> {
    if (!firestore) return new Map();
    try {
        const packagesRef = collection(firestore, 'packages');
        const q = query(packagesRef, where('status', '==', 'published'));
        const querySnapshot = await getDocs(q);
        const tourMap = new Map<string, string>();
        querySnapshot.docs.forEach(doc => {
            const data = doc.data();
            tourMap.set(doc.id, data.name);
        });
        return tourMap;
    } catch (error: any) {
        console.error("Error fetching all tour names map:", error);
        await logError({ message: `Failed to fetch all tour names map: ${error.message}`, stack: error.stack, pathname: '/' });
        return new Map();
    }
}

// Site Profile Functions
const SITE_PROFILE_ID = "happymountainnepal";

export async function getSiteProfile(): Promise<SiteProfile | null> {
    return getDocById<SiteProfile>('profile', SITE_PROFILE_ID);
}

export async function updateSiteProfile(data: Partial<Omit<SiteProfile, 'id'>>) {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'profile', SITE_PROFILE_ID);
        // Use setDoc with merge: true to create the document if it doesn't exist, or update it if it does.
        await setDoc(docRef, data, { merge: true });
    } catch (error: any) {
        console.error("Error updating site profile: ", error);
        await logError({ message: `Failed to update site profile: ${error.message}`, stack: error.stack, pathname: `/manage/profile`, context: { data } });
        throw new Error("Could not update site profile.");
    }
}

// Legal Content Functions
export async function getLegalContent(id: 'privacy-policy' | 'terms-of-service'): Promise<LegalContent | null> {
    return getDocById<LegalContent>('legal', id);
}

export async function updateLegalContent(id: 'privacy-policy' | 'terms-of-service', content: string): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = doc(firestore, 'legal', id);
        await setDoc(docRef, { 
            content: content, 
            lastUpdated: serverTimestamp() 
        }, { merge: true });
    } catch (error: any) {
        console.error(`Error updating legal content for ${id}:`, error);
        await logError({ message: `Failed to update legal content for ${id}: ${error.message}`, stack: error.stack, pathname: `/manage/legal/${id}` });
        throw new Error("Could not update legal content.");
    }
}

// New Legal Document Functions
export async function getLegalDocuments(): Promise<LegalDocument[]> {
    if (!firestore) return [];
    try {
        const docsRef = collection(firestore, 'legalDocuments');
        const q = query(docsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LegalDocument));
    } catch (error: any) {
        console.error("Error fetching legal documents:", error);
        throw new Error("Could not fetch legal documents.");
    }
}

export async function addLegalDocument(data: Omit<LegalDocument, 'id' | 'createdAt'>): Promise<string> {
    if (!firestore) throw new Error("Database not available.");
    try {
        const docRef = await addDoc(collection(firestore, 'legalDocuments'), {
            ...data,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error: any) {
        console.error("Error adding legal document:", error);
        throw new Error("Could not add legal document.");
    }
}

export async function deleteLegalDocument(id: string): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    try {
        await deleteDoc(doc(firestore, 'legalDocuments', id));
    } catch (error: any) {
        console.error("Error deleting legal document:", error);
        throw new Error("Could not delete legal document.");
    }
}
