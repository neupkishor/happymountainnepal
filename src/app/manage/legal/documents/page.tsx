
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLegalDocuments, deleteLegalDocument } from '@/lib/db';
import type { LegalDocument } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, FileText, ExternalLink, Upload as UploadIcon } from 'lucide-react';
import Link from 'next/link';
import { DocumentViewer as DocumentCard } from '@/app/legal/documents/components/document-card';
import { useCookies } from 'next-client-cookies';

export default function LegalDocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const cookies = useCookies();
  const userEmail = cookies.get('user_email') || 'guest';
  const deviceIdentifier = 'server-placeholder'; // This is fine for admin view

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

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;
    try {
      await deleteLegalDocument(id);
      toast({ title: 'Success', description: 'Document deleted.' });
      fetchDocuments(); // Refresh the list
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
        <Button asChild variant="outline">
          <Link href="/manage/legal/documents/upload">
            <UploadIcon className="h-4 w-4 mr-2" />
            Upload New Document
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 border rounded-lg bg-card animate-pulse"
            >
              <div className="h-20 w-20 rounded-md bg-muted flex-shrink-0"></div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>
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
              <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                <DocumentCard
                  url={doc.url}
                  email={userEmail}
                  deviceId={deviceIdentifier}
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/manage/legal/documents/${doc.id}/edit`} className="block hover:underline">
                  <h3 className="font-medium truncate mb-1" title={doc.title}>
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                </Link>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/legal/documents/${doc.id}`} target="_blank" rel="noopener noreferrer">
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
    </div>
  );
}
