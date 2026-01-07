
'use client';

import { BlogCard } from '@/components/BlogCard';
import type { BlogPost } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE = 12;

export function BlogContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Read state from URL
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const initialSearch = searchParams.get('search') || '';
    const initialTags = searchParams.get('tags')?.split(',').map(tag => tag.trim()).filter(Boolean) || [];

    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [activeTags, setActiveTags] = useState<string[]>(initialTags);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (debouncedSearchTerm) {
            params.set('search', debouncedSearchTerm);
        } else {
            params.delete('search');
        }

        if (activeTags.length > 0) {
            params.set('tags', activeTags.join(','));
        } else {
            params.delete('tags');
        }
        
        // Reset to page 1 when filters change
        params.set('page', '1');

        router.replace(`${window.location.pathname}?${params.toString()}`);
    }, [debouncedSearchTerm, activeTags, router]);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    limit: String(ITEMS_PER_PAGE),
                    page: String(currentPage),
                    search: debouncedSearchTerm,
                    tags: activeTags.join(','),
                });

                const response = await fetch(`/api/blog?${queryParams.toString()}`);
                const data = await response.json();
                
                setBlogPosts(data.posts);
                setHasMore(data.hasMore);
                setTotalCount(data.totalCount);
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [currentPage, debouncedSearchTerm, activeTags]);
    
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            const params = new URLSearchParams(searchParams);
            params.set('page', page.toString());
            router.push(`/blog?${params.toString()}`);
            window.scrollTo(0, 0);
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        setActiveTags(prev => prev.filter(t => t !== tagToRemove));
    };

    return (
        <>
            <div className="max-w-xl mx-auto mb-8">
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

            {activeTags.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                    <span className="text-sm font-semibold">Filtered by:</span>
                    {activeTags.map(tag => (
                        <Badge key={tag} variant="default" className="py-1 px-3">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="ml-2 rounded-full hover:bg-background/20 p-0.5">
                                <X className="h-3 w-3"/>
                            </button>
                        </Badge>
                    ))}
                </div>
            )}


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
                    <p className="text-muted-foreground text-lg">No posts found for your search or filter.</p>
                </div>
            )}
        </>
    );
}
