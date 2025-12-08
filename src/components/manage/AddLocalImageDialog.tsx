'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { logFileUpload } from '@/lib/db';
import type { UploadCategory } from '@/lib/types';

interface AddLocalImageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    category?: UploadCategory;
}

export function AddLocalImageDialog({ isOpen, onClose, onSuccess, category = 'general' }: AddLocalImageDialogProps) {
    const [fileName, setFileName] = useState('');
    const [relativePath, setRelativePath] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<UploadCategory>(category);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const categories: UploadCategory[] = ['general', 'trip', 'document', 'background', 'feature-icon', 'user-photo', 'blog', 'logo', 'author'];

    const handleSubmit = async () => {
        if (!fileName || !relativePath) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please fill in all required fields.',
            });
            return;
        }

        // Ensure path starts with /
        const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

        setIsSubmitting(true);
        try {
            await logFileUpload({
                fileName,
                url: normalizedPath, // For relative paths, url is the same as path
                userId: 'admin-user',
                category: selectedCategory,
                pathType: 'relative',
                path: normalizedPath,
                uploadSource: 'Application',
                fileType: getFileTypeFromPath(normalizedPath),
            });

            toast({
                title: 'Success',
                description: 'Local image added to library.',
            });

            // Reset form
            setFileName('');
            setRelativePath('');
            setSelectedCategory(category);

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error adding local image:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to add local image.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFileTypeFromPath = (path: string): string => {
        const extension = path.split('.').pop()?.toLowerCase();
        if (!extension) return 'application/octet-stream';

        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        const videoExtensions = ['mp4', 'webm', 'ogg'];
        const pdfExtensions = ['pdf'];

        if (imageExtensions.includes(extension)) {
            return `image/${extension === 'jpg' ? 'jpeg' : extension}`;
        } else if (videoExtensions.includes(extension)) {
            return `video/${extension}`;
        } else if (pdfExtensions.includes(extension)) {
            return 'application/pdf';
        }
        return 'application/octet-stream';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Local Image from /public</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="fileName">File Name *</Label>
                        <Input
                            id="fileName"
                            placeholder="e.g., hero-image.jpg"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            A descriptive name for this file
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="relativePath">Relative Path *</Label>
                        <Input
                            id="relativePath"
                            placeholder="e.g., /images/hero.jpg"
                            value={relativePath}
                            onChange={(e) => setRelativePath(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Path relative to /public directory (e.g., /images/hero.jpg for public/images/hero.jpg)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as UploadCategory)}>
                            <SelectTrigger id="category">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add to Library'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
