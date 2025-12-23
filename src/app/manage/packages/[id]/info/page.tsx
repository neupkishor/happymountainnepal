
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditInfoClient } from '@/components/manage/EditInfoClient';

export default async function EditAdditionalInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getTourById(id);

  if (!tour) {
    notFound();
  }

  return <EditInfoClient tour={tour} />;
}
