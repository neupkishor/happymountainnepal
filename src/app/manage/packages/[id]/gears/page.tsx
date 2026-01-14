import { getTourById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditGearsClient } from '@/components/manage/EditGearsClient';

export default async function EditGearsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const tour = await getTourById(id);

    if (!tour) {
        notFound();
    }

    return <EditGearsClient tour={tour} />;
}
