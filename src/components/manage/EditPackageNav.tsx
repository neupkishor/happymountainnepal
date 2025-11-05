'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Wand2 } from 'lucide-react'; // Import icon

interface EditPackageNavProps {
  packageId: string;
  currentStep: string;
}

const steps = [
  { slug: 'basic-info', label: 'Basic Info' },
  { slug: 'booking', label: 'Booking & Price' },
  { slug: 'itinerary', label: 'Itinerary' },
  { slug: 'inclusions', label: 'Inclusions' },
  { slug: 'media', label: 'Main Media' },
  { slug: 'gallery', label: 'Gallery' },
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
       <Button
          asChild
          variant={currentStep === 'assist' ? 'default' : 'ghost'}
          className="justify-start mt-4 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
        >
          <Link href={`/manage/packages/${packageId}/edit/assist`}>
            <Wand2 className="mr-2 h-4 w-4" />
            AI Assist
          </Link>
        </Button>
    </nav>
  );
}
