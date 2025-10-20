import { getTourById } from '@/lib/db';
import { BookingForm } from '@/components/manage/forms/BookingForm';
import { notFound } from 'next/navigation';

type BookingPageProps = {
  params: { id: string };
};

export default async function BookingPage({ params }: BookingPageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Booking Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure how customers can book "{tour.name}".
        </p>
      </div>
      <BookingForm tour={tour} />
    </div>
  );
}