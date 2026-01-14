import { getTourById, getAllReviews } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditReviewsClient } from '@/components/manage/EditReviewsClient';

export default async function EditReviewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const tour = await getTourById(id);
    const globalReviews = await getAllReviews();

    if (!tour) {
        notFound();
    }

    // Normalize reviews dates
    if (tour.reviews) {
        tour.reviews = tour.reviews.map(r => ({
            ...r,
            date: typeof r.date === 'object' && r.date && 'toDate' in (r.date as any)
                ? (r.date as any).toDate().toISOString()
                : r.date
        }));
    }

    return <EditReviewsClient tour={tour} globalReviews={globalReviews} />;
}
