'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getFileNameFromUrl } from '@/lib/utils';

interface ImageViewerDialogProps {
  images: string[];
  tourName: string;
  isOpen: boolean;
  onClose: () => void;
  initialIndex: number;
}

export function ImageViewerDialog({
  images,
  tourName,
  isOpen,
  onClose,
  initialIndex,
}: ImageViewerDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) setCurrentImageIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const goToNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPreviousImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === 'ArrowRight') goToNextImage();
      else if (event.key === 'ArrowLeft') goToPreviousImage();
      else if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToNextImage, goToPreviousImage, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentImageIndex];
  const currentImageName = getFileNameFromUrl(currentImage);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]" />
      <DialogContent className="fixed inset-0 z-[9999] flex items-center justify-center p-0 border-none bg-transparent">
        <DialogHeader>
          <DialogTitle className="sr-only">Image Viewer</DialogTitle>
          <DialogDescription className="sr-only">
            Viewing image {currentImageIndex + 1} of {images.length}: {currentImageName}
          </DialogDescription>
        </DialogHeader>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Image Navigation */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 z-50 text-white hover:bg-white/20"
          onClick={goToPreviousImage}
        >
          <ChevronLeft className="h-10 w-10" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 z-50 text-white hover:bg-white/20"
          onClick={goToNextImage}
        >
          <ChevronRight className="h-10 w-10" />
        </Button>

        {/* Image Display */}
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <Image
              src={currentImage}
              alt={`${tourName} - ${currentImageName}`}
              fill
              className="object-contain rounded-lg"
              priority
            />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-md text-sm">
            {currentImageName}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
