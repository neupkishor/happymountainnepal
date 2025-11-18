
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Grid } from 'lucide-react';
import { ImageViewerDialog } from './ImageViewerDialog';

interface ImageGalleryProps {
  images: string[];
  mainImage: string;
  tourName: string;
}

export function ImageGallery({ images, mainImage, tourName }: ImageGalleryProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const allImages = [mainImage, ...images];
  const galleryImages = images.slice(0, 2); // Show up to 2 smaller images
  
  const openViewer = (index: number) => {
    setViewerInitialIndex(index);
    setIsViewerOpen(true);
  };

  return (
    <>
      <div className="container mx-auto pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4 h-[60vh] max-h-[500px]">
          {/* Main Image */}
          <div 
            className="md:row-span-2 relative rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => openViewer(0)}
          >
            <Image
              src={mainImage}
              alt={tourName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority
              data-ai-hint="trekking landscape"
            />
             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
          </div>

          {/* Smaller Images */}
          {galleryImages.map((src, index) => (
            <div 
              key={src + index} 
              className="relative rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openViewer(index + 1)}
            >
              <Image
                src={src}
                alt={`${tourName} - gallery image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="mountain scene"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            </div>
          ))}

          {/* View All Button */}
          {images.length > 2 && galleryImages.length === 2 && (
             <div 
                className="relative rounded-lg overflow-hidden cursor-pointer group flex items-center justify-center bg-secondary"
                onClick={() => openViewer(0)}
            >
                <Image
                    src={images[1]} // Use the second image as background for button
                    alt="View all gallery images"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 filter blur-sm"
                />
                <div className="absolute inset-0 bg-black/50" />
                <Button variant="secondary" className="relative">
                    <Grid className="mr-2 h-4 w-4" />
                    View All Galleries
                </Button>
            </div>
          )}
        </div>
      </div>
      <ImageViewerDialog
        images={allImages}
        tourName={tourName}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        initialIndex={viewerInitialIndex}
      />
    </>
  );
}
