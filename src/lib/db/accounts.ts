
'use server';

import { getFirestore, collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { Account, Activity, DisplayUser } from '@/lib/types';
import { logError } from './errors';

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


export async function getPaginatedUsers(options: { page: number, limit: number }): Promise<{
    users: DisplayUser[],
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    }
}> {
    if (!firestore) throw new Error("Database not available.");

    const { page, limit } = options;

    // 1. Fetch all registered accounts
    const accountsSnapshot = await getDocs(collection(firestore, 'accounts'));
    const registeredUsers = new Map<string, Account>();
    accountsSnapshot.forEach(doc => {
        registeredUsers.set(doc.id, { id: doc.id, ...doc.data() } as Account);
    });

    // 2. Fetch all logs to get anonymous users and activity data
    const logsSnapshot = await getDocs(query(collection(firestore, 'logs'), orderBy('timestamp', 'desc')));

    // 3. Process logs to get unique users, activity counts, and last seen dates
    const userActivityMap = new Map<string, { activityCount: number; lastSeen: Timestamp; identifier: string; type: 'Permanent' | 'Temporary' }>();

    logsSnapshot.forEach(doc => {
        const log = doc.data() as any;
        const id = log.accountId || log.cookieId;

        if (!id) return;

        if (!userActivityMap.has(id)) {
            const account = registeredUsers.get(id);
            userActivityMap.set(id, {
                activityCount: 0,
                lastSeen: log.timestamp as Timestamp,
                identifier: account ? account.email : log.cookieId,
                type: account ? 'Permanent' : 'Temporary',
            });
        }

        const userData = userActivityMap.get(id)!;
        userData.activityCount += 1;
        // The first log we see for a user is the latest one due to sorting
    });

    // 4. Convert map to array for sorting and pagination
    const allUsers = Array.from(userActivityMap.entries()).map(([id, data]) => ({
        id,
        ...data,
        lastSeen: data.lastSeen.toDate().toISOString(),
    }));

    // Sort by last seen date
    allUsers.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

    // 5. Apply pagination
    const totalCount = allUsers.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const paginatedUsers = allUsers.slice(startIndex, startIndex + limit);

    return {
        users: paginatedUsers,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
}
