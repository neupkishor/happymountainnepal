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
import { AIAssist } from '../AIAssist';
import { Checkbox } from '@/components/ui/checkbox';

interface InclusionsFormValues {
  inclusions: string[];
  exclusions: string[];
}

const formSchema = z.object({
  inclusions: z.array(z.string().min(1, "Inclusion cannot be empty.")),
  exclusions: z.array(z.string().min(1, "Exclusion cannot be empty.")),
});

interface InclusionsFormProps {
  tour: Tour;
}

export function InclusionsForm({ tour }: InclusionsFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();
  const [importedData, setImportedData] = useState<ImportedTourData | null>(null);

  const form = useForm<InclusionsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inclusions: tour.inclusions || [],
      exclusions: tour.exclusions || [],
    },
  });

  const { fields: inclusionFields, append: appendInclusion, remove: removeInclusion } = useFieldArray<InclusionsFormValues>({
    control: form.control,
    name: "inclusions",
  });

  const { fields: exclusionFields, append: appendExclusion, remove: removeExclusion } = useFieldArray<InclusionsFormValues>({
    control: form.control,
    name: "exclusions",
  });

  const handleApplyImport = (section: 'inclusions' | 'exclusions', selectedItems: string[]) => {
    const appendFn = section === 'inclusions' ? appendInclusion : appendExclusion;
    const currentItems = section === 'inclusions' ? inclusionFields : exclusionFields;
    
    // @ts-ignore
    const newItems = selectedItems.filter(item => !currentItems.some(field => field.value === item));
    appendFn(newItems);
    toast({ title: 'Success', description: `${newItems.length} new ${section} applied.` });
  };
  
  const onSubmit = (values: InclusionsFormValues) => {
    startTransition(async () => {
      try {
        await updateTour(tour.id, values);
        toast({ title: 'Success', description: 'Inclusions and exclusions updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update inclusions for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values: values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save changes. Please try again.',
        });
      }
    });
  };

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <AIAssist onDataImported={setImportedData} tourId={tour.id} />
        
        {importedData && (importedData.inclusions.length > 0 || importedData.exclusions.length > 0) && (
             <Card>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {importedData.inclusions.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Apply Imported Inclusions</h3>
                            {importedData.inclusions.map((item, index) => (
                                <div key={`inc-${index}`} className="flex items-center space-x-2 my-1">
                                    <Checkbox
                                        id={`import-inc-${index}`}
                                        onCheckedChange={(checked) => {
                                            if (checked) appendInclusion(item);
                                            else {
                                                const fieldIndex = inclusionFields.findIndex(field => (field as any).value === item);
                                                if(fieldIndex > -1) removeInclusion(fieldIndex);
                                            }
                                        }}
                                    />
                                    <label htmlFor={`import-inc-${index}`} className="text-sm font-medium">{item}</label>
                                </div>
                            ))}
                        </div>
                    )}
                    {importedData.exclusions.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Apply Imported Exclusions</h3>
                            {importedData.exclusions.map((item, index) => (
                                <div key={`exc-${index}`} className="flex items-center space-x-2 my-1">
                                    <Checkbox
                                        id={`import-exc-${index}`}
                                        onCheckedChange={(checked) => {
                                            if (checked) appendExclusion(item);
                                            else {
                                                const fieldIndex = exclusionFields.findIndex(field => (field as any).value === item);
                                                if(fieldIndex > -1) removeExclusion(fieldIndex);
                                            }
                                        }}
                                    />
                                    <label htmlFor={`import-exc-${index}`} className="text-sm font-medium">{item}</label>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Inclusions</h3>
                        {inclusionFields.map((field, index) => (
                            <FormField
                            key={field.id}
                            control={form.control}
                            name={`inclusions.${index}`}
                            render={({ field }) => (
                                <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                    <Input {...field} placeholder="e.g., Airport transfers" disabled={isPending} />
                                    </FormControl>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeInclusion(index)} disabled={isPending}>
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendInclusion('')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Inclusion
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Exclusions</h3>
                        {exclusionFields.map((field, index) => (
                            <FormField
                            key={field.id}
                            control={form.control}
                            name={`exclusions.${index}`}
                            render={({ field }) => (
                                <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                    <Input {...field} placeholder="e.g., International airfare" disabled={isPending} />
                                    </FormControl>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeExclusion(index)} disabled={isPending}>
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendExclusion('')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Exclusion
                        </Button>
                    </div>
                </div>
                
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}
