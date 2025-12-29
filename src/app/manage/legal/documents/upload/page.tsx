
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  ArrowLeft,
  UploadIcon,
  FileText,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { addLegalDocument } from '@/lib/db';

export default function UploadLegalDocumentPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!title.trim() || !selectedFile) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Title and file are required.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('platform', 'p3.happymountainnepal');
        formData.append(
          'contentIds',
          JSON.stringify(['legal-documents', 'admin-user', 'upload-page'])
        );
        formData.append(
          'name',
          selectedFile.name.replace(/\.[^/.]+$/, '')
        );

        const res = await fetch(
          'https://cdn.neupgroup.com/bridge/api/v1/upload',
          { method: 'POST', body: formData }
        );

        const text = await res.text();
        if (!res.ok) throw new Error(text);

        const result = JSON.parse(text);
        if (!result.success || !result.url) {
          throw new Error(result.message || 'Upload failed');
        }

        await addLegalDocument({
          title: title.trim(),
          description: description.trim(),
          url: result.url,
        });

        toast({
          title: 'Success',
          description: 'Document uploaded successfully.',
        });

        router.push('/manage/legal/documents');
        router.refresh();
      } catch (err: any) {
        console.error(err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err.message || 'Upload failed',
        });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button asChild variant="ghost" className="pl-0 mb-4">
        <Link href="/manage/legal/documents">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documents
        </Link>
      </Button>

      <h1 className="text-3xl font-bold !font-headline">
        Upload New Document
      </h1>
      <p className="text-muted-foreground mt-2 mb-6">
        Add a new legal document to your site.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
          <CardDescription>
            Title, optional description, and file.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* TITLE */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Title *</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description (Optional)
            </label>
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* FILE */}
          <div className="space-y-2">
            <label className="text-sm font-medium">File *</label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary"
              onClick={() =>
                document.getElementById('file-upload')?.click()
              }
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={isSubmitting}
              />

              {selectedFile ? (
                <>
                  <FileText className="h-8 w-8 mx-auto text-green-500" />
                  <p className="text-sm mt-1">{selectedFile.name}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </>
              ) : (
                <>
                  <UploadIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to select a file
                  </p>
                </>
              )}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={isSubmitting || !title || !selectedFile}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload and Save Document'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
