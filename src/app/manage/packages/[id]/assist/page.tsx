import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditPackageNav } from '@/components/manage/EditPackageNav';
import { AIAssistPageComponent } from '@/components/manage/AIAssistPage';

type AIAssistPageProps = {
  params: {
    id: string;
  };
};

export default async function AIAssistPage({ params }: AIAssistPageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
        <p className="text-muted-foreground mb-8">Editing "{tour.name || 'New Package'}"</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
                <EditPackageNav packageId={params.id} currentStep="assist" />
            </div>
            <div className="md:col-span-3">
                <AIAssistPageComponent tour={tour} />
            </div>
        </div>
    </div>
  );
}
