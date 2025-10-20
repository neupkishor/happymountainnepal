'use client';

import { useState, useEffect, useTransition } from 'react';
import { useFormContext, useController } from 'react-hook-form';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, XCircle, Image as ImageIcon, Library, PlusCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaLibraryDialog } from './MediaLibraryDialog';
import { FileUploadInput } from './FileUploadInput';
import { getFileUploads } from '@/lib/db';
import type { FileUpload } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface MediaPickerProps {
  name: string;
  label?: string;
  maxRecent?: number;
}

export function MediaPicker({ name, label, maxRecent = 10 }: MediaPickerProps) {
  const { control, setValue } = useFormContext();
  const { field } = useController({ name, control });
  const { toast } = useToast();

  const [previewUrl, setPreviewUrl] = useState<string | null>(field.value || null);
  const [recentUploads, setRecentUploads] = useState<FileUpload[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isUploading, setIsUploading] = useState(false); // State for direct upload via FileUploadInput

  const fetchRecentUploads = async () => {
    setIsLoadingRecent(true);
    try {
      const uploads = await getFileUploads();
      setRecentUploads(uploads.slice(0, maxRecent));
    } catch (error) {
      console.error('Failed to fetch recent uploads:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load recent uploads.',
      });
    } finally {
      setIsLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  useEffect(() => {
    console.log(`[MediaPicker - ${name}] field.value changed:`, field.value);
    setPreviewUrl(field.value || null);
  }, [field.value, name]); // Added 'name' to dependencies for clarity

  // Modified to handle array from MediaLibraryDialog, but only takes the first one for single selection
  const handleSelectImage = (urls: string[]) => {
    const url = urls.length > 0 ? urls[0] : ''; // Take the first selected URL
    console.log(`[MediaPicker - ${name}] Selected URL:`, url);
    setValue(name, url, { shouldValidate: true, shouldDirty: true });
    setPreviewUrl(url); // Update local preview immediately
  };

  const handleClearImage = () => {
    console.log(`[MediaPicker - ${name}] Clearing image.`);
    setValue(name, '', { shouldValidate: true, shouldDirty: true });
    setPreviewUrl(null);
  };

  const handleDirectUploadSuccess = (url: string) => {
    console.log(`[MediaPicker - ${name}] Direct upload success, URL:`, url);
    handleSelectImage([url]); // Pass as array for consistency
    fetchRecentUploads(); // Refresh recent uploads after a new one
    setIsUploading(false);
    toast({ title: 'Upload Successful', description: 'New file uploaded and selected.' });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label || 'Image'}</Label>
      <div className="border rounded-lg p-4 space-y-4">
        {previewUrl && (
          <div className="relative group w-full h-48 mb-4">
            <Image
              src={previewUrl}
              alt="Selected image preview"
              fill
              className="object-cover rounded-md border-2 border-primary"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleClearImage}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Uploads</h4>
          {isLoadingRecent ? (
            <div className="grid grid-cols-5 gap-2">
              {[...Array(maxRecent)].map((_, i) => (
                <div key={i} className="h-16 w-full bg-muted rounded-md animate-pulse" />
              ))}
            </div>
          ) : recentUploads.length > 0 ? (
            <div className="grid grid-cols-5 gap-2">
              {recentUploads.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    'relative h-16 w-full rounded-md overflow-hidden cursor-pointer border-2 transition-all',
                    previewUrl === file.url ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted-foreground'
                  )}
                  onClick={() => handleSelectImage([file.url])} // Pass as array for consistency
                >
                  <Image
                    src={file.url}
                    alt={file.fileName}
                    fill
                    className="object-cover"
                  />
                  {previewUrl === file.url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                      <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent uploads.</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <MediaLibraryDialog onSelect={handleSelectImage} initialSelectedUrls={previewUrl ? [previewUrl] : []}>
            <Button type="button" variant="outline" className="w-full">
              <Library className="mr-2 h-4 w-4" /> Choose from Library
            </Button>
          </MediaLibraryDialog>
          <FileUploadInput
            name={`${name}-direct-upload`}
            onUploadSuccess={handleDirectUploadSuccess}
            onUploadingChange={setIsUploading}
          >
            <Button type="button" className="w-full" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" /> Upload New
                </>
              )}
            </Button>
          </FileUploadInput>
        </div>
      </div>
    </div>
  );
}