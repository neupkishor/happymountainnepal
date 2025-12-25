
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { BlogManagementCard } from '@/components/manage/BlogTableRow'; // Re-using as card
import { getBlogPosts } from '@/lib/db';
import type { BlogPost } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';

const ITEMS_PER_PAGE = 10;

export function ManageBlogContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const [searchTerm, setSearchTerm] = useState('');

    const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchAllPosts = async () => {
            setLoading(true);
            try {
                // Fetch all posts for client-side search.
                // In a very large application, we would implement server-side search.
                const posts = [];
                let hasMore = true;
                let lastDocId: string | null = null;
                while (hasMore) {
                    const result = await getBlogPosts({ limit: 50, lastDocId });
                    posts.push(...result.posts);
                    hasMore = result.hasMore;
                    if(result.posts.length > 0) {
                        lastDocId = result.posts[result.posts.length - 1].id;
                    }
                }
                setAllPosts(posts);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllPosts();
    }, []);

    const filteredPosts = useMemo(() => {
        return allPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allPosts, searchTerm]);

    const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
    const paginatedPosts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredPosts, currentPage]);


    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            router.push(`/manage/blog?page=${newPage}`);
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
                ) : paginatedPosts.length > 0 ? (
                    paginatedPosts.map((post) => (
                        <BlogManagementCard key={post.id} post={post} />
                    ))
                ) : (
                    <Card>
                        <CardContent className="text-center py-16 text-muted-foreground">
                            No posts found.
                        </CardContent>
                    </Card>
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-6 mt-6">
                    <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || loading}
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
