
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditInfoClient } from '@/components/manage/EditInfoClient';

export default async function EditAdditionalInfoPage({ params }: { params: { id: string } }) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return <EditInfoClient tour={tour} />;
}
