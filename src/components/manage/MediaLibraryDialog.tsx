
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
import { Loader2, Search, Image as ImageIcon, CheckCircle2, FileText, Trash2, XCircle } from 'lucide-react';
import { getFileUploads, deleteFileUpload } from '@/lib/db';
import type { FileUpload, UploadCategory } from '@/lib/types';
import Image from 'next/image';
import { SmartImage } from '@/components/ui/smart-image';
import { cn } from '@/lib/utils';
import { FileUploadInput } from './FileUploadInput';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AddLocalImageDialog } from './AddLocalImageDialog';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { getSelectablePath } from '@/lib/url-utils';

interface MediaLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  initialSelectedUrls?: string[];
  defaultCategory?: UploadCategory;
}

const categories: UploadCategory[] = ['general', 'trip', 'document', 'background', 'feature-icon', 'user-photo', 'blog', 'logo', 'author'];

const DEFAULT_SELECTED_URLS: string[] = [];

export function MediaLibraryDialog({ isOpen, onClose, onSelect, initialSelectedUrls = DEFAULT_SELECTED_URLS, defaultCategory = 'general' }: MediaLibraryDialogProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSelection, setCurrentSelection] = useState<string[]>(initialSelectedUrls);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<UploadCategory | 'all'>('all');
  const [isLocalImageDialogOpen, setIsLocalImageDialogOpen] = useState(false);

  const { toast } = useToast();
  const { profile } = useSiteProfile();

  const fetchUploads = async (category: UploadCategory | 'all' = 'all', isLoadMore = false) => {
    if (!isLoadMore) setIsLoading(true);
    try {
      const currentLimit = isLoadMore ? 8 : 16;
      const cursor = isLoadMore ? lastDocId : null;

      const { uploads: fetchedUploads, hasMore: moreAvailable } = await getFileUploads({
        category: category === 'all' ? undefined : category,
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
      setSelectedCategory(defaultCategory || 'all');
      fetchUploads(defaultCategory || 'all');
      setCurrentSelection(initialSelectedUrls);
    }
  }, [isOpen, initialSelectedUrls, defaultCategory]);

  useEffect(() => {
    if (isOpen) {
      fetchUploads(selectedCategory);
    }
  }, [selectedCategory, isOpen]);



  // Helper function to get the correct path for a file
  // For relative paths with basePath, this returns the full absolute URL
  const getFilePath = (file: FileUpload): string => {
    return getSelectablePath(file, profile?.basePath);
  };

  const filteredUploads = uploads
    .filter((upload) =>
      upload.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aPath = getFilePath(a);
      const bPath = getFilePath(b);
      const aIsSelected = currentSelection.includes(aPath);
      const bIsSelected = currentSelection.includes(bPath);

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
      // Refresh list
      setUploads(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete file.',
      });
    }
  };

  const handleImageClick = (filePath: string) => {
    setCurrentSelection(prev => {
      if (prev.includes(filePath)) {
        return prev.filter(u => u !== filePath);
      } else {
        return [...prev, filePath];
      }
    });
  };

  const handleFileUploadSuccess = (url: string) => {
    toast({ title: 'Upload Successful', description: 'File added to library.' });
    fetchUploads(selectedCategory); // Refresh library for current category
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
          {/* Upload Area */}
          <div className="border border-dashed p-4 rounded-lg space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Upload New File</h3>
            </div>
            <FileUploadInput
              name="media-library-upload"
              onUploadSuccess={handleFileUploadSuccess}
              onUploadingChange={setIsUploading}
              category={defaultCategory} // Pass down the category for new uploads
            />
          </div>

          {/* Library Browser */}
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
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as UploadCategory | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Media Section */}
            {currentSelection.length > 0 && (
              <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Selected Media ({currentSelection.length})
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {currentSelection.map((selectedPath) => {
                    const selectedFile = uploads.find(f => getFilePath(f) === selectedPath);
                    return (
                      <div
                        key={selectedPath}
                        className="relative h-20 w-full rounded-md overflow-hidden cursor-pointer border-2 border-primary ring-2 ring-primary group"
                        onClick={() => handleImageClick(selectedPath)}
                      >
                        {selectedFile ? (
                          selectedFile.type?.startsWith('image/') ? (
                            <SmartImage
                              src={selectedFile.url}
                              alt={selectedFile.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground p-2">
                              <FileText className="h-6 w-6" />
                            </div>
                          )
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground p-2">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                          <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                        </div>
                        {/* X button to deselect */}
                        <div className="absolute top-0.5 right-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-5 w-5 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(selectedPath);
                            }}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isLoading && uploads.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-grow text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                Loading files...
              </div>
            ) : filteredUploads.length === 0 && uploads.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-grow text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-4" />
                <p>No files found in this category.</p>
              </div>
            ) : (
              <ScrollArea className="flex-grow -mr-4 pr-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredUploads.map((file) => {
                    const filePath = getFilePath(file);
                    return (
                      <div
                        key={file.id}
                        className={cn(
                          'relative h-32 w-full rounded-md overflow-hidden cursor-pointer border-2 transition-all group',
                          currentSelection.includes(filePath) ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted-foreground'
                        )}
                        onClick={() => handleImageClick(filePath)}
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
                        {currentSelection.includes(filePath) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                            <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
                          </div>
                        )}

                        {/* Delete Button - Only visible on hover */}
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
                    );
                  })}
                </div>
                {hasMore && (
                  <div className="mt-4 flex justify-center pb-4">
                    <Button variant="outline" onClick={() => fetchUploads(selectedCategory, true)} disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isLoading ? 'Loading...' : 'Show More'}
                    </Button>
                  </div>
                )}
              </ScrollArea>
            )}
          </div>

          <div className="flex justify-end mt-auto pt-4 border-t">
            <Button onClick={handleInsertSelected} disabled={currentSelection.length === 0 || isUploading}>
              Insert Selected ({currentSelection.length})
            </Button>
          </div>
        </div>
      </DialogContent>

      <AddLocalImageDialog
        isOpen={isLocalImageDialogOpen}
        onClose={() => setIsLocalImageDialogOpen(false)}
        onSuccess={() => fetchUploads(selectedCategory)}
        category={selectedCategory === 'all' ? 'general' : selectedCategory}
      />
    </Dialog >
  );
}
