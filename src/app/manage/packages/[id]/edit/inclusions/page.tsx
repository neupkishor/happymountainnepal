import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { InclusionsForm } from '@/components/manage/forms/InclusionsForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';

type EditPackagePageProps = {
  params: { id: string };
};

export default async function EditInclusionsPage({ params }: EditPackagePageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <EditPackageLayout tour={tour} currentStep="inclusions">
        <InclusionsForm tour={tour} />
    </EditPackageLayout>
  );
}
