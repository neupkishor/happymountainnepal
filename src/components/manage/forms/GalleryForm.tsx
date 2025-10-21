'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { type Tour } from '@/lib/types';
import { updateTour, logError } from '@/lib/db';
import { useTransition } from 'react';
import { Loader2, PlusCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaLibraryDialog } from '../MediaLibraryDialog';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Label } from '@/components/ui/label';

// Define an explicit interface for FormValues
interface GalleryFormValues {
  images: string[];
}

const formSchema = z.object({
  images: z.array(z.string().url({ message: "Please enter a valid URL." }).min(1, "Image URL cannot be empty.")),
});

interface GalleryFormProps {
  tour: Tour;
}

// Helper to extract filename from URL
const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const fileNameWithExtension = pathSegments[pathSegments.length - 1];
    // Remove query parameters and hash from filename
    return fileNameWithExtension.split('?')[0].split('#')[0];
  } catch (error) {
    return url; // Return original URL if parsing fails
  }
};

export function GalleryForm({ tour }: GalleryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: tour.images || [],
    },
  });

  const currentImages = form.watch('images');

  const handleSelectImages = (urls: string[]) => {
    form.setValue('images', urls, { shouldValidate: true, shouldDirty: true });
    setIsLibraryOpen(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = currentImages.filter((_, index) => index !== indexToRemove);
    form.setValue('images', updatedImages, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = (values: GalleryFormValues) => {
    console.log('[GalleryForm] Submitting values:', values);
    startTransition(async () => {
      try {
        await updateTour(tour.id, values);
        toast({ title: 'Success', description: 'Gallery images updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update gallery for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values: values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save gallery images. Please try again.',
        });
      }
    });
  };

  return (
    <FormProvider {...form}>
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="space-y-4">
                <Label>Additional Images</Label>
                <p className="text-sm text-muted-foreground">These images will be displayed in the tour's photo gallery.</p>
                
                {currentImages.length === 0 ? (
                    <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                        <ImageIcon className="mx-auto h-12 w-12 mb-4" />
                        <p>No images selected yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {currentImages.map((imageUrl, index) => (
                            <div key={imageUrl + index} className="relative group rounded-lg overflow-hidden border">
                                <Image
                                    src={imageUrl}
                                    alt={getFileNameFromUrl(imageUrl)}
                                    width={200}
                                    height={150}
                                    className="w-full h-32 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleRemoveImage(index)}
                                        disabled={isPending}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 truncate">
                                    {getFileNameFromUrl(imageUrl)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <Button type="button" variant="outline" className="w-full" disabled={isPending} onClick={() => setIsLibraryOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Select Images from Library
                </Button>
                <FormMessage>{form.formState.errors.images?.message}</FormMessage>
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Gallery
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <MediaLibraryDialog
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={handleSelectImages}
        initialSelectedUrls={currentImages}
        defaultCategory="trip"
      />
    </FormProvider>
  );
}
