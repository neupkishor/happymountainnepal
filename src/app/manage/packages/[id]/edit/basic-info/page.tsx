import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { BasicInfoForm } from '@/components/manage/forms/BasicInfoForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';

type EditPackagePageProps = {
  params: { id: string };
};

export default async function EditBasicInfoPage({ params }: EditPackagePageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <EditPackageLayout tour={tour} currentStep="basic-info">
        <BasicInfoForm tour={tour} />
    </EditPackageLayout>
  );
}
