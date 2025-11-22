import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditPackageNav } from '@/components/manage/EditPackageNav';
import { InclusionsForm } from '@/components/manage/forms/InclusionsForm';

type EditPackagePageProps = {
  params: { id: string };
};

export default async function EditInclusionsPage({ params }: EditPackagePageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <p className="text-muted-foreground mb-8">Editing "{tour.name || 'New Package'}"</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <EditPackageNav packageId={params.id} currentStep="inclusions" />
        </div>
        <div className="md:col-span-3">
          <InclusionsForm tour={tour} />
        </div>
      </div>
    </div>
  );
}
