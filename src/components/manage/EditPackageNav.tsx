'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Wand2, Send } from 'lucide-react'; // Import icon

interface EditPackageNavProps {
  packageId: string;
  currentStep: string;
}

const steps = [
  { slug: 'basic-info', label: 'Basic Info' },
  { slug: 'booking', label: 'Booking & Price' },
  { slug: 'itinerary', label: 'Itinerary' },
  { slug: 'inclusions', label: 'Inclusions' },
  { slug: 'media', label: 'Media & Gallery' },
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
          variant={currentStep === 'assist' ? 'secondary' : 'ghost'}
          className="justify-start mt-4"
        >
          <Link href={`/manage/packages/${packageId}/edit/assist`}>
            <Wand2 className="mr-2 h-4 w-4" />
            AI Assist
          </Link>
        </Button>
         <Button
          asChild
          variant={currentStep === 'publish' ? 'default' : 'ghost'}
          className={cn("justify-start mt-2", currentStep === 'publish' && 'ring-2 ring-primary/50')}
        >
          <Link href={`/manage/packages/${packageId}/edit/publish`}>
            <Send className="mr-2 h-4 w-4" />
            Publish
          </Link>
        </Button>
    </nav>
  );
}
