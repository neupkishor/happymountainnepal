
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditItineraryClient } from '@/components/manage/EditItineraryClient';

export default async function EditItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getTourById(id);

  if (!tour) {
    notFound();
  }

  return <EditItineraryClient tour={tour} />;
}
