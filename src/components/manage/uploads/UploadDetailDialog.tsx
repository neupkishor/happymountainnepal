
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
import Image from 'next/image';
import { SmartImage } from '@/components/ui/smart-image';
import { FileIcon } from 'lucide-react';

interface UploadDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileUpload | null;
}

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-sm text-foreground sm:mt-0 break-all">{value}</dd>
  </div>
);

export function UploadDetailDialog({ isOpen, onClose, file }: UploadDetailDialogProps) {
  if (!file) return null;

  const uploadedDate = file.uploadedOn ? format(new Date(file.uploadedOn), "PPP p") : "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>File Details</DialogTitle>
          <DialogDescription className="truncate font-mono text-xs">{file.url}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
            {file.type?.startsWith('image/') ? (
              <SmartImage
                src={file.url}
                alt={file.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground p-2">
                  <FileIcon className="h-16 w-16" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <dl className="space-y-3">
              <DetailRow label="File Name" value={file.name} />
              <DetailRow label="File Type" value={<Badge variant="outline">{file.type}</Badge>} />
              <DetailRow label="File Size" value={`${(file.size / 1024).toFixed(2)} KB`} />
              <DetailRow label="Uploaded By" value={file.uploadedBy} />
              <DetailRow label="Uploaded On" value={uploadedDate} />
              <DetailRow
                label="Tags"
                value={
                  <div className="flex flex-wrap gap-1">
                    {file.tags?.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                }
              />
            </dl>
          </div>
        </div>
        {file.meta && file.meta.length > 0 && (
            <div>
                <h3 className="font-semibold mb-2">Metadata</h3>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                    {JSON.stringify(file.meta, null, 2)}
                </pre>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
