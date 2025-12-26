
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLegalDocuments, deleteLegalDocument } from '@/lib/db';
import type { LegalDocument } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Trash2, FileText, ExternalLink, Upload as UploadIcon, Pencil } from 'lucide-react';
import Link from 'next/link';
import { DocumentViewer as DocumentCard } from '@/app/legal/documents/components/document-card';
import { cookies } from 'next/headers';

export default function LegalDocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [userEmail, setUserEmail] = useState('guest');
  const [deviceIdentifier, setDeviceIdentifier] = useState('client');

  // Client-safe cookie reading
  useEffect(() => {
    const cookieString = document.cookie;
    const emailCookie = cookieString.split('; ').find(row => row.startsWith('user_email='));
    const deviceIdCookie = cookieString.split('; ').find(row => row.startsWith('device_id='));
    
    if (emailCookie) {
      setUserEmail(decodeURIComponent(emailCookie.split('=')[1]));
    }
    if (deviceIdCookie) {
      setDeviceIdentifier(decodeURIComponent(deviceIdCookie.split('=')[1]));
    }
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const allDocs = await getLegalDocuments();
      setDocuments(allDocs);
    } catch (error) {
      console.error("Failed to load legal documents", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load legal documents.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;

    try {
      await deleteLegalDocument(id);
      toast({ title: 'Success', description: 'Document deleted.' });
      fetchDocuments();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete document.',
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold !font-headline">
            Legal Documents
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage licenses, certificates, and legal files.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/manage/legal/documents/upload">
            <UploadIcon className="h-4 w-4 mr-2" />
            Upload New Document
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 border rounded-lg animate-pulse"
            >
              <div className="h-20 w-20 bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No documents uploaded yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:shadow-md"
            >
              <div className="h-20 w-20 bg-muted rounded flex items-center justify-center">
                <DocumentCard
                  url={doc.url}
                  email={userEmail}
                  deviceId={deviceIdentifier}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{doc.title}</p>
                {doc.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {doc.description}
                  </p>
                )}
              </div>

              <div className="flex gap-1">
                <Button asChild variant="ghost" size="sm">
                  <Link
                    href={`/legal/documents/${doc.id}`}
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/manage/legal/documents/${doc.id}/edit`}>
                    <Pencil className="h-4 w-4" />
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
    </div>
  );
}
