
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
import { Loader2, Search, Image as ImageIcon, CheckCircle2, FileText, Trash2 } from 'lucide-react';
import { getFileUploads, deleteFileUpload } from '@/lib/db';
import type { FileUpload } from '@/lib/types';
import { SmartImage } from '@/components/ui/smart-image';
import { cn } from '@/lib/utils';
import { FileUploadInput } from './FileUploadInput';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface MediaLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  initialSelectedUrls?: string[];
  defaultTags?: string[];
}

const DEFAULT_SELECTED_URLS: string[] = [];

export function MediaLibraryDialog({ isOpen, onClose, onSelect, initialSelectedUrls = DEFAULT_SELECTED_URLS, defaultTags = ['general'] }: MediaLibraryDialogProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSelection, setCurrentSelection] = useState<string[]>(initialSelectedUrls);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(['all']);

  const { toast } = useToast();

  const fetchUploads = async (tags: string[] = ['all'], isLoadMore = false) => {
    if (!isLoadMore) setIsLoading(true);
    try {
      const currentLimit = isLoadMore ? 8 : 16;
      const cursor = isLoadMore ? lastDocId : null;

      const { uploads: fetchedUploads, hasMore: moreAvailable } = await getFileUploads({
        tags: tags.includes('all') ? undefined : tags,
        limit: currentLimit,
        lastDocId: cursor
      });

      if (isLoadMore) {
        setUploads(prev => [...prev, ...fetchedUploads]);
      } else {
        setUploads(fetchedUploads);
      }

      setHasMore(moreAvailable);
      if (fetchedUploads.length > 0) {
        setLastDocId(fetchedUploads[fetchedUploads.length - 1].id);
      }
    } catch (error: any) {
      console.error('Failed to fetch uploads:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load media library. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedTags(defaultTags || ['all']);
      fetchUploads(defaultTags || ['all']);
      setCurrentSelection(initialSelectedUrls);
    }
  }, [isOpen, initialSelectedUrls, defaultTags]);

  useEffect(() => {
    if (isOpen) {
      fetchUploads(selectedTags);
    }
  }, [selectedTags, isOpen]);

  const filteredUploads = uploads
    .filter((upload) =>
      upload.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aIsSelected = currentSelection.includes(a.url);
      const bIsSelected = currentSelection.includes(b.url);
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

  const handleImageClick = (url: string) => {
    setCurrentSelection(prev => {
      if (prev.includes(url)) {
        return prev.filter(u => u !== url);
      } else {
        return [...prev, url];
      }
    });
  };

  const handleFileUploadSuccess = (url: string) => {
    toast({ title: 'Upload Successful', description: 'File added to library.' });
    fetchUploads(selectedTags);
    setCurrentSelection(prev => [...prev, url]);
  };

  const handleInsertSelected = () => {
    onSelect(currentSelection);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="flex-grow flex flex-col gap-4 overflow-hidden">
          <div className="border border-dashed p-4 rounded-lg space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Upload New File</h3>
            </div>
            <FileUploadInput
              name="media-library-upload"
              onUploadSuccess={handleFileUploadSuccess}
              onUploadingChange={setIsUploading}
              tags={defaultTags}
            />
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredUploads.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      'relative h-32 w-full rounded-md overflow-hidden cursor-pointer border-2 transition-all group',
                      currentSelection.includes(file.url) ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted-foreground'
                    )}
                    onClick={() => handleImageClick(file.url)}
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
                    {currentSelection.includes(file.url) && (
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
                ))}
              </div>
              {hasMore && (
                <div className="mt-4 flex justify-center pb-4">
                  <Button variant="outline" onClick={() => fetchUploads(selectedTags, true)} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? 'Loading...' : 'Show More'}
                  </Button>
                </div>
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
