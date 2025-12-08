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
import type { FileUpload } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card } from '../ui/card';

interface MediaPickerProps {
  name: string;
  label?: string;
  maxRecent?: number;
}

export function MediaPicker({ name, label, maxRecent = 7 }: MediaPickerProps) {
  const { control, setValue } = useFormContext();
  const { field } = useController({ name, control });
  const { toast } = useToast();

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
  const getFilePath = (file: FileUpload): string => {
    return file.pathType === 'relative' ? file.path : file.url;
  };

  const displayedRecent = recentUploads.slice(0, maxRecent);

  // Find the selected file for preview
  const selectedFile = displayedRecent.find(f => getFilePath(f) === previewUrl);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label || 'Image'}</Label>
      <Card className="p-4">
        {previewUrl && (
          <div className="relative group w-full h-48 mb-4">
            <SmartImage
              src={selectedFile?.url || previewUrl}
              pathType={selectedFile?.pathType}
              path={selectedFile?.path}
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
          <h4 className="text-sm font-medium text-muted-foreground">Select an Image</h4>
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

            {/* Recent Images */}
            {displayedRecent.map((file) => {
              const filePath = getFilePath(file);
              return (
                <div
                  key={file.id}
                  className={cn(
                    'relative h-24 w-full rounded-md overflow-hidden cursor-pointer border-2 transition-all',
                    previewUrl === filePath ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted-foreground'
                  )}
                  onClick={() => handleSelectImage([filePath])}
                >
                  <SmartImage
                    src={file.url}
                    pathType={file.pathType}
                    path={file.path}
                    alt={file.fileName}
                    fill
                    className="object-cover"
                  />
                  {previewUrl === filePath && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                      <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                    </div>
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
