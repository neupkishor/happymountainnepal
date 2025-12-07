
'use client';

import { useState, useEffect } from 'react';
import { getLegalDocuments } from '@/lib/db';
import type { LegalDocument } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import Link from 'next/link';

export default function LegalDocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const docs = await getLegalDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Failed to load legal documents", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <div className="container mx-auto py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold !font-headline">Legal Documents</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Our official documents for transparency and your peace of mind.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : documents.length > 0 ? (
          <div className="space-y-6">
            {documents.map(doc => (
              <Card key={doc.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      {doc.title}
                    </CardTitle>
                    {doc.description && <CardDescription className="mt-2">{doc.description}</CardDescription>}
                  </div>
                  <Button asChild>
                    <Link href={`/legal/documents/${doc.id}`}>
                      <Download className="mr-2 h-4 w-4" /> View Document
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Documents Available</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Please check back later for our official documents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
