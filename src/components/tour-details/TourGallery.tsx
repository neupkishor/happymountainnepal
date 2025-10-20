'use client';

import { useState } from 'react';
import { GalleryGrid } from './GalleryGrid';
import { ImageViewerDialog } from './ImageViewerDialog';

interface TourGalleryProps {
  images: string[];
  tourName: string;
}

export function TourGallery({ images, tourName }: TourGalleryProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return null; // Don't render if no images
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
      <GalleryGrid images={images} tourName={tourName} onImageClick={openViewer} />
      <ImageViewerDialog
        images={images}
        tourName={tourName}
        isOpen={isViewerOpen}
        onClose={closeViewer}
        initialIndex={currentImageIndex}
      />
    </>
  );
}