'use client';

import { EditPackageLayout } from '@/components/manage/EditPackageLayout';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Tour } from '@/lib/types';
import { useEffect } from 'react';
import { ItineraryForm } from '@/components/manage/forms/ItineraryForm';

const itineraryItemSchema = z.object({
    day: z.coerce.number().int().min(1),
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
});

const formSchema = z.object({
    itinerary: z.array(itineraryItemSchema),
});

type FormValues = z.infer<typeof formSchema>;

export function EditItineraryClient({ tour }: { tour: Tour }) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            itinerary: tour.itinerary || [],
        },
    });

    useEffect(() => {
        form.reset({
            itinerary: tour.itinerary || [],
        });
    }, [tour, form]);

    return (
        <FormProvider {...form}>
            <EditPackageLayout tour={tour} currentStep="itinerary">
                <ItineraryForm tour={tour} />
            </EditPackageLayout>
        </FormProvider>
    );
}
