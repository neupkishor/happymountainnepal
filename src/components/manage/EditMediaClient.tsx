'use client';

import { EditPackageLayout } from '@/components/manage/EditPackageLayout';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Tour, ImageWithCaption } from '@/lib/types';
import { useEffect } from 'react';
import { BasicMediaForm } from '@/components/manage/forms/BasicMediaForm';

const extractIframeSrc = (input: string): string => {
    if (!input) return '';
    const iframeRegex = /<iframe.*?src="(.*?)"[^>]*><\/iframe>/;
    const match = input.match(iframeRegex);
    return match ? match[1] : input;
};

const imageSchema = z.object({
    url: z.string().url(),
    caption: z.string().optional(),
});

const formSchema = z.object({
  map: z.string().transform(val => extractIframeSrc(val)).pipe(
    z.string().url({ message: "Please enter a valid map URL." }).min(1, "Map URL is required.")
  ),
  allImages: z.array(imageSchema).min(1, "Please select at least one image."),
});

type FormValues = z.infer<typeof formSchema>;

export function EditMediaClient({ tour }: { tour: Tour }) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            map: tour.map || '',
            allImages: [tour.mainImage, ...(tour.images || [])].filter(Boolean),
        },
    });

    useEffect(() => {
        form.reset({
            map: tour.map || '',
            allImages: [tour.mainImage, ...(tour.images || [])].filter(Boolean),
        });
    }, [tour, form]);

    return (
        <FormProvider {...form}>
            <EditPackageLayout tour={tour} currentStep="media">
                <BasicMediaForm tour={tour} />
            </EditPackageLayout>
        </FormProvider>
    );
}
