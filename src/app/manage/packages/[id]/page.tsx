
// This page is intentionally left blank for now.
// You can use it to build a public-facing or admin-facing
// detail view of a package that is different from the main
// `/tours/[slug]` page.

// For now, we redirect to the tour's public page.
import { getTourById } from '@/lib/db';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

type PackageDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const tour = await getTourById(params.id);
  if (!tour) {
    notFound();
  }
  redirect(`/tours/${tour.slug}`);
}
