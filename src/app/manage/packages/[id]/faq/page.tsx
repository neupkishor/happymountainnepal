
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditFaqClient } from '@/components/manage/EditFaqClient';

export default async function EditFaqPage({ params }: { params: { id: string } }) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return <EditFaqClient tour={tour} />;
}
