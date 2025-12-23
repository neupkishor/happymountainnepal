import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditBasicInfoClient } from '@/components/manage/EditBasicInfoClient';

export default async function EditBasicInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getTourById(id);

  if (!tour) {
    notFound();
  }

  return <EditBasicInfoClient tour={tour} />;
}

