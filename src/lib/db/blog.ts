
'use server';

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp, doc, updateDoc, deleteDoc, where, limit as firestoreLimit, startAfter, getDoc, FieldPath } from 'firebase/firestore';
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

export async function saveBlogPost(id: string | undefined, data: Omit<BlogPost, 'id' | 'date'> & { date?: string }): Promise<string> {
    if (!firestore) throw new Error("Database not available.");

    if (id) {
        // Update existing post
        const docRef = doc(firestore, 'blogPosts', id);
        await updateDoc(docRef, data);
        return id;
    } else {
        // Create new post
        const newPost = {
            ...data,
            date: serverTimestamp(),
        };
        const docRef = await addDoc(collection(firestore, 'blogPosts'), newPost);
        return docRef.id;
    }
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
    page?: number;
    status?: 'published' | 'draft';
    search?: string;
}): Promise<{ posts: BlogPost[]; hasMore: boolean; totalPages: number; totalCount: number; }> {
    if (!firestore) return { posts: [], hasMore: false, totalPages: 0, totalCount: 0 };

    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const searchTerm = options?.search?.toLowerCase().trim() || '';

    let baseQuery = query(collection(firestore, 'blogPosts'));
    
    if (options?.status) {
        baseQuery = query(baseQuery, where('status', '==', options.status));
    }
    
    // Apply search filter if provided
    // This is a basic implementation. For production, consider a search service like Algolia or Typesense.
    if (searchTerm) {
        // Firestore doesn't support case-insensitive search natively.
        // A common workaround is to store a lowercase version of fields to be searched.
        // For this implementation, we will fetch and filter, which is not efficient for large datasets.
    }
    
    // Get total count for pagination calculation
    const countSnapshot = await getDocs(query(baseQuery, where('status', '==', options?.status || 'published')));
    const allDocs = countSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<BlogPost, 'id'>}));

    const filteredDocs = searchTerm 
        ? allDocs.filter(doc => 
            doc.title.toLowerCase().includes(searchTerm) || 
            doc.author.toLowerCase().includes(searchTerm)
          )
        : allDocs;

    const totalCount = filteredDocs.length;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Paginate
    let paginatedQuery = query(baseQuery, orderBy('date', 'desc'), firestoreLimit(limit));

    if (page > 1) {
        // To get the cursor for the start of the desired page, we need to fetch the IDs of the previous pages.
        const offset = (page - 1) * limit;
        const cursorQuery = query(baseQuery, orderBy('date', 'desc'), firestoreLimit(offset));
        const cursorSnapshot = await getDocs(cursorQuery);
        const lastVisible = cursorSnapshot.docs[cursorSnapshot.docs.length - 1];
        if (lastVisible) {
            paginatedQuery = query(paginatedQuery, startAfter(lastVisible));
        }
    }

    const postsSnapshot = await getDocs(paginatedQuery);
    
    // Filter again as pagination was on the base query
    let posts = postsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date
        } as BlogPost;
    });

    if (searchTerm) {
        posts = posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) || 
            post.author.toLowerCase().includes(searchTerm)
        );
    }
    
    return { 
        posts, 
        hasMore: page < totalPages, 
        totalPages, 
        totalCount 
    };
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
