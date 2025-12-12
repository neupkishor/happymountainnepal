'use client';

import { BookingForm } from '@/components/manage/forms/BookingForm';
import { PricingForm } from '@/components/manage/forms/PricingForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Tour } from '@/lib/types';
import { useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';

const departureDateSchema = z.object({
    date: z.date({ required_error: "A date is required." }),
    price: z.coerce.number().positive("Price must be positive."),
    guaranteed: z.boolean(),
});

const bookingFormSchema = z.object({
    bookingType: z.enum(['internal', 'external'], { required_error: "Booking type is required." }),
    externalBookingUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
}).superRefine((data, ctx) => {
    if (data.bookingType === 'external' && (!data.externalBookingUrl || data.externalBookingUrl.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "External booking URL is required for external booking type.",
            path: ['externalBookingUrl'],
        });
    }
});

const pricingFormSchema = z.object({
    price: z.coerce.number().positive({ message: "Base price must be positive." }),
    departureDates: z.array(departureDateSchema),
    anyDateAvailable: z.boolean().optional(),
});

// Use .and() instead of .merge() for combining zod schemas
const combinedSchema = bookingFormSchema.and(pricingFormSchema);
type FormValues = z.infer<typeof combinedSchema>;

export function EditBookingClient({ tour }: { tour: Tour }) {
    const form = useForm<FormValues>({
        resolver: zodResolver(combinedSchema),
        defaultValues: {
            price: tour.price || 0,
            departureDates: tour.departureDates?.map(d => ({
                ...d,
                date: d.date instanceof Timestamp ? d.date.toDate() : new Date(d.date)
            })) || [],
            anyDateAvailable: tour.anyDateAvailable || false,
            bookingType: tour.bookingType || 'internal',
            externalBookingUrl: tour.externalBookingUrl || '',
        },
    });

    useEffect(() => {
        form.reset({
            price: tour.price || 0,
            departureDates: tour.departureDates?.map(d => ({
                ...d,
                date: d.date instanceof Timestamp ? d.date.toDate() : new Date(d.date)
            })) || [],
            anyDateAvailable: tour.anyDateAvailable || false,
            bookingType: tour.bookingType || 'internal',
            externalBookingUrl: tour.externalBookingUrl || '',
        });
    }, [tour, form]);

    return (
        <FormProvider {...form}>
            <EditPackageLayout tour={tour} currentStep="booking">
                <div className="space-y-8">
                    <PricingForm tour={tour} />
                    <BookingForm tour={tour} />
                </div>
            </EditPackageLayout>
        </FormProvider>
    );
}
