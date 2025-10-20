'use client';

import { ReviewForm } from '@/components/manage/ReviewForm';

export default function CreateReviewPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Add New Review</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to add a new customer review.
        </p>
      </div>
      <ReviewForm />
    </div>
  );
}