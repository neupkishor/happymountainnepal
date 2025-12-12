
'use client';

import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FaqForm } from '@/components/manage/forms/FaqForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Tour } from '@/lib/types';
import { useEffect } from 'react';

const faqItemSchema = z.object({
  question: z.string().min(5, "Question is required and must be at least 5 characters."),
  answer: z.string().min(10, "Answer is required and must be at least 10 characters."),
});

const formSchema = z.object({
  faq: z.array(faqItemSchema),
});

type FormValues = z.infer<typeof formSchema>;

function EditFaqPageClient({ tour }: { tour: Tour }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      faq: tour.faq || [],
    },
  });

  useEffect(() => {
    form.reset({
      faq: tour.faq || [],
    });
  }, [tour, form]);

  return (
    <FormProvider {...form}>
      <EditPackageLayout tour={tour} currentStep="faq">
        <FaqForm tour={tour} />
      </EditPackageLayout>
    </FormProvider>
  );
}

export default async function EditFaqPage({ params }: { params: { id: string } }) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return <EditFaqPageClient tour={tour} />;
}
