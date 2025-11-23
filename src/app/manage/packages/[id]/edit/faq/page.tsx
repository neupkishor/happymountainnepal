import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FaqForm } from '@/components/manage/forms/FaqForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';

type EditPackagePageProps = {
  params: { id: string };
};

export default async function EditFaqPage({ params }: EditPackagePageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <EditPackageLayout tour={tour} currentStep="faq">
        <FaqForm tour={tour} />
    </EditPackageLayout>
  );
}
