
'use client';

import { BlogCard } from '@/components/BlogCard';
import { getBlogPosts } from '@/lib/db';
import type { BlogPost } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';

const ITEMS_PER_PAGE = 12;

export function BlogContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const initialSearch = searchParams.get('search') || '';

    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (debouncedSearchTerm) {
            params.set('search', debouncedSearchTerm);
            params.set('page', '1'); // Reset to page 1 on new search
        } else {
            params.delete('search');
        }

        router.replace(`${window.location.pathname}?${params.toString()}`);
    }, [debouncedSearchTerm, router]);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const result = await getBlogPosts({
                    limit: ITEMS_PER_PAGE,
                    page: currentPage,
                    status: 'published',
                    search: debouncedSearchTerm
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
    }, [currentPage, debouncedSearchTerm]);
    
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            const params = new URLSearchParams(searchParams);
            params.set('page', page.toString());
            router.push(`/blog?${params.toString()}`);
            window.scrollTo(0, 0);
        }
    };

    return (
        <>
            <div className="max-w-xl mx-auto mb-12">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search articles by title or author..."
                        className="pl-10 h-12 text-base rounded-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
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
                    <p className="text-muted-foreground text-lg">No posts found for your search.</p>
                </div>
            )}
        </>
    );
}
