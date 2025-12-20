
'use client';

import { EditPackageLayout } from '@/components/manage/EditPackageLayout';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Tour } from '@/lib/types';
import { useEffect } from 'react';
import { InclusionsForm } from '@/components/manage/forms/InclusionsForm';

interface InclusionsFormValues {
    inclusions: string[];
    exclusions: string[];
}

const formSchema = z.object({
    inclusions: z.array(z.string().min(1, "Inclusion cannot be empty.")),
    exclusions: z.array(z.string().min(1, "Exclusion cannot be empty.")),
});

export function EditInclusionsClient({ tour }: { tour: Tour }) {
    const form = useForm<InclusionsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            inclusions: tour.inclusions || [],
            exclusions: tour.exclusions || [],
        },
    });

    useEffect(() => {
        form.reset({
            inclusions: tour.inclusions || [],
            exclusions: tour.exclusions || [],
        });
    }, [tour, form]);

    return (
        <FormProvider {...form}>
            <EditPackageLayout tour={tour} currentStep="inclusions">
                <InclusionsForm tour={tour} />
            </EditPackageLayout>
        </FormProvider>
    );
}
