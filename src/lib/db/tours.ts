
'use server';

import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp, doc, setDoc, where, getDoc, limit as firestoreLimit, updateDoc, deleteDoc, startAfter } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { Tour, Destination, ImportedTourData, ImageWithCaption } from '@/lib/types';
import { slugify } from "@/lib/utils";
import { logError } from './errors';

async function getDocById<T>(collectionName: string, id: string): Promise<T | null> {
    if (!firestore) return null;
    const docRef = doc(firestore, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
}

async function getDocBySlug<T>(collectionName: string, slug: string): Promise<T | null> {
    if (!firestore) return null;
    const q = query(collection(firestore, collectionName), where('slug', '==', slug), firestoreLimit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as T;
}

// Helper function to normalize image data
function normalizeImageData(imageData: any): ImageWithCaption {
    // If it's already an object with url property, return as is
    if (imageData && typeof imageData === 'object' && !Array.isArray(imageData) && imageData.url) {
        return {
            url: String(imageData.url || ''),
            caption: imageData.caption || undefined,
            posted_by: imageData.posted_by || undefined,
            story: imageData.story || undefined,
        };
    }

    // If it's an array [url, posted_by, caption] or [url, posted_by, caption, story]
    if (Array.isArray(imageData)) {
        return {
            url: String(imageData[0] || ''),
            posted_by: imageData[1] || undefined,
            caption: imageData[2] || undefined,
            story: imageData[3] || undefined,
        };
    }

    // If it's just a string (legacy format), treat it as URL
    if (typeof imageData === 'string') {
        return {
            url: imageData,
        };
    }

    // Fallback
    return { url: '' };
}

// Helper function to normalize tour data
function normalizeTourData(tour: any): Tour {
    return {
        ...tour,
        mainImage: normalizeImageData(tour.mainImage),
        images: Array.isArray(tour.images)
            ? tour.images.map(normalizeImageData).filter((img: ImageWithCaption) => img.url && img.url.trim().length > 0)
            : [],
        gears: Array.isArray(tour.gears) ? tour.gears : [],
        guides: Array.isArray(tour.guides) ? tour.guides : [],
    };
}

export async function createTour(): Promise<string | null> {
    if (!firestore) return null;
    const newTourData: Omit<Tour, 'id'> = {
        name: 'New Untitled Package',
        slug: slugify('New Untitled Package'),
        description: '',
        region: [],
        type: 'Trekking',
        difficulty: 'Moderate',
        duration: 0,
        price: 0,
        mainImage: { url: '', caption: '' },
        images: [],
        itinerary: [],
        inclusions: [],
        exclusions: [],
        departureDates: [],
        anyDateAvailable: false,
        map: 'https://www.google.com/maps/d/u/0/viewer?mid=1OXiIBghnVbSBVV-aRCScumjB9yz1woY&femb=1&ll=28.371376049324283%2C83.8769916&z=11',
        reviews: [],
        status: 'draft',
        faq: [],
        additionalInfoSections: [],
        bookingType: 'internal',
        externalBookingUrl: '',
    };
    const docRef = await addDoc(collection(firestore, 'packages'), newTourData);
    return docRef.id;
}

export async function createTourWithBasicInfo(data: Partial<ImportedTourData>): Promise<string | null> {
    if (!firestore) throw new Error("Database not available.");
    const slug = slugify(data.name || 'new-package');
    if (!await checkSlugAvailability(slug)) {
        throw new Error(`Slug '${slug}' is already in use.`);
    }

    const newTourData: Omit<Tour, 'id'> = {
        name: data.name || 'New Untitled Package',
        slug: slug,
        description: data.description || '',
        region: Array.isArray(data.region) ? data.region : [],
        type: data.type || 'Trekking',
        difficulty: data.difficulty || 'Moderate',
        duration: typeof data.duration === 'number' ? data.duration : 0,
        price: data.price || 0,
        mainImage: { url: '', caption: '' },
        images: [],
        itinerary: data.itinerary || [],
        inclusions: data.inclusions || [],
        exclusions: data.exclusions || [],
        departureDates: [],
        anyDateAvailable: false,
        map: 'https://www.google.com/maps/d/u/0/viewer?mid=1OXiIBghnVbSBVV-aRCScumjB9yz1woY&femb=1&ll=28.371376049324283%2C83.8769916&z=11',
        reviews: [],
        status: 'draft',
        faq: data.faq || [],
        additionalInfoSections: data.additionalInfoSections || [],
        bookingType: 'internal',
        externalBookingUrl: '',
    };
    const docRef = await addDoc(collection(firestore, 'packages'), newTourData);
    return docRef.id;
}

export async function updateTour(id: string, data: Partial<Omit<Tour, 'id'>>) {
    if (!firestore) throw new Error("Database not available.");
    const docRef = doc(firestore, 'packages', id);
    let finalData: Partial<Omit<Tour, 'id'>> = { ...data };

    if (data.name || data.description || data.region || data.type || data.difficulty) {
        const currentDoc = await getDoc(docRef);
        const existingData = currentDoc.data() as Tour || {};
        const combinedData = { ...existingData, ...data };
        const keywords = new Set<string>();
        (combinedData.name || '').toLowerCase().split(' ').forEach(word => keywords.add(word));
        (combinedData.description || '').toLowerCase().split(' ').forEach(word => keywords.add(word.replace(/[^a-z0-9]/gi, '')));
        if (Array.isArray(combinedData.region)) {
            combinedData.region.forEach(r => keywords.add(r.trim().toLowerCase()));
        } else if (typeof combinedData.region === 'string') {
            (combinedData.region as string).split(',').forEach(r => keywords.add(r.trim().toLowerCase()));
        }
        if (combinedData.type) keywords.add(combinedData.type.toLowerCase());
        if (combinedData.difficulty) keywords.add(combinedData.difficulty.toLowerCase());
        finalData.searchKeywords = Array.from(keywords).filter(Boolean);
    }
    if (finalData.departureDates) {
        finalData.departureDates = finalData.departureDates.map((d: any) => ({
            ...d,
            date: d.date instanceof Date ? Timestamp.fromDate(d.date) : d.date
        }));
    }
    await updateDoc(docRef, finalData);
}

export async function deleteTour(id: string) {
    if (!firestore) throw new Error("Database not available.");
    await deleteDoc(doc(firestore, 'packages', id));
}

export async function checkSlugAvailability(slug: string, excludeTourId?: string): Promise<boolean> {
    if (!firestore) throw new Error("Database not available.");
    const q = query(collection(firestore, 'packages'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    if (excludeTourId) {
        return querySnapshot.docs.every(doc => doc.id === excludeTourId);
    }
    return querySnapshot.empty;
}

export async function validateTourForPublishing(tourId: string): Promise<string[] | true> {
    if (!firestore) throw new Error("Database not available.");
    const tour = await getTourById(tourId);
    if (!tour) return ["Tour not found."];

    const missing: string[] = [];
    if (!tour.name || tour.name.length < 5) missing.push("Name (at least 5 characters)");
    if (!tour.slug || tour.slug.length < 3) missing.push("URL Slug (at least 3 characters)");
    if (!tour.description || tour.description.length < 20) missing.push("Description (at least 20 characters)");
    if (!tour.region || tour.region.length === 0) missing.push("Region (at least one region)");
    if (!tour.type) missing.push("Activity Type");
    if (!tour.difficulty) missing.push("Difficulty Level");
    if (!tour.duration || tour.duration < 1) missing.push("Duration (at least 1 day)");
    if (!tour.price || tour.price <= 0) missing.push("Base Price (must be positive)");
    if (!tour.bookingType) missing.push("Booking Type");
    if (tour.bookingType === 'external' && (!tour.externalBookingUrl || tour.externalBookingUrl.length === 0)) {
        missing.push("External Booking URL (required for external booking type)");
    }
    if (!tour.mainImage || !tour.mainImage.url) missing.push("Main Image");
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
    if (!tour.anyDateAvailable && (!tour.departureDates || tour.departureDates.length === 0 || tour.departureDates.some(item => !item.date || item.price <= 0))) {
        missing.push("Departure Dates (at least one complete date with price, or 'Any Date Available' must be checked)");
    }
    return missing.length > 0 ? missing : true;
}

export async function getTourById(id: string): Promise<Tour | null> {
    const tour = await getDocById<Tour>('packages', id);
    if (!tour) return null;
    return normalizeTourData(tour);
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
    const tour = await getDocBySlug<Tour>('packages', slug);
    if (!tour) return null;
    return normalizeTourData(tour);
}

export async function getPackagesPaginated(options: {
    page: number;
    limit: number;
    search?: string;
}): Promise<{
    packages: Tour[];
    pagination: { currentPage: number; totalPages: number; totalCount: number; };
}> {
    if (!firestore) return { packages: [], pagination: { currentPage: options.page, totalPages: 0, totalCount: 0 } };

    const { page, limit, search } = options;

    // Fetch all packages first (we need to do client-side filtering for search)
    let baseQuery = query(collection(firestore, 'packages'), orderBy('name'));
    const allDocsSnapshot = await getDocs(baseQuery);

    let allPackages = allDocsSnapshot.docs.map(doc => normalizeTourData({
        id: doc.id,
        ...doc.data()
    }));

    // Apply search filter if provided
    if (search && search.trim()) {
        const searchTermLower = search.toLowerCase().trim();
        allPackages = allPackages.filter(pkg => {
            // Search in name
            if (pkg.name?.toLowerCase().includes(searchTermLower)) return true;

            // Search in description
            if (pkg.description?.toLowerCase().includes(searchTermLower)) return true;

            // Search in regions
            if (Array.isArray(pkg.region)) {
                if (pkg.region.some(r => r.toLowerCase().includes(searchTermLower))) return true;
            }

            // Search in type
            if (pkg.type?.toLowerCase().includes(searchTermLower)) return true;

            // Search in difficulty
            if (pkg.difficulty?.toLowerCase().includes(searchTermLower)) return true;

            return false;
        });
    }

    // Calculate pagination
    const totalCount = allPackages.length;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;

    // Get the page of results
    const packages = allPackages.slice(offset, offset + limit);

    return {
        packages,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount
        }
    };
}

export async function getAllToursForSelect(): Promise<{ id: string; name: string; slug: string }[]> {
    if (!firestore) return [];
    const q = query(collection(firestore, 'packages'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, slug: doc.data().slug }));
}

export async function getAllPublishedTours(): Promise<Tour[]> {
    if (!firestore) return [];
    const q = query(collection(firestore, 'packages'), where('status', '==', 'published'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => normalizeTourData({ id: doc.id, ...doc.data() }));
}

export async function getDestinations(): Promise<Destination[]> {
    if (!firestore) return [];
    const packagesSnapshot = await getDocs(query(collection(firestore, 'packages'), where('status', '==', 'published')));
    const packages = packagesSnapshot.docs.map(doc => doc.data() as Tour);
    const regionCounts = packages.reduce((acc, tour) => {
        if (tour.region && Array.isArray(tour.region)) {
            tour.region.forEach(r => {
                const regionName = r.trim();
                if (regionName) acc[regionName] = (acc[regionName] || 0) + 1;
            });
        }
        return acc;
    }, {} as Record<string, number>);
    const sortedRegions = Object.entries(regionCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, count]) => ({
        name, tourCount: count, image: `https://picsum.photos/seed/dest-${slugify(name)}/${name === 'Everest' ? '600/600' : '600/300'}`
    }));
    const defaultDests = ['Everest', 'Annapurna', 'Langtang', 'Manaslu', 'Gokyo'];
    for (const destName of defaultDests) {
        if (!sortedRegions.some(r => r.name === destName) && sortedRegions.length < 5) {
            sortedRegions.push({ name: destName, tourCount: 0, image: `https://picsum.photos/seed/dest-${slugify(destName)}/600/300` });
        }
    }
    const everestIndex = sortedRegions.findIndex(d => d.name === 'Everest');
    if (everestIndex > 0) {
        const everest = sortedRegions.splice(everestIndex, 1)[0];
        sortedRegions.unshift(everest);
    }
    return sortedRegions.slice(0, 5);
}


export async function updateTourWithAiData(tourId: string, data: Partial<ImportedTourData>): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    const docRef = doc(firestore, 'packages', tourId);
    const tourDoc = await getDoc(docRef);
    if (!tourDoc.exists()) throw new Error("Tour not found.");
    const existingData = tourDoc.data() as Tour;
    const updateData: Partial<Tour> = {};
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.duration) updateData.duration = data.duration;
    if (data.price) updateData.price = data.price;
    if (data.difficulty) updateData.difficulty = data.difficulty;
    if (data.region) updateData.region = [...new Set([...(existingData.region || []), ...data.region])];
    if (data.itinerary) {
        const existingDays = new Set(existingData.itinerary?.map(i => i.day));
        updateData.itinerary = [...(existingData.itinerary || []), ...data.itinerary.filter(i => !existingDays.has(i.day))];
    }
    if (data.inclusions) updateData.inclusions = [...new Set([...(existingData.inclusions || []), ...data.inclusions])];
    if (data.exclusions) updateData.exclusions = [...new Set([...(existingData.exclusions || []), ...data.exclusions])];
    if (data.faq) {
        const existingQuestions = new Set(existingData.faq?.map(f => f.question));
        updateData.faq = [...(existingData.faq || []), ...data.faq.filter(f => !existingQuestions.has(f.question))];
    }
    if (data.additionalInfoSections) {
        const existingTitles = new Set(existingData.additionalInfoSections?.map(s => s.title));
        updateData.additionalInfoSections = [...(existingData.additionalInfoSections || []), ...data.additionalInfoSections.filter(s => !existingTitles.has(s.title))];
    }
    await updateDoc(docRef, updateData);
}

