'use client';

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type SiteProfile } from '@/lib/types';
import { getSiteProfile, updateSiteProfile, logError } from '@/lib/db';
import { useTransition, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  reviewCount: z.coerce.number().int().min(0, "Review count cannot be negative.").optional(),
  contactEmail: z.string().email({ message: "Please enter a valid email." }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  heroTitle: z.string().optional(),
  heroDescription: z.string().optional(),
  footerTagline: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileForm() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reviewCount: 0,
      contactEmail: '',
      phone: '',
      address: '',
      heroTitle: 'Discover Your Next Adventure',
      heroDescription: 'Explore breathtaking treks and cultural tours in the heart of the Himalayas. Unforgettable journeys await.',
      footerTagline: 'Your gateway to Himalayan adventures.',
    },
  });

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const profileData = await getSiteProfile();
        if (profileData) {
          form.reset({
            reviewCount: profileData.reviewCount || 0,
            contactEmail: profileData.contactEmail || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            heroTitle: profileData.heroTitle || 'Discover Your Next Adventure',
            heroDescription: profileData.heroDescription || 'Explore breathtaking treks and cultural tours in the heart of the Himalayas. Unforgettable journeys await.',
            footerTagline: profileData.footerTagline || 'Your gateway to Himalayan adventures.',
          });
        }
      } catch (error: any) {
        console.error("Failed to fetch site profile:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load site profile.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [form, toast]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await updateSiteProfile(values);
        toast({ title: 'Success', description: 'Company profile updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update site profile: ${error.message}`, stack: error.stack, pathname, context: { values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save profile. Please try again.',
        });
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }
  

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Homepage Content</CardTitle>
                    <CardDescription>Manage the main text content for your homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="heroTitle"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Homepage Hero Title</FormLabel>
                            <FormControl>
                            <Input placeholder="Discover Your Next Adventure" {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="heroDescription"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Homepage Hero Description</FormLabel>
                            <FormControl>
                            <Textarea placeholder="Explore breathtaking treks..." {...field} disabled={isPending} rows={3}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="footerTagline"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Footer Tagline</FormLabel>
                            <FormControl>
                            <Input placeholder="Your gateway to Himalayan adventures." {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>Manage public company stats and contact details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="reviewCount"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Review Count</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 250" {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                            <Input type="email" placeholder="info@example.com" {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                            <Input placeholder="+1 555-123-4567" {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Address</FormLabel>
                            <FormControl>
                            <Input placeholder="123 Mountain Rd, Kathmandu, Nepal" {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
            </Button>
        </form>
        </Form>
    </FormProvider>
  );
}
