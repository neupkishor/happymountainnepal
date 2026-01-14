import { getTourById, getGears } from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditGearsClient } from '@/components/manage/EditGearsClient';

export default async function EditGearsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const tour = await getTourById(id);
    const globalGears = await getGears();

    if (!tour) {
        notFound();
    }

    return <EditGearsClient tour={tour} globalGears={globalGears} />;
}
