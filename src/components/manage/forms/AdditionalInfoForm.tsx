'use client';

import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
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
import { Card, CardContent } from '@/components/ui/card';
import { type Tour, type ImportedTourData } from '@/lib/types';
import { updateTour, logError } from '@/lib/db';
import { useTransition, useState } from 'react';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { AIAssist } from '../AIAssist';
import { Checkbox } from '@/components/ui/checkbox';

const additionalInfoSectionSchema = z.object({
  title: z.string().min(3, "Section title is required and must be at least 3 characters."),
  content: z.string().min(20, "Section content is required and must be at least 20 characters."),
});

const formSchema = z.object({
  additionalInfoSections: z.array(additionalInfoSectionSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface AdditionalInfoFormProps {
  tour: Tour;
}

export function AdditionalInfoForm({ tour }: AdditionalInfoFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();
  const [importedData, setImportedData] = useState<ImportedTourData | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      additionalInfoSections: tour.additionalInfoSections || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additionalInfoSections",
  });

  const handleApplyImport = (selectedItems: any[]) => {
    // Append new items instead of replacing
    const newItems = selectedItems.filter(item => !fields.some(field => field.title === item.title));
    append(newItems);
    toast({ title: 'Success', description: `${newItems.length} new sections applied.` });
    setImportedData(null); // Clear imported data after applying
  };

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await updateTour(tour.id, { additionalInfoSections: values.additionalInfoSections });
        toast({ title: 'Success', description: 'Additional information sections updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update additional info for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values: values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save additional information. Please try again.',
        });
      }
    });
  };

  return (
    <FormProvider {...form}>
        <div className="space-y-6">
            <AIAssist onDataImported={setImportedData} tourId={tour.id} />

            {importedData && importedData.additionalInfoSections.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Apply Imported Sections</h3>
                        <div className="space-y-2">
                        {importedData.additionalInfoSections.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                <label htmlFor={`import-additionalInfo-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 truncate pr-4" title={item.title}>
                                    {item.title}
                                </label>
                                <Checkbox
                                    id={`import-additionalInfo-${index}`}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            append(item);
                                        } else {
                                            const fieldIndex = fields.findIndex(field => field.title === item.title);
                                            if (fieldIndex > -1) {
                                                remove(fieldIndex);
                                            }
                                        }
                                    }}
                                />
                            </div>
                        ))}
                        </div>
                    </CardContent>
                </Card>
            )}

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
                            <FormField
                                control={form.control}
                                name={`additionalInfoSections.${index}.title`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Section Title</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., What to Expect" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`additionalInfoSections.${index}.content`}
                                render={({ field }) => (
                                <FormItem className="mt-4">
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                    <RichTextEditor
                                        {...field}
                                        placeholder="Enter detailed information for this section here. You can use rich text formatting."
                                        disabled={isPending}
                                    />
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
                                onClick={() => append({ title: '', content: '' })}
                                disabled={isPending}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Section
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Additional Info
                            </Button>
                        </div>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </FormProvider>
  );
}
