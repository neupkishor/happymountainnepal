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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransition, useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, Wand2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePathname, useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { checkSlugAvailability, createTourWithBasicInfo, logError } from '@/lib/db';
import { importTourFromUrl } from '@/ai/flows/import-tour-from-url-flow';

const formSchema = z.object({
  name: z.string().min(5, { message: "Name must be at least 5 characters." }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters." }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and use hyphens for spaces."),
  region: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)).refine(val => val.length > 0, { message: "At least one region is required." }),
  type: z.enum(['Trek', 'Tour', 'Peak Climbing']),
  difficulty: z.enum(['Easy', 'Moderate', 'Strenuous', 'Challenging']),
  duration: z.coerce.number().int().min(1, { message: "Duration must be at least 1 day." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePackageForm() {
  const [isPending, startTransition] = useTransition();
  const [isImporting, setIsImporting] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      region: [],
      type: 'Trek',
      difficulty: 'Moderate',
      duration: 1,
      description: '',
    } as any,
  });

  const name = form.watch('name');
  const currentSlug = form.watch('slug');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const debouncedSlug = useDebounce(currentSlug, 500);

  useEffect(() => {
    if (!isSlugManuallyEdited && name) {
      form.setValue('slug', slugify(name), { shouldValidate: true });
    }
  }, [name, isSlugManuallyEdited, form]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!debouncedSlug || form.formState.errors.slug?.message) {
        setIsSlugAvailable(null);
        return;
      }
      setIsSlugChecking(true);
      try {
        const available = await checkSlugAvailability(debouncedSlug);
        setIsSlugAvailable(available);
      } catch (e) {
        setIsSlugAvailable(null);
      } finally {
        setIsSlugChecking(false);
      }
    };
    checkAvailability();
  }, [debouncedSlug, form, form.formState.errors.slug?.message]);

  const handleImport = async () => {
    if (!importUrl) {
      toast({ variant: 'destructive', title: 'URL required', description: 'Please enter a URL to import.' });
      return;
    }
    setIsImporting(true);
    try {
      const importedData = await importTourFromUrl({ url: importUrl });
      
      const transformedData: Partial<FormValues> = {
        name: importedData.name,
        slug: slugify(importedData.name),
        description: importedData.description,
        duration: importedData.duration,
        difficulty: importedData.difficulty,
      };

      // Use reset to update all form fields
      form.reset(transformedData);
      
      // Since `region` in the form is a string, we join the array
      form.setValue('region', importedData.region.join(', '));
      
      toast({ title: 'Import Successful', description: 'Form has been populated with imported data.' });

    } catch (error: any) {
      console.error("Import failed:", error);
      logError({ message: `Failed to import from URL: ${error.message}`, stack: error.stack, pathname, context: { url: importUrl } });
      toast({ variant: 'destructive', title: 'Import Failed', description: 'Could not fetch or parse data from the URL.' });
    } finally {
      setIsImporting(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const newId = await createTourWithBasicInfo({
          name: values.name,
          slug: values.slug,
          description: values.description,
          region: Array.isArray(values.region) ? values.region : [],
          type: values.type,
          difficulty: values.difficulty,
          duration: values.duration,
        });

        if (!newId) throw new Error('Failed to create package');

        toast({ title: 'Success', description: 'Package created.' });
        router.push(`/manage/packages/${newId}/edit/basic-info`);
      } catch (error: any) {
        console.error("Failed to create package:", error);
        await logError({ message: `Failed to create package: ${error.message}`, stack: error.stack, pathname, context: { values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not create package. Please try again.',
        });
      }
    });
  };

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-6 w-6" />
            Import from URL (AI-Powered)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste a URL to an existing tour page, and our AI will attempt to automatically fill in the form below.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="https://example-tour-company.com/everest-trek"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                disabled={isImporting || isPending}
                className="pl-9"
              />
            </div>
            <Button onClick={handleImport} disabled={isImporting || isPending}>
              {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Import
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Form fields remain the same */}
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
                            setIsSlugAvailable(null);
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
                        <Input
                          placeholder="e.g., Everest, Khumbu"
                          {...field as any}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (days)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
  
              <Button type="submit" disabled={isPending || isSlugChecking || !isSlugAvailable}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Package
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
