
'use server';

import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { TeamMember, TeamGroup } from '@/lib/types';
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
    const q = query(collection(firestore, collectionName), where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as T;
}

export async function addTeamMember(data: Omit<TeamMember, 'id' | 'slug'>) {
    if (!firestore) throw new Error("Database not available.");
    const slug = slugify(data.name);
    const newMember = { ...data, slug };
    await addDoc(collection(firestore, 'teamMembers'), newMember);
}

export async function updateTeamMember(id: string, data: Partial<Omit<TeamMember, 'id' | 'slug'>>) {
    if (!firestore) throw new Error("Database not available.");
    const slug = slugify(data.name || '');
    const docRef = doc(firestore, 'teamMembers', id);
    const currentDoc = await getDoc(docRef);
    const currentData = currentDoc.data() as TeamMember | undefined;
    let finalData: Partial<TeamMember> = { ...data, slug };

    if (data.groupId !== undefined && data.groupId !== currentData?.groupId) {
        if (data.groupId === null) {
            finalData.orderIndex = 0;
        } else {
            const membersInNewGroupQuery = query(
                collection(firestore, 'teamMembers'),
                where('groupId', '==', data.groupId)
            );
            const snapshot = await getDocs(membersInNewGroupQuery);
            finalData.orderIndex = snapshot.size;
        }
    }
    await updateDoc(docRef, finalData);
}

export async function deleteTeamMember(id: string) {
    if (!firestore) throw new Error("Database not available.");
    const docRef = doc(firestore, 'teamMembers', id);
    await deleteDoc(docRef);
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
    return getDocById<TeamMember>('teamMembers', id);
}

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | null> {
    return getDocBySlug<TeamMember>('teamMembers', slug);
}

export async function getTeamMembers(): Promise<TeamMember[]> {
    if (!firestore) return [];
    const teamMembersRef = collection(firestore, 'teamMembers');
    const q = query(teamMembersRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
}

export async function createTeamGroup(data: Omit<TeamGroup, 'id'>): Promise<string> {
    if (!firestore) throw new Error("Database not available.");
    const docRef = await addDoc(collection(firestore, 'teamGroups'), data);
    return docRef.id;
}

export async function updateTeamGroup(id: string, data: Partial<Omit<TeamGroup, 'id'>>): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    const docRef = doc(firestore, 'teamGroups', id);
    await updateDoc(docRef, data);
}

export async function deleteTeamGroup(id: string): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    const membersRef = collection(firestore, 'teamMembers');
    const q = query(membersRef, where('groupId', '==', id));
    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(doc =>
        updateDoc(doc.ref, { groupId: null, orderIndex: null })
    );
    await Promise.all(updatePromises);
    await deleteDoc(doc(firestore, 'teamGroups', id));
}

export async function getTeamGroups(): Promise<TeamGroup[]> {
    if (!firestore) return [];
    const groupsRef = collection(firestore, 'teamGroups');
    const q = query(groupsRef, orderBy('orderIndex', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamGroup));
}

export async function updateTeamMemberPosition(id: string, groupId: string | null, orderIndex: number): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    const docRef = doc(firestore, 'teamMembers', id);
    await updateDoc(docRef, { groupId, orderIndex });
}

export async function batchUpdateTeamMemberPositions(updates: { id: string; groupId: string | null; orderIndex: number }[]): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    const updatePromises = updates.map(({ id, groupId, orderIndex }) => {
        const docRef = doc(firestore, 'teamMembers', id);
        return updateDoc(docRef, { groupId, orderIndex });
    });
    await Promise.all(updatePromises);
}

export async function batchUpdateTeamGroupOrder(updates: { id: string; orderIndex: number }[]): Promise<void> {
    if (!firestore) throw new Error("Database not available.");
    const updatePromises = updates.map(({ id, orderIndex }) => {
        const docRef = doc(firestore, 'teamGroups', id);
        return updateDoc(docRef, { orderIndex });
    });
    await Promise.all(updatePromises);
}
