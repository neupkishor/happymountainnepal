
'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { getAllToursForSelect, getTourById, saveInquiry, logError } from '@/lib/db';
import type { Tour } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { ItineraryForm } from '@/components/manage/forms/ItineraryForm'; // Reusing for UI

const itineraryItemSchema = z.object({
    day: z.coerce.number().int().min(1),
    title: z.string().min(3, "Title is required."),
    description: z.string().min(10, "Description is required."),
});

const formSchema = z.object({
  basePackageId: z.string().min(1, "Please select a base package."),
  itinerary: z.array(itineraryItemSchema),
  customizationNotes: z.string().optional(),
  name: z.string().min(2, "Name is required."),
  email: z.string().email("A valid email is required."),
  phone: z.string().optional(),
  country: z.string().min(2, "Country is required."),
});

type FormValues = z.infer<typeof formSchema>;

const steps = [
  { id: 'package', title: 'Choose Your Adventure' },
  { id: 'customize', title: 'Customize Your Itinerary' },
  { id: 'details', title: 'Your Details' },
];

export default function BookPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [tours, setTours] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingTours, setIsLoadingTours] = useState(true);
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      basePackageId: '',
      itinerary: [],
      customizationNotes: '',
      name: '',
      email: '',
      phone: '',
      country: '',
    },
  });

  const selectedPackageId = form.watch('basePackageId');

  useEffect(() => {
    async function fetchTours() {
      try {
        const tourList = await getAllToursForSelect();
        setTours(tourList);
      } catch (error) {
        console.error("Failed to fetch tours:", error);
      } finally {
        setIsLoadingTours(false);
      }
    }
    fetchTours();
  }, []);

  useEffect(() => {
    async function updateItinerary() {
      if (selectedPackageId) {
        const tourDetails = await getTourById(selectedPackageId);
        if (tourDetails && tourDetails.itinerary) {
          form.setValue('itinerary', tourDetails.itinerary);
        } else {
          form.setValue('itinerary', []);
        }
      }
    }
    if (currentStep === 0) { // Only auto-update when on the first step
        updateItinerary();
    }
  }, [selectedPackageId, form, currentStep]);

  const nextStep = async () => {
    const fieldsToValidate: (keyof FormValues)[] = currentStep === 0 
        ? ['basePackageId'] 
        : currentStep === 1
        ? ['itinerary', 'customizationNotes']
        : ['name', 'email', 'phone', 'country'];
    
    // @ts-ignore
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const onSubmit = async (values: FormValues) => {
    setIsPending(true);
    try {
      const inquiryPayload = {
        type: 'booking' as const,
        page: pathname,
        temporary_id: 'booking-form',
        data: values,
      };

      await saveInquiry(inquiryPayload);
      
      toast({
        title: "Inquiry Submitted!",
        description: "Thank you for your request. We will review your custom itinerary and get back to you with a price quote shortly.",
      });
      form.reset();
      setCurrentStep(0);
    } catch (error: any) {
      console.error("Booking form submission error:", error);
      await logError({
        message: 'Booking form submission failed',
        stack: error.stack,
        pathname,
        context: { values }
      });
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was a problem sending your request. Please try again.',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold !font-headline">Book Your Custom Trip</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Follow the steps below to create and submit your personalized adventure.
          </p>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Step {currentStep + 1}: {steps[currentStep].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -30, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStep === 0 && (
                      <FormField
                        control={form.control}
                        name="basePackageId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Which package would you like to customize?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingTours}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a base tour package" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingTours ? (
                                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                                ) : (
                                  tours.map(tour => (
                                    <SelectItem key={tour.id} value={tour.id}>{tour.name}</SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <ItineraryEditor />
                        <FormField
                            control={form.control}
                            name="customizationNotes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Any other notes or requests?</FormLabel>
                                    <FormControl>
                                        <Textarea
                                        placeholder="e.g., 'I'd like an extra acclimatization day in Namche Bazaar', or 'Can we add a visit to a local monastery?'"
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="p-4 bg-secondary/50 rounded-lg text-sm text-secondary-foreground">
                            You will get the expected price for your custom itinerary through an email or phone number you provide in the next step.
                        </div>
                      </div>
                    )}
                    
                    {currentStep === 2 && (
                       <div className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input placeholder="+1 555-123-4567" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="country" render={({ field }) => (
                            <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="e.g., United States" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="mt-8 flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || isPending}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep} disabled={isPending}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Inquiry
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

function ItineraryEditor() {
    const { control } = useForm<FormValues>();
    const { fields, append, remove, move } = useForm({
        control,
        name: "itinerary",
    });

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Itinerary</h3>
            {fields.map((field, index) => (
                <Card key={field.id} className="p-4 relative">
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <div className="space-y-2">
                         <FormField control={control} name={`itinerary.${index}.day`} render={({ field }) => (
                            <FormItem><FormLabel>Day</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={control} name={`itinerary.${index}.title`} render={({ field }) => (
                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Arrival in Kathmandu" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name={`itinerary.${index}.description`} render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Details for the day..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </Card>
            ))}
             <Button type="button" variant="outline" onClick={() => append({ day: fields.length + 1, title: '', description: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Day
            </Button>
        </div>
    )
}

