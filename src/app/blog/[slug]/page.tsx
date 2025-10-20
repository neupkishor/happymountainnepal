
'use client';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Timestamp } from 'firebase/firestore';
import { useFirestore, useDoc } from '@/firebase';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import type { BlogPost } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type BlogDetailPageProps = {
  params: {
    slug: string;
  };
};

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = params;
  const firestore = useFirestore();
  const [postId, setPostId] = useState<string | null>(null);
  const [isLoadingId, setIsLoadingId] = useState(true);

  useEffect(() => {
    if (!firestore || !slug) return;
    const findPost = async () => {
      setIsLoadingId(true);
      const q = query(collection(firestore, 'blogPosts'), where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setPostId(querySnapshot.docs[0].id);
      }
      setIsLoadingId(false);
    };
    findPost();
  }, [firestore, slug]);
  
  const postRef = postId ? doc(firestore, 'blogPosts', postId) : null;
  const { data: post, isLoading: isLoadingPost } = useDoc<BlogPost>(postRef);

  const isLoading = isLoadingId || isLoadingPost;


  if (isLoading || !post) {
    return (
        <article>
            <header className="relative h-[40vh] md:h-[50vh] w-full">
                <Skeleton className="h-full w-full" />
            </header>
            <div className="container mx-auto py-12">
                <div className="max-w-3xl mx-auto space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </div>
        </article>
    );
  }

  const displayDate = post.date instanceof Timestamp ? post.date.toDate().toLocaleDateString() : post.date;

  return (
    <article>
      <header className="relative h-[40vh] md:h-[50vh] w-full">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
          data-ai-hint="travel landscape"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
        <div className="container mx-auto h-full flex flex-col justify-end pb-12 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold !font-headline text-white">{post.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author}`} />
                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{post.author}</span>
            </div>
            <span>&bull;</span>
            <time dateTime={new Date(displayDate).toISOString()}>{displayDate}</time>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-12">
        <div className="max-w-3xl mx-auto">
          <div 
            className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-h3:font-headline prose-h3:text-2xl prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-ul:list-disc prose-ul:ml-6"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </div>
      </div>
    </article>
  );
}
