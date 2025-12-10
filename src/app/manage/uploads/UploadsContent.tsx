'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFileUploads, getFileUploadsCount, deleteFileUpload } from '@/lib/db';
import { UploadDialog } from '@/components/upload/UploadDialog';
import { formatDistanceToNow } from 'date-fns';
import { PictureInPicture, ChevronLeft, ChevronRight, ExternalLink, FileIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { FileUpload } from '@/lib/types';
import { AddLocalImageDialog } from '@/components/manage/AddLocalImageDialog';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { getFullUrl } from '@/lib/url-utils';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 10;

export function UploadsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [fileItems, setFileItems] = useState<FileUpload[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [pageHistory, setPageHistory] = useState<(string | null)[]>([null]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLocalImageDialogOpen, setIsLocalImageDialogOpen] = useState(false);

    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const { profile } = useSiteProfile();
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
            // Refresh the list by removing the item locally or fetching again
            setFileItems((prev) => prev.filter((item) => item.id !== fileId));
            setTotalCount((prev) => prev - 1);
        } catch (error) {
            console.error('Failed to delete file:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete the file. Please try again.',
            });
        }
    };

    useEffect(() => {
        async function fetchCount() {
            const count = await getFileUploadsCount();
            setTotalCount(count);
        }
        fetchCount();
    }, []);

    useEffect(() => {
        async function fetchUploads() {
            setIsLoading(true);
            try {
                const lastDocId = pageHistory[currentPage - 1];
                const result = await getFileUploads({
                    limit: ITEMS_PER_PAGE,
                    lastDocId
                });
                setFileItems(result.uploads);
                setHasMore(result.hasMore);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching uploads:', error);
                setIsLoading(false);
            }
        }
        fetchUploads();
    }, [currentPage, pageHistory]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const goToNextPage = () => {
        if (hasMore && fileItems.length > 0) {
            const lastDocId = fileItems[fileItems.length - 1].id;
            setPageHistory(prev => [...prev, lastDocId]);
            router.push(`/manage/uploads?page=${currentPage + 1}`);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setPageHistory(prev => prev.slice(0, -1));
            router.push(`/manage/uploads?page=${currentPage - 1}`);
        }
    };

    const handleUploadComplete = async () => {
        // Refresh the uploads list
        router.refresh();
        if (currentPage !== 1) {
            router.push('/manage/uploads?page=1');
        } else {
            const result = await getFileUploads({ limit: ITEMS_PER_PAGE, lastDocId: null });
            setFileItems(result.uploads);
            setHasMore(result.hasMore);
            const count = await getFileUploadsCount();
            setTotalCount(count);
        }
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
                <div className="flex gap-2">
                    <Button onClick={() => setIsLocalImageDialogOpen(true)} variant="outline">
                        Add Local Image
                    </Button>
                    <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                        Upload
                    </Button>
                </div>
            </div>

            <UploadDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onUploadComplete={handleUploadComplete}
            />

            <AddLocalImageDialog
                isOpen={isLocalImageDialogOpen}
                onClose={() => setIsLocalImageDialogOpen(false)}
                onSuccess={handleUploadComplete}
            />

            {isLoading ? (
                <div className="space-y-4 mb-8">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-4 border rounded-lg bg-card animate-pulse"
                        >
                            <div className="h-20 w-20 rounded-md bg-muted flex-shrink-0"></div>
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
            ) : fileItems.length > 0 ? (
                <>
                    <div className="space-y-4 mb-8">
                        {fileItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-card"
                            >
                                <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                    {item.fileType?.startsWith('image/') ? (
                                        <Image
                                            src={item.pathType === 'relative' ? item.path : item.url}
                                            alt={item.fileName}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                                            <FileIcon className="h-10 w-10" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate mb-1" title={item.fileName}>
                                        {item.fileName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                        <Badge variant="outline" className="text-xs">
                                            {item.userId}
                                        </Badge>
                                        {item.fileSize && (
                                            <Badge variant="secondary" className="text-xs">
                                                {(item.fileSize / 1024).toFixed(2)} KB
                                            </Badge>
                                        )}
                                        <Badge variant={item.uploadSource === 'NeupCDN' ? 'default' : 'secondary'} className="text-xs">
                                            {item.uploadSource || 'Unknown'}
                                        </Badge>
                                        <Badge variant={item.pathType === 'relative' ? 'outline' : 'secondary'} className="text-xs">
                                            {item.pathType === 'relative' ? 'Local' : 'External'}
                                        </Badge>
                                        <span>
                                            {item.uploadedAt ? formatDistanceToNow(new Date(item.uploadedAt), { addSuffix: true }) : 'N/A'}
                                        </span>
                                    </div>
                                    {item.pathType === 'relative' && (
                                        <p className="text-xs text-muted-foreground mt-1 truncate" title={item.path}>
                                            Path: {item.path}
                                        </p>
                                    )}
                                </div>
                                <Button asChild variant="ghost" size="sm" className="flex-shrink-0">
                                    <Link href={getFullUrl(item, profile?.baseUrl)} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-shrink-0 text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        ))}
                    </div>

                    {totalCount > ITEMS_PER_PAGE && (
                        <div className="flex items-center justify-between border-t pt-6">
                            <div className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToNextPage}
                                    disabled={!hasMore}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16 text-muted-foreground border rounded-lg">
                    <PictureInPicture className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">No Files Uploaded</h3>
                    <p>Uploaded files will appear here as they are added.</p>
                </div>
            )}
        </div>
    );
}
