
'use client';

import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
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
import { updateSiteProfile, logError } from '@/lib/db';
import { useTransition, useEffect } from 'react';
import { Facebook, Instagram, Loader2, Twitter, PlusCircle, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { MediaPicker } from '../MediaPicker';
import { MultiMediaPicker } from '../MultiMediaPicker';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const whyUsSchema = z.object({
  icon: z.string().url("Icon URL must be a valid URL."),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
});

const formSchema = z.object({
  basePath: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  reviewCount: z.coerce.number().int().min(0, "Review count cannot be negative.").optional(),
  contactEmail: z.string().email({ message: "Please enter a valid email." }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  location: z.string().optional(),
  locationUrl: z.string().url().optional().or(z.literal('')),
  heroTitle: z.string().optional(),
  heroDescription: z.string().optional(),
  footerTagline: z.string().optional(),
  heroImage: z.string().url("Please provide a valid image URL.").optional(),
  heroImages: z.array(z.string().url()).optional(),
  heroTransitionInterval: z.coerce.number().min(2, "Minimum 2 seconds").max(60, "Max 60 seconds").optional(),
  socials: z.object({
    facebook: z.string().url().or(z.literal('')).optional(),
    instagram: z.string().url().or(z.literal('')).optional(),
    twitter: z.string().url().or(z.literal('')).optional(),
  }).optional(),
  whyUs: z.array(whyUsSchema).optional(),
  chatbot: z.object({
    enabled: z.boolean(),
    position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left', 'middle-right', 'middle-left']),
    whatsappNumber: z.string().optional(),
    emailAddress: z.string().email({ message: "Please enter a valid email." }).optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileForm() {
  const [isPending, startTransition] = useTransition();
  const { profile, isLoading } = useSiteProfile();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      basePath: '',
      reviewCount: 0,
      contactEmail: '',
      phone: '',
      address: '',
      location: '',
      locationUrl: '',
      heroTitle: 'Discover Your Next Adventure',
      heroDescription: 'Explore breathtaking treks and cultural tours in the heart of the Himalayas. Unforgettable journeys await.',
      footerTagline: 'Your gateway to Himalayan adventures.',
      heroImage: 'https://happymountainnepal.com/wp-content/uploads/2022/06/everest-helicopter-tour1.jpg',
      heroImages: [],
      heroTransitionInterval: 5,
      socials: {
        facebook: '',
        instagram: '',
        twitter: '',
      },
      whyUs: [],
      chatbot: {
        enabled: true,
        position: 'bottom-right',
        whatsappNumber: '',
        emailAddress: '',
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "whyUs",
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        basePath: profile?.basePath || '',
        reviewCount: profile.reviewCount || 0,
        contactEmail: profile.contactEmail || '',
        phone: profile.phone || '',
        address: profile.address || '',
        location: profile.location || '',
        locationUrl: profile.locationUrl || '',
        heroTitle: profile.heroTitle || 'Discover Your Next Adventure',
        heroDescription: profile.heroDescription || 'Explore breathtaking treks and cultural tours in the heart of the Himalayas. Unforgettable journeys await.',
        footerTagline: profile.footerTagline || 'Your gateway to Himalayan adventures.',
        heroImage: profile.heroImage || 'https://happymountainnepal.com/wp-content/uploads/2022/06/everest-helicopter-tour1.jpg',
        heroImages: profile.heroImages || (profile.heroImage ? [profile.heroImage] : []),
        heroTransitionInterval: profile.heroTransitionInterval || 5,
        socials: {
          facebook: profile.socials?.facebook || '',
          instagram: profile.socials?.instagram || '',
          twitter: profile.socials?.twitter || '',
        },
        whyUs: profile.whyUs || [],
        chatbot: {
          enabled: profile.chatbot?.enabled ?? true,
          position: profile.chatbot?.position || 'bottom-right',
          whatsappNumber: profile.chatbot?.whatsappNumber || '',
          emailAddress: profile.chatbot?.emailAddress || '',
        },
      });
    }
  }, [profile, form]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        // Sync main heroImage to first of heroImages if available
        if (values.heroImages && values.heroImages.length > 0) {
          values.heroImage = values.heroImages[0];
        }

        await updateSiteProfile(values);
        // Invalidate session storage cache
        sessionStorage.removeItem('site-profile');
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
              <CardDescription>Manage the main text content and background image for your homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <MultiMediaPicker name="heroImages" label="Hero Background Images" maxItems={12} tags={['all']} description="Select up to 12 images. The first image will be the default background, and others will cycle automatically." />

              <FormField
                control={form.control}
                name="heroTransitionInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slide Transition Interval (Seconds)</FormLabel>
                    <FormControl>
                      <Input type="number" min={2} max={60} {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-4 mt-4"></div>

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
                      <Textarea placeholder="Explore breathtaking treks..." {...field} disabled={isPending} rows={3} />
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
              <CardTitle>"Why Trek With Us" Section</CardTitle>
              <CardDescription>Manage the features highlighted on your homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md relative space-y-4">
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
                    <MediaPicker name={`whyUs.${index}.icon`} label="Feature Icon" tags={['feature-icon']} />
                    <FormField
                      control={form.control}
                      name={`whyUs.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Expert Local Guides" {...field} disabled={isPending} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`whyUs.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Briefly describe this feature." {...field} disabled={isPending} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ icon: '', title: '', description: '' })}
                disabled={isPending}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Feature
              </Button>
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
                name="basePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Path (Website URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://happymountainnepal.com" {...field} disabled={isPending} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      The base URL of your website. This is required for creating correct links in sitemaps and feeds.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <FormLabel>Company Address (Legacy)</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Mountain Rd, Kathmandu, Nepal" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Name (Displayed)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Kathmandu, Nepal" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locationUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location URL (Map Link)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://goo.gl/maps/..." {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Enter the full URLs for your social media profiles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="socials.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Facebook className="h-4 w-4" /> Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/your-page" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socials.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/your-profile" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socials.twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Twitter className="h-4 w-4" /> Twitter / X</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/your-handle" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save All Profile Settings
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
}