export async function getAllTourRegions(): Promise<string[]> {
    if (!firestore) return [];
    const querySnapshot = await getDocs(query(collection(firestore, 'packages'), where('status', '==', 'published')));
    const regionsSet = new Set<string>();
    querySnapshot.forEach(doc => {
        const tour = doc.data() as Tour;
        if (Array.isArray(tour.region)) {
            tour.region.forEach(r => regionsSet.add(r));
        }
    });
    return Array.from(regionsSet).sort();
}

export async function getPaginatedTours({ limit, lastDocId }: { limit: number, lastDocId: string | null }): Promise<{ tours: Tour[], lastDocId: string | null, hasMore: boolean }> {
    if (!firestore) throw new Error("Database not available.");
    let q = query(
        collection(firestore, 'packages'),
        where('status', '==', 'published'),
        orderBy('name'),
        firestoreLimit(limit + 1)
    );
    if (lastDocId) {
        const lastVisible = await getDoc(doc(firestore, "packages", lastDocId));
        if (lastVisible.exists()) {
            q = query(q, startAfter(lastVisible));
        }
    }
    const querySnapshot = await getDocs(q);
    const fetchedTours = querySnapshot.docs.map(doc => normalizeTourData({ id: doc.id, ...doc.data() }));
    const hasMore = fetchedTours.length > limit;
    const toursToReturn = hasMore ? fetchedTours.slice(0, limit) : fetchedTours;
    const newLastDocId = toursToReturn.length > 0 ? toursToReturn[toursToReturn.length - 1].id : null;
    return { tours: toursToReturn, lastDocId: newLastDocId, hasMore };
}

export async function getAllTourNamesMap(): Promise<Map<string, string>> {
    if (!firestore) return new Map();
    const q = query(collection(firestore, 'packages'), where('status', '==', 'published'));
    const querySnapshot = await getDocs(q);
    const tourMap = new Map<string, string>();
    querySnapshot.docs.forEach(doc => tourMap.set(doc.id, doc.data().name));
    return tourMap;
}
