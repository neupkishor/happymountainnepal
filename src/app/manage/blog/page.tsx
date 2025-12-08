'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { PlusCircle, Wand2, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogTableRow } from '@/components/manage/BlogTableRow';
import { getBlogPosts, getBlogPostCount } from '@/lib/db';
import type { BlogPost } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';

const ITEMS_PER_PAGE = 10;

export default function BlogListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  // pageHistory stores the last document ID for each page.
  // Index 0 is null (start of page 1). Index 1 is last doc of page 1 (start of page 2).
  const [pageHistory, setPageHistory] = useState<(string | null)[]>([null]);

  // Fetch total count on mount
  useEffect(() => {
    async function fetchCount() {
      const count = await getBlogPostCount();
      setTotalCount(count);
    }
    fetchCount();
  }, []);

  // Fetch posts when page or history changes
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // If we are on page 1, lastDocId is null.
        // If we are on page 2, we need pageHistory[1] (which should be set by Next button).
        // However, if user directly navigates to page=2, we might not have history.
        // This simple cursor implementation relies on sequential navigation for deep pages,
        // OR we would need an offset-based query (expensive in Firestore) or a way to specificy "jump to".
        // For now, we assume sequential or reset to 1 if history missing for deep page.

        if (currentPage > 1 && !pageHistory[currentPage - 1]) {
          // Missing history for this page, redirect to first page or handle gracefully
          // Ideally we shouldn't allow deep linking without offset support, but for now:
          router.replace('/manage/blog?page=1');
          return;
        }

        const lastDocId = pageHistory[currentPage - 1];
        const result = await getBlogPosts({ limit: ITEMS_PER_PAGE, lastDocId });
        setPosts(result.posts);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [currentPage, pageHistory, router]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const goToNextPage = () => {
    if (hasMore && posts.length > 0) {
      const lastDocId = posts[posts.length - 1].id;
      // Ensure we don't duplicate history if user clicks multiple times or it's already set
      setPageHistory(prev => {
        const newHistory = [...prev];
        newHistory[currentPage] = lastDocId; // Set expected start for NEXT page (index currentPage)
        return newHistory;
      });
      router.push(`/manage/blog?page=${currentPage + 1}`);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      router.push(`/manage/blog?page=${currentPage - 1}`);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold !font-headline">Blog Posts</h1>
          <p className="text-muted-foreground mt-2">Create and manage your articles.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/manage/import/blog">
              <Wand2 className="mr-2 h-4 w-4" />
              Import from URL
            </Link>
          </Button>
          <Button asChild>
            <Link href="/manage/blog/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Post
            </Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Blog Posts</CardTitle>
          <CardDescription>
            Here you can create, edit, and manage all blog posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Skeleton className="w-full h-10" />
                  </TableCell>
                </TableRow>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <BlogTableRow key={post.id} post={post} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalCount > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between border-t pt-6 mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages || 1}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={!hasMore || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
