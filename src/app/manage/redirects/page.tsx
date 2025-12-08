
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getRedirects, addRedirect, deleteRedirect } from '@/lib/redirects';
import type { Redirect } from '@/lib/types';
import { Loader2, PlusCircle, Trash2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const formSchema = z.object({
  source: z.string().min(1, 'Source path is required.').refine(val => val.startsWith('/'), { message: 'Source must start with a /' }),
  destination: z.string().min(1, 'Destination is required.'),
  permanent: z.enum(['true', 'false']),
});

type FormValues = z.infer<typeof formSchema>;

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source: '',
      destination: '',
      permanent: 'true',
    },
  });

  const fetchRedirects = async () => {
    setIsLoading(true);
    try {
      const allRedirects = await getRedirects();
      setRedirects(allRedirects);
    } catch (error) {
      console.error("Failed to load redirects", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load redirects.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRedirects();
  }, []);

  const handleAddRedirect = (values: FormValues) => {
    startTransition(async () => {
      try {
        await addRedirect({
          ...values,
          permanent: values.permanent === 'true'
        });
        toast({ title: 'Success', description: 'Redirect created.' });
        form.reset();
        fetchRedirects();
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to create redirect.' });
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteRedirect(id);
        toast({ title: 'Success', description: 'Redirect deleted.' });
        fetchRedirects();
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete redirect.' });
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Redirect Manager</h1>
        <p className="text-muted-foreground mt-2">Create and manage URL redirects for your site.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Redirect</CardTitle>
          <CardDescription>Enter a source path and a destination URL.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddRedirect)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From (Source Path)</FormLabel>
                        <FormControl>
                          <Input placeholder="/old-blog-post" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To (Destination URL)</FormLabel>
                        <FormControl>
                          <Input placeholder="/new-post or https://example.com" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="permanent"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Redirect Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center space-x-4"
                          disabled={isPending}
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="true" />
                            </FormControl>
                            <FormLabel className="font-normal">Permanent (308)</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="false" />
                            </FormControl>
                            <FormLabel className="font-normal">Temporary (307)</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Add Redirect
                </Button>
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Redirects</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : redirects.length === 0 ? (
            <p className="text-muted-foreground text-center">No redirects have been created yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redirects.map(redirect => (
                  <TableRow key={redirect.id}>
                    <TableCell className="font-mono text-sm">{redirect.source}</TableCell>
                    <TableCell className="font-mono text-sm truncate max-w-xs">{redirect.destination}</TableCell>
                    <TableCell>
                      <Badge variant={redirect.permanent ? 'default' : 'secondary'}>
                        {redirect.permanent ? 'Permanent' : 'Temporary'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(redirect.id)} disabled={isPending}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
