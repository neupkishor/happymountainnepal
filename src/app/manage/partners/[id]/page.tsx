
// This page simply redirects to the edit page for now.
// It could be used in the future for a detailed view.
import { redirect } from 'next/navigation';

type PartnerDetailPageProps = {
  params: {
    id: string;
  };
};

export default function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  redirect(`/manage/partners/${params.id}/edit`);
}

    