'use client';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Timestamp } from 'firebase/firestore';
import type { BlogPost } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogPostClientProps {
  post: BlogPost;
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const displayDate = post.date instanceof Timestamp ? post.date.toDate().toLocaleDateString() : post.date;
  const isoDatePublished = post.date instanceof Timestamp ? post.date.toDate().toISOString() : new Date(post.date).toISOString();
  const isoDateModified = isoDatePublished; // Assuming no separate modified date for now

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.image,
    "datePublished": isoDatePublished,
    "dateModified": isoDateModified,
    "author": {
      "@type": "Person",
      "name": post.author,
      "image": post.authorPhoto || undefined,
      // "url": "https://happymountainnepal.com/about/teams/author-slug" // Optional: if author has a profile page
    },
    "publisher": {
      "@type": "Organization",
      "name": "Happy Mountain Nepal",
      "logo": {
        "@type": "ImageObject",
        "url": "https://neupgroup.com/content/p3happymountainnepal/logo.png" // Replace with your actual logo URL
      },
      "url": "https://happymountainnepal.com" // Replace with your actual domain
    },
    "description": post.excerpt,
    "articleBody": post.content,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://happymountainnepal.com/blog/${post.slug}` // Replace with your actual domain
    }
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
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
                <AvatarImage src={post.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author}`} />
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
            className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-h2:font-headline prose-h2:text-4xl prose-h3:font-headline prose-h3:text-2xl prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-ul:list-disc prose-ul:ml-6"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </div>
      </div>
    </article>
  );
}