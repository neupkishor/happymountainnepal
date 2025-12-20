
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditInclusionsClient } from '@/components/manage/EditInclusionsClient';

export default async function EditInclusionsPage({ params }: { params: { id: string } }) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return <EditInclusionsClient tour={tour} />;
}
