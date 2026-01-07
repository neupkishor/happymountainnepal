
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
import { useToast } from '@/hooks/use-toast';
import { SmartImage } from '@/components/ui/smart-image';
import { UploadDetailDialog } from '@/components/manage/uploads/UploadDetailDialog';

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
    const [selectedFile, setSelectedFile] = useState<FileUpload | null>(null);

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

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold !font-headline">Uploads Library</h1>
                    <p className="text-muted-foreground mt-2">
                        {totalCount} {totalCount === 1 ? 'file' : 'files'} uploaded
                    </p>
                </div>
                <div>
                    <Button onClick={() => setIsUploadDialogOpen(true)} variant="outline">
                        Upload
                    </Button>
                </div>
            </div>

            <UploadDialog
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
                onUploadComplete={handleUploadComplete}
            />

            <UploadDetailDialog
                isOpen={!!selectedFile}
                onClose={() => setSelectedFile(null)}
                file={selectedFile}
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
                                className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-card cursor-pointer"
                                onClick={() => setSelectedFile(item)}
                            >
                                <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                    {item.type?.startsWith('image/') ? (
                                        <SmartImage
                                            src={item.url}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                                            <FileIcon className="h-10 w-10" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate mb-1" title={item.name}>
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                        <Badge variant="outline" className="text-xs">
                                            {item.uploadedBy}
                                        </Badge>
                                        {item.size && (
                                            <Badge variant="secondary" className="text-xs">
                                                {(item.size / 1024).toFixed(2)} KB
                                            </Badge>
                                        )}
                                        <Badge variant="default" className="text-xs">
                                            ☁️ NeupCDN
                                        </Badge>
                                        <span>
                                            {item.uploadedOn ? formatDistanceToNow(new Date(item.uploadedOn), { addSuffix: true }) : 'N/A'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 truncate font-mono" title={item.url}>
                                        URL: {item.url}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-shrink-0 text-destructive hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(item.id);
                                    }}
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
