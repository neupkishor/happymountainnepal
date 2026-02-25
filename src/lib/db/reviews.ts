
'use server';

import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp, doc, updateDoc, deleteDoc, where, limit as firestoreLimit, startAfter, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { ManagedReview, OnSiteReview, OffSiteReview } from '@/lib/types';
import { logError } from './errors';
import { getAllToursForSelect, getTourNameById } from './tours';

async function getDocById<T>(collectionName: string, id: string): Promise<T | null> {
    if (!firestore) return null;
    const docRef = doc(firestore, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
}

export async function addReview(data: Omit<ManagedReview, 'id'>): Promise<string> {
    if (!firestore) throw new Error("Database not available.");
    const docRef = await addDoc(collection(firestore, 'reviews'), {
        ...data,
        reviewedOn: Timestamp.fromDate(new Date(data.reviewedOn as any)),
    });
    return docRef.id;
}

export async function updateReview(id: string, data: Partial<Omit<ManagedReview, 'id'>>) {
    if (!firestore) throw new Error("Database not available.");
    const docRef = doc(firestore, 'reviews', id);
    const updateData: Partial<Omit<ManagedReview, 'id'>> = { ...data };
    if (updateData.reviewedOn && updateData.reviewedOn instanceof Date) {
        updateData.reviewedOn = Timestamp.fromDate(updateData.reviewedOn);
    }
    await updateDoc(docRef, updateData);
}

export async function deleteReview(id: string): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    await deleteDoc(doc(firestore, 'reviews', id));
}

export async function getReviewById(id: string): Promise<ManagedReview | null> {
    return getDocById<ManagedReview>('reviews', id);
}

export async function getAllReviews(): Promise<ManagedReview[]> {
    if (!firestore) return [];
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
}

export async function getFiveStarReviews(): Promise<ManagedReview[]> {
    if (!firestore) return [];
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
}

interface PaginatedReviewsResult {
    reviews: ManagedReview[];
    lastDocId: string | null;
    hasMore: boolean;
}

const REVIEWS_PER_PAGE = 5;

export async function getReviewsForPackage(packageId: string, lastDocId?: string | null): Promise<PaginatedReviewsResult> {
    if (!firestore) throw new Error("Database not available.");
    let q = query(
        collection(firestore, 'reviews'),
        where('reviewFor', '==', packageId),
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
    const fetchedReviews = querySnapshot.docs.map(doc => ({
        id: doc.id, ...doc.data(), reviewedOn: (doc.data().reviewedOn as Timestamp).toDate().toISOString()
    } as ManagedReview));
    const hasMore = fetchedReviews.length > REVIEWS_PER_PAGE;
    const reviewsToReturn = hasMore ? fetchedReviews.slice(0, REVIEWS_PER_PAGE) : fetchedReviews;
    const newLastDocId = reviewsToReturn.length > 0 ? reviewsToReturn[reviewsToReturn.length - 1].id : null;
    return { reviews: reviewsToReturn, lastDocId: newLastDocId, hasMore };
}

export async function getGeneralReviews(excludePackageId: string, lastDocId?: string | null): Promise<PaginatedReviewsResult> {
    if (!firestore) throw new Error("Database not available.");
    let q = query(
        collection(firestore, 'reviews'),
        where('reviewFor', '!=', excludePackageId),
        orderBy('reviewFor'),
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
    return { reviews: reviewsToReturn, lastDocId: newLastDocId, hasMore };
}
