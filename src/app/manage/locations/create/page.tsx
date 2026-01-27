
import { LocationForm } from '@/components/manage/forms/LocationForm';
import { getLocations } from '@/lib/db/sqlite';

export default async function CreateLocationPage() {
    const locations = await getLocations();
    return (
        <div className="max-w-4xl mx-auto">
            <LocationForm availableLocations={locations} />
        </div>
    );
}
