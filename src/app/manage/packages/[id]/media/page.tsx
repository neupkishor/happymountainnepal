
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditMediaClient } from '@/components/manage/EditMediaClient';

export default async function EditMediaPage({ params }: { params: { id: string } }) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return <EditMediaClient tour={tour} />;
}
