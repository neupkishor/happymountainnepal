
'use client';

import { useState } from 'react';
import { useFormContext, useController } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import imageCompression from 'browser-image-compression';
import { logError, logFileUpload } from '@/lib/db';
import { usePathname } from 'next/navigation';
import { slugify } from '@/lib/utils';
import type { UploadCategory } from '@/lib/types';

interface FileUploadInputProps {
  name: string;
  children?: React.ReactNode;
  onUploadSuccess?: (url: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  customFileName?: string;
  skipCompression?: boolean;
  category: UploadCategory; // Prop is now required
}

export function FileUploadInput({
  name,
  children,
  onUploadSuccess,
  onUploadingChange,
  customFileName,
  skipCompression = false,
  category, // Removed default, as it should be explicit
}: FileUploadInputProps) {
  const { control, setValue } = useFormContext();
  const { field } = useController({ name, control });
  const pathname = usePathname();

  const [isUploadingInternal, setIsUploadingInternal] = useState(false);
  const isUploading = isUploadingInternal;
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingInternal(true);
    onUploadingChange?.(true);
    setUploadError(null);

    let finalFile = file;

    if (!skipCompression && file.type.startsWith('image/')) {
        try {
          const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          finalFile = await imageCompression(file, options);
          console.log(`[Compression] Original: ${(file.size / 1024).toFixed(2)} KB, Compressed: ${(finalFile.size / 1024).toFixed(2)} KB`);
        } catch (compressionError: any) {
          logError({
            message: `Image compression failed: ${compressionError.message}`,
            stack: compressionError.stack,
            pathname,
          });
          toast({
            variant: 'destructive',
            title: 'Compression Failed',
            description: 'Could not compress the image. Please try a different file.',
          });
          setIsUploadingInternal(false);
          onUploadingChange?.(false);
          return;
        }
    } else {
        console.log('[Compression] Skipped for this file type or setting.');
    }

    let extension = file.name.split('.').pop()?.toLowerCase();
    const isImage = file.type.startsWith('image/');
    if (isImage && (!extension || !['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension))) {
      extension = 'jpg';
    }

    const safeBaseName = customFileName || slugify(file.name.replace(/\.[^/.]+$/, ''));
    const safeFileName = extension ? `${safeBaseName}.${extension}` : safeBaseName;
    
    const mimeType = file.type || (isImage ? `image/${extension === 'jpg' ? 'jpeg' : extension}` : 'application/octet-stream');

    const correctedFile = new File([finalFile], safeFileName, { type: mimeType });

    const formData = new FormData();
    const userId = 'admin-user'; // Replace with actual user ID if available
    const fieldNameSlug = slugify(name);

    formData.append('file', correctedFile);
    formData.append('platform', 'p3.happymountainnepal');
    formData.append('contentIds', JSON.stringify(['uploads', userId, fieldNameSlug]));
    formData.append('name', safeBaseName);

    try {
      const response = await fetch('https://neupgroup.com/content/bridge/api/upload', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${responseText}`);
      }

      const result = JSON.parse(responseText);

      if (result.success && result.url) {
        const fullUrl = result.url;
        setValue(name, fullUrl, { shouldValidate: true, shouldDirty: true });

        await logFileUpload({
          fileName: correctedFile.name,
          url: fullUrl,
          userId: userId,
          fileSize: correctedFile.size,
          fileType: correctedFile.type,
          category: category,
        });

        onUploadSuccess?.(fullUrl);
      } else {
        throw new Error(result.message || 'Unknown upload error.');
      }
    } catch (error: any) {
      logError({
        message: `Upload failed: ${error.message}`,
        stack: error.stack,
        pathname,
        context: { endpoint: 'upload', fileName: file.name },
      });
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message,
      });
      setUploadError(error.message);
    } finally {
      setIsUploadingInternal(false);
      onUploadingChange?.(false);
    }
  };

  // --- Render ---
  if (children) {
    return (
      <label htmlFor={name} className="cursor-pointer w-full">
        <Input
          id={name}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        {children}
      </label>
    );
  }

  return (
    <div className="space-y-2">
      <div className="border border-dashed rounded-lg p-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="relative w-full">
            <Input
              id={name}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full pointer-events-none"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </>
              )}
            </Button>
          </div>
          {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
        </div>
      </div>
    </div>
  );
}
