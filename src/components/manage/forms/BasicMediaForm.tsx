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
import { type Tour, type FileUpload } from '@/lib/types';
import { updateTour, logError, getFileUploads } from '@/lib/db';
import { useTransition, useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaPicker } from '../MediaPicker';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const extractIframeSrc = (input: string): string => {
  if (!input) return '';
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
  const { toast } = useToast();
  const pathname = usePathname();

  const [allUploads, setAllUploads] = useState<FileUpload[]>([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mainImage: tour.mainImage || '',
      map: tour.map || '',
      images: tour.images || [],
    },
  });

  const currentImages = form.watch('images');

  useEffect(() => {
    const fetchUploads = async () => {
      setIsLoadingUploads(true);
      try {
        const uploads = await getFileUploads({ category: 'trip' });
        setAllUploads(uploads);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load media library.',
        });
      } finally {
        setIsLoadingUploads(false);
      }
    };
    fetchUploads();
  }, [toast]);

  const toggleImageSelection = (url: string) => {
    const currentSelection = form.getValues('images');
    const newSelection = currentSelection.includes(url)
      ? currentSelection.filter(u => u !== url)
      : [...currentSelection, url];
    form.setValue('images', newSelection, { shouldDirty: true, shouldValidate: true });
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
              <FormLabel>Gallery Images</FormLabel>
              <p className="text-sm text-muted-foreground">Click on any image below to add or remove it from the tour's gallery.</p>
              
              {isLoadingUploads ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : allUploads.length === 0 ? (
                  <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                      <ImageIcon className="mx-auto h-12 w-12 mb-4" />
                      <p>No trip images found in your library. Upload some using the Main Image picker.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {allUploads.map((file) => (
                          <div
                            key={file.id}
                            className={cn(
                              'relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all group',
                              currentImages.includes(file.url) ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted-foreground'
                            )}
                            onClick={() => toggleImageSelection(file.url)}
                          >
                            <Image
                                src={file.url}
                                alt={file.fileName}
                                fill
                                className="object-cover"
                            />
                             {currentImages.includes(file.url) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity">
                                    <CheckCircle2 className="h-8 w-8 text-white" />
                                </div>
                             )}
                          </div>
                      ))}
                  </div>
              )}
              <FormMessage>{form.formState.errors.images?.message}</FormMessage>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save All Media
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
}
