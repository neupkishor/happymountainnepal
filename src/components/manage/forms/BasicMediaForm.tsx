'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { type Tour } from '@/lib/types';
import { updateTour, logError } from '@/lib/db';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaPicker } from '../MediaPicker';
import { usePathname } from 'next/navigation';

// Define an explicit interface for FormValues
interface BasicMediaFormValues {
  mainImage: string;
  map: string;
}

// Helper function to extract src from iframe
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
});

interface BasicMediaFormProps {
  tour: Tour;
}

export function BasicMediaForm({ tour }: BasicMediaFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<BasicMediaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mainImage: tour.mainImage || '',
      map: tour.map || '',
    },
  });

  const onSubmit = (values: BasicMediaFormValues) => {
    console.log('[BasicMediaForm] Submitting values:', values);
    startTransition(async () => {
      try {
        await updateTour(tour.id, values);
        toast({ title: 'Success', description: 'Basic media updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update basic media for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values: values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save basic media. Please try again.',
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

              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Basic Media
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
