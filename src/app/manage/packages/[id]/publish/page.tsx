
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditPublishClient } from '@/components/manage/EditPublishClient';
import type { Tour } from '@/lib/types';

// This is a Server Component, so it can be async. No 'use client'.
export default async function EditPublishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getTourById(id);

  if (!tour) {
    notFound();
  }

  // Pass the fetched data to the Client Component.
  return <EditPublishClient tour={tour} />;
}
