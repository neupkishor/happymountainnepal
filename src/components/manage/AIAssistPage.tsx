'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wand2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { logError, updateTourWithAiData } from '@/lib/db';
import { importTourData } from '@/ai/flows/import-tour-data-flow';
import type { Tour, ImportedTourData } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  source: z.string().min(10, { message: "Please enter a URL or paste at least 10 characters of text." }),
});

type FormValues = z.infer<typeof formSchema>;

const isUrl = (text: string) => {
  try {
    new URL(text);
    return true;
  } catch (_) {
    return false;
  }
};

interface AIAssistPageComponentProps {
  tour: Tour;
}

export function AIAssistPageComponent({ tour }: AIAssistPageComponentProps) {
  const [isFetching, setIsFetching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fetchedData, setFetchedData] = useState<ImportedTourData | null>(null);
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { source: '' },
  });

  const handleFetchData = async (values: FormValues) => {
    setIsFetching(true);
    setFetchedData(null);
    setSelectedSections({});
    const sourceIsUrl = isUrl(values.source);

    try {
      const inputData = sourceIsUrl ? { url: values.source } : { text: values.source };
      const data = await importTourData(inputData);
      setFetchedData(data);
      toast({ title: 'Data Fetched', description: 'Review the extracted information below and select what to import.' });
    } catch (error: any) {
      console.error("Fetch failed:", error);
      logError({
        message: `Failed to fetch from ${sourceIsUrl ? 'URL' : 'Text'}: ${error.message}`,
        stack: error.stack,
        pathname,
        context: { values, tourId: tour.id }
      });
      toast({
        variant: 'destructive',
        title: 'Fetch Failed',
        description: error.message || 'Could not fetch or parse data.'
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleToggleSection = (section: keyof ImportedTourData, isSelected: boolean) => {
    setSelectedSections(prev => ({ ...prev, [section]: isSelected }));
  };

  const handleImportSelected = async () => {
    if (!fetchedData) return;
    setIsImporting(true);

    const dataToImport = Object.keys(selectedSections).reduce((acc, key) => {
      if (selectedSections[key as keyof ImportedTourData]) {
        // @ts-ignore
        acc[key] = fetchedData[key];
      }
      return acc;
    }, {} as Partial<ImportedTourData>);

    if (Object.keys(dataToImport).length === 0) {
      toast({ variant: 'destructive', title: 'Nothing Selected', description: 'Please select at least one section to import.' });
      setIsImporting(false);
      return;
    }

    try {
      await updateTourWithAiData(tour.id, dataToImport);
      toast({ title: 'Import Successful', description: 'Selected sections have been updated.' });
      router.refresh(); // Refresh the page or navigate away
    } catch (error: any) {
      console.error("Import failed:", error);
      logError({
        message: `Failed to import selected data for tour ${tour.id}: ${error.message}`,
        stack: error.stack,
        pathname,
        context: { tourId: tour.id, dataToImport }
      });
      toast({ variant: 'destructive', title: 'Import Failed', description: 'Could not update the package. Please try again.' });
    } finally {
      setIsImporting(false);
    }
  };

  const renderDataPreview = (key: string, data: any) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <p className="text-sm text-muted-foreground italic">Nothing found for this section.</p>;
    }
    if (typeof data === 'object') {
      return <pre className="text-xs bg-muted p-2 rounded-md max-h-40 overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
    }
    return <p className="text-sm text-muted-foreground truncate">{String(data)}</p>;
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href={`/manage/packages/${tour.id}/basics`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Editor
          </Link>
        </Button>
        <h1 className="text-3xl font-bold !font-headline flex items-center gap-2">
          <Wand2 className="h-8 w-8" />
          AI Assist
        </h1>
        <p className="text-muted-foreground mt-2">
          Import and merge data from a URL or text to update "{tour.name}".
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Source</CardTitle>
          <CardDescription>Paste a URL or raw text content to extract tour details from.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFetchData)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="https://example.com/tour-details or paste raw text here..."
                          {...field}
                          disabled={isFetching}
                          rows={8}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isFetching} className="w-full sm:w-auto">
                  {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Fetch & Analyze
                </Button>
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>

      {fetchedData && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Information</CardTitle>
            <CardDescription>Select the sections you want to import. This will append new items to lists like Itinerary and FAQ.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(fetchedData).map(key => {
              const typedKey = key as keyof ImportedTourData;
              // @ts-ignore
              const value = fetchedData[typedKey];
              if (!value || (Array.isArray(value) && value.length === 0)) return null;

              return (
                <div key={key} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Checkbox
                    id={`import-${key}`}
                    className="mt-1"
                    onCheckedChange={(checked) => handleToggleSection(typedKey, !!checked)}
                    checked={!!selectedSections[typedKey]}
                  />
                  <div className="flex-1 space-y-1">
                    <label htmlFor={`import-${key}`} className="font-semibold capitalize cursor-pointer">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                    {renderDataPreview(key, value)}
                  </div>
                </div>
              );
            })}
          </CardContent>
          <div className="p-6 pt-0">
            <Button onClick={handleImportSelected} disabled={isImporting || Object.values(selectedSections).every(v => !v)}>
              {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Import Selected Sections
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
