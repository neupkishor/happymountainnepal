'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFileUploads, logFileUpload } from '@/lib/db';
import type { FileUpload } from '@/lib/types';
import { FileUploadInput } from '@/components/manage/FileUploadInput';
import { useForm, FormProvider } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

export default function LegalDocumentsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const form = useForm(); // Dummy form provider for FileUploadInput

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const allUploads = await getFileUploads({ category: 'document' });
      setUploads(allUploads);
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

  const handleUploadSuccess = (url: string) => {
    toast({ title: 'Upload Successful', description: 'Document added to the library.' });
    fetchDocuments(); // Refresh the list
  };

  return (
    <FormProvider {...form}>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold !font-headline">Legal Documents</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage your company's licenses, registration certificates, and other important documents.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload New Document</CardTitle>
            <CardDescription>
              Accepted file types: Images (JPG, PNG, WebP) and PDF. Files will be categorized as "document".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadInput
              name="legal-document-upload"
              onUploadingChange={setIsUploading}
              onUploadSuccess={handleUploadSuccess}
              skipCompression={true}
              category="document"
            >
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <p>Click or drag file to this area to upload</p>
                {isUploading && <Loader2 className="h-6 w-6 animate-spin mx-auto mt-4" />}
              </div>
            </FileUploadInput>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
                ) : uploads.length === 0 ? (
                    <p className="text-muted-foreground text-center">No documents uploaded yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {uploads.map(file => (
                            <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer">
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="relative h-40 bg-muted">
                                        {file.fileType?.startsWith('image/') ? (
                                            <Image src={file.url} alt={file.fileName} fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-lg font-bold text-muted-foreground">PDF</div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <p className="font-semibold text-sm truncate">{file.fileName}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(file.uploadedAt), 'PPP')}</p>
                                    </div>
                                </Card>
                            </a>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}
