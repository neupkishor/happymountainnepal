'use client';

import { BlogCard } from '@/components/BlogCard';
import { getBlogPosts, getBlogPostCount } from '@/lib/db';
import type { BlogPost } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function BlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageHistory, setPageHistory] = useState<(string | null)[]>([null]);

  useEffect(() => {
    async function fetchCount() {
      const count = await getBlogPostCount('published');
      setTotalCount(count);
    }
    fetchCount();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        if (currentPage > 1 && !pageHistory[currentPage - 1]) {
          router.replace('/blog?page=1');
          return;
        }

        const lastDocId = pageHistory[currentPage - 1];
        const result = await getBlogPosts({
          limit: ITEMS_PER_PAGE,
          lastDocId,
          status: 'published'
        });
        setBlogPosts(result.posts);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [currentPage, pageHistory, router]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const goToNextPage = () => {
    if (hasMore && blogPosts.length > 0) {
      const lastDocId = blogPosts[blogPosts.length - 1].id;
      setPageHistory(prev => {
        const newHistory = [...prev];
        newHistory[currentPage] = lastDocId;
        return newHistory;
      });
      router.push(`/blog?page=${currentPage + 1}`);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      router.push(`/blog?page=${currentPage - 1}`);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold !font-headline">Travel Journal</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Guides, stories, and practical advice from our adventures in the Himalayas.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-lg" />)}
        </div>
      ) : blogPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalCount > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between border-t pt-8 mt-8">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages || 1}
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={!hasMore || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No posts found.</p>
        </div>
      )}
    </div>
  );
}
