import { getGears } from '@/lib/db';
import { GlobalGearsManager } from '@/components/manage/GlobalGearsManager';

export const dynamic = 'force-dynamic';

export default async function GearsPage() {
    const gears = await getGears();
    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Global Gears Library</h1>
            </div>
            <GlobalGearsManager initialGears={gears} />
        </div>
    );
}
