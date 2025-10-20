'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Upload, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { getFileUploads } from '@/lib/db';
import type { FileUpload } from '@/lib/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { FileUploadInput } from './FileUploadInput';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MediaLibraryDialogProps {
  children: React.ReactNode;
  onSelect: (urls: string[]) => void; // Now expects an array of URLs
  initialSelectedUrls?: string[]; // Initial selected URLs for multi-selection
}

export function MediaLibraryDialog({ children, onSelect, initialSelectedUrls = [] }: MediaLibraryDialogProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('library');
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSelection, setCurrentSelection] = useState<string[]>(initialSelectedUrls); // State for current selection in dialog
  const [isPending, startTransition] = useTransition(); // For potential future async actions within dialog
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
    if (open) {
      fetchUploads();
      setCurrentSelection(initialSelectedUrls); // Reset selection when dialog opens
    }
  }, [open, initialSelectedUrls]);

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
    setTab('library'); // Switch back to library tab
    setCurrentSelection(prev => [...prev, url]); // Add newly uploaded file to selection
  };

  const handleInsertSelected = () => {
    onSelect(currentSelection);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-grow">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">
              <ImageIcon className="mr-2 h-4 w-4" /> Browse Library
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" /> Upload New
            </TabsTrigger>
          </TabsList>
          <TabsContent value="library" className="flex flex-col flex-grow mt-4 data-[state=inactive]:hidden">
            <div className="relative mb-4">
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
              <ScrollArea className="flex-grow pr-4">
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
            <div className="flex justify-end mt-4">
                <Button onClick={handleInsertSelected} disabled={currentSelection.length === 0}>
                    Insert Selected ({currentSelection.length})
                </Button>
            </div>
          </TabsContent>
          <TabsContent value="upload" className="flex flex-col flex-grow mt-4 data-[state=inactive]:hidden">
            <div className="flex-grow flex items-center justify-center">
              <FileUploadInput name="media-library-upload" onUploadSuccess={handleFileUploadSuccess} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}