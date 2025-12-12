import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditBasicInfoClient } from '@/components/manage/EditBasicInfoClient';

export default async function EditBasicInfoPage({ params }: { params: { id: string } }) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return <EditBasicInfoClient tour={tour} />;
}

