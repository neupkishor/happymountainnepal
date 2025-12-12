
'use client';

import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { InclusionsForm } from '@/components/manage/forms/InclusionsForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Tour } from '@/lib/types';
import { useEffect } from 'react';

interface InclusionsFormValues {
  inclusions: string[];
  exclusions: string[];
}

const formSchema = z.object({
  inclusions: z.array(z.string().min(1, "Inclusion cannot be empty.")),
  exclusions: z.array(z.string().min(1, "Exclusion cannot be empty.")),
});

function EditInclusionsPageClient({ tour }: { tour: Tour }) {
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

export default async function EditInclusionsPage({ params }: { params: { id: string } }) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return <EditInclusionsPageClient tour={tour} />;
}
