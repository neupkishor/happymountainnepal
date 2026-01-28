
import { collection, getDocs, doc, updateDoc, Timestamp, query, limit } from 'firebase/firestore';
import { firestore } from '../src/lib/firebase-server';
import { saveUpload } from '../src/lib/db/sqlite';

async function migrateUploads() {
    console.log('Starting migration of uploads from Firebase to SQLite...');

    if (!firestore) {
        console.error('Firestore not initialized. Check your firebase-server configuration.');
        process.exit(1);
    }

    try {
        const uploadsRef = collection(firestore, 'uploads');
        // We can process in batches if there are many, but for a simple script, fetching all might be okay.
        // If there are thousands, we might want to paginate, but let's start simple.
        // Let's grab all of them.
        const snapshot = await getDocs(uploadsRef);

        console.log(`Found ${snapshot.size} uploads in Firebase.`);

        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();

            if (data.isMoved) {
                console.log(`Skipping ${docSnapshot.id} (already moved)`);
                skippedCount++;
                continue;
            }

            try {
                console.log(`Migrating ${docSnapshot.id}...`);

                // Convert timestamps to ISO strings
                const uploadedAt = data.uploadedAt instanceof Timestamp
                    ? data.uploadedAt.toDate().toISOString()
                    : (typeof data.uploadedAt === 'string' ? data.uploadedAt : new Date().toISOString());

                const createdAt = data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate().toISOString()
                    : (typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString());

                // uploadedOn seems to be a string based on usage in existing code, but let's be safe
                const uploadedOn = typeof data.uploadedOn === 'string'
                    ? data.uploadedOn
                    : new Date().toISOString();

                const uploadData = {
                    id: docSnapshot.id,
                    name: data.name || 'Untitled',
                    url: data.url || '',
                    uploadedBy: data.uploadedBy || 'Unknown',
                    type: data.type || 'application/octet-stream', // Default type
                    size: typeof data.size === 'number' ? data.size : 0,
                    tags: Array.isArray(data.tags) ? data.tags : [],
                    meta: Array.isArray(data.meta) ? data.meta : [],
                    uploadedOn: uploadedOn,
                    uploadedAt: uploadedAt,
                    createdAt: createdAt
                };

                // Save to SQLite
                saveUpload(uploadData);

                // Update Firebase to mark as moved
                await updateDoc(docSnapshot.ref, {
                    isMoved: true
                });

                console.log(`Successfully migrated ${docSnapshot.id}`);
                migratedCount++;

            } catch (err) {
                console.error(`Error migrating ${docSnapshot.id}:`, err);
                errorCount++;
            }
        }

        console.log('\nMigration complete.');
        console.log(`Migrated: ${migratedCount}`);
        console.log(`Skipped: ${skippedCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (error) {
        console.error('Fatal error during migration:', error);
        process.exit(1);
    }
}

migrateUploads();
