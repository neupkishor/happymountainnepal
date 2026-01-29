#!/usr/bin/env tsx

/**
 * Migration Script: Firestore to SQLite - Packages
 * 
 * This script migrates all packages from Firestore to SQLite database.
 * It handles complex nested data structures and provides progress reporting.
 * 
 * Usage: npx tsx scripts/migrate-packages.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';
import { savePackage } from '../src/lib/db/sqlite';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};

function log(message: string, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

// Initialize Firebase if not already initialized
function initializeFirebase() {
    if (getApps().length === 0) {
        initializeApp(firebaseConfig);
        log('✅ Firebase initialized', colors.green);
    }

    return getFirestore();
}

// Convert Firestore Timestamp to ISO string
function convertTimestamp(value: any): string | undefined {
    if (!value) return undefined;
    if (value.toDate && typeof value.toDate === 'function') {
        return value.toDate().toISOString();
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (typeof value === 'string') {
        return value;
    }
    return undefined;
}

// Normalize package data for SQLite
function normalizePackageData(firestoreDoc: any) {
    const data = firestoreDoc.data();
    const id = firestoreDoc.id;

    // Handle departure dates with Timestamps
    const departureDates = (data.departureDates || []).map((dd: any) => ({
        date: convertTimestamp(dd.date) || '',
        price: dd.price || 0,
        guaranteed: dd.guaranteed || false
    }));

    // Handle reviews with Timestamps
    const reviews = (data.reviews || []).map((review: any) => ({
        ...review,
        date: convertTimestamp(review.date)
    }));

    // Ensure mainImage has proper structure
    let mainImage = data.mainImage || { url: '' };
    if (typeof mainImage === 'string') {
        mainImage = { url: mainImage };
    }

    return {
        id,
        name: data.name || 'Untitled Package',
        slug: data.slug || id,
        description: data.description || '',
        shortDescription: data.shortDescription || '',
        region: Array.isArray(data.region) ? data.region : [],
        type: data.type || 'Trekking',
        difficulty: data.difficulty || 'Moderate',
        duration: data.duration || 0,
        price: data.price || 0,
        mainImage,
        images: data.images || [],
        itinerary: data.itinerary || [],
        inclusions: data.inclusions || [],
        exclusions: data.exclusions || [],
        departureDates,
        anyDateAvailable: data.anyDateAvailable || false,
        map: data.map || '',
        reviews,
        status: data.status || 'draft',
        faq: data.faq || [],
        additionalInfoSections: data.additionalInfoSections || [],
        bookingType: data.bookingType || 'internal',
        externalBookingUrl: data.externalBookingUrl || '',
        gears: data.gears || [],
        guides: data.guides || [],
        searchKeywords: data.searchKeywords || [],
        createdAt: convertTimestamp(data.createdAt) || new Date().toISOString(),
    };
}

async function migratePackages() {
    log('\n🚀 Starting Package Migration from Firestore to SQLite', colors.bright + colors.cyan);
    log('─'.repeat(60), colors.cyan);

    try {
        const firestore = initializeFirebase();

        log('\n📦 Fetching packages from Firestore...', colors.yellow);
        const packagesSnapshot = await getDocs(collection(firestore, 'packages'));

        const totalPackages = packagesSnapshot.size;
        log(`✅ Found ${totalPackages} packages in Firestore`, colors.green);

        if (totalPackages === 0) {
            log('\n⚠️  No packages found to migrate', colors.yellow);
            return;
        }

        log('\n🔄 Starting migration...', colors.cyan);

        let successCount = 0;
        let errorCount = 0;
        const errors: { id: string; name: string; error: string }[] = [];

        for (const doc of packagesSnapshot.docs) {
            try {
                const packageData = normalizePackageData(doc);
                savePackage(packageData);
                successCount++;

                // Progress indicator
                const progress = Math.round((successCount + errorCount) / totalPackages * 100);
                process.stdout.write(`\r📊 Progress: ${progress}% (${successCount + errorCount}/${totalPackages})`);
            } catch (error: any) {
                errorCount++;
                errors.push({
                    id: doc.id,
                    name: doc.data().name || 'Unknown',
                    error: error.message
                });
            }
        }

        // Final results
        log('\n\n' + '─'.repeat(60), colors.cyan);
        log('✅ Migration Complete!', colors.bright + colors.green);
        log('─'.repeat(60), colors.cyan);
        log(`\n📊 Summary:`, colors.bright);
        log(`  ✅ Successfully migrated: ${successCount} packages`, colors.green);

        if (errorCount > 0) {
            log(`  ❌ Failed: ${errorCount} packages`, colors.red);
            log(`\n❌ Errors:`, colors.red);
            errors.forEach(({ id, name, error }) => {
                log(`  - Package: "${name}" (ID: ${id})`, colors.yellow);
                log(`    Error: ${error}`, colors.red);
            });
        }

        log('\n✅ All packages have been migrated to SQLite!', colors.green);
        log('You can now update your application to use SQLite functions.\n', colors.cyan);

    } catch (error: any) {
        log(`\n❌ Migration failed: ${error.message}`, colors.red);
        if (error.stack) {
            log(error.stack, colors.red);
        }
        process.exit(1);
    }
}

// Run the migration
migratePackages()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        log(`\n❌ Unexpected error: ${error.message}`, colors.red);
        process.exit(1);
    });
