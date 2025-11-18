'use client';

import { useForm, FormProvider } from 'react-hook-form';
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
import { Loader2, Library, GripVertical, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaLibraryDialog } from '../MediaLibraryDialog';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Reorder } from 'framer-motion';

const extractIframeSrc = (input: string): string => {
  if (!input) return '';
  const iframeRegex = /<iframe.*?src="(.*?)"[^>]*><\/iframe>/;
  const match = input.match(iframeRegex);
  return match ? match[1] : input;
};

// The form now manages a single array of all images.
const formSchema = z.object({
  map: z.string().transform(val => extractIframeSrc(val)).pipe(
    z.string().url({ message: "Please enter a valid map URL." }).min(1, "Map URL is required.")
  ),
  allImages: z.array(z.string().url()).min(1, "Please select at least one image."),
});

type FormValues = z.infer<typeof formSchema>;

interface BasicMediaFormProps {
  tour: Tour;
}

export function BasicMediaForm({ tour }: BasicMediaFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      map: tour.map || '',
      // Combine mainImage and gallery images into a single array for the form
      allImages: [tour.mainImage, ...(tour.images || [])].filter(Boolean),
    },
  });

  const allImages = form.watch('allImages');

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        // Before updating, split the `allImages` array back into `mainImage` and `images`
        const [mainImage, ...galleryImages] = values.allImages;
        const dataToUpdate = {
          map: values.map,
          mainImage: mainImage || '',
          images: galleryImages,
        };

        await updateTour(tour.id, dataToUpdate);
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
  
  const handleSelectImages = (urls: string[]) => {
      form.setValue('allImages', urls, { shouldDirty: true, shouldValidate: true });
      setIsLibraryOpen(false);
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Tour Images</h3>
                        <p className="text-sm text-muted-foreground mb-4">Select all images for the tour. Drag and drop to reorder. The first image will be the main cover image.</p>
                        <Button type="button" variant="outline" onClick={() => setIsLibraryOpen(true)}>
                            <Library className="mr-2 h-4 w-4" />
                            Select Images from Library
                        </Button>
                        <FormMessage className="mt-2">{form.formState.errors.allImages?.message}</FormMessage>

                        <Reorder.Group
                            axis="y"
                            values={allImages}
                            onReorder={(newOrder) => form.setValue('allImages', newOrder, { shouldDirty: true })}
                            className="mt-4 space-y-2"
                        >
                            {allImages.map((url, index) => (
                            <Reorder.Item key={url} value={url}>
                                <div className="flex items-center gap-4 p-2 border rounded-lg bg-card cursor-grab active:cursor-grabbing">
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    <div className="relative h-16 w-24 rounded-md overflow-hidden">
                                        <Image src={url} alt={`Selected image ${index + 1}`} fill className="object-cover" />
                                    </div>
                                    <span className="text-sm text-muted-foreground truncate flex-grow">{url.split('/').pop()}</span>
                                    {index === 0 && <span className="text-xs font-semibold text-primary-foreground bg-primary px-2 py-1 rounded-full">Main Image</span>}
                                </div>
                            </Reorder.Item>
                            ))}
                        </Reorder.Group>
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

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Media
          </Button>
        </form>
      </Form>
      <MediaLibraryDialog 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={handleSelectImages}
        initialSelectedUrls={allImages}
        defaultCategory='trip'
      />
    </FormProvider>
  );
}
