
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditPackageNav } from '@/components/manage/EditPackageNav';
import { BasicInfoForm } from '@/components/manage/forms/BasicInfoForm';
import { ItineraryForm } from '@/components/manage/forms/ItineraryForm';
import { InclusionsForm } from '@/components/manage/forms/InclusionsForm';
import { BasicMediaForm } from '@/components/manage/forms/BasicMediaForm';
import { GalleryForm } from '@/components/manage/forms/GalleryForm';
import { PricingForm } from '@/components/manage/forms/PricingForm';
import { FaqForm } from '@/components/manage/forms/FaqForm';
import { AdditionalInfoForm } from '@/components/manage/forms/AdditionalInfoForm';
import { BookingForm } from '@/components/manage/forms/BookingForm'; 
import { AIAssistPageComponent } from '@/components/manage/AIAssistPage';

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
      case 'booking':
        return <BookingForm tour={tour} />;
      case 'itinerary':
        return <ItineraryForm tour={tour} />;
      case 'inclusions':
        return <InclusionsForm tour={tour} />;
      case 'media':
          return <BasicMediaForm tour={tour} />;
      case 'gallery':
          return <GalleryForm tour={tour} />;
      case 'faq':
          return <FaqForm tour={tour} />;
      case 'info':
          return <AdditionalInfoForm tour={tour} />;
      case 'pricing':
          return <PricingForm tour={tour} />;
      case 'assist':
          return <AIAssistPageComponent tour={tour} />;
      default:
        notFound();
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
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
