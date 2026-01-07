
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { BlogManagementCard } from '@/components/manage/BlogTableRow';
import type { BlogPost } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';

const ITEMS_PER_PAGE = 10;

export function ManageBlogContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasMore: false,
    });

    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchPosts = async (page: number, search: string) => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    limit: String(ITEMS_PER_PAGE),
                    page: String(page),
                    search: search,
                });

                const response = await fetch(`/api/blog?${queryParams.toString()}`);
                const data = await response.json();

                setPosts(data.posts || []);
                setPagination({
                    currentPage: page,
                    totalPages: data.totalPages || 0,
                    totalCount: data.totalCount || 0,
                    hasMore: data.hasMore || false,
                });

            } catch (error) {
                console.error("Failed to fetch posts", error);
                setPosts([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 0,
                    totalCount: 0,
                    hasMore: false,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPosts(currentPage, debouncedSearchTerm);
    }, [debouncedSearchTerm, currentPage]);

    // Update URL when search term changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (debouncedSearchTerm) {
            params.set('search', debouncedSearchTerm);
            params.set('page', '1'); // Reset to page 1 on new search
        } else {
            params.delete('search');
        }
        
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        router.replace(newUrl, { scroll: false });
    }, [debouncedSearchTerm, router]);


    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            const params = new URLSearchParams();

            if (debouncedSearchTerm) {
                params.set('search', debouncedSearchTerm);
            }

            if (newPage > 1) {
                params.set('page', String(newPage));
            }

            const newUrl = params.toString() ? `/manage/blog?${params.toString()}` : '/manage/blog';
            router.push(newUrl, { scroll: false });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold !font-headline">Blog Posts</h1>
                    <p className="text-muted-foreground mt-2">Create and manage your articles.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/manage/blog/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create New Post
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="relative pt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by title or author..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {loading ? (
                    [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                ) : posts.length > 0 ? (
                    posts.map((post) => (
                        <BlogManagementCard key={post.id} post={post} />
                    ))
                ) : (
                    <Card>
                        <CardContent className="text-center py-16 text-muted-foreground">
                            No posts found for your search query.
                        </CardContent>
                    </Card>
                )}
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-6 mt-6">
                    <div className="text-sm text-muted-foreground">
                        Page {pagination.currentPage} of {pagination.totalPages}
                        {pagination.totalCount > 0 && (
                            <span className="ml-2">({pagination.totalCount} total {pagination.totalCount === 1 ? 'post' : 'posts'})</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasMore || loading}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
