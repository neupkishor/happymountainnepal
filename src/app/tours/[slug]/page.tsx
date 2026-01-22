import { getTourBySlug } from '@/lib/db';
import TourDetailClient from './tour-detail-client';
import { notFound } from 'next/navigation';
import { Metadata } from 'next'; // Import Metadata type
import { headers } from 'next/headers';
import { AdminPageControl } from '@/components/admin/AdminPageControl';

type TourDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Generate dynamic metadata for each tour page
export async function generateMetadata({ params }: TourDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);

  if (!tour || tour.status === 'unpublished' || tour.status === 'draft') {
    return {
      title: 'Tour Not Found',
      description: 'The requested tour could not be found or is not available.',
    };
  }

  return {
    title: tour.name,
    description: tour.description,
    alternates: {
      canonical: `https://happymountainnepal.com/tours/${tour.slug}`, // Replace with your actual domain
      languages: {
        'en': `https://happymountainnepal.com/tours/${tour.slug}`,
        'x-default': `https://happymountainnepal.com/tours/${tour.slug}`,
      },
    },
    openGraph: {
      title: tour.name,
      description: tour.description,
      url: `https://happymountainnepal.com/tours/${tour.slug}`,
      images: [
        {
          url: tour.mainImage.url,
          alt: tour.name,
        },
      ],
      type: 'article',
      siteName: 'Happy Mountain Nepal',
    },
    twitter: {
      card: 'summary_large_image',
      title: tour.name,
      description: tour.description,
      images: [tour.mainImage.url],
    },
  };
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);

  if (!tour || tour.status === 'unpublished' || tour.status === 'draft') {
    notFound();
  }

  const headersList = await headers();
  const tempUserId = headersList.get('x-temp-account-id') || 'NotAvailable';

  return (
    <>
      <AdminPageControl editPath={`/manage/packages/${tour.id}`} />
      <TourDetailClient tour={tour} tempUserId={tempUserId} />
    </>
  );
}
