'use client';

import { EditPackageLayout } from '@/components/manage/EditPackageLayout';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Tour } from '@/lib/types';
import { useEffect } from 'react';
import { AdditionalInfoForm } from '@/components/manage/forms/AdditionalInfoForm';

const additionalInfoSectionSchema = z.object({
    title: z.string().min(3, "Section title is required and must be at least 3 characters."),
    content: z.string().min(20, "Section content is required and must be at least 20 characters."),
});

const formSchema = z.object({
    additionalInfoSections: z.array(additionalInfoSectionSchema),
});

type FormValues = z.infer<typeof formSchema>;

export function EditInfoClient({ tour }: { tour: Tour }) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            additionalInfoSections: tour.additionalInfoSections || [],
        },
    });

    useEffect(() => {
        form.reset({
            additionalInfoSections: tour.additionalInfoSections || [],
        });
    }, [tour, form]);

    return (
        <FormProvider {...form}>
            <EditPackageLayout tour={tour} currentStep="info">
                <AdditionalInfoForm tour={tour} />
            </EditPackageLayout>
        </FormProvider>
    );
}
