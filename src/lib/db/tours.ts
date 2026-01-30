
'use server';

import type { Tour, Destination, ImportedTourData, ImageWithCaption } from '@/lib/types';
import { slugify } from "@/lib/utils";
import { logError } from './errors';
import {
    savePackage,
    getPackageById,
    getPackageBySlug,
    getPackages,
    getAllPackagesForSelect,
    deletePackage,
    checkPackageSlugAvailability
} from './sqlite';

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
    try {
        const newTourData: Omit<Tour, 'id'> & { id: string } = {
            id: `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

        return savePackage(newTourData);
    } catch (error: any) {
        await logError(error, 'createTour');
        return null;
    }
}

export async function createTourWithBasicInfo(data: Partial<ImportedTourData>): Promise<string | null> {
    try {
        const slug = slugify(data.name || 'new-package');
        if (!await checkSlugAvailability(slug)) {
            throw new Error(`Slug '${slug}' is already in use.`);
        }

        const newTourData: Omit<Tour, 'id'> & { id: string } = {
            id: `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

        return savePackage(newTourData);
    } catch (error: any) {
        await logError(error, 'createTourWithBasicInfo');
        throw error;
    }
}

export async function updateTour(id: string, data: Partial<Omit<Tour, 'id'>>) {
    try {
        const existingTour = getPackageById(id);
        if (!existingTour) {
            throw new Error('Tour not found');
        }

        let finalData: any = { ...existingTour, ...data };

        // Generate search keywords if relevant fields changed
        if (data.name || data.description || data.region || data.type || data.difficulty) {
            const keywords = new Set<string>();
            (finalData.name || '').toLowerCase().split(' ').forEach((word: string) => keywords.add(word));
            (finalData.description || '').toLowerCase().split(' ').forEach((word: string) => keywords.add(word.replace(/[^a-z0-9]/gi, '')));
            if (Array.isArray(finalData.region)) {
                finalData.region.forEach((r: string) => keywords.add(r.trim().toLowerCase()));
            } else if (typeof finalData.region === 'string') {
                (finalData.region as string).split(',').forEach((r) => keywords.add(r.trim().toLowerCase()));
            }
            if (finalData.type) keywords.add(finalData.type.toLowerCase());
            if (finalData.difficulty) keywords.add(finalData.difficulty.toLowerCase());
            finalData.searchKeywords = Array.from(keywords).filter(Boolean);
        }

        savePackage(finalData);
    } catch (error: any) {
        await logError(error, 'updateTour');
        throw error;
    }
}

export async function deleteTour(id: string) {
    try {
        deletePackage(id);
    } catch (error: any) {
        await logError(error, 'deleteTour');
        throw error;
    }
}

export async function checkSlugAvailability(slug: string, excludeTourId?: string): Promise<boolean> {
    try {
        return checkPackageSlugAvailability(slug, excludeTourId);
    } catch (error: any) {
        await logError(error, 'checkSlugAvailability');
        throw error;
    }
}

export async function validateTourForPublishing(tourId: string): Promise<string[] | true> {
    try {
        const tour = await getTourById(tourId);
        if (!tour) return ["Tour not found."];

        const missing: string[] = [];

        // Basic Information
        if (!tour.name || tour.name.length < 5) missing.push("Name (at least 5 characters)");
        if (!tour.slug || tour.slug.length < 3) missing.push("URL Slug (at least 3 characters)");
        if (!tour.description || tour.description.length < 20) missing.push("Description (at least 20 characters)");
        if (!tour.shortDescription || tour.shortDescription.length < 50 || tour.shortDescription.length > 200) {
            missing.push("Short Description / Meta Description (50-200 characters for SEO)");
        }
        if (!tour.region || tour.region.length === 0) missing.push("Region (at least one region)");
        if (!tour.type) missing.push("Activity Type");
        if (!tour.difficulty) missing.push("Difficulty Level");
        if (!tour.duration || tour.duration < 1) missing.push("Duration (at least 1 day)");

        // Pricing & Booking
        if (!tour.price || tour.price <= 0) missing.push("Base Price (must be positive)");
        if (!tour.bookingType) missing.push("Booking Type");
        if (tour.bookingType === 'external' && (!tour.externalBookingUrl || tour.externalBookingUrl.length === 0)) {
            missing.push("External Booking URL (required for external booking type)");
        }
        if (!tour.anyDateAvailable && (!tour.departureDates || tour.departureDates.length === 0 || tour.departureDates.some(item => !item.date || item.price <= 0))) {
            missing.push("Departure Dates (at least one complete date with price, or 'Any Date Available' must be checked)");
        }

        // Media
        if (!tour.mainImage || !tour.mainImage.url) missing.push("Main Image");
        if (!tour.images || tour.images.length === 0) missing.push("Gallery Images (at least one image)");
        if (!tour.map || tour.map.length === 0) missing.push("Map URL");

        // Content
        if (!tour.itinerary || tour.itinerary.length === 0 || tour.itinerary.some(item => !item.day || !item.title || !item.description)) {
            missing.push("Itinerary (at least one complete day with title and description)");
        }
        if (!tour.inclusions || tour.inclusions.length === 0 || tour.inclusions.some(item => item.length === 0)) {
            missing.push("Inclusions (at least one item)");
        }
        if (!tour.exclusions || tour.exclusions.length === 0 || tour.exclusions.some(item => item.length === 0)) {
            missing.push("Exclusions (at least one item)");
        }

        return missing.length > 0 ? missing : true;
    } catch (error: any) {
        await logError(error, 'validateTourForPublishing');
        throw error;
    }
}

