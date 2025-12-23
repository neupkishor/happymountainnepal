
// This page simply redirects to the edit page for now.
// It could be used in the future for a detailed view.
import { redirect } from 'next/navigation';

type PartnerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const { id } = await params;
  redirect(`/manage/partners/${id}/edit`);
}

