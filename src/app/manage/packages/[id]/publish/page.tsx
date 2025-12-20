
'use client';

import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditPublishClient } from '@/components/manage/EditPublishClient';
import { Tour } from '@/lib/types';

export default async function EditPublishPage({ params }: { params: { id: string } }) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return <EditPublishClient tour={tour} />;
}