export async function getTourById(id: string): Promise<Tour | null> {
    try {
        const tour = getPackageById(id);
        if (!tour) return null;
        return normalizeTourData(tour);
    } catch (error: any) {
        await logError(error, 'getTourById');
        return null;
    }
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
    try {
        const tour = getPackageBySlug(slug);
        if (!tour) return null;
        return normalizeTourData(tour);
    } catch (error: any) {
        await logError(error, 'getTourBySlug');
        return null;
    }
}

export async function getPackagesPaginated(options: {
    page: number;
    limit: number;
    search?: string;
}): {
    packages: Promise<Tour[]>;
    pagination: { currentPage: number; totalPages: number; totalCount: number; };
} {
    try {
        const result = getPackages({
            page: options.page,
            limit: options.limit,
            search: options.search
        });

        return {
            packages: result.packages.map(normalizeTourData),
            pagination: {
                currentPage: result.pagination.currentPage,
                totalPages: result.pagination.totalPages,
                totalCount: result.pagination.totalCount
            }
        };
    } catch (error: any) {
        await logError(error, 'getPackagesPaginated');
        return {
            packages: [],
            pagination: { currentPage: options.page, totalPages: 0, totalCount: 0 }
        };
    }
}

export async function getAllToursForSelect(): Promise<{ id: string; name: string; slug: string }[]> {
    try {
        return getAllPackagesForSelect();
    } catch (error: any) {
        await logError(error, 'getAllToursForSelect');
        return [];
    }
}

export async function getAllPublishedTours(): Promise<Tour[]> {
    try {
        const result = getPackages({ status: 'published', limit: 1000 });
        return result.packages.map(normalizeTourData);
    } catch (error: any) {
        await logError(error, 'getAllPublishedTours');
        return [];
    }
}

export async function getDestinations(): Promise<Destination[]> {
    try {
        const packages = await getAllPublishedTours();
        const regionCounts = packages.reduce((acc, tour) => {
            if (tour.region && Array.isArray(tour.region)) {
                tour.region.forEach(r => {
                    const regionName = r.trim();
                    if (regionName) acc[regionName] = (acc[regionName] || 0) + 1;
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
            const everest = sortedRegions.splice(everestIndex, 1)[0];
            sortedRegions.unshift(everest);
        }

        return sortedRegions.slice(0, 5);
    } catch (error: any) {
        await logError(error, 'getDestinations');
        return [];
    }
}

export async function updateTourWithAiData(tourId: string, data: Partial<ImportedTourData>): Promise<void> {
    try {
        const existingTour = await getTourById(tourId);
        if (!existingTour) throw new Error("Tour not found.");

        const updateData: Partial<Tour> = {};
        if (data.name) updateData.name = data.name;
        if (data.description) updateData.description = data.description;
        if (data.duration) updateData.duration = data.duration;
        if (data.price) updateData.price = data.price;
        if (data.difficulty) updateData.difficulty = data.difficulty;
        if (data.region) updateData.region = [...new Set([...(existingTour.region || []), ...data.region])];

        if (data.itinerary) {
            const existingDays = new Set(existingTour.itinerary?.map(i => i.day));
            updateData.itinerary = [...(existingTour.itinerary || []), ...data.itinerary.filter(i => !existingDays.has(i.day))];
        }

        if (data.inclusions) updateData.inclusions = [...new Set([...(existingTour.inclusions || []), ...data.inclusions])];
        if (data.exclusions) updateData.exclusions = [...new Set([...(existingTour.exclusions || []), ...data.exclusions])];

        if (data.faq) {
            const existingQuestions = new Set(existingTour.faq?.map(f => f.question));
            updateData.faq = [...(existingTour.faq || []), ...data.faq.filter(f => !existingQuestions.has(f.question))];
        }

        if (data.additionalInfoSections) {
            const existingTitles = new Set(existingTour.additionalInfoSections?.map(s => s.title));
            updateData.additionalInfoSections = [...(existingTour.additionalInfoSections || []), ...data.additionalInfoSections.filter(s => !existingTitles.has(s.title))];
        }

        await updateTour(tourId, updateData);
    } catch (error: any) {
        await logError(error, 'updateTourWithAiData');
        throw error;
    }
}

export async function getAllTourRegions(): Promise<string[]> {
    try {
        const packages = await getAllPublishedTours();
        const regionsSet = new Set<string>();
        packages.forEach(tour => {
            if (Array.isArray(tour.region)) {
                tour.region.forEach(r => regionsSet.add(r));
            }
        });
        return Array.from(regionsSet).sort();
    } catch (error: any) {
        await logError(error, 'getAllTourRegions');
        return [];
    }
}

export async function getPaginatedTours({ limit, lastDocId }: { limit: number, lastDocId: string | null }): {
    tours: Promise<Tour[]>;
    lastDocId: string | null;
    hasMore: boolean;
} {
    try {
        // Simple pagination without cursor for SQLite
        // We can implement cursor-based pagination later if needed
        const result = getPackages({ status: 'published', limit: limit + 1 });
        const tours = result.packages.map(normalizeTourData);
        const hasMore = tours.length > limit;
        const toursToReturn = hasMore ? tours.slice(0, limit) : tours;
        const newLastDocId = toursToReturn.length > 0 ? toursToReturn[toursToReturn.length - 1].id : null;

        return {
            tours: toursToReturn,
            lastDocId: newLastDocId,
            hasMore
        };
    } catch (error: any) {
        await logError(error, 'getPaginatedTours');
        return { tours: [], lastDocId: null, hasMore: false };
    }
}

export async function getAllTourNamesMap(): Promise<Map<string, string>> {
    try {
        const packages = getAllPackagesForSelect();
        const tourMap = new Map<string, string>();
        packages.forEach(pkg => tourMap.set(pkg.id, pkg.name));
        return tourMap;
    } catch (error: any) {
        await logError(error, 'getAllTourNamesMap');
        return new Map();
    }
}
