
'use client';

import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
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
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '../ImageUpload';
import { usePathname } from 'next/navigation';

const formSchema = z.object({
  mainImage: z.string().url({ message: "Please upload a main image." }).min(1, "Main image is required."),
  mapImage: z.string().url({ message: "Please upload a map image." }).min(1, "Map image is required."),
  images: z.array(z.string().url({ message: "Please enter a valid URL." }).min(1, "Image URL cannot be empty.")),
});

type FormValues = z.infer<typeof formSchema>;

interface MediaFormProps {
  tour: Tour;
}

export function MediaForm({ tour }: MediaFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mainImage: tour.mainImage || '',
      images: tour.images || [],
      mapImage: tour.mapImage || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'images'
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await updateTour(tour.id, values);
        toast({ title: 'Success', description: 'Media updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update media for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values: values } });
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
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div>
                <h3 className="text-lg font-medium mb-2">Main Image</h3>
                <ImageUpload name="mainImage" />
                <FormMessage>{form.formState.errors.mainImage?.message}</FormMessage>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Map Image</h3>
                <ImageUpload name="mapImage" />
                <FormMessage>{form.formState.errors.mapImage?.message}</FormMessage>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Images</h3>
                {fields.map((field, index) => (
                   <div key={field.id} className="flex items-center gap-2 p-4 border rounded-lg">
                     <div className="w-full">
                        <ImageUpload name={`images.${index}`} />
                        <FormMessage>{form.formState.errors.images?.[index]?.message}</FormMessage>
                     </div>
                     <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={isPending}>
                       <Trash2 className="h-4 w-4 text-destructive" />
                     </Button>
                   </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append('')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Media
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
