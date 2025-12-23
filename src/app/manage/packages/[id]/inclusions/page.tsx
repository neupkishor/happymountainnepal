
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditInclusionsClient } from '@/components/manage/EditInclusionsClient';

export default async function EditInclusionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getTourById(id);

  if (!tour) {
    notFound();
  }

  return <EditInclusionsClient tour={tour} />;
}
