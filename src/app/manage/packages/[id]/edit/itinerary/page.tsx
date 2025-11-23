import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ItineraryForm } from '@/components/manage/forms/ItineraryForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';

type EditPackagePageProps = {
  params: { id: string };
};

export default async function EditItineraryPage({ params }: EditPackagePageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <EditPackageLayout tour={tour} currentStep="itinerary">
        <ItineraryForm tour={tour} />
    </EditPackageLayout>
  );
}
