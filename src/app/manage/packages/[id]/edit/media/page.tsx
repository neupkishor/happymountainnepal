import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { BasicMediaForm } from '@/components/manage/forms/BasicMediaForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';

type EditPackagePageProps = {
  params: { id: string };
};

export default async function EditMediaPage({ params }: EditPackagePageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <EditPackageLayout tour={tour} currentStep="media">
        <BasicMediaForm tour={tour} />
    </EditPackageLayout>
  );
}
