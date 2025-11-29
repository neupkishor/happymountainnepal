
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wand2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { logError, createBlogPostWithData } from '@/lib/db';
import { importBlogPost } from '@/ai/flows/import-blog-post-flow';

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ImportBlogPage() {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: '' },
  });

  const handleImport = async (values: FormValues) => {
    setIsImporting(true);
    try {
      // 1. Get structured data from AI flow
      const importedData = await importBlogPost({ url: values.url });

      // 2. Create a new blog post in the database
      const newPostId = await createBlogPostWithData(importedData);

      if (!newPostId) {
        throw new Error("Failed to get new post ID from database operation.");
      }

      toast({ 
        title: 'Import Successful', 
        description: 'Blog post has been created as a draft. Redirecting to the editor...'
      });

      // 3. Redirect to the edit page for the new post
      router.push(`/manage/blog/${newPostId}/edit`);

    } catch (error: any) {
      console.error("Import failed:", error);
      logError({ 
        message: `Failed to import from URL: ${error.message}`, 
        stack: error.stack, 
        pathname, 
        context: { url: values.url } 
      });
      toast({ 
        variant: 'destructive', 
        title: 'Import Failed', 
        description: error.message || 'Could not fetch, parse, or save the blog post.' 
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
     <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Import Blog Post</h1>
        <p className="text-muted-foreground mt-2">
          Enter the URL of a blog post to automatically import its content, title, and images.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-primary" />
              AI Blog Importer
          </CardTitle>
          <CardDescription>
              The imported post will be saved as a draft for you to review and publish.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleImport)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blog Post URL</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="https://your-favorite-blog.com/amazing-post"
                                {...field}
                                disabled={isImporting}
                                className="pl-10"
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isImporting} className="w-full sm:w-auto">
                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Import Blog Post
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
