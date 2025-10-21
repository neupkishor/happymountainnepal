
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getLegalDocuments, addLegalDocument, deleteLegalDocument } from '@/lib/db';
import type { LegalDocument } from '@/lib/types';
import { MediaLibraryDialog } from '@/components/manage/MediaLibraryDialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';

export default function LegalDocumentsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDescription, setNewDocDescription] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');

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

  const handleSelectFile = (urls: string[]) => {
    if (urls.length > 0) {
      setNewDocUrl(urls[0]);
    }
    setIsLibraryOpen(false);
  };
  
  const handleAddDocument = async () => {
      if (!newDocTitle || !newDocUrl) {
          toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a title and select a file.'});
          return;
      }
      setIsUploading(true);
      try {
          await addLegalDocument({
              title: newDocTitle,
              description: newDocDescription,
              url: newDocUrl,
          });
          toast({ title: 'Success', description: 'Legal document added.'});
          setNewDocTitle('');
          setNewDocDescription('');
          setNewDocUrl('');
          fetchDocuments();
      } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to add document.'});
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Legal Documents</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage your company's licenses, registration certificates, and other important documents.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Document</CardTitle>
          <CardDescription>
            Select a document from your library and provide a title.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Document Title (e.g., Company Registration)"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            disabled={isUploading}
          />
          <Textarea 
            placeholder="Optional description for the document."
            value={newDocDescription}
            onChange={(e) => setNewDocDescription(e.target.value)}
            disabled={isUploading}
          />
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setIsLibraryOpen(true)}
              disabled={isUploading}
            >
              Select File
            </Button>
            {newDocUrl && <span className="text-sm text-muted-foreground truncate max-w-xs">{newDocUrl.split('/').pop()}</span>}
          </div>
          <Button onClick={handleAddDocument} disabled={isUploading || !newDocTitle || !newDocUrl}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Add Document
          </Button>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
              {isLoading ? (
                  <div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
              ) : documents.length === 0 ? (
                  <p className="text-muted-foreground text-center">No documents uploaded yet.</p>
              ) : (
                  <div className="space-y-4">
                      {documents.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                               <FileText className="h-6 w-6 text-muted-foreground" />
                               <div>
                                    <p className="font-semibold">{doc.title}</p>
                                    {doc.description && <p className="text-sm text-muted-foreground">{doc.description}</p>}
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={doc.url} target="_blank" rel="noopener noreferrer">View</Link>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                          </div>
                      ))}
                  </div>
              )}
          </CardContent>
      </Card>
      
      <MediaLibraryDialog 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={handleSelectFile}
        defaultCategory="document"
      />
    </div>
  );
}
