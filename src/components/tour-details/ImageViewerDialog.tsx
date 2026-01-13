'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFileNameFromUrl } from '@/lib/utils';
import type { ImageWithCaption } from '@/lib/types';

interface ImageViewerDialogProps {
  images: ImageWithCaption[];
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
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Update index when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setCaptionExpanded(false);
    }
  }, [isOpen, initialIndex]);

  // Check if caption is truncated
  useEffect(() => {
    if (captionRef.current && !captionExpanded) {
      const element = captionRef.current;
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [currentIndex, captionExpanded]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentIndex, images.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setCaptionExpanded(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setCaptionExpanded(false);
  };

  // Touch swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (images.length <= 1) return;

    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // minimum distance for a swipe

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped left - go to next
        handleNext();
      } else {
        // Swiped right - go to previous
        handlePrevious();
      }
    }
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];
  const caption = currentImage.caption || tourName;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/60 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Previous Button */}
      {images.length > 1 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Main Image Container with margins and rounded corners */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full h-full overflow-hidden rounded-2xl">
          <Image
            src={String(currentImage.url)}
            alt={currentImage.caption || currentImage.story || tourName}
            fill
            className="object-contain"
            priority
            sizes="100vw"
            quality={95}
          />
        </div>
      </div>

      {/* Caption Overlay */}
      {(currentImage.caption || currentImage.story || currentImage.posted_by) && (
        <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-24 pb-8 px-6 pointer-events-auto">
            <div className="max-w-5xl mx-auto space-y-2">
              {currentImage.posted_by && (
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <span className="font-medium">Posted by: {currentImage.posted_by}</span>
                </div>
              )}
              {currentImage.story && (
                <p
                  ref={captionRef}
                  className={`text-white text-lg font-medium leading-relaxed ${captionExpanded ? '' : 'line-clamp-2'
                    }`}
                >
                  {currentImage.story}
                </p>
              )}
              {currentImage.caption && !currentImage.story && (
                <p
                  ref={captionRef}
                  className={`text-white/90 text-base italic leading-relaxed ${captionExpanded ? '' : 'line-clamp-1'
                    }`}
                >
                  {currentImage.caption}
                </p>
              )}
              {isTruncated && (
                <button
                  onClick={() => setCaptionExpanded(!captionExpanded)}
                  className="text-white/80 hover:text-white text-sm mt-2 transition-colors underline decoration-dotted"
                >
                  {captionExpanded ? 'Show less' : '...more'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
