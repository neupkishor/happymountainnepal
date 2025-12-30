
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { FileUpload } from '@/lib/types';
import { format } from 'date-fns';
import { SmartImage } from '@/components/ui/smart-image';
import { FileIcon, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface UploadDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileUpload | null;
}

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-start py-2 border-b">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-sm text-foreground sm:mt-0 text-right break-all">{value}</dd>
  </div>
);

const FilePreview = ({ file }: { file: FileUpload }) => {
  if (file.type?.startsWith('image/')) {
    return (
      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
        <SmartImage
          src={file.url}
          alt={file.name}
          fill
          className="object-contain"
        />
      </div>
    );
  }

  if (file.type?.startsWith('video/')) {
    return (
      <video controls src={file.url} className="w-full rounded-lg bg-black">
        Your browser does not support the video tag.
      </video>
    );
  }
  
  if (file.type?.startsWith('audio/')) {
    return (
      <audio controls src={file.url} className="w-full">
        Your browser does not support the audio element.
      </audio>
    );
  }
  
  // Fallback for other file types
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="font-semibold mb-2">No preview available</p>
        <Button asChild>
          <a href={file.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview in New Tab
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};


export function UploadDetailDialog({ isOpen, onClose, file }: UploadDetailDialogProps) {
  if (!file) return null;

  const uploadedDate = file.uploadedOn ? format(new Date(file.uploadedOn), "PPP p") : "N/A";
  const fileDescription = file.meta?.find((m: any) => m.key === 'description')?.value;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{file.name}</DialogTitle>
          {fileDescription && (
            <DialogDescription>{fileDescription}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <FilePreview file={file} />

          <div>
            <h3 className="font-semibold mb-2">File Information</h3>
            <dl className="space-y-1">
              <DetailRow label="File Name" value={file.name} />
              <DetailRow label="File Type" value={<Badge variant="outline">{file.type}</Badge>} />
              <DetailRow label="File Size" value={`${(file.size / 1024).toFixed(2)} KB`} />
              <DetailRow label="Uploaded By" value={file.uploadedBy} />
              <DetailRow label="Uploaded On" value={uploadedDate} />
              <DetailRow
                label="Tags"
                value={
                  <div className="flex flex-wrap gap-1 justify-end">
                    {file.tags?.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                }
              />
               <DetailRow label="URL" value={<a href={file.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{file.url}</a>} />
            </dl>
          </div>

          {file.meta && file.meta.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Metadata</h3>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                {JSON.stringify(file.meta, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
