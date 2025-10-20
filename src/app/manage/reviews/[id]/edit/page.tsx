import { getReviewById } from '@/lib/db';
import { ReviewForm } from '@/components/manage/ReviewForm';
import { notFound } from 'next/navigation';

type EditReviewPageProps = {
  params: { id: string };
};

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const review = await getReviewById(params.id);

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