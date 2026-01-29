'use client';

import { EditPackageLayout } from '@/components/manage/EditPackageLayout';
import { ReviewsForm, reviewsFormSchema } from '@/components/manage/forms/ReviewsForm';
import type { Tour, ManagedReview } from '@/lib/types';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

export function EditReviewsClient({ tour, globalReviews }: { tour: Tour; globalReviews: ManagedReview[] }) {
    const form = useForm({
        resolver: zodResolver(reviewsFormSchema),
        defaultValues: {
            reviews: tour.reviews || [],
        },
    });

    useEffect(() => {
        form.reset({
            reviews: tour.reviews || [],
        });
    }, [tour.id]); // eslint-disable-next-line react-hooks/exhaustive-deps

    return (
        <FormProvider {...form}>
            <EditPackageLayout tour={tour} currentStep="reviews">
                <ReviewsForm tour={tour} globalReviews={globalReviews} />
            </EditPackageLayout>
        </FormProvider>
    );
}
