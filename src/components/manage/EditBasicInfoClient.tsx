'use client';

import { BasicInfoForm } from '@/components/manage/forms/BasicInfoForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { slugify } from '@/lib/utils';
import type { Tour } from '@/lib/types';
import { useEffect } from 'react';

const formSchema = z.object({
    name: z.string().min(5, { message: "Name must be at least 5 characters." }),
    slug: z.string().min(3, { message: "Slug must be at least 3 characters." }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and use hyphens for spaces."),
    region: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)).refine(val => val.length > 0, { message: "At least one region is required." }),
    type: z.enum(['Trekking', 'Tour', 'Climbing', 'Jungle Safari']),
    difficulty: z.enum(['Easy', 'Moderate', 'Strenuous', 'Challenging']),
    duration: z.coerce.number().int().min(1, { message: "Duration must be at least 1 day." }),
    description: z.string().min(20, { message: "Description must be at least 20 characters." }),
    searchKeywords: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EditBasicInfoClient({ tour }: { tour: Tour }) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: tour.name || '',
            slug: tour.slug || slugify(tour.name || 'new-package'),
            region: Array.isArray(tour.region) ? tour.region.join(', ') : tour.region || '',
            type: tour.type || 'Trekking',
            difficulty: tour.difficulty || 'Moderate',
            duration: tour.duration || 0,
            description: tour.description || '',
            searchKeywords: tour.searchKeywords || [],
        },
    });

    useEffect(() => {
        form.reset({
            name: tour.name || '',
            slug: tour.slug || slugify(tour.name || 'new-package'),
            region: Array.isArray(tour.region) ? tour.region.join(', ') : tour.region || '',
            type: tour.type || 'Trekking',
            difficulty: tour.difficulty || 'Moderate',
            duration: tour.duration || 0,
            description: tour.description || '',
            searchKeywords: tour.searchKeywords || [],
        });
    }, [tour, form]);

    return (
        <FormProvider {...form}>
            <EditPackageLayout tour={tour} currentStep="basics">
                <BasicInfoForm tour={tour} />
            </EditPackageLayout>
        </FormProvider>
    );
}
