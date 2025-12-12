import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditBookingClient } from '@/components/manage/EditBookingClient';

export default async function EditBookingPage({ params }: { params: { id: string } }) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return <EditBookingClient tour={tour} />;
}

