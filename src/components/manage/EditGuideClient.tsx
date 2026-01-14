'use client';

import { EditPackageLayout } from '@/components/manage/EditPackageLayout';
import { GuideForm, guideFormSchema } from '@/components/manage/forms/GuideForm';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Tour, BlogPost } from '@/lib/types';
import { useEffect } from 'react';

interface EditGuideClientProps {
    tour: Tour;
    globalBlogs: BlogPost[];
}

export default function EditGuideClient({ tour, globalBlogs }: EditGuideClientProps) {
    const methods = useForm({
        resolver: zodResolver(guideFormSchema),
        defaultValues: {
            guides: tour.guides || [],
        },
    });

    // Update form default values if tour changes (though usually handled by init)
    useEffect(() => {
        if (tour.guides) {
            methods.reset({ guides: tour.guides });
        }
    }, [tour, methods]);

    return (
        <FormProvider {...methods}>
            <EditPackageLayout tour={tour} currentStep="guide">
                <GuideForm tour={tour} globalBlogs={globalBlogs} />
            </EditPackageLayout>
        </FormProvider>
    );
}
