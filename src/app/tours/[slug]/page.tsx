import { getTourBySlug } from '@/lib/db';
import TourDetailClient from './tour-detail-client';
import { notFound } from 'next/navigation';
import { Metadata } from 'next'; // Import Metadata type

type TourDetailPageProps = {
  params: {
    slug: string;
  };
};

// Generate dynamic metadata for each tour page
export async function generateMetadata({ params }: TourDetailPageProps): Promise<Metadata> {
  const tour = await getTourBySlug(params.slug);

  if (!tour) {
    return {
      title: 'Tour Not Found',
      description: 'The requested tour could not be found.',
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
          url: tour.mainImage,
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
      images: [tour.mainImage],
    },
  };
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const tour = await getTourBySlug(params.slug);

  if (!tour) {
    notFound();
  }

  return <TourDetailClient tour={tour} />;
}