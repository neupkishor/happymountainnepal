
import { getPartnerById } from '@/lib/db';
import { PartnerForm } from '@/components/manage/PartnerForm';
import { notFound } from 'next/navigation';

type EditPartnerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPartnerPage({ params }: EditPartnerPageProps) {
  const { id } = await params;
  const partner = await getPartnerById(id);

  if (!partner) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Edit Partner</h1>
        <p className="text-muted-foreground mt-2">
          Update the details for {partner.name}.
        </p>
      </div>
      <PartnerForm partner={partner} />
    </div>
  );
}

