
'use client';

import { useState } from 'react';
import { useFormContext, useController } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Label } from '../ui/label';
import imageCompression from 'browser-image-compression';
import { logError } from '@/lib/db';
import { usePathname } from 'next/navigation';

interface ImageUploadProps {
  name: string;
}

export function ImageUpload({ name }: ImageUploadProps) {
  const { control, setValue } = useFormContext();
  const { field } = useController({ name, control });
  const pathname = usePathname();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(field.value || null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    let compressedFile = file;
    try {
        console.log(`Original file size: ${file.size / 1024 / 1024} MB`);
        const options = {
            maxSizeMB: 0.1, // Target size 100KB
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        }
        compressedFile = await imageCompression(file, options);
        console.log(`Compressed file size: ${compressedFile.size / 1024 / 1024} MB`);
    } catch (compressionError: any) {
        console.error('Image compression error:', compressionError);
        logError({ message: `Image compression failed: ${compressionError.message}`, stack: compressionError.stack, pathname, context: { fileName: file.name, fileType: file.type, fileSize: file.size } });
        toast({
            variant: 'destructive',
            title: 'Compression Failed',
            description: 'Could not compress the image. Please try a different file.',
        });
        setIsUploading(false);
        return;
    }


    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('platform', 'p3.happymountainnepal');
    formData.append('userid', 'admin-user');
    formData.append('contentid', `${name}-${Date.now()}`);

    try {
      // IMPORTANT: Replace with your actual upload endpoint URL
      const response = await fetch('https://neupgroup.com/usercontent/bridge/api/upload.php', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed with status: ' + response.statusText);
      }

      const result = await response.json();

      if (result.success && result.url) {
        setValue(name, result.url, { shouldValidate: true, shouldDirty: true });
        setPreviewUrl(result.url);
        toast({
          title: 'Upload Successful',
          description: 'Your image has been uploaded.',
        });
      } else {
        throw new Error(result.message || 'Unknown error occurred during upload.');
      }
    } catch (error: any) {
      logError({ message: `Image upload failed`, stack: error.stack, pathname, context: { endpoint: 'https://neupgroup.com/usercontent/bridge/api/upload.php', fileName: compressedFile.name } });
      setUploadError(error.message || 'An unexpected error occurred.');
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>Image</Label>
      <div className="border border-dashed rounded-lg p-4">
        {previewUrl ? (
          <div className="relative group w-full h-48">
            <Image
              src={previewUrl}
              alt="Image preview"
              fill
              className="object-contain rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                setValue(name, '', { shouldValidate: true, shouldDirty: true });
                setPreviewUrl(null);
              }}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative w-full">
              <Input
                id={name}
                type="file"
                accept="image/*"
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
                    Choose Image
                  </>
                )}
              </Button>
            </div>
            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

    
