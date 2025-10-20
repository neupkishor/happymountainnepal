'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { getFileNameFromUrl } from '@/lib/utils';

interface GalleryGridProps {
  images: string[];
  tourName: string;
  onImageClick: (index: number) => void;
}

export function GalleryGrid({ images, tourName, onImageClick }: GalleryGridProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold !font-headline mb-6">Gallery</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((src, index) => (
          <Card key={index} className="overflow-hidden cursor-pointer" onClick={() => onImageClick(index)}>
            <CardContent className="p-0">
              <div className="relative w-full h-48">
                <Image
                  src={src}
                  alt={`${tourName} - Gallery Image ${index + 1} - ${getFileNameFromUrl(src)}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  data-ai-hint="trekking landscape"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}