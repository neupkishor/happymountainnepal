'use client';

import { useState, useEffect } from 'react';
import { useFormContext, useController } from 'react-hook-form';
import Image from 'next/image';
import { SmartImage } from '@/components/ui/smart-image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, XCircle, Library, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaLibraryDialog } from './MediaLibraryDialog';
import { FileUploadInput } from './FileUploadInput';
import { getFileUploads } from '@/lib/db';
import type { FileUpload, UploadCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card } from '../ui/card';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { getSelectablePath } from '@/lib/url-utils';

interface MediaPickerProps {
  name: string;
  label?: string;
  maxRecent?: number;
  category?: UploadCategory;
}

export function MediaPicker({ name, label, maxRecent = 7, category = 'general' }: MediaPickerProps) {
  const { control, setValue } = useFormContext();
  const { field } = useController({ name, control });
  const { toast } = useToast();
  const { profile } = useSiteProfile();

  const [previewUrl, setPreviewUrl] = useState<string | null>(field.value || null);
  const [recentUploads, setRecentUploads] = useState<FileUpload[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const fetchRecentUploads = async () => {
    setIsLoadingRecent(true);
    try {
      const { uploads } = await getFileUploads();
      setRecentUploads(uploads);
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
    setPreviewUrl(field.value || null);
  }, [field.value]);

  const handleSelectImage = (urls: string[]) => {
    const url = urls.length > 0 ? urls[0] : '';
    setValue(name, url, { shouldValidate: true, shouldDirty: true });
    setPreviewUrl(url);
    setIsLibraryOpen(false);
  };

  const handleClearImage = () => {
    setValue(name, '', { shouldValidate: true, shouldDirty: true });
    setPreviewUrl(null);
  };

  const handleDirectUploadSuccess = (url: string) => {
    handleSelectImage([url]);
    fetchRecentUploads();
    setIsUploading(false);
    toast({ title: 'Upload Successful', description: 'New file uploaded and selected.' });
  };

  // Helper function to get the correct path for a file
  // For relative paths with basePath, this returns the full absolute URL
  const getFilePath = (file: FileUpload): string => {
    return getSelectablePath(file, profile?.basePath);
  };

  // Sort uploads to show selected media first
  const sortedUploads = [...recentUploads].sort((a, b) => {
    const aPath = getFilePath(a);
    const bPath = getFilePath(b);
    const aIsSelected = aPath === previewUrl;
    const bIsSelected = bPath === previewUrl;

    if (aIsSelected && !bIsSelected) return -1;
    if (!aIsSelected && bIsSelected) return 1;
    return 0;
  });

  const displayedRecent = sortedUploads.slice(0, maxRecent);

  // Find the selected file for preview
  const selectedFile = displayedRecent.find(f => getFilePath(f) === previewUrl);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label || 'Image'}</Label>
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">
              {previewUrl ? 'Selected Image' : 'Select an Image'}
            </h4>
            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={handleClearImage}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Clear Selection
              </Button>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {/* Upload Box */}
            <FileUploadInput
              name={`${name}-direct-upload`}
              onUploadSuccess={handleDirectUploadSuccess}
              onUploadingChange={setIsUploading}
              category="general"
            >
              <div className="flex items-center justify-center h-24 w-full rounded-md border-2 border-dashed text-muted-foreground hover:bg-muted/50 hover:border-primary transition-colors cursor-pointer">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </div>
            </FileUploadInput>

            {/* Recent Images - Selected items appear first */}
            {displayedRecent.map((file) => {
              const filePath = getFilePath(file);
              const isSelected = previewUrl === filePath;
              return (
                <div
                  key={file.id}
                  className={cn(
                    'relative h-24 w-full rounded-md overflow-hidden cursor-pointer border-2 transition-all group',
                    isSelected
                      ? 'border-primary ring-2 ring-primary shadow-lg'
                      : 'border-transparent hover:border-muted-foreground'
                  )}
                  onClick={() => handleSelectImage([filePath])}
                >
                  <SmartImage
                    src={file.url}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                  {isSelected && (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                        <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                      </div>
                      {/* Deselect button on hover */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearImage();
                        }}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              );
            })}

            {/* Show More Box */}
            <div
              className="flex items-center justify-center h-24 w-full rounded-md border text-muted-foreground hover:bg-muted/50 hover:border-primary transition-colors cursor-pointer"
              onClick={() => setIsLibraryOpen(true)}
            >
              <Library className="h-6 w-6" />
            </div>
          </div>
        </div>
      </Card>

      <MediaLibraryDialog
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={handleSelectImage}
        initialSelectedUrls={previewUrl ? [previewUrl] : []}
      />
    </div>
  );
}
