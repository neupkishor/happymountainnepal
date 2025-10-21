'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { logError } from '@/lib/db';
import { usePathname } from 'next/navigation';

const formSchema = z.object({
  content: z.string().min(50, 'Terms of Service content must be at least 50 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

const DUMMY_TERMS = `
<h2>1. Agreement to Terms</h2>
<p>By using our website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
<h2>2. Booking and Payments</h2>
<p>All bookings are subject to availability. A deposit is required to secure your booking. The final payment schedule will be communicated to you upon booking confirmation. Cancellation policies apply and will be detailed in your booking agreement.</p>
<h2>3. Your Responsibilities</h2>
<p>You are responsible for ensuring you are in good health for your chosen trek or tour. You must have adequate travel insurance covering medical emergencies, evacuation, and trip cancellation.</p>
<h2>4. Limitation of Liability</h2>
<p>Happy Mountain Nepal is not liable for any injury, damage, loss, or delay that may occur due to factors beyond our control, including but not limited to natural disasters, political instability, or personal illness.</p>
<h2>5. Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new terms on this site.</p>
`;


export default function TermsOfServiceManager() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  useEffect(() => {
    // In a real app, you would fetch this content from a database.
    // For this demo, we'll simulate a fetch.
    setIsLoading(true);
    setTimeout(() => {
      form.setValue('content', localStorage.getItem('termsOfServiceContent') || DUMMY_TERMS);
      setIsLoading(false);
    }, 500);
  }, [form]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        // In a real app, you'd save this to your database.
        // For this demo, we'll save to localStorage.
        localStorage.setItem('termsOfServiceContent', values.content);
        
        toast({ title: 'Success', description: 'Terms of Service updated.' });
      } catch (error: any) {
        logError({ message: 'Failed to update terms of service', stack: error.stack, pathname, context: values });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save the terms. Please try again.',
        });
      }
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">
          Use the rich text editor below to modify your website's terms of service.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Terms Content</CardTitle>
          <CardDescription>
            The changes you make here will be reflected on the public-facing terms page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <RichTextEditor
                  value={form.watch('content')}
                  onChange={(value) => form.setValue('content', value)}
                  disabled={isPending}
                />
              )}
              <Button type="submit" disabled={isPending || isLoading}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Terms of Service
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
