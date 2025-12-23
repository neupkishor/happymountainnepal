
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditMediaClient } from '@/components/manage/EditMediaClient';

export default async function EditMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getTourById(id);

  if (!tour) {
    notFound();
  }

  return <EditMediaClient tour={tour} />;
}
