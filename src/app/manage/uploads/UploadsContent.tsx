
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFileUploads, getFileUploadsCount, deleteFileUpload } from '@/lib/db';
import { UploadDialog } from '@/components/upload/UploadDialog';
import { formatDistanceToNow } from 'date-fns';
import { PictureInPicture, ChevronLeft, ChevronRight, ExternalLink, FileIcon, Trash2, Plus, Copy, MoreHorizontal, Link as LinkIcon, Upload } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { FileUpload } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { SmartImage } from '@/components/ui/smart-image';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const ITEMS_PER_PAGE = 10;

export function UploadsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [fileItems, setFileItems] = useState<FileUpload[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const { toast } = useToast();

    const handleDelete = async (fileId: string) => {
        if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteFileUpload(fileId);
            toast({
                title: 'File Deleted',
                description: 'The file has been successfully removed.',
            });
            fetchData(currentPage); // Refetch current page
        } catch (error) {
            console.error('Failed to delete file:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete the file. Please try again.',
            });
        }
    };

    const fetchData = async (page: number) => {
        setIsLoading(true);
        try {
            const result = await getFileUploads({
                limit: ITEMS_PER_PAGE,
                page: page
            });
            setFileItems(result.uploads);
            setHasMore(result.hasMore);
            setTotalCount(result.totalCount || 0);
            setTotalPages(result.totalPages || 0);
        } catch (error) {
            console.error('Error fetching uploads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);


    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            router.push(`/manage/uploads?page=${page}`);
        }
    };

    const handleUploadComplete = () => {
        fetchData(1);
        if (currentPage !== 1) {
            router.push('/manage/uploads?page=1');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied', description: 'URL copied to clipboard.' });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold !font-headline">Uploads Library</h1>
                    <p className="text-muted-foreground mt-2">
                        {totalCount} {totalCount === 1 ? 'file' : 'files'} uploaded
                    </p>
                </div>
                <div className="flex flex-col items-end">
                </div>
            </div>

            <UploadDialog
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
                onUploadComplete={handleUploadComplete}
            />

            {isLoading ? (
                <div className="space-y-4 mb-8">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-4 border rounded-lg bg-card animate-pulse"
                        >
                            <div className="h-16 w-24 rounded-md bg-muted flex-shrink-0"></div>
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="h-5 bg-muted rounded w-3/4"></div>
                                <div className="flex items-center gap-3">
                                    <div className="h-4 bg-muted rounded w-20"></div>
                                    <div className="h-4 bg-muted rounded w-24"></div>
                                </div>
                            </div>
                            <div className="h-9 w-20 bg-muted rounded flex-shrink-0"></div>
                        </div>
                    ))}
                </div>
            ) : fileItems.length > 0 || currentPage === 1 ? (
                <div className="space-y-4 mb-8">
                    {/* Action Cards (Only on Page 1) */}
                    {currentPage === 1 && (
                        <>
                            <Card
                                className="cursor-pointer border-dashed hover:bg-primary/5 transition-colors"
                                onClick={() => setIsUploadDialogOpen(true)}
                            >
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="h-16 w-24 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Upload className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-primary">Upload New File</h3>
                                        <p className="text-sm text-muted-foreground">Drag & drop or click to upload from your device.</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Plus className="h-5 w-5 text-primary" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Link href="/manage/uploads/linked" className="block">
                                <Card className="cursor-pointer border-dashed hover:bg-primary/5 transition-colors">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="h-16 w-24 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <LinkIcon className="h-8 w-8 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-primary">Add from URL (Bulk)</h3>
                                            <p className="text-sm text-muted-foreground">Add images by pasting their URLs.</p>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <ArrowRightIcon className="h-5 w-5 text-primary" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </>
                    )}

                    {/* File List */}
                    {fileItems.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <Link href={`/manage/uploads/${item.id}`} className="block flex-shrink-0">
                                    <div className="relative h-16 w-24 rounded-md overflow-hidden bg-muted">
                                        {item.type?.startsWith('image/') ? (
                                            <SmartImage
                                                src={item.url}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                                                <FileIcon className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <div className="flex-1 min-w-0">
                                    <Link href={`/manage/uploads/${item.id}`} className="font-medium hover:underline text-base truncate block mb-1">
                                        {item.name}
                                    </Link>
                                    <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 lowercase">
                                            {item.type?.split('/')[1] || 'file'}
                                        </Badge>
                                        <span>{item.size ? `${(item.size / 1024).toFixed(1)} KB` : 'UNK'}</span>
                                        <span>&bull;</span>
                                        <span title={item.uploadedOn}>{formatDistanceToNow(new Date(item.uploadedAt))} ago</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(item.url)} title="Copy URL">
                                        <Copy className="h-4 w-4" />
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    View Original
                                                </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/manage/uploads/${item.id}`}>
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(item.id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-muted-foreground border rounded-lg">
                    <PictureInPicture className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">No Files Uploaded</h3>
                    <p>Uploaded files will appear here as they are added.</p>
                </div>
            )}

            {totalCount > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between border-t pt-6">
                    <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={!hasMore}
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

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
