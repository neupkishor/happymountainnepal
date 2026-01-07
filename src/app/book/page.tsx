
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChoosePackageStep } from '@/components/book/ChoosePackageStep';
import { CustomizeItineraryStep } from '@/components/book/CustomizeItineraryStep';
import { ContactDetailsStep } from '@/components/book/ContactDetailsStep';
import { ConfirmationStep } from '@/components/book/ConfirmationStep';

function BookingFlow() {
  const searchParams = useSearchParams();
  const step = searchParams.get('step');
  const packageId = searchParams.get('package');

  let currentStepComponent;

  switch (step) {
    case 'customize':
      currentStepComponent = packageId ? <CustomizeItineraryStep packageId={packageId} /> : <ChoosePackageStep />;
      break;
    case 'details':
      currentStepComponent = packageId ? <ContactDetailsStep packageId={packageId} /> : <ChoosePackageStep />;
      break;
    case 'complete':
        currentStepComponent = <ConfirmationStep />;
        break;
    default:
      currentStepComponent = <ChoosePackageStep />;
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
