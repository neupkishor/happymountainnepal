import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditBookingClient } from '@/components/manage/EditBookingClient';

export default async function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getTourById(id);

  if (!tour) {
    notFound();
  }

  return <EditBookingClient tour={tour} />;
}

