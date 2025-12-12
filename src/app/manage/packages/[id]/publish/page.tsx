
'use client';

import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { PublishForm } from '@/components/manage/forms/PublishForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Tour } from '@/lib/types';
import { useEffect } from 'react';


const formSchema = z.object({
  status: z.enum(['draft', 'published', 'unpublished', 'hidden']),
});

type FormValues = z.infer<typeof formSchema>;

function EditPublishPageClient({ tour }: { tour: Tour }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: tour.status || 'draft',
    },
  });

  useEffect(() => {
    form.reset({
      status: tour.status || 'draft',
    });
  }, [tour, form]);


  return (
    <FormProvider {...form}>
      <EditPackageLayout tour={tour} currentStep="publish">
        <PublishForm tour={tour} />
      </EditPackageLayout>
    </FormProvider>
  );
}


export default async function EditPublishPage({ params }: { params: { id: string } }) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return <EditPublishPageClient tour={tour} />;
}
