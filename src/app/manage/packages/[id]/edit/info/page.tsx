import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { AdditionalInfoForm } from '@/components/manage/forms/AdditionalInfoForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';

type EditPackagePageProps = {
  params: { id: string };
};

export default async function EditAdditionalInfoPage({ params }: EditPackagePageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <EditPackageLayout tour={tour} currentStep="info">
        <AdditionalInfoForm tour={tour} />
    </EditPackageLayout>
  );
}
