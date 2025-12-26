
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, UploadIcon, FileText, XCircle } from 'lucide-react';
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
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!title.trim() || !selectedFile) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please provide a title and select a file.' });
            return;
        }

        startTransition(async () => {
            try {
                // For legal documents, we'll use the neupgroup.com API for secure storage
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('platform', 'p3.happymountainnepal');
                formData.append('contentIds', JSON.stringify(['legal-documents', 'admin-user', 'upload-page']));
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
                if (!result.success || !result.url) {
                    throw new Error(result.message || 'Unknown upload error');
                }

                const fileUrl = result.url;

                // Add document to our database
                await addLegalDocument({
                    title: title.trim(),
                    description: description.trim(),
                    url: fileUrl,
                });
                
                toast({ title: 'Success', description: 'Legal document uploaded successfully.' });
                router.push('/manage/legal/documents');
                router.refresh();

            } catch (error: any) {
                console.error('Upload error:', error);
                toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to upload document.' });
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Button asChild variant="ghost" className="pl-0 mb-4">
                    <Link href="/manage/legal/documents">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Documents
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold !font-headline">Upload New Document</h1>
                 <p className="text-muted-foreground mt-2">
                    Add a new legal document to your site.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Document Details</CardTitle>
                    <CardDescription>Provide a title, description (optional), and the file to upload.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="title">Document Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Company Registration Certificate"
                            disabled={isSubmitting}
                        />
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A brief description of what this document is."
                            disabled={isSubmitting}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file-upload">File *</Label>
                        <div
                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors mt-2"
                            onClick={() => document.getElementById('file-upload')?.click()}
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
                                <div className="space-y-1">
                                    <FileText className="h-8 w-8 mx-auto text-green-500" />
                                    <p className="text-sm font-medium">{selectedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB - Ready to upload
                                    </p>
                                    <Button variant="ghost" size="sm" onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                    }} className="mt-2 text-destructive">
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Remove Selection
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <UploadIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Click to browse or drag & drop a file
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PDF, DOC, DOCX, JPG, PNG
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button onClick={handleUpload} disabled={isSubmitting || !title.trim() || !selectedFile}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
