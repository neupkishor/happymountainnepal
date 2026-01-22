
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLegalDocuments, getLegalSettings, updateLegalSettings } from '@/lib/db';
import type { LegalDocument } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Upload as UploadIcon, Plus, ChevronRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Switch } from "@/components/ui/switch";

export default function LegalDocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGlobalProtectionEnabled, setIsGlobalProtectionEnabled] = useState(true);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const [allDocs, settings] = await Promise.all([
        getLegalDocuments(),
        getLegalSettings()
      ]);
      setDocuments(allDocs);
      setIsGlobalProtectionEnabled(settings.requireEmailProtection);
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

  const handleToggleGlobalProtection = async (enabled: boolean) => {
    // Optimistic update
    setIsGlobalProtectionEnabled(enabled);

    try {
      await updateLegalSettings({ requireEmailProtection: enabled });
      toast({
        title: enabled ? 'Protection Enabled' : 'Protection Disabled',
        description: enabled
          ? 'Users must now verify email to view documents.'
          : 'Documents are now publicly viewable (watermarked).'
      });
    } catch (error) {
      console.error("Failed to update settings", error);
      setIsGlobalProtectionEnabled(!enabled); // Revert
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update protection settings."
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
      ) : (
        <div className="space-y-4">
          {/* Global Settings Card */}
          <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/10 dark:border-blue-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Global Protection
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    If enabled, all documents require users to verify their email before viewing.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isGlobalProtectionEnabled}
                    onCheckedChange={handleToggleGlobalProtection}
                  />
                  <span className="text-sm font-medium w-16 text-right">
                    {isGlobalProtectionEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add New Document Card */}
          <Link href="/manage/legal/documents/upload" className="block">
            <Card className="cursor-pointer border-dashed hover:bg-primary/5 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-16 w-24 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UploadIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-primary">Upload New Document</h3>
                  <p className="text-sm text-muted-foreground">
                    Click to upload a new legal document, certificate, or license.
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Document List */}
          {documents.map(doc => (
            <Link
              key={doc.id}
              href={`/manage/legal/documents/${doc.id}`}
              className="block"
            >
              <Card className="hover:bg-accent/5 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-20 w-20 bg-muted rounded flex items-center justify-center overflow-hidden border">
                    <div className="relative w-full h-full bg-white flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={doc.url}
                        alt={doc.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-base">{doc.title}</p>
                    {doc.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {doc.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic mt-1">
                        No description provided
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-muted-foreground">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {documents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No documents found besides the option to add one above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
