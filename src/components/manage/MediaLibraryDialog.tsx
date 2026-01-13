
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Image as ImageIcon, CheckCircle2, FileText, Trash2, ExternalLink } from 'lucide-react';
import { getFileUploads, deleteFileUpload } from '@/lib/db';
import type { FileUpload, ImageWithCaption } from '@/lib/types';
import { SmartImage } from '@/components/ui/smart-image';
import { cn } from '@/lib/utils';
import { FileUploadInput } from './FileUploadInput';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { getFullUrl } from '@/lib/url-utils';
import Link from 'next/link';

interface MediaLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (images: ImageWithCaption[]) => void;
  initialSelectedUrls?: string[];
  defaultTags?: string[];
  defaultCategory?: string;
}

const DEFAULT_SELECTED_URLS: string[] = [];

export function MediaLibraryDialog({ isOpen, onClose, onSelect, initialSelectedUrls = DEFAULT_SELECTED_URLS, defaultTags = ['general'], defaultCategory }: MediaLibraryDialogProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSelection, setCurrentSelection] = useState<string[]>(initialSelectedUrls);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(['all']);

  const { toast } = useToast();
  const { profile } = useSiteProfile();

  const fetchUploads = async (tags: string[] = ['all'], currentPage = 1, search = '') => {
    if (currentPage === 1) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const limit = 10;
      const { uploads: fetchedUploads, hasMore: moreAvailable } = await getFileUploads({
        tags: tags.includes('all') ? undefined : tags,
        limit,
        page: currentPage,
        searchTerm: search
      });

      setUploads(prev => {
        if (currentPage === 1) return fetchedUploads;
        // Merge and ensure uniqueness by ID
        const combined = [...prev, ...fetchedUploads];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return unique;
      });

      setHasMore(moreAvailable);
      setPage(currentPage);
    } catch (error: any) {
      console.error('Failed to fetch uploads:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load media library. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentSelection(initialSelectedUrls);
      const tagsToUse = defaultTags || ['all'];
      setSelectedTags(tagsToUse);
      // Reset search and page on open
      setSearchTerm('');
      setPage(1);
      fetchUploads(tagsToUse, 1, '');
    }
  }, [isOpen]);

  // Debounced search effect
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchUploads(selectedTags, 1, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedTags]);

  const filteredUploads = uploads.sort((a, b) => {
    const aIsSelected = currentSelection.includes(getFullUrl(a, profile?.basePath));
    const bIsSelected = currentSelection.includes(getFullUrl(b, profile?.basePath));
    if (aIsSelected && !bIsSelected) return -1;
    if (!aIsSelected && bIsSelected) return 1;
    return 0;
  });

  const handleDelete = async (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await deleteFileUpload(fileId);
      toast({
        title: 'File Deleted',
        description: 'The file has been removed.',
      });
      setUploads(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete file.',
      });
    }
  };

  const handleImageClick = (file: FileUpload) => {
    const fullUrl = getFullUrl(file, profile?.basePath);
    setCurrentSelection(prev => {
      if (prev.includes(fullUrl)) {
        return prev.filter(u => u !== fullUrl);
      } else {
        return [...prev, fullUrl];
      }
    });
  };

  const handleFileUploadSuccess = (url: string) => {
    toast({ title: 'Upload Successful', description: 'File added to library.' });
    fetchUploads(selectedTags);
    setCurrentSelection(prev => [...prev, url]);
  };

  const handleInsertSelected = () => {
    // Convert selected URLs to ImageWithCaption objects
    const selectedImages: ImageWithCaption[] = currentSelection.map(url => {
      const file = uploads.find(u => getFullUrl(u, profile?.basePath) === url);
      return {
        url,
        caption: file?.name || ''
      };
    });
    onSelect(selectedImages);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="flex-grow flex flex-col gap-4 overflow-hidden">
          <div className="border border-dashed p-6 rounded-xl bg-muted/30 text-center space-y-3">
            <div className="flex flex-col items-center gap-2">
              <h3 className="font-semibold text-lg">Manage Media & Upload</h3>
              <p className="text-sm text-muted-foreground">Go to the management page to upload, rename, or organize your media library.</p>
            </div>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/manage/uploads" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Media Management
              </Link>
            </Button>
          </div>

          <div className="flex-grow flex flex-col gap-4 overflow-hidden">
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-grow -mr-4 pr-4">
              {isLoading && uploads.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredUploads.map((file) => {
                      const fullUrl = getFullUrl(file, profile?.basePath);
                      const isSelected = currentSelection.includes(fullUrl);
                      return (
                        <div
                          key={file.id}
                          className={cn(
                            'relative h-32 w-full rounded-md overflow-hidden cursor-pointer border-2 transition-all group',
                            isSelected ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted-foreground'
                          )}
                          onClick={() => handleImageClick(file)}
                        >
                          {file.type?.startsWith('image/') ? (
                            <SmartImage
                              src={file.url}
                              alt={file.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground p-2">
                              <FileText className="h-8 w-8" />
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                              <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
                            </div>
                          )}

                          <div className="absolute top-1 right-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={(e) => handleDelete(e, file.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {hasMore && (
                    <div className="mt-4 flex justify-center pb-4">
                      <Button variant="outline" onClick={() => fetchUploads(selectedTags, page + 1, searchTerm)} disabled={isFetchingMore}>
                        {isFetchingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isFetchingMore ? 'Loading...' : 'Show More'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </div>

          <div className="flex justify-end mt-auto pt-4 border-t">
            <Button onClick={handleInsertSelected} disabled={currentSelection.length === 0 || isUploading}>
              Insert Selected ({currentSelection.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  );
}
