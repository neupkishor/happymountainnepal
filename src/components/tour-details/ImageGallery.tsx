import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"

interface ImageGalleryProps {
  images: string[];
  mainImage: string;
  tourName: string;
}

export function ImageGallery({ images, mainImage, tourName }: ImageGalleryProps) {
  const allImages = [mainImage, ...images];

  return (
    <div className="w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {allImages.map((src, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[40vh] md:h-[60vh] w-full">
                <Image
                  src={src}
                  alt={`${tourName} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  data-ai-hint="trekking landscape"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:inline-flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:inline-flex" />
      </Carousel>
    </div>
  )
}
