
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditPackageNav } from '@/components/manage/EditPackageNav';
import { BasicInfoForm } from '@/components/manage/forms/BasicInfoForm';
import { ItineraryForm } from '@/components/manage/forms/ItineraryForm';
import { InclusionsForm } from '@/components/manage/forms/InclusionsForm';
import { MediaForm } from '@/components/manage/forms/MediaForm';
import { PricingForm } from '@/components/manage/forms/PricingForm';


type EditPackagePageProps = {
  params: {
    id: string;
    step: string;
  };
};

export default async function EditPackagePage({ params }: EditPackagePageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  const { id, step } = params;

  const renderStepContent = () => {
    switch(step) {
      case 'basic-info':
        return <BasicInfoForm tour={tour} />;
      case 'itinerary':
        return <ItineraryForm tour={tour} />;
      case 'inclusions':
        return <InclusionsForm tour={tour} />;
      case 'media':
          return <MediaForm tour={tour} />;
      case 'pricing':
          return <PricingForm tour={tour} />;
      default:
        notFound();
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold !font-headline mb-2">Edit Package</h1>
      <p className="text-muted-foreground mb-8">Editing "{tour.name || 'New Package'}"</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <EditPackageNav packageId={id} currentStep={step} />
        </div>
        <div className="md:col-span-3">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
