
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChoosePackageStep } from '@/components/book/ChoosePackageStep';
import { CustomizeItineraryStep } from '@/components/book/CustomizeItineraryStep';
import { ContactDetailsStep } from '@/components/book/ContactDetailsStep';
import { ConfirmationStep } from '@/components/book/ConfirmationStep';
import { ChooseRegionStep } from '@/components/book/ChooseRegionStep';

function BookingFlow() {
  const searchParams = useSearchParams();
  const step = searchParams.get('step');
  const packageId = searchParams.get('package');
  const region = searchParams.get('region');

  let currentStepComponent;

  switch (step) {
    case 'package':
      if (region) {
        currentStepComponent = <ChoosePackageStep region={region} />;
      } else {
        currentStepComponent = <ChooseRegionStep />; // If no region, force region selection
      }
      break;
    case 'customize':
      currentStepComponent = packageId ? <CustomizeItineraryStep packageId={packageId} /> : <ChooseRegionStep />;
      break;
    case 'details':
      currentStepComponent = packageId ? <ContactDetailsStep packageId={packageId} /> : <ChooseRegionStep />;
      break;
    case 'complete':
      currentStepComponent = <ConfirmationStep />;
      break;
    default:
      currentStepComponent = <ChooseRegionStep />; // Default to choosing a region
      break;
  }

  return (
    <div className="container mx-auto py-16">
      <div className="max-w-4xl mx-auto">
        {currentStepComponent}
      </div>
    </div>
  );
}

export default function BookPage() {
    return (
        <Suspense fallback={<div className="container mx-auto py-16">Loading...</div>}>
            <BookingFlow />
        </Suspense>
    )
}
