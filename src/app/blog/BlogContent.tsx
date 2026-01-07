
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

export function BlogContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const result = await getBlogPosts({
                    limit: ITEMS_PER_PAGE,
                    page: currentPage,
                    status: 'published'
                });
                setBlogPosts(result.posts);
                setHasMore(result.hasMore);
                setTotalCount(result.totalCount);
                setTotalPages(result.totalPages);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [currentPage]);
    
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            router.push(`/blog?page=${page}`);
            window.scrollTo(0, 0);
        }
    };

    return (
        <>
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
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t pt-8 mt-8">
                            <div className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages || 1}
                            </div>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1 || isLoading}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => goToPage(currentPage + 1)}
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
        </>
    );
}
