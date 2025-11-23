import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { BookingForm } from '@/components/manage/forms/BookingForm';
import { PricingForm } from '@/components/manage/forms/PricingForm';
import { EditPackageLayout } from '@/components/manage/EditPackageLayout';

type EditPackagePageProps = {
  params: { id: string };
};

export default async function EditBookingPage({ params }: EditPackagePageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <EditPackageLayout tour={tour} currentStep="booking">
        <div className="space-y-8">
            <PricingForm tour={tour} />
            <BookingForm tour={tour} />
        </div>
    </EditPackageLayout>
  );
}
