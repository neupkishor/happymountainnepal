
import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
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

  return <AIAssistPageComponent tour={tour} />;
}
