'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface EditPackageNavProps {
  packageId: string;
  currentStep: string;
}

const steps = [
  { slug: 'basic-info', label: 'Basic Info' },
  { slug: 'booking', label: 'Booking' }, // New step for Booking
  { slug: 'itinerary', label: 'Itinerary' },
  { slug: 'inclusions', label: 'Inclusions / Exclusions' },
  { slug: 'media', label: 'Main Media' },
  { slug: 'gallery', label: 'Gallery' },
  { slug: 'pricing', label: 'Pricing & Dates' },
  { slug: 'faq', label: 'FAQ' },
  { slug: 'info', label: 'Additional Info' },
];

export function EditPackageNav({ packageId, currentStep }: EditPackageNavProps) {
  return (
    <nav className="flex flex-col gap-2 sticky top-24">
      {steps.map(step => (
        <Button
          key={step.slug}
          asChild
          variant={currentStep === step.slug ? 'default' : 'ghost'}
          className="justify-start"
        >
          <Link href={`/manage/packages/${packageId}/edit/${step.slug}`}>
            {step.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}