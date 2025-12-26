
'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp, doc, updateDoc, deleteDoc, where, limit as firestoreLimit, startAfter } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { BlogPost, ImportedBlogData } from '@/lib/types';
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

export async function checkBlogSlugAvailability(slug: string, excludePostId?: string): Promise<boolean> {
    if (!firestore) throw new Error("Database not available.");
    const q = query(collection(firestore, 'blogPosts'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    if (excludePostId) {
        return querySnapshot.docs.every(doc => doc.id === excludePostId);
    }
    return querySnapshot.empty;
}

export async function createBlogPost(): Promise<string | null> {
    if (!firestore) return null;
    const newPost: Omit<BlogPost, 'id' | 'slug' | 'date'> & { date: any } = {
        title: 'New Untitled Post',
        content: '<p>Start writing your amazing blog post here...</p>',
        excerpt: '',
        author: 'Admin',
        authorPhoto: 'https://picsum.photos/seed/admin-avatar/400/400',
        date: serverTimestamp(),
        image: 'https://picsum.photos/seed/blog-placeholder/800/500',
        status: 'draft',
        metaInformation: '',
    };
    const docRef = await addDoc(collection(firestore, 'blogPosts'), newPost);
    return docRef.id;
}

export async function createBlogPostWithData(data: ImportedBlogData): Promise<string | null> {
    if (!firestore) throw new Error("Database not available.");

    const slug = slugify(data.title);
    if (!await checkBlogSlugAvailability(slug)) {
        throw new Error(`A blog post with the slug '${slug}' already exists.`);
    }

    const newPost: Omit<BlogPost, 'id' | 'slug' | 'date'> & { date: any } = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        author: data.author || 'Admin',
        authorPhoto: '',
        date: serverTimestamp(),
        image: data.image,
        status: 'draft',
        metaInformation: '',
    };
    const docRef = await addDoc(collection(firestore, 'blogPosts'), newPost);
    await updateDoc(docRef, { slug });
    return docRef.id;
}

export async function updateBlogPost(id: string, data: Partial<Omit<BlogPost, 'id'>>) {
    if (!firestore) throw new Error("Database not available.");
    const docRef = doc(firestore, 'blogPosts', id);
    await updateDoc(docRef, data);
}

export async function deleteBlogPost(id: string) {
    if (!firestore) throw new Error("Database not available.");
    await deleteDoc(doc(firestore, 'blogPosts', id));
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
    return getDocById<BlogPost>('blogPosts', id);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    return getDocBySlug<BlogPost>('blogPosts', slug);
}

export async function getBlogPosts(options?: {
    limit?: number;
    lastDocId?: string | null;
    status?: 'published' | 'draft';
    search?: string;
}): Promise<{ posts: BlogPost[]; hasMore: boolean; totalPages: number; }> {
    if (!firestore) return { posts: [], hasMore: false, totalPages: 0 };
    
    const limit = options?.limit || 10;
    
    // Base query for counting
    let countQuery = query(collection(firestore, 'blogPosts'));
    if (options?.status) {
        countQuery = query(countQuery, where('status', '==', options.status));
    }
     if (options?.search) {
        // This is a simplified search. For production, consider a dedicated search service.
        countQuery = query(countQuery, where('title', '>=', options.search), where('title', '<=', options.search + '\uf8ff'));
    }
    const countSnapshot = await getDocs(countQuery);
    const totalCount = countSnapshot.size;
    const totalPages = Math.ceil(totalCount / limit);

    // Data query with pagination
    let dataQuery = query(collection(firestore, 'blogPosts'), orderBy('date', 'desc'));
    if (options?.status) {
        dataQuery = query(dataQuery, where('status', '==', options.status));
    }
    if (options?.search) {
        dataQuery = query(dataQuery, where('title', '>=', options.search), where('title', '<=', options.search + '\uf8ff'));
    }
    
    if (options?.lastDocId) {
        const lastDoc = await getDoc(doc(firestore, 'blogPosts', options.lastDocId));
        if (lastDoc.exists()) {
            dataQuery = query(dataQuery, startAfter(lastDoc));
        }
    }

    dataQuery = query(dataQuery, firestoreLimit(limit + 1));
    const querySnapshot = await getDocs(dataQuery);

    const posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date
        } as BlogPost;
    });

    const hasMore = posts.length > limit;
    if (hasMore) {
        posts.pop(); // Remove the extra item
    }

    return { posts, hasMore, totalPages };
}


export async function getBlogPostCount(status?: 'published' | 'draft'): Promise<number> {
    if (!firestore) return 0;
    let q = query(collection(firestore, 'blogPosts'));
    if (status) {
        q = query(q, where('status', '==', status));
    }
    const snapshot = await getDocs(q);
    return snapshot.size;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
    if (!firestore) return [];
    const q = query(collection(firestore, 'blogPosts'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
}
