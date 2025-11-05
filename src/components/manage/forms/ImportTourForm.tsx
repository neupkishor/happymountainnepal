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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Wand2, Link as LinkIcon, Pilcrow } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { logError } from '@/lib/db';
import { importTourData } from '@/ai/flows/import-tour-data-flow';
import type { ImportedTourData } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  url: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  text: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ImportTourFormProps {
  setImportedData: (data: ImportedTourData | null) => void;
}

export function ImportTourForm({ setImportedData }: ImportTourFormProps) {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: '', text: '' },
  });

  const handleImport = async (values: FormValues, type: 'url' | 'text') => {
    setIsImporting(true);
    try {
      const inputData = type === 'url' ? { url: values.url } : { text: values.text };
      
      if ((type === 'url' && !values.url) || (type === 'text' && !values.text)) {
          throw new Error("Input is required.");
      }

      const importedData = await importTourData(inputData);
      setImportedData(importedData);
      
      toast({ 
        title: 'Import Successful', 
        description: 'Manual entry form has been populated. Please review and save.'
      });

    } catch (error: any) {
      console.error("Import failed:", error);
      logError({ 
        message: `Failed to import from ${type}: ${error.message}`, 
        stack: error.stack, 
        pathname, 
        context: { values } 
      });
      toast({ 
        variant: 'destructive', 
        title: 'Import Failed', 
        description: error.message || 'Could not fetch or parse data.' 
      });
      setImportedData(null);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form className="space-y-6">
            <Tabs defaultValue="url">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">
                  <LinkIcon className="mr-2 h-4 w-4" /> From URL
                </TabsTrigger>
                <TabsTrigger value="text">
                  <Pilcrow className="mr-2 h-4 w-4" /> From Text
                </TabsTrigger>
              </TabsList>
              <TabsContent value="url">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tour Page URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example-tour-company.com/everest-trek"
                          {...field}
                          disabled={isImporting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <Button onClick={form.handleSubmit((v) => handleImport(v, 'url'))} disabled={isImporting} className="mt-4">
                  {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Import from URL
                </Button>
              </TabsContent>
              <TabsContent value="text">
                 <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pasted Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste all the tour details here, including itinerary, price, inclusions, etc."
                          {...field}
                          disabled={isImporting}
                          rows={15}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <Button onClick={form.handleSubmit((v) => handleImport(v, 'text'))} disabled={isImporting} className="mt-4">
                  {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Import from Text
                </Button>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
