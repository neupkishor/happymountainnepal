
'use client';

import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { BasicMediaForm } from '@/components/manage/forms/BasicMediaForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Tour } from '@/lib/types';
import { useEffect } from 'react';

const extractIframeSrc = (input: string): string => {
  if (!input) return '';
  const iframeRegex = /<iframe.*?src="(.*?)"[^>]*><\/iframe>/;
  const match = input.match(iframeRegex);
  return match ? match[1] : input;
};

const formSchema = z.object({
  map: z.string().transform(val => extractIframeSrc(val)).pipe(
    z.string().url({ message: "Please enter a valid map URL." }).min(1, "Map URL is required.")
  ),
  allImages: z.array(z.string().url()).min(1, "Please select at least one image."),
});

type FormValues = z.infer<typeof formSchema>;

function EditMediaPageClient({ tour }: { tour: Tour }) {
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

export default async function EditMediaPage({ params }: { params: { id: string } }) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return <EditMediaPageClient tour={tour} />;
}
