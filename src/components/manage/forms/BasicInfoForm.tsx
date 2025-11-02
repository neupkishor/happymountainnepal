
'use client';

import { useForm } from 'react-hook-form';
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
import { updateTour, logError, checkSlugAvailability, validateTourForPublishing } from '@/lib/db';
import { useTransition, useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePathname } from 'next/navigation';
import { slugify } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

const formSchema = z.object({
  name: z.string().min(5, { message: "Name must be at least 5 characters." }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters." }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and use hyphens for spaces."),
  region: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)).refine(val => val.length > 0, { message: "At least one region is required." }), // Updated schema for string[]
  type: z.enum(['Trek', 'Tour', 'Peak Climbing']),
  difficulty: z.enum(['Easy', 'Moderate', 'Strenuous', 'Challenging']),
  duration: z.coerce.number().int().min(1, { message: "Duration must be at least 1 day." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  status: z.enum(['draft', 'published', 'unpublished']), // Added status field
});

type FormValues = z.infer<typeof formSchema>;

interface BasicInfoFormProps {
  tour: Tour;
}

export function BasicInfoForm({ tour }: BasicInfoFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tour.name || '',
      slug: tour.slug || slugify(tour.name || 'new-package'),
      region: Array.isArray(tour.region) ? tour.region.join(', ') : tour.region || '', // Handle existing string or array
      type: tour.type || 'Trek',
      difficulty: tour.difficulty || 'Moderate',
      duration: tour.duration || 0,
      description: tour.description || '',
      status: tour.status || 'draft', // Set default from tour prop
    },
  });

  const name = form.watch('name');
  const currentSlug = form.watch('slug');
  const currentStatus = form.watch('status'); // Watch status field
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const debouncedSlug = useDebounce(currentSlug, 500);

  // Auto-generate slug from name if not manually edited
  useEffect(() => {
    if (!isSlugManuallyEdited && name) {
      form.setValue('slug', slugify(name), { shouldValidate: true });
    }
  }, [name, isSlugManuallyEdited, form]);

  // Check slug availability
  useEffect(() => {
    const checkAvailability = async () => {
      if (debouncedSlug && form.formState.errors.slug?.message === undefined) { // Only check if slug is valid format
        setIsSlugChecking(true);
        try {
          const available = await checkSlugAvailability(debouncedSlug, tour.id);
          setIsSlugAvailable(available);
          if (!available) {
            form.setError('slug', { type: 'manual', message: 'This slug is already taken.' });
          } else {
            form.clearErrors('slug');
          }
        } catch (error) {
          console.error("Error checking slug availability:", error);
          setIsSlugAvailable(false);
          form.setError('slug', { type: 'manual', message: 'Could not check slug availability.' });
        } finally {
          setIsSlugChecking(false);
        }
      } else {
        setIsSlugAvailable(null);
      }
    };
    checkAvailability();
  }, [debouncedSlug, tour.id, form, form.formState.errors.slug?.message]);


  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        // If status is being changed to 'published', run validation
        if (values.status === 'published' && tour.status !== 'published') {
          const validationResult = await validateTourForPublishing(tour.id);
          if (validationResult !== true) {
            toast({
              variant: 'destructive',
              title: 'Cannot Publish',
              description: (
                <div>
                  <p>The package cannot be published due to missing information:</p>
                  <ul className="list-disc list-inside mt-2">
                    {validationResult.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              ),
            });
            return; // Prevent update if validation fails
          }
        }

        await updateTour(tour.id, values);
        toast({ title: 'Success', description: 'Basic info updated.' });
      } catch (error: any) {
        console.error("Failed to save package:", error);
        logError({ message: `Failed to update basic info for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values: values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save package. Please try again.',
        });
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Everest Base Camp Trek" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="e.g., everest-base-camp-trek"
                        {...field}
                        disabled={isPending || isSlugChecking}
                        onChange={(e) => {
                          field.onChange(slugify(e.target.value));
                          setIsSlugManuallyEdited(true);
                          setIsSlugAvailable(null); // Reset availability status on change
                        }}
                      />
                    </FormControl>
                    {isSlugChecking && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
                    )}
                    {!isSlugChecking && isSlugAvailable !== null && (
                      isSlugAvailable ? (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                      )
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief overview of the trek or tour..."
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Region (comma-separated)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Everest, Annapurna" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Duration (in days)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Activity Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an activity type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Trek">Trek</SelectItem>
                                <SelectItem value="Tour">Tour</SelectItem>
                                <SelectItem value="Peak Climbing">Peak Climbing</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a difficulty level" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Moderate">Moderate</SelectItem>
                                <SelectItem value="Strenuous">Strenuous</SelectItem>
                                <SelectItem value="Challenging">Challenging</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            {/* New Status Field */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="unpublished">Unpublished</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isPending || isSlugChecking || !isSlugAvailable}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
