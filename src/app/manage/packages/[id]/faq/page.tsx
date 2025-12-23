
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditFaqClient } from '@/components/manage/EditFaqClient';

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getTourById(id);

  if (!tour) {
    notFound();
  }

  return <EditFaqClient tour={tour} />;
}
