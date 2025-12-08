'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Link2, X, Check } from 'lucide-react';
import { addExternalMediaLink } from '@/lib/db';
import { Checkbox } from '@/components/ui/checkbox';

interface UploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUploadComplete: () => void;
}

export function UploadDialog({ open, onOpenChange, onUploadComplete }: UploadDialogProps) {
    const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
    const [uploadDestination, setUploadDestination] = useState<'api' | 'server'>('server');
    const [serverPath, setServerPath] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadOriginal, setUploadOriginal] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            if (uploadDestination === 'api') {
                // Upload to neupgroup.com API
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('platform', 'p3.happymountainnepal');
                formData.append('contentIds', JSON.stringify(['uploads', 'admin-user', 'upload-dialog']));
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
                    // Log to database
                    await fetch('/api/log-upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fileName: selectedFile.name,
                            url: result.url,
                            userId: 'admin',
                            fileType: selectedFile.type,
                            category: 'general',
                        }),
                    });

                    // Reset and close
                    setSelectedFile(null);
                    setUploadOriginal(false);
                    onUploadComplete();
                    onOpenChange(false);
                } else {
                    throw new Error(result.message || 'Unknown upload error');
                }
            } else {
                // Upload to local server
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('compress', (!uploadOriginal).toString());
                formData.append('uploadType', uploadDestination);
                formData.append('serverPath', serverPath);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                // Reset and close
                setSelectedFile(null);
                setUploadOriginal(false);
                onUploadComplete();
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleLinkUpload = async () => {
        if (!linkUrl.trim()) return;

        setIsUploading(true);
        try {
            await addExternalMediaLink(linkUrl, 'admin');

            // Reset and close
            setLinkUrl('');
            onUploadComplete();
            onOpenChange(false);
        } catch (error) {
            console.error('Link upload error:', error);
            alert('Failed to add media link. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const resetDialog = () => {
        setUploadMode('file');
        setUploadDestination('server');
        setServerPath('');
        setSelectedFile(null);
        setLinkUrl('');
        setUploadOriginal(false);
        setIsDragging(false);
    };

    return (
        <Dialog open={open} onOpenChange={(open) => {
            onOpenChange(open);
            if (!open) resetDialog();
        }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Media</DialogTitle>
                    <DialogDescription>
                        {uploadMode === 'file'
                            ? 'Drag and drop a file or click to browse'
                            : 'Enter the URL of the media you want to add'
                        }
                    </DialogDescription>
                </DialogHeader>

                {/* Mode Toggle */}
                <div className="flex items-center gap-2 mb-4">
                    <Button
                        variant={uploadMode === 'file' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setUploadMode('file')}
                        className="flex-1"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                    </Button>
                    <Button
                        variant={uploadMode === 'link' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setUploadMode('link')}
                        className="flex-1"
                    >
                        <Link2 className="h-4 w-4 mr-2" />
                        Add by Link
                    </Button>
                </div>

                {uploadMode === 'file' ? (
                    <div className="space-y-4">
                        {/* Drag and Drop Zone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors
                ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
                ${selectedFile ? 'bg-muted/50' : ''}
              `}
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            <input
                                id="file-input"
                                type="file"
                                className="hidden"
                                onChange={handleFileSelect}
                                accept="image/*,video/*"
                            />

                            {selectedFile ? (
                                <div className="space-y-2">
                                    <Check className="h-12 w-12 mx-auto text-green-500" />
                                    <p className="font-medium">{selectedFile.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Drag and drop your file here, or click to browse
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Supports images and videos
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Compression Option */}
                        {selectedFile && (
                            <>
                                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                    <Checkbox
                                        id="upload-original"
                                        checked={uploadOriginal}
                                        onCheckedChange={(checked) => setUploadOriginal(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="upload-original"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        Upload original (no compression)
                                    </label>
                                </div>

                                {/* Upload Destination */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Upload Destination</label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={uploadDestination === 'api' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setUploadDestination('api')}
                                            className="flex-1"
                                        >
                                            API Storage
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={uploadDestination === 'server' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setUploadDestination('server')}
                                            className="flex-1"
                                        >
                                            Server
                                        </Button>
                                    </div>

                                    {/* Server Path Input */}
                                    {uploadDestination === 'server' && (
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                value={serverPath}
                                                onChange={(e) => setServerPath(e.target.value)}
                                                placeholder="Optional: uploads, images, etc."
                                                className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Leave empty for /public or specify path like "uploads" for /public/uploads
                                            </p>
                                        </div>
                                    )}

                                    <p className="text-xs text-muted-foreground">
                                        {uploadDestination === 'api'
                                            ? 'Upload to external API storage service'
                                            : `Upload to server: /public${serverPath ? '/' + serverPath : ''}`
                                        }
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Upload Button */}
                        <Button
                            onClick={handleFileUpload}
                            disabled={!selectedFile || isUploading}
                            className="w-full"
                        >
                            {isUploading ? 'Uploading...' : 'Upload File'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* URL Input */}
                        <div className="space-y-2">
                            <label htmlFor="media-url" className="text-sm font-medium">
                                Media URL
                            </label>
                            <input
                                id="media-url"
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-3 py-2 border rounded-md bg-background"
                                disabled={isUploading}
                            />
                            <p className="text-xs text-muted-foreground">
                                The file will be hotlinked from this URL
                            </p>
                        </div>

                        {/* Add Link Button */}
                        <Button
                            onClick={handleLinkUpload}
                            disabled={!linkUrl.trim() || isUploading}
                            className="w-full"
                        >
                            {isUploading ? 'Adding...' : 'Add Link'}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
