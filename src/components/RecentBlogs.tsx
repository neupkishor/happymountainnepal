
'use client';
import { useState, useEffect } from 'react';
import { getRecentBlogPosts } from "@/lib/db";
import type { BlogPost } from '@/lib/types';
import { BlogCard } from "./BlogCard";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { Skeleton } from './ui/skeleton';

export function RecentBlogs() {
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentBlogPosts().then(posts => {
        setRecentPosts(posts.slice(0, 3));
        setLoading(false);
    });
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold !font-headline">From Our Travel Journal</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Tips, stories, and guides to inspire your next Himalayan journey.
          </p>
        </div>
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-lg" />)}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
            ))}
            </div>
        )}
        <div className="text-center mt-12">
          <Link href="/blogs">
            <Button size="lg" variant="outline">
              Read More Articles <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
