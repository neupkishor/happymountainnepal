'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { logError } from '@/lib/db';
import { importTourData } from '@/ai/flows/import-tour-data-flow';
import type { ImportedTourData } from '@/lib/types';

const formSchema = z.object({
  source: z.string().min(10, { message: "Please enter a URL or paste at least 10 characters of text." }),
});

type FormValues = z.infer<typeof formSchema>;

interface AIAssistProps {
  onDataImported: (data: ImportedTourData | null) => void;
  tourId?: string; // Optional tourId for edit context
}

const isUrl = (text: string) => {
  try {
    new URL(text);
    return true;
  } catch (_) {
    return false;
  }
}

export function AIAssist({ onDataImported, tourId }: AIAssistProps) {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { source: '' },
  });

  const handleImport = async (values: FormValues) => {
    setIsImporting(true);
    const sourceIsUrl = isUrl(values.source);
    
    try {
      const inputData = sourceIsUrl ? { url: values.source } : { text: values.source };
      const importedData = await importTourData(inputData);
      onDataImported(importedData);
      
      toast({ 
        title: 'Import Successful', 
        description: tourId ? 'Data sections below can be updated.' : 'Manual entry form has been populated. Please review and save.'
      });

    } catch (error: any) {
      console.error("Import failed:", error);
      logError({ 
        message: `Failed to import from ${sourceIsUrl ? 'URL' : 'Text'}: ${error.message}`, 
        stack: error.stack, 
        pathname, 
        context: { values, tourId } 
      });
      toast({ 
        variant: 'destructive', 
        title: 'Import Failed', 
        description: error.message || 'Could not fetch or parse data.' 
      });
      onDataImported(null);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            AI Assist
        </CardTitle>
        <CardDescription>
            Paste a URL or raw text to automatically extract and fill in tour details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleImport)} className="space-y-4">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="https://example-tour-company.com/everest-trek&#10;...or paste your tour details here."
                      {...field}
                      disabled={isImporting}
                      rows={8}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isImporting} className="w-full sm:w-auto">
              {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              {tourId ? 'Fetch Data to Update' : 'Import Details'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
