import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { PublishForm } from '@/components/manage/forms/PublishForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';

type EditPackagePageProps = {
  params: { id: string };
};

export default async function EditPublishPage({ params }: EditPackagePageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <EditPackageLayout tour={tour} currentStep="publish">
        <PublishForm tour={tour} />
    </EditPackageLayout>
  );
}
