import { getReviewById } from '@/lib/db';
import { ReviewForm } from '@/components/manage/ReviewForm';
import { notFound } from 'next/navigation';

type EditReviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const { id } = await params;
  const review = await getReviewById(id);

  if (!review) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Edit Review</h1>
        <p className="text-muted-foreground mt-2">
          Editing review by "{review.userName}".
        </p>
      </div>
      <ReviewForm review={review} />
    </div>
  );
}