
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditItineraryClient } from '@/components/manage/EditItineraryClient';

export default async function EditItineraryPage({ params }: { params: { id: string } }) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return <EditItineraryClient tour={tour} />;
}
