
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { type Tour } from '@/lib/types';
import { updateTour, logError } from '@/lib/db';
import { useTransition } from 'react';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';

const itineraryItemSchema = z.object({
  day: z.coerce.number().int().min(1),
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
});

const formSchema = z.object({
  itinerary: z.array(itineraryItemSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface ItineraryFormProps {
  tour: Tour;
}

export function ItineraryForm({ tour }: ItineraryFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itinerary: tour.itinerary || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "itinerary",
  });

  const onSubmit = (values: FormValues) => {
    // Sort itinerary by day before submitting
    const sortedItinerary = [...values.itinerary].sort((a, b) => a.day - b.day);
    
    startTransition(async () => {
      try {
        await updateTour(tour.id, { itinerary: sortedItinerary });
        toast({ title: 'Success', description: 'Itinerary updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update itinerary for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values: values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save itinerary. Please try again.',
        });
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md relative">
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => remove(index)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name={`itinerary.${index}.day`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-1">
                          <FormLabel>Day</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} disabled={isPending} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itinerary.${index}.title`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-3">
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Arrival in Kathmandu" {...field} disabled={isPending} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`itinerary.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Details about the day's activities..." {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => append({ day: fields.length + 1, title: '', description: '' })}
                    disabled={isPending}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Day
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Itinerary
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    
