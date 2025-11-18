'use client';

import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { type Tour } from '@/lib/types';
import { updateTour, logError } from '@/lib/db';
import { useTransition, useState } from 'react';
import { Loader2, PlusCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaPicker } from '../MediaPicker';
import { usePathname } from 'next/navigation';
import { MediaLibraryDialog } from '../MediaLibraryDialog';
import { getFileNameFromUrl } from '@/lib/utils';
import Image from 'next/image';

const extractIframeSrc = (input: string): string => {
  const iframeRegex = /<iframe.*?src="(.*?)"[^>]*><\/iframe>/;
  const match = input.match(iframeRegex);
  return match ? match[1] : input;
};

const formSchema = z.object({
  mainImage: z.string().url({ message: "Please upload a main image." }).min(1, "Main image is required."),
  map: z.string().transform(val => extractIframeSrc(val)).pipe(
    z.string().url({ message: "Please enter a valid map URL." }).min(1, "Map URL is required.")
  ),
  images: z.array(z.string().url({ message: "Please enter a valid URL." }).min(1, "Image URL cannot be empty.")),
});

type FormValues = z.infer<typeof formSchema>;

interface BasicMediaFormProps {
  tour: Tour;
}

export function BasicMediaForm({ tour }: BasicMediaFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mainImage: tour.mainImage || '',
      map: tour.map || '',
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

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await updateTour(tour.id, values);
        toast({ title: 'Success', description: 'Media and gallery updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update media for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save media. Please try again.',
        });
      }
    });
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Main Image</h3>
                <MediaPicker name="mainImage" category="trip" />
                <FormMessage>{form.formState.errors.mainImage?.message}</FormMessage>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Map URL</h3>
                <FormField
                  control={form.control}
                  name="map"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="e.g., https://www.google.com/maps/d/u/0/viewer?mid=... or full iframe tag"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <FormLabel>Additional Gallery Images</FormLabel>
              <p className="text-sm text-muted-foreground">These images will be displayed in the tour's photo gallery.</p>
              
              {currentImages.length === 0 ? (
                  <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                      <ImageIcon className="mx-auto h-12 w-12 mb-4" />
                      <p>No additional images selected.</p>
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
                  Select Gallery Images
              </Button>
              <FormMessage>{form.formState.errors.images?.message}</FormMessage>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save All Media
          </Button>
        </form>
      </Form>
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
