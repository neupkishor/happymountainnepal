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
import { Loader2, Search, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { getFileUploads } from '@/lib/db';
import type { FileUpload } from '@/lib/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { FileUploadInput } from './FileUploadInput';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MediaLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  initialSelectedUrls?: string[];
}

export function MediaLibraryDialog({ isOpen, onClose, onSelect, initialSelectedUrls = [] }: MediaLibraryDialogProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSelection, setCurrentSelection] = useState<string[]>(initialSelectedUrls);
  const [isUploading, setIsUploading] = useState(false);
  const [skipCompression, setSkipCompression] = useState(false);
  const { toast } = useToast();

  const fetchUploads = async () => {
    setIsLoading(true);
    try {
      const fetchedUploads = await getFileUploads();
      setUploads(fetchedUploads);
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
      fetchUploads();
      setCurrentSelection(initialSelectedUrls);
    }
  }, [isOpen, initialSelectedUrls]);

  const filteredUploads = uploads.filter((upload) =>
    upload.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    upload.fileType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    fetchUploads(); // Refresh library
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
              <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Upload New File</h3>
                  <Button
                    variant={skipCompression ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSkipCompression(!skipCompression)}
                    >
                    {skipCompression ? 'Uncompressed' : 'Compressed'}
                  </Button>
              </div>
              <FileUploadInput 
                name="media-library-upload"
                onUploadSuccess={handleFileUploadSuccess}
                onUploadingChange={setIsUploading}
                skipCompression={skipCompression}
              />
          </div>

          {/* Library Browser */}
          <div className="flex-grow flex flex-col gap-4 overflow-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center flex-grow text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                Loading files...
              </div>
            ) : filteredUploads.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-grow text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-4" />
                <p>No files found. Try uploading some!</p>
              </div>
            ) : (
              <ScrollArea className="flex-grow -mr-4 pr-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredUploads.map((file) => (
                    <div
                      key={file.id}
                      className={cn(
                        'relative h-32 w-full rounded-md overflow-hidden cursor-pointer border-2 transition-all',
                        currentSelection.includes(file.url) ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted-foreground'
                      )}
                      onClick={() => handleImageClick(file.url)}
                    >
                      <Image
                        src={file.url}
                        alt={file.fileName}
                        fill
                        className="object-cover"
                      />
                      {currentSelection.includes(file.url) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                          <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
    </Dialog>
  );
}
