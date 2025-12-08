'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getLegalDocuments, addLegalDocument, deleteLegalDocument } from '@/lib/db';
import type { LegalDocument } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, FileText, ExternalLink, Upload as UploadIcon } from 'lucide-react';
import Link from 'next/link';

export default function LegalDocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadDestination, setUploadDestination] = useState<'api' | 'public'>('api');

  const { toast } = useToast();

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const allDocs = await getLegalDocuments();
      setDocuments(allDocs);
    } catch (error) {
      console.error("Failed to load documents", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load legal documents." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadDocument = async () => {
    if (!title.trim() || !selectedFile) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide title and select a file.' });
      return;
    }

    setIsUploading(true);
    try {
      let fileUrl = '';

      if (uploadDestination === 'api') {
        // Upload to neupgroup.com API
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('platform', 'p3.happymountainnepal');
        formData.append('contentIds', JSON.stringify(['legal-documents', 'admin-user']));
        formData.append('name', selectedFile.name.replace(/\.[^/.]+$/, ''));

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
          fileUrl = result.url;
        } else {
          throw new Error(result.message || 'Unknown upload error');
        }
      } else {
        // Upload to local server /public
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('compress', 'false');
        formData.append('uploadType', 'server');
        formData.append('serverPath', '');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        fileUrl = result.url;
      }

      // Add document to database
      await addLegalDocument({
        title: title.trim(),
        description: description.trim(),
        url: fileUrl,
      });

      // Log to uploads database
      await fetch('/api/log-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          url: fileUrl,
          userId: 'admin',
          fileType: selectedFile.type,
          category: 'document',
        }),
      });

      toast({ title: 'Success', description: 'Legal document uploaded successfully.' });

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setIsDialogOpen(false);
      fetchDocuments();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to upload document.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteLegalDocument(id);
      toast({ title: 'Success', description: 'Document deleted.' });
      fetchDocuments();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete document.' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold !font-headline">Legal Documents</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage your company's licenses, registration certificates, and other important documents.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} variant="outline">
          <UploadIcon className="h-4 w-4 mr-2" />
          Upload New Document
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {/* Skeleton Cards */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 border rounded-lg bg-card animate-pulse"
            >
              {/* Skeleton Icon */}
              <div className="h-20 w-20 rounded-md bg-muted flex-shrink-0"></div>

              {/* Skeleton Info */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>

              {/* Skeleton Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="h-9 w-20 bg-muted rounded"></div>
                <div className="h-9 w-9 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No documents uploaded yet.</p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Click "Upload New Document" to add your first document.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-card"
            >
              {/* Icon */}
              <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate mb-1" title={doc.title}>
                  {doc.title}
                </h3>
                {doc.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {doc.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/legal/documents/${doc.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteDocument(doc.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
            <DialogDescription>
              Add a legal document with title, description, and file.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Company Registration"
                disabled={isUploading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description for the document"
                disabled={isUploading}
                rows={3}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">File *</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  disabled={isUploading}
                />
                {selectedFile ? (
                  <div className="space-y-1">
                    <FileText className="h-8 w-8 mx-auto text-green-500" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to select a file
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX, JPG, PNG
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Destination */}
            <div className="space-y-2">
              <Label>Upload Destination</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={uploadDestination === 'api' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadDestination('api')}
                  className="flex-1"
                  disabled={isUploading}
                >
                  API Storage
                </Button>
                <Button
                  type="button"
                  variant={uploadDestination === 'public' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadDestination('public')}
                  className="flex-1"
                  disabled={isUploading}
                >
                  Public Folder
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {uploadDestination === 'api'
                  ? 'Upload to external API storage (neupgroup.com)'
                  : 'Upload to server /public folder'
                }
              </p>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUploadDocument}
              disabled={!title.trim() || !selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
