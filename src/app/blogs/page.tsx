
'use client';

import { BlogCard } from '@/components/BlogCard';
import { useFirestore } from '@/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import type { BlogPost } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

export default function BlogPage() {
  const firestore = useFirestore();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;
    const fetchPosts = async () => {
      setIsLoading(true);
      const postsQuery = query(
        collection(firestore, 'blogPosts'),
        where('status', '==', 'published'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(postsQuery);
      const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
      setBlogPosts(posts);
      setIsLoading(false);
    };
    fetchPosts();
  }, [firestore]);

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold !font-headline">Travel Journal</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Guides, stories, and practical advice from our adventures in the Himalayas.
        </p>
      </div>

      {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-lg" />)}
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts?.map((post) => (
            <BlogCard key={post.id} post={post} />
            ))}
        </div>
      )}
    </div>
  );
}
