'use client';

import { useState } from 'react';
import { GalleryGrid } from './GalleryGrid';
import { ImageViewerDialog } from './ImageViewerDialog';
import type { ImageWithCaption } from '@/lib/types';

interface TourGalleryProps {
  images: ImageWithCaption[];
  tourName: string;
}

export function TourGallery({ images, tourName }: TourGalleryProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Filter out invalid images
  const validImages = images.filter(img => img && img.url && typeof img.url === 'string' && img.url.trim().length > 0);

  if (!validImages || validImages.length === 0) {
    return null; // Don't render if no valid images
  }

  const openViewer = (index: number) => {
    setCurrentImageIndex(index);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
  };

  return (
    <>
      <GalleryGrid images={validImages} tourName={tourName} onImageClick={openViewer} />
      <ImageViewerDialog
        images={validImages}
        tourName={tourName}
        isOpen={isViewerOpen}
        onClose={closeViewer}
        initialIndex={currentImageIndex}
      />
    </>
  );
}