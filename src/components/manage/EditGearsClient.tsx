'use client';

import { EditPackageLayout } from '@/components/manage/EditPackageLayout';
import { GearsForm, gearsFormSchema } from '@/components/manage/forms/GearsForm';
import type { Tour } from '@/lib/types';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

export function EditGearsClient({ tour }: { tour: Tour }) {
    const form = useForm({
        resolver: zodResolver(gearsFormSchema),
        defaultValues: {
            gears: tour.gears || [],
        },
    });

    useEffect(() => {
        form.reset({
            gears: tour.gears || [],
        });
    }, [tour, form]);

    return (
        <FormProvider {...form}>
            <EditPackageLayout tour={tour} currentStep="gears">
                <GearsForm tour={tour} />
            </EditPackageLayout>
        </FormProvider>
    );
}
