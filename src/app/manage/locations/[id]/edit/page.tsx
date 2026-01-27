
import { LocationForm } from '@/components/manage/forms/LocationForm';
import { getLocationById, getLocations } from '@/lib/db/sqlite';
import { notFound } from 'next/navigation';

interface EditLocationPageProps {
    params: {
        id: string;
    };
}

export default async function EditLocationPage({ params }: EditLocationPageProps) {
    const location = getLocationById(params.id);
    const existingLocations = await getLocations(); // Fetch all locations for parent selection

    if (!location) {
        notFound();
    }

    // Map database properties to Location interface
    const locationData = {
        ...location,
        isFeatured: Boolean(location.isFeatured)
    };

    return (
        <div className="max-w-4xl mx-auto">
            <LocationForm initialData={locationData} availableLocations={existingLocations} />
        </div>
    );
}
