
'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { Log } from '@/lib/types';
import { logError } from './errors';

export async function createLog(data: Omit<Log, 'id' | 'timestamp'>): Promise<void> {
    if (!firestore) {
        console.error("Firestore is not initialized. Cannot create log.");
        return;
    }
    try {
        const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                (acc as any)[key] = value;
            }
            return acc;
        }, {} as Record<string, any>);

        await addDoc(collection(firestore, 'logs'), {
            ...cleanedData,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to create log in Firestore:', error);
    }
}

export async function getLogs(options?: {
    limit?: number;
    page?: number;
    cookieId?: string;
    resourceType?: 'page' | 'api' | 'static' | 'redirect';
    isBot?: boolean;
}): Promise<{ logs: Log[]; hasMore: boolean; totalPages: number }> {
    if (!firestore) return { logs: [], hasMore: false, totalPages: 0 };
    
    const limit = options?.limit || 10;
    const page = options?.page || 1;

    let q = query(collection(firestore, 'logs'), orderBy('timestamp', 'desc'));

    if (options?.cookieId) q = query(q, where('cookieId', '==', options.cookieId));
    if (options?.resourceType) q = query(q, where('resourceType', '==', options.resourceType));
    if (options?.isBot !== undefined) q = query(q, where('isBot', '==', options.isBot));

    const countSnapshot = await getDocs(q);
    const totalCount = countSnapshot.size;
    const totalPages = Math.ceil(totalCount / limit);

    const startIndex = (page - 1) * limit;
    const paginatedDocs = countSnapshot.docs.slice(startIndex, startIndex + limit);

    const logs = paginatedDocs.map(doc => {
        const data = doc.data();
        const timestamp = data.timestamp || Timestamp.now();
        return {
            id: doc.id,
            ...data,
            timestamp: timestamp.toDate().toISOString()
        } as Log;
    });

    const hasMore = page < totalPages;

    return { logs, hasMore, totalPages };
}

export async function getLogCount(options?: {
    cookieId?: string;
    resourceType?: 'page' | 'api' | 'static' | 'redirect';
    isBot?: boolean;
}): Promise<number> {
    if (!firestore) return 0;
    let q = query(collection(firestore, 'logs'));
    if (options?.cookieId) q = query(q, where('cookieId', '==', options.cookieId));
    if (options?.resourceType) q = query(q, where('resourceType', '==', options.resourceType));
    if (options?.isBot !== undefined) q = query(q, where('isBot', '==', options.isBot));
    const snapshot = await getDocs(q);
    return snapshot.size;
}

export async function deleteLog(id: string): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    await deleteDoc(doc(firestore, 'logs', id));
}

export async function clearOldLogs(daysToKeep: number = 30): Promise<number> {
    if (!firestore) throw new Error("Database not available.");
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

    const q = query(collection(firestore, 'logs'), where('timestamp', '<', cutoffTimestamp));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    return snapshot.size;
}

export async function getUniquePageLogs(options?: {
    limit?: number;
    page?: number;
    resourceType?: 'page' | 'api' | 'static' | 'redirect';
    isBot?: boolean;
}): Promise<{ logs: Log[]; hasMore: boolean; totalPages: number }> {
    if (!firestore) return { logs: [], hasMore: false, totalPages: 0 };
    let q = query(collection(firestore, 'logs'), orderBy('timestamp', 'desc'));
    if (options?.resourceType) q = query(q, where('resourceType', '==', options.resourceType));
    if (options?.isBot !== undefined) q = query(q, where('isBot', '==', options.isBot));

    const snapshot = await getDocs(q);
    const uniquePagesMap = new Map<string, Log>();

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const timestamp = data.timestamp || Timestamp.now();
        const log: Log = {
            id: doc.id,
            ...data,
            timestamp: timestamp.toDate().toISOString()
        } as Log;
        const pageKey = log.pageAccessed;
        if (!uniquePagesMap.has(pageKey)) {
            uniquePagesMap.set(pageKey, log);
        }
    });

    const allUniqueLogs = Array.from(uniquePagesMap.values()).sort((a, b) => new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime());

    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const totalCount = allUniqueLogs.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const logs = allUniqueLogs.slice(startIndex, startIndex + limit);

    return { logs, hasMore: page < totalPages, totalPages };
}
